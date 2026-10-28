---
name: guides-update
description: Bring docs/standards, AGENTS.md, the README and CHANGELOG.md back to true after work lands. Use after finishing a change, or when asked to update the guides, standards or docs.
---

# Bring the documents back to true

`docs/standards/writing.md` §Keeping a document true states the rule: **a
change that alters behavior a document describes changes that document in the
same commit.** This is that step done systematically instead of from memory.

**Point at the guides, never copy them.** If you find yourself restating a rule
here or in a test comment, cite `file:line` instead. A copied rule drifts,
which is the exact defect the guide set exists to prevent.

## 1. What actually changed

Run the scope block in `merge-prep` §1. It fetches `main` first and diffs the
working tree against where this branch left it, and it says there why each
line is needed; the short of it is that the change is mostly uncommitted when
this runs, and a stale local `main` makes other people's merged work look like
this branch's.

**When `merge-prep` called this skill, run the block again** rather than
reusing the list it wrote. This runs at its §11, after an upgrade, its fixes,
a legal review, a design review, the search and answer-engine reviews and an
optimization pass have each had the chance to add to the change, and the
documents have to describe all of it: a dependency the upgrade moved is as
much a reason to touch `operations.md` 6.2 as anything the branch set out to
do.

For each change write one sentence about the **behavior**, not the edit. "The
sign-in control now says why it does nothing" rather than "changed a span".

Then sort each into exactly one of:

- **Contradicts a written rule.** Highest priority — a guide that lies is worse
  than one that is silent, because it is believed and cited.
- **A new pattern that will recur.** Wants a rule.
- **A one-off inside an existing rule.** May want a citation refresh.
- **Invisible to every document.** Most refactors.

## 2. Find every document that describes it

| Changed                                                                          | Read                                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A component, CSS, an interaction, an image                                       | `web.md`                                                                              |
| A drawing, a diagram, a mark, or anything that moves                             | `web.md` 5.7–5.10 and 8                                                               |
| Copy, frontmatter, the content pipeline                                          | `content.md`                                                                          |
| A title, a social card, structured data, the Markdown copies, a route's metadata | `content.md` 5.13–5.16, `operations.md` 7, `code/next.md`                             |
| The build, Netlify, headers, DNS, dependencies                                   | `operations.md`                                                                       |
| Types, React, tests, comments                                                    | `code/*.md`                                                                           |
| A skill added or renamed                                                         | AGENTS.md's list (tested), the counts in `docs/standards/index.md` and README (not)   |
| A skill's order, its scope, or what it calls                                     | README's "Which skill to run", AGENTS.md's "Recurring tasks", the skills that call it |
| A source comment that says what the code does                                    | `code/comments.md` 4                                                                  |
| Something that would make the site _wrong_                                       | `AGENTS.md`                                                                           |

Then find every mention, because a rule is stated once and cited several times,
and a comment in the source describes the same behavior with nothing to hold it
to the code:

```sh
grep -rn "<the thing>" docs/ .claude/ AGENTS.md README.md
grep -rn "<the thing>" src/ tests/ scripts/
```

## 3. Rewrite what is now false

Keep the argument. These guides argue from the code, and a rule with its
reasoning removed is a rule the next person deletes.

Six specific things to check:

- **A stated blocker that no longer blocks.** Grep the guides for the thing you
  just built. `content.md` 5.1 names a trigger to revisit the docs framework
  decision; `operations.md` 6.2 names a fallback for each pre-1.0 dependency.
  Both are the kind of note that outlives its reason.
- **A `human` that is now checked.** Move it into the guide's "what is checked"
  table and name the test.
- **The `*Checked by:*` line.**
- **An example that no longer matches the source.**
- **A comment that describes the old behavior.** A doc comment saying how a
  drawing moves, or naming code that's gone, is believed the way a wrong guide
  is, and no test reads it (`code/comments.md` 4). Grep `src/ tests/ scripts/`
  for the words it would have used: for motion, "plays once", "five seconds",
  "on load"; for something removed, every name it went by, not only its
  file or component name.
- **A count in prose the change moved.** "Eight skills", "five components",
  "twelve today": each was true when written and nothing recounts it
  (`writing.md` §Measured numbers). Grep for the number in words as well as
  digits, and prefer a sentence that doesn't need one.

## 4. Write rules only for what will recur

A rule for a one-off is noise. Match the house shape exactly: a `###` heading
in sentence case, a **Binding** / **House** / **Contested** / **Guidance**
label, the argument with citations, **what the obvious alternative was and why
it is wrong**, and a closing `*Checked by:*`.

**Guidance** is for a recipe, a vocabulary or a shape to copy: how the work is
usually done well here, where departing from it is a judgment rather than a
defect (`docs/standards/index.md` §How a rule is written here). Don't label a
recipe House to give it weight. A reviewer enforces House line by line, and the
owner asked for plenty of guidance on what to do without the guides becoming
too restrictive.

If it can be mechanized, write the test in the same change and mutation-prove
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
npx vitest run tests/standards-citations.test.ts tests/guide-structure.test.ts tests/skills.test.ts
```

Fix from their output, which is idempotent. Renumbering mechanically from a
diff double-applies the moment the diff grows.

Three traps fail these on prose that reads correctly:

- **A backticked lowercase hyphenated name** is read as a skill, and motion
  and drawing prose is full of them: a property, a keyframe, a lint rule.
  Write a class with its dot, a property with its value, a keyframe in plain
  words, and a lint rule with its plugin prefix, or record the name and what
  it is in `NOT_SKILLS` in `tests/skills.test.ts`. `writing.md` §What a
  guide's backticks survive.
- **A dollar sign followed by a digit in a skill**, a price or a shell
  argument, which Claude Code fills in before anybody reads it. `writing.md`
  §What a skill's text survives.
- **A section appended past its parent.** A subsection written at the end of
  the file lands under the last `##` rather than its own, and reads correctly
  on its own: that's how `content.md` once had 5.9 to 5.13 sitting under
  `## 6`. Each subsection goes before the next `##`.

Then `npm run format && npm run verify`.

**When `merge-prep` called this, run `npm run format` and return to it
instead.** Its §12 is the verify and comes straight after this, so running it
here too is the same build and the same suite twice, and the push is that
skill's alone.

## 8. Report

Documents changed and why; any rule newly mechanized; any disagreement recorded
rather than resolved; and anything found false that you did not fix, with the
reason. Run from `merge-prep`, this goes into its report rather than standing
on its own.
