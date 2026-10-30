# Troubleshooting page template

One page per problem. The reader arrived from a search or an error message and
is working under pressure, so lead with what they can recognize and get to the
fix quickly.

## Frontmatter and title

- `title` starts with "Resolve" and names the problem in the reader's terms,
  for example "Resolve CoreDNS DNS timeouts and SERVFAIL errors".
- `sidebar_label` is the short symptom, for example "CoreDNS DNS timeouts".
- `description` repeats the symptom and the affected setup in one sentence.
  Search results show it, so include the error text or the condition a reader
  would search for.
- Place the page under the Troubleshoot subsection for the system that fails
  (control plane, networking, storage, synchronization, worker nodes), not the
  feature that triggered it.

## Sections

1. **Symptoms.** What the reader sees. Quote error messages and log lines
   exactly, in a code block, so the page matches a search for them. Include
   the command that shows the symptom when there is one.
2. **Confirm the cause (optional).** Use it when several problems look alike.
   Give a check that tells this problem apart from the others, with the
   expected output for each case.
3. **Cause.** Why it happens, in a few sentences. Name the conditions it needs,
   such as a version range, a tenancy model, or a CNI. Readers who don't match
   them can stop here.
4. **Fix.** The steps that resolve it. Use `Flow` and `Step` for more than two
   steps. When the fix differs by setup, give each setup its own subsection
   and say at the top of the section which one applies to whom.
   - If the fix needs a restart, causes downtime, or rotates credentials, say
     so before the steps, not inside them.
   - If a step widens access or turns on debug settings, end with a step that
     turns it back off.
5. **Verify.** A command and its expected output that confirm the fix worked.
   If correct behavior could look like a failure, say so here.
6. **Fix status (optional).** If a product release fixes the problem, give the
   version, and label the steps above as a workaround for earlier versions.
   Use a real version number, not a version token.
7. **Related resources.** Links to the feature's configuration page, related
   troubleshooting pages, and the GitHub issue or PR if public.

## Skeleton

````mdx
---
title: Resolve <problem in the reader's terms>
sidebar_label: <short symptom>
description: <Symptom and the setup it affects, in one sentence.>
---

import Flow, { Step } from '@site/src/components/Flow';

## Symptoms

<What the reader sees.>

```text
<exact error message or log line>
```

## Cause

<Why it happens, and the conditions it needs.>

## Fix

<Restart, downtime, or credential impact, if any.>

<Flow>
<Step>
<What this step does.>

```bash
<command>
```
</Step>
</Flow>

## Verify

<How to confirm the fix worked, with expected output.>

## Related resources

- [<Feature configuration>](<relative-path>.mdx)
````

## Don't

- Don't append troubleshooting to the end of a configuration or feature page.
  Give it its own page and link to it from the feature page.
- Don't put admonitions inside `Step`.
- Don't name customers, their infrastructure, or incidents.
