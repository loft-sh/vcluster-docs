# Task page template

One page per job the reader wants done, such as rotating certificates or
connecting a cluster to the platform. The reader knows what they want and
needs the steps in the right order, with nothing that belongs on a concept
page.

## Frontmatter and title

- `title` starts with a verb and names the outcome, for example "Rotate
  certificates". Use sentence case.
- `sidebar_label` usually matches the title, shortened if needed.
- `description` says what the reader accomplishes, in one sentence.

## Sections

1. **Intro.** One or two sentences: what the task does and when someone needs
   it. Link to the concept page for background instead of explaining it here.
2. **Before you begin.** Put anything that changes whether or how the reader
   should start here, ahead of the steps:
   - Prerequisites: tools and versions, access, license tier, and the tenancy
     models or distributions the task supports.
   - Operational cost: restarts, downtime, session invalidation, or credential
     rotation.
   - Branches: when different setups take different paths, say which path
     applies to whom before the reader picks one.
3. **Steps.** Use `Flow` and `Step` for three or more steps. Give each step one
   action and a sentence saying what it does before the command. Show the
   expected output where it helps the reader confirm the step worked. When
   the procedure differs between vcluster.yaml, the CLI, and the platform UI,
   use a subsection or tabs for each.
4. **Verify.** A check that confirms the whole task worked, with the expected
   result.
5. **Undo or clean up (when it applies).** How to reverse the change, or how to
   turn back off anything the task widened, such as debug logging or access.
6. **Next steps (optional).** Links to the tasks a reader usually does next.

## Skeleton

````mdx
---
title: <Verb> <outcome>
sidebar_label: <Verb> <outcome>
description: <What the reader accomplishes, in one sentence.>
---

import Flow, { Step } from '@site/src/components/Flow';

<What this task does and when you need it.> For background, see
[<Concept>](<relative-path>.mdx).

## Before you begin

- <Prerequisite>
- <Operational cost, if any>

## <Verb> <outcome>

<Flow>
<Step>
<What this step does.>

```bash
<command>
```
</Step>
</Flow>

## Verify

<How to confirm the task worked, with expected output.>

## Next steps

- [<Related task>](<relative-path>.mdx)
````

## Don't

- Don't explain how the feature works internally beyond what a step needs.
  Link to the concept page.
- Don't put a caveat that affects the whole procedure after the steps.
- Don't put admonitions inside `Step`.
- Don't use a static code block with placeholders for values the reader
  replaces. Use `InterpolatedCodeBlock`.
