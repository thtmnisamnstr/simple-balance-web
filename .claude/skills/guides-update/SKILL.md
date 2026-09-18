---
name: guides-update
description: Bring docs/standards, AGENTS.md and CHANGELOG.md back to true after work lands. Use after finishing a change, or when asked to update the guides, standards or docs.
---

# Bring the documents back to true

`docs/standards/writing.md` §Keeping a document true states the rule: **a
change that alters behaviour a document describes changes that document in the
same commit.** This is that step done systematically instead of from memory.

**Point at the guides, never copy them.** If you find yourself restating a rule
here or in a test comment, cite `file:line` instead. A copied rule drifts,
which is the exact defect the guide set exists to prevent.

## 1. What actually changed

```sh
git diff main...HEAD --stat
git log --oneline main..HEAD | cat
```

For each change write one sentence about the **behaviour**, not the edit. "The
sign-in control now says why it does nothing" rather than "changed a span".

Then sort each into exactly one of:

- **Contradicts a written rule.** Highest priority — a guide that lies is worse
  than one that is silent, because it is believed and cited.
- **A new pattern that will recur.** Wants a rule.
- **A one-off inside an existing rule.** May want a citation refresh.
- **Invisible to every document.** Most refactors.

## 2. Find every document that describes it

| Changed                                        | Read            |
| ---------------------------------------------- | --------------- |
| A component, CSS, an interaction, an image     | `web.md`        |
| Copy, frontmatter, the content pipeline        | `content.md`    |
| The build, Netlify, headers, DNS, dependencies | `operations.md` |
| Types, React, tests, comments                  | `code/*.md`     |
| Something that would make the site _wrong_     | `AGENTS.md`     |

Then find every mention, because a rule is stated once and cited several times:

```sh
grep -rn "<the thing>" docs/ AGENTS.md
```

## 3. Rewrite what is now false

Keep the argument. These guides argue from the code, and a rule with its
reasoning removed is a rule the next person deletes.

Four specific things to check:

- **A stated blocker that no longer blocks.** Grep the guides for the thing you
  just built. `content.md` 5.1 names a trigger to revisit the docs framework
  decision; `operations.md` 6.2 names a fallback for each pre-1.0 dependency. Both are the kind of note
  that outlives its reason.
- **A `human` that is now checked.** Move it into the guide's "what is checked"
  table and name the test.
- **The `*Checked by:*` line.**
- **An example that no longer matches the source.**

## 4. Write rules only for what will recur

A rule for a one-off is noise. Match the house shape exactly: a `###` heading
in sentence case, a **Binding** / **House** / **Contested** label, the argument
with citations, **what the obvious alternative was and why it is wrong**, and a
closing `*Checked by:*`.

If it can be mechanised, write the test in the same change and mutation-prove
it.

## 5. The changelog

`writing.md` §The changelog owns the shape. Under `## Unreleased`, in
`Added` / `Changed` / `Fixed`, written for somebody deciding whether this
matters to them. **An entry naming a file or a function has failed.**

## 6. AGENTS.md

Only for something that makes the site _wrong_ rather than untidy — the
`ads.txt` rules, the announced flag, the brand contract. It is the top of the
hierarchy and every guide defers to it.

## 7. Recount and repoint

```sh
npx vitest run tests/standards-citations.test.ts
```

Fix from its output, which is idempotent. Renumbering mechanically from a diff
double-applies the moment the diff grows.

Then `npm run format && npm run verify`.

## 8. Report

Documents changed and why; any rule newly mechanised; any disagreement recorded
rather than resolved; and anything found false that you did not fix, with the
reason.
