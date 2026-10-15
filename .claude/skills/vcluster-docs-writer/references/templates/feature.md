# Feature page template

Docs for a new vCluster or platform feature or setting. Engineers usually
write the first draft of these pages for the features they build.

## 1. Overview

- **What:** a high-level description of the feature.
- **Why:** the use cases it solves, and why someone would turn it on.
- Include a diagram if the feature changes the architecture.

## 2. How to use the feature

- Describe the fields or settings the feature adds, with their defaults.
- **Always say if the feature changes default behavior**, in an info or warning
  admonition near the top of the section, before any procedure it affects.
- Order examples from simple (defaults) to complex (special fields).

## 3. YAML examples

- **Add context before the YAML**, explaining the use case.
- **Comment the YAML**, explaining what each section does.
- **Add the effect after the YAML**, explaining what happens.
- Give the code block a `title`, for example `yaml title="vcluster.yaml"`.
- Group examples by use case, for example "Use case 1: production namespace
  with specific naming".

## 4. Step-by-step examples

- Use `<Flow>` and `<Step>` components for multi-step procedures.
- Give each step a clear description before its commands.
- Include expected output where it helps.
- Group related examples under descriptive headings.
- For platform procedures, keep screenshots to a minimum, since the UI changes
  often. Use one where a layout or dashboard is hard to describe in words.

## 5. Verify it worked

Tell the reader how to confirm the feature is working, with a command and its
expected output where possible.

## 6. Known limitations

- Document limitations at the end of the page.
- Use subsections for different categories of limitation.
- Give workarounds or alternatives where they exist.
- Include failing and working examples where they make a limitation clearer.

## 7. Admonitions

- `:::info` for neutral information and default behaviors.
- `:::warning` or `:::caution` for important limitations or immutable settings.
- `:::note` for additional helpful context.
- **Never place admonitions inside JSX components** such as `<Step>`.

## 8. Writing style

Follow [style-guide.md](../style-guide.md). The rules feature pages miss most
often: sentence case for headings, present tense, no first-person plural, and
writing from the reader's point of view.

## Before you open the PR

- Where else should the docs mention or link to this feature?
- Does it change how a user moves through an existing task?
- Does the page match the structure of similar pages in the same section?
- Does the feature need a tier badge or a version note? If it's licensed, add
  or update its entry in `src/data/features.yaml`.
- Run Vale on the page and fix what it reports.
