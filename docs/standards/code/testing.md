# Testing

## 1. What a marketing site is worth testing

A static page with no state and no user input does not need a large suite. What
it does need is a check on every claim that is expensive to get wrong and
invisible when it is.

Five kinds earn their place here:

- **Money.** The `ads.txt` rules (`operations.md` 2). Wrong, they cost revenue
  and produce no symptom.
- **Contracts with another repository.** The brand tokens. Drift is visible
  only to somebody looking at both surfaces at once.
- **Claims.** The copy rules. A test can read every string; a reviewer reads
  the ones they scroll past.
- **Accessibility facts a renderer can decide.** Heading order, alt text,
  landmark names, `aria-hidden` on decoration.
- **What only machines read.** The structured data, the sitemap and its
  dates, the robots meta tag, the link-preview cards, the Markdown copies and
  `/llms.txt`. None of it shows on the page, all of it goes wrong in somebody
  else's software, and every piece is cheap to check in `out/`
  (`tests/structured-data.test.ts:8`–`17` argues it for the JSON-LD). Nobody
  notices a preview card naming the wrong page until a link has been pasted
  into a chat, and by then it's the reader who noticed.

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

**Guidance: how to prove it.** The rule is the paragraph above; these are
the ways of meeting it that have worked here, and another route that leaves
a check watched failing by name meets it as well.

- **A check on the built output:** break the file in `out/`, run that one
  test file, and run `npm run build` to put `out/` back. Breaking the source
  and rebuilding works too, and costs a build each way.
- **A check on the source:** make the break, run the test file, and undo the
  edit itself. `git checkout -- <file>` is the quick undo only for a file
  with no other uncommitted change, because it throws those away too.
- **Either way, end on `git status` and `git diff`** for the files you
  touched, with nothing of the mutation left. A break left in the tree is
  the one change nobody meant to commit.
- **The failure names its subject.** It says which page or file, in the
  assertion's message or in the list it compares, because "expected [ … ] to
  equal [ ]" with no page in it sends the next person searching.
- **The comment says what it was proved against**, the way
  `tests/sections.test.tsx:74` records the hand-written anchor it was proved
  with. A reader can then tell a check that was watched failing from one
  that was only written.

_Checked by:_ `human`. Nothing can tell a proved check from an unproved one
except the comment that says what broke it.

### 2.4 Tests read the built output where the built output is the point

**House.** `tests/sections.test.tsx` reads `out/`, because `noindex`, the
sitemap and `robots.txt` are what a crawler sees. This is why `npm run verify`
builds before it tests.

**Guidance.** More than half the test files read `out/` now, and the same few
things trip each new one:

- **Build first.** A lone `npx vitest run` after a source edit tests the
  previous build, and passes or fails for reasons that are no longer true.
  `npm run verify` builds first; by hand, `npm run build` comes before the
  test file.
- **Parse what the consumer parses.** `JSON.parse` for the JSON-LD
  (`tests/structured-data.test.ts`), `@xmldom/xmldom` for a feed
  (`tests/feeds.test.ts`), and a regex only for one attribute on one tag. A
  substring check sails past the unescaped ampersand every feed reader
  refuses.
- **Match what Next writes.** A metadata URL comes out absolute against
  `metadataBase`, so a test looking for a page's alternate link matches
  `https://smpl.money/…` and not the path the route wrote
  (`tests/markdown.test.ts:60`). React escapes five entities into an
  attribute or a title, so decode before comparing lengths or words
  (`tests/sitemap.test.ts:49`).
- **Reuse the walk.** The `out/` page walk is written out again in the
  accessibility, branding, copy, feeds, sitemap and structured-data tests,
  and the copies disagree about the error page: the copy and feeds tests
  also read `404.html` (`tests/copy.test.ts:138`, `tests/feeds.test.ts:36`)
  and the others don't. Not counted, because nothing recounts it
  (`writing.md` §Measured numbers). The next one goes into `tests/support/`,
  beside `sourceFiles`, with the error page decided once.
- **A byte-for-byte match on Next's serialization**, like the robots tag at
  `tests/sitemap.test.ts:155`, can fail on correct output after an upgrade
  changes how Next writes a tag. That is 2.5: narrow it to the attribute and
  its value, and don't hold the upgrade back.

_Checked by:_ `npm run verify`, whose order is the rule; the rest is `human`.

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

**Guidance: a typeset value.** Words outside the prose are typeset where
they render (`web.md` 3.3), so the source says `doesn't` and the page says
`doesn’t`. A test that looks for a content string on the rendered page
compares `typeset(value)`, not the value
(`tests/home-page.test.tsx:153`). "Unable to find an element with the text"
right after a string gained an apostrophe or a quotation mark is almost
always this, and the fix is the wrapper rather than a looser matcher.

_Checked by:_ `human`. The failure names the wrong subject when it happens,
which is the signal — a check about a number failing with "expected undefined"
after a copy edit is this rule, every time.

### 2.7 A check built on a pattern is tested on fixtures

**House.** When a check's work is done by a regex or a predicate, it gets
literal lines it must catch and literal lines it must pass, tested against the
pattern directly. The skill-name sweep has both lists
(`tests/skills.test.ts:217`–`245`), the redirect predicate has both
(`tests/export-shape.test.ts:176`), and so do the spelling and em dash
readers in `tests/copy.test.ts` and the content security policy reader in
`tests/legal.test.tsx`.

The repository on any given day may hold no example of the shape the check
exists for. The redirect check guards against a catch-all `netlify.toml`
doesn't have, so a sweep over today's file proves the file complies and says
nothing about whether the pattern would see the next one. A fixture is the
violation, kept where the pattern can always see it.

**Each shape that once fooled a check goes in as a fixture, with a comment
naming it.** The skill sweep's dead names come in each form a skill is cited
in here, bold, in a list, in a table beside a section number and inside a
path, and the bold one and the table row are lines a rename really left
behind, in the legal review and the roadmap. The passing list matters as
much: it is what stops a pattern widened in a hurry from becoming a ban on a
word rather than on a claim, which is what `tests/copy.test.ts:314` exists
for.

**The obvious alternative** is to test the pattern only through the
documents as they are, which is what the sweep already does, and it's green
exactly when it can't tell you anything.

_Checked by:_ `human`.

### 2.8 A mapping keyed by page is held in both directions

**House.** Where something exists once per page, the check holds the two
sets equal: every page has its piece, and no piece exists for a page that
doesn't.

- The sitemap: `tests/sitemap.test.ts:70` and `:82`.
- The page cards: `tests/export-shape.test.ts:362`.
- The docs marks and the group pictures: `tests/docs-features.test.ts:196`
  and `:205`.
- The learn art and glyphs: `tests/learn.test.ts:352`.
- The screenshots' narrow copies: `tests/home-page.test.tsx:336` and `:372`.

**One direction is the natural test to write, and it is half the defect.**
"Every page has a card" passes beside a card for a page that was renamed;
"every card has a page" passes beside a page that has none. The forward half
catches what a reader sees missing; the backward half catches what ships for
a page that's gone.

**The build fails first where it can.** The accessor a page renders through
throws on a missing key, so the build names the page before any test runs
(`src/components/docs-art/glyphs.tsx:153`, and the same shape for the group
pictures and the learn art). The test then holds the other direction, which
no accessor can see, because nothing asks for a key that belongs to no page.

**The gap.** The page cards are held by their record,
`scripts/build-images.sources.json`, not by the files in `public/og/`. The
script rewrites the record whole and never deletes a PNG, so an orphan card
ships while the record check passes (`operations.md` 7.1).

**The obvious alternative** is the one direction, and it is the one everybody
writes first.

_Checked by:_ `human`.

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

It also measures layout, for the same reason: reflow at 320px and 390px, and
the defects `web.md` §9 attributes to its "layout" block — a lede flush
against its title, a code block narrower than its column, two figures that do
not line up, a search field wearing the browser's focus ring, the blog's lead
cover sitting lower than its own inset, the docs sidebar open on a phone, and,
from one design review, the legal pages' sections running together, the
browser's gap under a list, pager titles and starting-point kickers out of
level, a comparison row's divider stepping on a phone, a stacked plan card's
empty top, a short page ending in a band under its footer, a picture's labels
too small to read, every stop wearing the link's ring, the art panel's ring
under 3:1, a screenshot's `sizes` that the layout had moved away from, a
card's drawing that sat still on a phone or was still arriving once its
picture was on screen, and a scroll-built drawing frozen inside a box that
hides its overflow.
Each was found by looking first and written down second, so the block is a
record of what a review caught rather than a claim about layout in general.

It is the only test that needs a browser, and it is skippable by one named
variable — `SKIP_BROWSER_TESTS=1`, set in `netlify.toml` and nowhere else,
because Netlify's build image is not guaranteed to have the libraries Chromium
needs. `operations.md` 5 explains why the skip is explicit rather than
conditional on Chromium being present.

**Guidance: what the next browser check should know.**

1. **A function passed to `page.evaluate` is serialized** and run in the
   page, so it reaches nothing around it: no import, no variable from the
   test, no helper it doesn't define inside itself. Define it at module scope
   and pass it by name, where it's plain that it closes over nothing and can
   be reused at both widths, as `ring` and `readSidebar` are
   (`tests/a11y.test.ts:243`, `:391`).
2. **Ask whether something shows with `checkVisibility()`, never its size.**
   A closed `<details>` hides its content with `content-visibility: hidden`,
   and a script asking for a height gets one anyway
   (`tests/a11y.test.ts:408`–`411`).
3. **A responsive behavior is measured at both widths in one test**, through
   `measure()`'s width argument (`tests/a11y.test.ts:454`), so the test
   states the behavior as the pair it is: the sidebar shown at 1280 and
   folded at 390 (`tests/a11y.test.ts:677`). Split in two, either half can be
   deleted or go stale while the other stays green. A phone is a context, not
   a width: `(hover: none)` follows touch emulation, so a 390-wide context
   without `measure()`'s `touch` argument is a narrow desktop, and the card
   test states phone and desktop as one pair the same way
   (`tests/a11y.test.ts:925`).
4. **The contexts don't set reduced motion**, so axe audits the page moving,
   as most readers see it. A contrast failure that comes and goes between
   runs is text fading in over a background, and the fix is the animation,
   not a retry; that is why a card rises into view and never fades into it
   (`web.md` 8.3). A loop never settles, so at networkidle axe measures
   whichever frame it lands on, and the finished picture is checked
   deliberately instead (`web.md` 8.7).
5. **Several pages or widths go through `Promise.all`, and a walk that
   depends on its last step recurses.** The linter refuses an `await` inside
   a loop (`eslint/no-await-in-loop`). Where the steps are independent it's
   right: each width is a context of its own, so the screenshot widths and
   every docs page's pager are measured at once through `measure()`. Where
   each step depends on the last, as each Tab press lands wherever the
   previous one left focus, `tabStops` calls itself rather than looping
   (`tests/a11y.test.ts:261`), which keeps the order and passes the linter
   without switching it off.

**What neither tier can see** is rhythm, alignment, balance, and whether a
section is in a sensible place. Those rules in `web.md` are `human`, and
`design-review` is that pass.
