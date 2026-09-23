# Testing

## 1. What a marketing site is worth testing

A static page with no state and no user input does not need a large suite. What
it does need is a check on every claim that is expensive to get wrong and
invisible when it is.

Four kinds earn their place here:

- **Money.** The `ads.txt` rules (`operations.md` 2). Wrong, they cost revenue
  and produce no symptom.
- **Contracts with another repository.** The brand tokens. Drift is visible
  only to somebody looking at both surfaces at once.
- **Claims.** The copy rules. A test can read every string; a reviewer reads
  the ones they scroll past.
- **Accessibility facts a renderer can decide.** Heading order, alt text,
  landmark names, `aria-hidden` on decoration.

What is **not** worth testing: that a component renders, that a class is
applied, that a heading says what the content module says it says. Those are
change detectors.

## 2. Rules

### 2.1 A sweep asserts its population first

**Binding.** A check that makes a claim about every file, image or string
begins by asserting it found some.

An empty population passes every claim made over it, so a matcher that stops
matching is indistinguishable from a repository that complies. This is
inherited from the application, where three checks were found to be asserting
nothing at all.

_Checked by:_ `human`, and it is visible in every sweep here — `expect(...)
.toBeGreaterThan(n)` before the real assertion.

### 2.2 Discover the population, name the exceptions

**Binding.** A check about a kind of file walks the tree (`sourceFiles` in
`tests/support/source.ts`). It does not carry a list of paths.

A list is a claim about what exists, made once, by somebody who could not see
what would be added. An _exception_ is different and is written down, named and
argued — the Shiki custom properties in `tests/brand-tokens.test.ts` are the
example here.

### 2.3 Every new check is mutation-proved

**Binding.** Break the thing it guards, watch it fail by name, restore, watch it
pass.

A check nobody has seen fail is a check that may not be able to fail. Five real
defects in this repository were found by the brand-token test while it was
being written, which is the standard to hold a new check to.

### 2.4 Tests read the built output where the built output is the point

**House.** `tests/sections.test.tsx` reads `out/`, because `noindex`, the
sitemap and `robots.txt` are what a crawler sees. This is why `npm run verify`
builds before it tests.

### 2.5 A narrowed check beats a changed fact

**House.** When a check fires on correct code, narrow the check and say why.
Do not change the code to satisfy a rule that was wrong.

Both copy rules here were narrowed rather than obeyed: the "no simple/easy"
check reported the product's own name and the repository URL, and the
whitespace check reported the deliberate indentation inside a terminal sample.
Each now strips what it should never have been reading.

### 2.6 A check finds its subject by identity, not by what it is called

**House.** When a check is about a fact, it locates that fact by a stable
identifier. Matching the visible label couples a check about behavior to a
decision about wording, and the two change for different reasons, at different
times, at the hands of different people.

Four checks broke in one afternoon on a copy rewrite that changed no behavior
any of them was testing:

- `tests/app-facts.test.ts` found the account-limit row by its label,
  `"Financial accounts"`. Rewording that heading for a general reader turned
  three lookups into `undefined` and failed **the check that holds this site's
  prices to the application's contract** — for a reason that had nothing to do
  with prices. Rows carry an `id` now.
- `tests/pricing.test.tsx` required an FAQ question containing `"archived"`
  and another containing `"self-hosting"` — both the product's words for
  things, neither one a reader would type. The check was holding the page to
  the vocabulary the rewrite existed to remove.
- `tests/home-page.test.tsx` asserted the screenshot disclosure by searching
  for `"demo ledger"`. It now asserts the exported string itself, so the
  sentence is free to be rewritten and its absence still fails.

**The obvious alternative is to match the visible string**, and it is why this
keeps happening: it reads naturally, it passes on the day it is written, and
the coupling is invisible until somebody edits prose. A test that fails when
the page is reworded is not protecting the fact it names; it is protecting a
sentence nobody promised to keep.

The tell is a string literal in a test that also appears on a page. If the
same words are in `src/content/`, the test should be reaching for the value,
not retyping it.

_Checked by:_ `human`. The failure names the wrong subject when it happens,
which is the signal — a check about a number failing with "expected undefined"
after a copy edit is this rule, every time.

## 3. Tiers

Two, and there is no integration tier because there is no server.

**jsdom**, for everything that is a fact about markup, content or the built
output — the great majority of this suite, and fast.

**A browser**, for the one thing jsdom cannot do at all. `tests/a11y.test.ts`
serves `out/` itself, drives Chromium through Playwright, and runs axe over
every emitted page in both themes. Color contrast is the reason it exists:
jsdom has no layout engine and no computed styles, so a token change that
makes text unreadable is invisible to every other test here and to every
reviewer who did not happen to open that page in that theme.

It is the only test that needs a browser, and it is skippable by one named
variable — `SKIP_BROWSER_TESTS=1`, set in `netlify.toml` and nowhere else,
because Netlify's build image is not guaranteed to have the libraries Chromium
needs. `operations.md` 5 explains why the skip is explicit rather than
conditional on Chromium being present.

**What neither tier can see** is rhythm, alignment, balance, and whether a
section is in a sensible place. Those rules in `web.md` are `human`, and
`design-review` is that pass.
