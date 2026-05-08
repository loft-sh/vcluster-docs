package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func main() {
	var branch, vclusterDir, outputDir, sourcePath, targetFolder string
	var useLocal bool

	flag.StringVar(&branch, "branch", "current", "vCluster branch to checkout")
	flag.StringVar(&vclusterDir, "vcluster-dir", "~/loft/vcluster", "Path to local vCluster repository")
	flag.StringVar(&outputDir, "output", "./vcluster/cli", "Output directory for generated CLI docs")
	flag.BoolVar(&useLocal, "local", true, "Use local vCluster repository")
	flag.StringVar(&sourcePath, "source-path", "", "Source checkout path; set by release receiver. Overrides --vcluster-dir and forces --local.")
	flag.StringVar(&targetFolder, "target-folder", "", "Output folder for generated CLI docs; set by release receiver. Overrides --output.")
	flag.Parse()

	// --target-folder explicitly passed empty means the caller computed an
	// empty path (e.g. classify-version.sh returned no folder). Refuse rather
	// than silently writing into the legacy default under release CI.
	targetFolderSet := false
	flag.Visit(func(f *flag.Flag) {
		if f.Name == "target-folder" {
			targetFolderSet = true
		}
	})
	if targetFolderSet && targetFolder == "" {
		log.Fatal("vcluster-cli generator: --target-folder was passed but empty; refusing to write to legacy default. Check the calling workflow (hack/release/run-generator.sh).")
	}

	if sourcePath != "" {
		vclusterDir = sourcePath
		useLocal = true
	}
	if targetFolder != "" {
		outputDir = targetFolder
	}

	cliDocsDir := outputDir

	if strings.HasPrefix(vclusterDir, "~/") {
		home, _ := os.UserHomeDir()
		vclusterDir = filepath.Join(home, vclusterDir[2:])
	}

	workDir := vclusterDir
	if !useLocal {
		tempDir, err := os.MkdirTemp("", "vcluster-docs-gen-*")
		if err != nil {
			log.Fatal(err)
		}
		defer os.RemoveAll(tempDir)

		workDir = tempDir
		cloneCmd := exec.Command("git", "clone", "--depth", "1", "--branch", branch, "https://github.com/loft-sh/vcluster.git", workDir)
		cloneCmd.Stdout = os.Stdout
		cloneCmd.Stderr = os.Stderr
		if err := cloneCmd.Run(); err != nil {
			log.Fatal(err)
		}
	}

	if useLocal && branch != "current" {
		if output, err := exec.Command("git", "-C", workDir, "branch", "--show-current").Output(); err == nil {
			if currentBranch := strings.TrimSpace(string(output)); currentBranch != branch {
				if err := exec.Command("git", "-C", workDir, "checkout", branch).Run(); err != nil {
					log.Fatal(err)
				}
			}
		}
	}

	// Generate docs directly here instead of calling external script
	docsDir := filepath.Join(workDir, "docs", "pages", "cli")
	os.MkdirAll(docsDir, 0755)

	// Copy our docs_gen.go to the vcluster directory
	docsGenPath := filepath.Join(workDir, "docs_gen.go")
	docsGenSource := filepath.Join(filepath.Dir(os.Args[0]), "docs_gen.go")
	// If running with go run, the source is in the same directory as main.go
	if _, err := os.Stat(docsGenSource); os.IsNotExist(err) {
		docsGenSource = "./hack/vcluster-cli/docs_gen.go"
	}
	if err := copyFile(docsGenSource, docsGenPath); err != nil {
		log.Fatal(err)
	}
	defer os.Remove(docsGenPath)

	// Run the generation
	genCmd := exec.Command("go", "run", "-mod=mod", docsGenPath, docsDir)
	genCmd.Dir = workDir
	genCmd.Stdout = os.Stdout
	genCmd.Stderr = os.Stderr
	if err := genCmd.Run(); err != nil {
		log.Fatal(err)
	}

	// Remove old generated CLI docs (*.md files only, preserve *.mdx and _category_.json)
	if err := cleanupOldDocs(cliDocsDir); err != nil {
		log.Fatal(err)
	}

	// Copy to final destination
	os.MkdirAll(cliDocsDir, 0755)
	if err := copyDir(docsDir, cliDocsDir); err != nil {
		log.Fatal(err)
	}

	// Cobra resolves os.UserHomeDir() at flag-registration time, so any
	// flag whose default is rooted at $HOME bakes the runner's home into
	// the generated MDX (e.g. /home/runner/.vcluster/config.json). The
	// docs need to read as ~/. The previous shell version of this step
	// depended on ripgrep being on PATH; on a vanilla GitHub-hosted
	// runner it isn't, so the substitution silently no-op'd and the
	// runner's home leaked through to the published docs. Pure-Go walk
	// + literal replace removes the toolchain dependency.
	if home, err := os.UserHomeDir(); err == nil && home != "" {
		if err := rewriteHome(cliDocsDir, home); err != nil {
			log.Fatalf("rewrite home in %q: %v", cliDocsDir, err)
		}
	}

	fmt.Printf("CLI documentation generated in %s\n", cliDocsDir)
}

func rewriteHome(root, home string) error {
	return filepath.Walk(root, func(p string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() || filepath.Ext(p) != ".md" {
			return err
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return err
		}
		updated := strings.ReplaceAll(string(b), home, "~")
		if updated == string(b) {
			return nil
		}
		return os.WriteFile(p, []byte(updated), 0o644)
	})
}

func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relPath, _ := filepath.Rel(src, path)
		dstPath := filepath.Join(dst, relPath)
		if info.IsDir() {
			return os.MkdirAll(dstPath, info.Mode())
		}
		return copyFile(path, dstPath)
	})
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

// cleanupOldDocs removes old generated .md files (CLI docs) while preserving
// manually created .mdx files and _category_.json
func cleanupOldDocs(dir string) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil // Directory doesn't exist yet, nothing to clean
		}
		return err
	}

	for _, entry := range entries {
		// Skip directories and non-.md files
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".md") {
			continue
		}

		// Remove .md files (auto-generated CLI docs)
		path := filepath.Join(dir, entry.Name())
		if err := os.Remove(path); err != nil {
			return fmt.Errorf("failed to remove %s: %w", path, err)
		}
	}

	return nil
}
