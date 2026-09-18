# Standards

Two sets, and neither restates the other.

- **[`web.md`](web.md)** — the design. Tokens, rhythm, type, colour, images,
  states and the keyboard. What the page looks like and why.
- **[`content.md`](content.md)** — the words, and the content pipeline behind
  `/blog` and `/docs`. Voice, claims, frontmatter, and what a writer may rely
  on.
- **[`operations.md`](operations.md)** — the build and the deployment. Netlify,
  the static export, DNS, and the one file whose absence costs money.
- **[`code/`](code/index.md)** — the source. TypeScript strictness, components,
  tests, comments, and the linter and formatter settings.

Two documents sit outside the standards and are the first things to read when
picking this up:

- **[`../roadmap.md`](../roadmap.md)** — everything known to be outstanding,
  each item with why it is not done and what done looks like.
- **[`../adsense.md`](../adsense.md)** — how ads reach the application, why
  this site's `ads.txt` authorises them, and the one mistake that costs revenue
  with no symptom.

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

And every rule says **what the obvious alternative was and why it is wrong**.
That sentence is what makes a rule survive somebody who disagrees with it.

`*Checked by:*` names a test, or says `human` and explains why no test can
decide it. "Not checked" with no reason is not an acceptable state for a rule;
either it can be mechanised, or the guide says what a person has to look at.

## This site's relationship to the application

Simple Balance itself lives in a separate repository with its own, much larger
guide set. One thing crosses the boundary: the brand token contract in
`src/styles/brand.css`, copied from the app's stylesheet. Everything else here
is this site's own, because a marketing page and a ledger are different
problems and sharing rules between them would make both worse.

The token contract is the exception because the alternative is visibly worse:
two greens.
