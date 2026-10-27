# Writing these documents

How the guides themselves are kept true.

## Keeping a document true

**Binding.** A change that alters behavior a document describes changes that
document in the same commit.

Not "soon", and not in a follow-up. A guide that lies is worse than a guide
that is silent, because it is believed and cited. The `guides-update` skill is
this rule done systematically rather than from memory.

_Checked by:_ `tests/standards-citations.test.ts` for the citations and links.
Whether the prose still describes the code is nobody's check but a reader's,
which is why the citation test exists — a drifted line number is the cheapest
available proxy for a drifted sentence.

## Citations

**House.** A rule argues from the code, and names it: `` `src/app/page.tsx:42` ``.
A rule with no citation is an opinion.

**The skills are held to this too**, and were not for a while. `.claude/` was
outside the citation test's scope, which is how `update-dependencies` and
`guides-update` both went on pointing at `operations.md` 5.2 and 5.3 through a
renumbering that made them 6.2 and 6.3 — and how `optimize` came to name a
script that had been deleted. A wrong citation in a skill is worse than the
same mistake in a guide: a skill is read by whoever is _about to do the work_,
so it sends somebody to the wrong rule at the moment they are relying on it.

There were thirty-five section citations in `.claude/` when the check was
added, and none of them had ever been checked. Both spellings count — a
guide writes `` `operations.md` 6.2 `` and a skill usually writes the full
path — and the pattern only ever allowed one directory segment, so the
skills' own form was invisible to it twice over.

Line numbers rot. That is accepted rather than solved: the citation test proves
the file exists and the line is inside it and has something on it, and cannot
prove the line still holds what the sentence claims. When code moves under a
citation, find what the sentence names and cite where it is now. A pass that
shifts every number by the size of a diff is wrong for every citation whose
target did not move by exactly that much.

**Every number in a citation is a line**, a range's end written after it
(`` `…:42`–`51` ``) and another line of the same file (`` `…:42`, `:60` ``)
included. The test read only the first for a while, so a pass that shifted
the starts left a range in `code/testing.md` running backwards and a `:303`
naming the helper inserted above the one it cited. It reads all of them now,
and refuses a range that ends before it starts.

_Checked by:_ `tests/standards-citations.test.ts`.

## What a skill's text survives

**Binding.** No skill contains a dollar sign followed by a digit, or
`$ARGUMENTS`. Claude Code replaces each one with the words the skill was
invoked with, counting from zero, before anybody reads the skill.

So a shell function in a skill that reads its argument as `$1` is not reading
an argument. `sync-from-app` was invoked with a request whose second word was
"application", and its `kit()` helper arrived fetching
`docs/product/application` for every file it was asked for, which 404s, while
its `checked()` helper read every field of the sync report as empty. Both
looked like the failed check that §0 of that skill warns about, and neither
was the application's fault.

**Quoting does not help**, which is the obvious thing to try: the replacement
is made on the text, not by a shell, and `"…/$1"` was inside double quotes.
What works is never writing the form. A helper takes its argument with `for`,
which names no parameter; text is cut with `node` rather than `awk`, whose
whole-record field is the same form; and a price in a skill is written in
words, because the form is a price as well.

_Checked by:_ `tests/skills.test.ts`, which refuses the form in every skill
and is proved against each of those shapes.

## What a guide's backticks survive

**House.** A backticked lowercase hyphenated name in `docs/`, `.claude/`,
`AGENTS.md` or the README is read as a skill. `tests/skills.test.ts` treats
every one that way and passes skills, packages, `aria-` and `data-`
attributes, the application's own skills in its `APPLICATION_SKILLS` record
(`tests/skills.test.ts:50`), identifiers ending in a long number like the
publisher id (`tests/skills.test.ts:103`), and the names in its `NOT_SKILLS`
record (`tests/skills.test.ts:63`). Nothing else. That's how a skill renamed
under a bare citation gets caught, and bare is how most skills here are
cited.

Motion and drawing sections are full of names with that shape: CSS
properties, keyframes, classes and lint rules. Write each the way it's
written where it lives, and the sweep passes it:

- a class with its dot, `.mo-loop`;
- a property with its value, `clip-path: inset(50%)`;
- a keyframe in prose, by what it does;
- a lint rule with its plugin prefix, `jsx-a11y/prefer-tag-over-role`.

A name that can't be written any of those ways goes into `NOT_SKILLS` with
what it is, in the same commit.

**The obvious alternative is to narrow the sweep to skip CSS**, which is what
`code/testing.md` 2.5 would suggest for a check firing on correct text.
Nothing in a name's shape says CSS, though. A narrowing is either a list of
every property, keyframe and class, which is `NOT_SKILLS` with more to
maintain, or a pattern loose enough to pass a renamed skill cited bare,
which is the defect the check exists to catch. `NOT_SKILLS` is the narrowed
check, kept by name.

_Checked by:_ `tests/skills.test.ts`.

## Measured numbers

**House.** A number in a guide is either recounted by a test or marked as
illustrative. "About twenty" is honest; "23" that nothing recounts is a number
that will be wrong within a month and cited anyway.

_Checked by:_ `tests/standards-citations.test.ts` for the file:line forms.

## Where this guide and the repository disagree

**House.** Record it. Do not quietly pick one.

A disagreement written down is a decision somebody can revisit. A disagreement
resolved silently in favor of the code is a rule that was deleted without
anybody agreeing to delete it.

## The changelog

`CHANGELOG.md` is written for somebody deciding whether to take an update, in
the same voice as these guides: what was wrong, what it cost, what it does now.

Entries go under `## Unreleased` in `Added` / `Changed` / `Fixed`. **An entry
naming a file or a function has failed** — the reader does not have the
repository open.

This site has no released versions and no upgrade path: it is a website, and
every visitor gets whatever is deployed. The changelog is therefore a record
for maintainers rather than a contract with users, and it is kept because
"when did the hero copy change and why" is a question that gets asked.

## Commit messages

An imperative subject naming what is now true from the reader's side. No
prefix, no scope, no period, 70 characters as a ceiling. The test is whether
somebody who has not seen the diff could tell whether it affects them.

A body of hard-wrapped prose owing four things: why the defect survived review,
what was checked and how, findings that were rejected and why, and corrections
to the previous commit's message.
