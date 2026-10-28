# Standards

Two sets, and neither restates the other.

- **[`web.md`](web.md)** — the design. Tokens, rhythm, type, color, images,
  states and the keyboard. What the page looks like and why.
- **[`content.md`](content.md)** — the words, and the content pipeline behind
  `/blog`, `/docs` and `/learn`. Voice, claims, frontmatter, and what a writer
  may rely on.
- **[`operations.md`](operations.md)** — the build and the deployment. Netlify,
  the static export, DNS, and the one file whose absence costs money.
- **[`code/`](code/index.md)** — the source. TypeScript strictness, components,
  tests, comments, Next's surprises, and the linter and formatter settings.

Two documents sit outside the standards and are the first things to read when
picking this up:

- **[`../roadmap.md`](../roadmap.md)** — everything known to be outstanding,
  each item with why it is not done and what done looks like.

Eleven skills in `../../.claude/skills/` turn the recurring work into
procedures: `sync-from-app` brings the site to a new application release,
the docs included; `merge-prep` prepares a branch for merge; `write-content`
writes a post, a docs page or a learn guide; `draw-and-animate` makes a
picture and its motion; and `update-dependencies`, `legal-review`,
`design-review`, `seo-review`, `aeo-review`, `optimize` and `guides-update`
each bring one part of the site back to true. `merge-prep` runs those last
seven itself, in that order, because each can change what the ones after it
look at, so before a merge it is the only one to ask for. The README's "Which
skill to run" says which to reach for when.

`../../AGENTS.md` sits above all of them and holds the invariants — the rules
that, broken, make this site wrong rather than untidy. Where a guide and
`AGENTS.md` disagree, `AGENTS.md` wins and the guide records the disagreement
rather than quietly losing it.

## How a rule is written here

Every rule carries a label, an argument, and a closing line saying what checks
it.

- **Binding.** Cannot be broken. Something outside this repository stands
  behind it — WCAG, a wire format, a vendor's terms, or `AGENTS.md`.
- **House.** A settled preference. A violation is untidiness, not a defect.
- **Contested.** Recorded rather than resolved, with both sides.
- **Guidance.** How the work is usually done well here: a recipe, a
  vocabulary or a shape to copy, with its reason. Departing from it is a
  judgment, not a defect. It still argues, still names the alternative, and
  still closes with what checks it, which is usually `human`.

And every rule says **what the obvious alternative was and why it is wrong**.
That sentence is what makes a rule survive somebody who disagrees with it.

**Guidance is the newest label, and it exists so the guides can teach without
tightening.** With only the first three, a recipe had to be written as a
rule, and a recipe written as House reads as something a reviewer enforces
line by line. The owner asked for plenty of guidance on what to do without
the guides becoming more restrictive, and the label is how both are true. A
paragraph inside a Binding or House section can carry it too, by name, when
the section's rule is fixed and the way of meeting it is not.

`*Checked by:*` names a test, or says `human` and explains why no test can
decide it. "Not checked" with no reason is not an acceptable state for a rule;
either it can be mechanized, or the guide says what a person has to look at.

## This site's relationship to the application

Simple Balance itself lives in a separate repository with its own, much larger
guide set. One thing crosses the boundary: the brand token contract in
`src/styles/brand.css`, copied from the app's stylesheet. Everything else here
is this site's own, because a marketing page and a ledger are different
problems and sharing rules between them would make both worse.

The token contract is the exception because the alternative is visibly worse:
two greens.
