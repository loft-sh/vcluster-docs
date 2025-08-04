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

const cliDocsDir = "./vcluster/cli"

func main() {
	var branch, vclusterDir string
	var useLocal bool

	flag.StringVar(&branch, "branch", "current", "vCluster branch to checkout")
	flag.StringVar(&vclusterDir, "vcluster-dir", "~/loft/vcluster", "Path to local vCluster repository")
	flag.BoolVar(&useLocal, "local", true, "Use local vCluster repository")
	flag.Parse()

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

	docsDir := filepath.Join(workDir, "docs", "pages", "cli")
	os.MkdirAll(docsDir, 0755)

	genCmd := exec.Command("go", "run", "-mod=mod", "./hack/docs/main.go")
	genCmd.Dir = workDir
	genCmd.Stdout = os.Stdout
	genCmd.Stderr = os.Stderr
	if err := genCmd.Run(); err != nil {
		log.Fatal(err)
	}

	os.MkdirAll(cliDocsDir, 0755)
	if err := copyDir(filepath.Join(workDir, "docs", "pages", "cli"), cliDocsDir); err != nil {
		log.Fatal(err)
	}

	exec.Command("sh", "-c",
		fmt.Sprintf("rg -l '/home/[^/]+/.vcluster/config.json' --glob '*.md' %s | xargs sed -i 's|/home/[^/]\\+/.vcluster/config.json|~/.vcluster/config.json|g'", cliDocsDir)).Run()

	fmt.Printf("CLI documentation generated in %s\n", cliDocsDir)
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
