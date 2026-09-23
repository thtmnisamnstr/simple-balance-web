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

Thirty-five section citations live in `.claude/` and none of them was checked.
Both spellings count — a guide writes `` `operations.md` 6.2 `` and a skill
usually writes the full path — and the pattern only ever allowed one directory
segment, so the skills' own form was invisible to it twice over.

Line numbers rot. That is accepted rather than solved: the citation test proves
the file exists and the line is inside it and has something on it, and cannot
prove the line still holds what the sentence claims. When code moves under a
citation, find what the sentence names and cite where it is now. A pass that
shifts every number by the size of a diff is wrong for every citation whose
target did not move by exactly that much.

_Checked by:_ `tests/standards-citations.test.ts`.

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
