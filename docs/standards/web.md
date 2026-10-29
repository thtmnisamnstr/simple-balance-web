# The design

What this site looks like, and why. Read the section for the thing you are
changing rather than the whole page.

## 1. Tokens

### 1.1 Color comes from the contract and nowhere else

**Binding.** Every color is a `var(--token)` declared in
`src/styles/brand.css`. A hex, an `rgb()` or a named color anywhere else is a
defect.

The contract is copied from the application's own stylesheet. A marketing page
that is a slightly different green from the product reads as a different
company, and the reader cannot say why they distrust it.

The obvious alternative — "just use the hex, it is the same value" — is exactly
the failure. A literal cannot re-theme, so a page built from literals looks
correct in light mode and broken in dark, which is the mode nobody checks.

_Checked by:_ `tests/brand-tokens.test.ts`, which sweeps every stylesheet but
the contract for a hex or an `rgb()` outside a comment. Whether the contract
still matches the application's stylesheet is `sync-from-app` §1, a token
diff over the network that should report `--art-ink` and nothing else; no
test can make it, because the other half is in another repository.

### 1.2 Two theme blocks, not three

**House.** `brand.css` declares `:root` and one
`@media (prefers-color-scheme: dark)` block, sharing one key set.

The application has a third, `:root[data-theme="dark"]`, because it ships a
theme toggle. This site has none, so a third block would be unreachable CSS.
`localStorage` is per-origin, so a toggle here could not carry a choice made at
`app.smpl.money` anyway — it would be a second, contradictory preference rather
than a shared one. Respecting the operating system and nothing else is the
honest behavior for a page somebody reads once.

If a toggle ever lands, the third block arrives with it and the test below
changes in the same commit.

_Checked by:_ `tests/brand-tokens.test.ts` — both blocks declare the same keys,
and `[data-theme` appears nowhere in the file.

### 1.3 A token that is identical in both themes is named

**House.** Almost every token differs between light and dark. The exceptions
are listed with a reason in `tests/brand-tokens.test.ts`, and today they are
`--on-accent` and the eight `--art-*` tokens.

The `--art-*` set paints the homepage's hero, its chat and its closing panel,
and the learn articles' pictures, which are pictures of a dark thing rather
than panels that follow the page: re-picking them for dark mode would make
them stop being the thing they depict. The application's own `--art-*` tokens work the same way and for the
same reason, and the learn art copies its sign-in screen's panel.

_Checked by:_ `tests/brand-tokens.test.ts`.

### 1.4 The scales live in the site, not the contract

**House.** Spacing, radius, type scale and weight are declared in
`src/styles/site.css`, not in `brand.css`.

Color is a brand fact and has to match the app exactly. Rhythm is a layout
decision, and a marketing page's rhythm is not an app's: this page is read once,
in one pass, as often on a phone as not, so it is built on larger type and more
air than a dense ledger table could afford.

_Checked by:_ `tests/brand-tokens.test.ts` — every `var()` the site reads is
declared by one file or the other.

## 2. Spacing

### 2.1 Every gap comes from the scale

**Binding.** Margins, padding and gaps use `--s-1` through `--s-10`. A literal
`14px` is a defect.

Inconsistent vertical rhythm is the single most-reported design defect in this
project's history, and it is always a section inventing its own gap.

**`em` is the exception, and it is not a gap.** A handful of paddings are
`em`-relative — the inset on an inline code chip, a tag, a badge, and the
optical nudge that lines a tick up with the text beside it. Each scales with
the type it wraps, which is the thing the px scale cannot do, and each is a
fraction of a character rather than a gap between two things. The scale owns
the space _between_ elements; `em` owns the space _inside_ one.

**A browser default is a gap too, and the scale replaces it.** A list in the
prose kept the browser's own 1em under it, because the prose's spacing rule
sets only a top margin: 17.44px under a list at 1280, against 16 under
everything else. `.prose-body` lists drop their bottom margin and leave the
top to that rule. `margin: 0` was the suggested fix, and it outranks the
spacing rule, so it would have closed the gap above every list instead.

_Checked by:_ `tests/a11y.test.ts`, "layout", for the gap under a list. The
rest is `human`, and it is the most mechanizable rule left here — a sweep
of `margin`, `padding`, `gap` and `inset` for length literals, with an
allow-list for `0`, percentages, and the `em` insets above. Run against this
tree it reports eleven: seven `em`, the `-1px` of the `.visually-hidden`
recipe, and **three ordinary `px` literals** — a `2px` grid gap, a `2px`
nudge and a `0 1px` inset, each below the smallest step on the scale and none
of them argued for anywhere. They are the reason to build the sweep rather
than the evidence that it is unnecessary.

### 2.2 A title and the text under it are spaced once, for every title

**House.** `--s-4` between a `.section-title` or an `.entry-heading` and the
lede or paragraph that follows it, from one rule in `site.css`.

Headings and paragraphs both zero their margins, so the gap has to come from
somewhere, and for as long as that has been true it came from nowhere: the
lede sat flush against its title on the homepage's sections, the pricing page,
the blog and every docs page and post. The 404 alone had a gap, from a flex
column nothing else used, which is the shape this rule is about — a section
that looks right because it invented its own spacing, beside every other
title on the site looking wrong because nobody did.

**A heading inside a `<section>` is a title too.** The privacy policy and the
terms put each heading and its paragraphs in a section, and the prose's
spacing reached its direct children only, so the sections were spaced and
everything inside them ran together: a heading flush on its text, and a
paragraph break that read as a line wrap. A section's children take the same
`--s-4` now, from `.prose-body > section > * + *`.

_Checked by:_ `tests/a11y.test.ts`, "layout", which measures the gap on a
rendered page of each kind, and every gap inside the legal pages' sections.

## 3. Type

### 3.1 The scale is fluid, and every size is on it

**House.** `--step--2` to `--step-4`, plus `--step-mono`, each a `clamp()`. No
font size is set in `px` or `rem` directly.

`clamp()` rather than breakpoints because a marketing page is read at every
width between 320 and 2560, and a step function has visible jumps at the
boundaries.

**The scale used to stop at `--step--1` and the rule was false in thirteen
places.** Everything smaller than that step invented its own size — 0.72,
0.75, 0.78, 0.8 and 0.85rem, five values for three roles — because the scale
had no step where the site actually needed one. A rule nothing can reach is
not a rule. So `--step--2` is the micro-label (a table's column head, a code
block's language, a tier's flag), and `--step-mono` is the code surface,
because monospace reads larger than the UI face at the same nominal size and
two places were shrinking it by hand.

**Three deliberate exceptions, each commented where it sits.** Inline code is
`0.9em`, because it has to track the size of the sentence around it and a step
would make it identical inside a heading and a footnote. The two avatar glyph
sizes scale with their circle rather than with the page. None of the three is
body text.

_Checked by:_ `human`, by sweeping `site.css` for `font-size:` followed by a
digit. Three hits is correct; a fourth is a role that wants a step.

### 3.2 The font stack matches the application's exactly

**Binding.** `Inter, ui-sans-serif, system-ui, …`, byte for byte what
`src/client/styles.css` declares in the app.

Neither surface loads a webfont, so both actually render in the system UI face
and are identical. That is worth knowing before somebody "fixes" it: adding
Inter here and not there would make the two surfaces differ in the most visible
way possible, and the change is one line.

If a webfont is ever added, it is added to both, self-hosted on each origin.
`default-src 'self'` permits a same-origin font and forbids `fonts.gstatic.com`,
so a cross-origin font is a CSP change as well as a design one.

**How to check it, because "there is no webfont here" is not the check.** The
rule is about a _match_, and the other half of the match is in another
repository, so it is read over the network like everything else
(`AGENTS.md`):

```sh
REF=$(node scripts/check-app-sync.mjs --json | node -p 'JSON.parse(require("fs").readFileSync(0, "utf8")).ref')
curl -fsSL "https://raw.githubusercontent.com/thtmnisamnstr/simple-balance/$REF/src/client/styles.css" \
  | grep -A 6 "font-family"
```

The ref is the one `sync-from-app` §0 reads rather than one typed by hand —
`main` since 0.2.0 merged — so the check looks at the stylesheet the site is
being kept in step with. A `null` ref or
a 404 is a check that failed, not a match, and `sync-from-app` §0 says how
to find out why.

Verified byte for byte on 22 September 2026, on both `main` and
`deployment-and-monetization`, and again on 4 October 2026 on `main` at the
0.2.0 release:
`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
every time.

**The monospace stack deliberately does not match, and this is the record of
why.** The application has exactly one mono rule — an 11px internal label —
and its stack ends `Menlo, monospace`. This site renders code blocks and
inline code, and `ui-monospace` has no implementation on
Windows in several browsers, so without `Consolas` a code block there falls
through to generic `monospace`, which is usually Courier New. The two surfaces
are not showing comparable content in mono, so the divergence costs nothing a
reader could see.

**What would end it:** the application rendering code to a user. At that point
the two stacks are showing the same kind of thing and should be reconciled —
by moving the app to this one, since it is the superset.

It is **one declaration**, `--mono` in `site.css`, not three. It was written
out three times, and three copies of a value are three chances for it to
disagree with itself — the same argument as the sign-up label in 6.2 and the
header height in 4.3.

### 3.3 Words outside the prose are typeset like it

**House.** A string that is rendered without passing through Markdown goes
through `typeset` (`src/lib/typeset.ts`) where it is rendered: the contents
list, a callout's title, a learn page's title and summary, the index's group
blurbs, every word in a learn picture, the homepage's copy, the privacy
policy and the terms a part at a time, the 404, and the pricing page's copy,
which is typeset once where it is imported so the FAQ's structured data
carries the same characters the page shows.

The prose curls its quotes through `remark-smartypants`, and nothing else did.
The contents list said "aren't" directly above a heading saying "aren’t", and
a diagram's caption said "doesn't" under a paragraph saying "doesn’t". Every
reviewer of the learn pages found it, on every page. The legal pages and the
404 were the same omission found later: the privacy policy showed 79 straight
apostrophes. The source stays ASCII, because that is what a person types and
what the copy checks read, and a contents entry's or a legal heading's id is
slugged from the source, so no anchor moves.

House, not Binding: nothing outside this repository asks for curly quotes,
and a straight apostrophe is untidy rather than wrong. The test enforces it
all the same, because a reviewer found it on every page and a check costs
less than that.

_Checked by:_ `tests/typeset.test.ts`, which runs every string `typeset` is
given through the prose pipeline as well and holds the two to the same
result, the legal pages' strings a sentence at a time, and reads the built
learn pages, the homepage, the pricing page, the legal pages and the 404 for
a straight quote anywhere a reader can see.

## 4. Layout

### 4.1 One breakpoint, decided by content

**House.** `62rem`, where two columns stop fitting, plus a small-screen tidy at
`34rem`. Neither is a device width.

Naming breakpoints after devices dates a stylesheet within a year. Naming them
after the point the layout actually breaks does not.

### 4.2 A class belongs to one thing, and styles something

**Binding.** A class used by two unrelated components is a class the two can no
longer differ on.

This is not hypothetical: the first draft of this site put `.problem-q` on both
a section heading and a card heading, and `.footer-note` inside a figure
caption. Both were fixed before the first commit, and the fix is always the
same — give the second use its own class, even when the declarations are
identical today. The pricing page's heading over the list under its
comparison table wore `.section-title`, and with it that class's 12px gap
under an eyebrow, so it sat tight under a table it doesn't belong to and
twice as far above the list it introduces. It's `.included-title` now.

**And it has to style something.** A rule nothing can produce is dead CSS; a
class the markup writes with no rule behind it is the mirror image, and worse
in one way — it reads as styling, so it survives every refactor because
removing it looks risky. Four had accumulated, each on an element that earns
its place through `aria-label` or `aria-labelledby` rather than through
anything visual, and each was removed rather than given a rule.

_Checked by:_ `tests/dead-css.test.ts`, in both directions. The second is
deliberately conservative — it reads only plain string literals, so a composed
name is skipped rather than guessed at. `tests/a11y.test.ts`, "layout", holds
the pricing heading's gap toward the list it heads.

### 4.3 No page ever scrolls sideways

**Binding.** At 320 CSS pixels — the narrowest width 3.1 says this page is
read at — `document.scrollWidth` equals the viewport. This is WCAG 2.1 AA
reflow (1.4.10), and it is the accessibility failure a clean axe report is
most likely to be hiding, because axe has no rule for it and because it is
invisible on the machine the page was built on.

Three separate causes were live when this was written, and **not one of them
looked like an overflow in the source**:

- **A flex row that cannot wrap does not clip — it pushes.** The header's
  brand, two links and sign-up label came to 453px against a 390px viewport.
  It wraps below `34rem` now. The alternatives all cost a control: hiding the
  brand word leaves a link with no accessible name, and dropping "Run it
  yourself" removes the only way a reader on a phone reaches the code.

  **Below `34rem` the header carries no sign-up button**, at the owner's
  request (October 2026). It was the one control that wrapped onto a row of
  its own, taking the header to 112px at 390 and 146px at 320; without it the
  header is 86px at both. It's the one control that can go, because it is
  the one the page repeats in its body: the homepage's hero has it on the
  first screen, and every page that sells keeps its own (6.1). It is hidden
  with `display: none` in the stylesheet, not left out of the markup,
  because the server renders one header for every width.

- **`.visually-hidden` is `position: absolute`, so it escapes an unpositioned
  scroll container.** Every tick in the pricing table carries a hidden word
  beside it; those words were laid out against the page rather than against
  `.table-wrap`, and sat at x=452 inside a table that was itself correctly
  clipped. **The table was never the thing overflowing.** `.table-wrap` is
  `position: relative` for this reason and for no other.
- **A grid track will not shrink below its content's intrinsic width.**
  `.code-tabs` held a code sample whose longest line has no space to break at,
  so the track grew to 482px instead of letting the block scroll inside
  itself. `minmax(0, 1fr)`, not `1fr`.

A fourth, in prose rather than layout: a URL the privacy policy has to print
in full is forty-six characters with no space in them, which is wider than a
320px screen. `.prose` and `.prose-body` carry `overflow-wrap: break-word`,
which breaks only where a word would not otherwise fit.

A fifth, in a table: **a table is as wide as its longest cell that has nowhere
to break**, and `overflow-wrap: break-word` does not reach inside one the way
it reaches a paragraph. The configuration page's settings tables hold names
like `IDEMPOTENCY_RETENTION_HOURS` in code spans, and took the page to 469px
on a 320px phone. Every table in Markdown is now wrapped in `.prose-table` by
`prose.tsx` and scrolls inside it, the way the pricing comparison scrolls
inside `.table-wrap`. Breaking the names instead would have fit the page and
split a setting somebody has to copy exactly.

A comparison of two apps is the one table that doesn't scroll on a phone.
Below `34rem`, `.compare-pair` puts each feature's name on a line of its own
and the two apps' answers side by side under it, because scrolled, the other
app's column, which is the reason the page exists, started off the screen.
The five-app table on `/compare/` can't fit two to a row, so it scrolls like
the pricing table.

_Checked by:_ `tests/a11y.test.ts`, over every emitted page at 320px and
390px — the floor and an ordinary phone, because a page can pass at the floor
and fail just above it. The failure names the element or text run that
actually extends the document, which is deliberately **not** the widest thing
past the edge: the widest thing is usually something a scroller is holding
correctly.

### 4.4 Space at a box's edge is the box's own padding

**House.** A card's first and last children carry no margin toward the card's
edge, and nothing invisible takes a grid track.

Both ways of breaking it were live in the featured post card, which had twice
the space above its cover that it had beside it. The cover's top margin is the
gap under a post's byline, and leading the card it stacked on the padding. And
`.cover` is `display: contents`, so its `<source>` became an empty grid item
the card still owed a gap to. `.cover > source` is `display: none` for that
reason: the browser picks a file from the element, not from its box.

**An invisible copy that keeps neighbors level goes when there's no
neighbor.** Each plan card on the pricing page carries an unpainted copy of
Premium's flag, so the three headings sit level side by side however the
label wraps. Stacked, it went on taking room at the top of a card with
nothing beside it: 56px above Free's heading, against 33px at every other
edge. A container query on `.tiers` drops the copy from a card alone on its
row, with thresholds that are the grid's own arithmetic, so they move if the
tracks or the gap do.

**A column of a band is a box edge too.** The homepage's privacy list kept the
top margin it carries under a lede, so beside the words it started 24px below
them, level with nothing, and stacked it put 72px where the band above puts
the grid's 48. It drops that margin in this one use (`.home-privacy-list`).

_Checked by:_ `tests/a11y.test.ts`, "layout": the blog's lead story's inset is
the same above its cover as beside it, a stacked plan card's inset is the same
at its top as at its bottom, and the privacy list starts level with the words
beside it. The lead replaced the featured card, and its cover fills the height
of the words beside it for this rule's reason: a 2:1 cover centered in a taller
row sat lower than its inset.

### 4.5 Two of the same thing side by side line up

**House.** Figures in a row start and end level whatever their captions do,
and so do the words in cards stretched to one row and the cells of a table row.

A grid item is stretched to its row's height, and a grid inside it shares the
slack out across its own rows, so a figure whose neighbor's caption ran a line
longer grew a band of empty surface under its picture. `.shot-figure` is
`align-content: start`, and anything else laid out as a stretched grid with a
picture in it wants the same.

**Words in a stretched grid do it too.** The docs pager's two links stretch to
the taller one, and a one-line title sank 14px from its label beside a
two-line one; the docs index's three starting points let a kicker drift 14px
off a one-line title. The pager is `align-content: start`, and the starting
points `align-content: center`, so each pair sits against its tile the way
the tallest card's does. Whichever it is, a grid that is stretched names
where its slack goes.

**A table cell stays a table cell.** The pricing comparison's row headers
were made grids to put a note under the feature's name, and a grid isn't a
table cell, so it stopped stretching with its row: on a phone, where a price
wrapped and the name didn't, the name's divider was drawn 21px above the rest
of the row's. The note is a block under the name instead.

_Checked by:_ `tests/a11y.test.ts`, "layout", on the two screens under the
homepage's feature grid, the pager on every docs page, the three starting
points, and each comparison row's header at 390.

### 4.6 An index is shelves of cards, each one stop

**House.** A card on an index is one tab stop, named by its title, however
the index is laid out. The two ways of doing it come after the shelf below.

**Guidance: the shelf.** Today's layout, and the shape to copy for a new
index rather than a rule a different design breaks. The docs index is a
shelf per group. The group's picture, its heading, its blurb and its page
count sit in a column that stays in view while the group's pages scroll past
beside it as cards (`.docs-group`, `src/styles/site.css:4039`). Below 62rem
the column stops sticking and the heading goes beside its picture, over the
cards. The Self-hosting group sits
on its own band (`.docs-group-own`), because it's for a different reader and
somebody using app.smpl.money should see where their pages end (`content.md`
5.18). Three headings over three lists were the same weight and the same
gray, and nothing said where one group stopped.

**The lead page can be a feature.** It becomes `DocFeature`, a wider card,
when it's the group's only page or has steps in `docsIndex.steps`
(`src/app/docs/page.tsx:113`). "Only page" alone dropped Get started's
feature the day it gained a second page, and with it the four steps a new
reader most needs. A step is a heading id, and its words come from the page's
own heading, so a renamed heading changes the card too and a removed one
fails the build rather than linking to nowhere
(`src/components/docs-art/cards.tsx:49`).

**No holes.** With an odd number of cards the first takes the whole row
(`src/styles/site.css:4122`), as on the learn index
(`src/styles/site.css:1623`), and the blog's grid works the same idea out for
three columns, widening its first cards by what's left over
(`src/styles/site.css:4905`). A grid with a gap in its last row reads as a
page that lost a card.

**One tab stop per card, named by its title**, which is the House half. Two
patterns are in use, and the choice is whether anything in the card should
stay selectable:

- **The title's link stretched over the card** by an absolutely placed
  `::after`, so the whole card answers a pointer while the link's name stays
  the title (`.home-job-link`, `.docs-start-title a`). Right for a small card
  whose words nobody copies.
- **The picture as a second link to the same place**, out of the tab order
  and hidden from assistive technology (`tabIndex={-1}`, `aria-hidden`), as
  `LearnCard`, `DocCard`, `DocFeature` and the post cards do it. The card is
  still one stop with one name, and its summary can be selected.

A feature's steps are stops of their own, because each goes somewhere
different. **The obvious alternative was two ordinary links per card**, the
picture and the title, which doubles every Tab press to one place and has a
screen reader announce each card twice.

A card made of words gets no scroll reveal, for the contrast reason in 8.3.

_Checked by:_ `tests/docs-features.test.ts`, that every page is one card with
its own mark and that every step links to a heading the page has. The layout
is `human`, at 1280 and 390.

### 4.7 A long list folds on a phone, with no script

**House.** The docs sidebar is a `<details>` closed in the markup
(`src/components/docs-sidebar.tsx:31`). On a wide screen,
`@supports selector(::details-content)` hides its summary and undoes the
closed state's `content-visibility: hidden`, so the list is always shown
(`src/styles/site.css:2754`). Below 62rem the summary comes back and a closed
disclosure hides its content again (`src/styles/site.css:2892`), so a phone
reader gets the article first and one tap to the list.

It was rendered `open`, which cost nothing at twelve pages and put
twenty-seven links between a phone reader and every docs page's first line
once there were that many.

**The obvious alternative was a drawer behind a button.** That's a client
component, a focus trap and an Escape handler, all to rebuild behavior the
browser's own disclosure has, and the drawer does nothing until it hydrates.
`<details>` works before any script, and find-in-page can open it.
`code/react.md` 4.2 is the general rule: try the element with the behavior
built in first.

**The fallback is a summary.** A browser that can't style `::details-content`
keeps the summary on a wide screen too, and the reader opens it, which is
worse than a list and better than a list nobody can reach.

**Measure "shown" with `checkVisibility()`, never with a size.** A closed
`<details>` hides its content with `content-visibility: hidden`, and a script
asking for a hidden element's height still gets one (`tests/a11y.test.ts:408`).

_Checked by:_ `tests/a11y.test.ts`, "layout", that the sidebar is closed in
the markup at both widths, shown at 1280 and folded at 390
(`tests/a11y.test.ts:677`).

### 4.8 An article has two widths: its text's and its column's

**House.** Running text stops at `--measure`, 68 characters: the prose, and
the lede over it, with everything inside the prose (a code block, a table, a
callout, a screenshot) as wide as its text (5.6). The boxes around the prose
span the article's column: the contents list, the docs pager, the box that
closes a learn guide and the cards under it. That holds on the docs, the
learn guides and the posts alike.

A line longer than the measure is hard to follow back to its start, which is
the whole reason for it. A box isn't read a line at a time, and every box on
an article sharing one edge is what makes the column read as one.

Two reviewers read this opposite ways on one pass, one asking for the
contents list and the pager at the measure and one turning the same request
down, which is why it's written here. **The obvious alternative was to
narrow those two**, and it would have put boxes of two widths on one learn
page, 746 and 812 measured, with nothing to say why. A box that should be as
narrow as the text goes inside the prose.

_Checked by:_ `human`, at 1280.

### 4.9 A short page ends in its footer

**House.** The canvas past the end of the page is the footer's color
(`html` in `site.css`), so a page shorter than the window ends in its footer
rather than in a band of the page's ground under it. The 404 showed 81px to
381px of that band on a desktop, a shade off the footer above it.

**The obvious alternative was a full-height body**, a column that pushes the
footer to the bottom of the window. It changes how margins meet between the
header, the main and the footer on every page, to fix one, where the canvas
color changes nothing a longer page shows.

_Checked by:_ `tests/a11y.test.ts`, "layout", on the 404 in a window taller
than it.

## 5. Images

### 5.1 Screenshots are of the running application

**Binding.** Every screenshot on this site is captured from a real instance
against a seeded ledger, **by the application**, and pulled from the kit it
publishes at `docs/product/`.

This repository used to run the capture itself. The script that did it was
deleted, and no path here replaces it: this is the only repository that cannot
run the application, so a picture taken here of a version checked out here was
a picture nobody could reproduce. `sync-from-app` §4 is the procedure.

A mockup drifts from the thing it depicts and nobody notices until a reader
does — which, on a page whose argument is "the figures tie out", is the worst
possible place to be caught approximating.

_Checked by:_ `human` for provenance. `tests/home-page.test.tsx` holds the
things a renderer can see: alt text, dimensions, and the disclosure.

### 5.2 Both themes, chosen by the browser

**House.** Every image the page shows — screenshot or generated cover — ships
as two WebP files and is selected with `<picture>` and a
`prefers-color-scheme` media query.

No script decides it, so a reader in dark mode downloads the dark file and
never fetches the light one. The alternative — one image, usually the light
one — puts a white rectangle in the middle of a dark page.

**It said "screenshot" for a while, and the covers were not screenshots.** So
a post opened, in dark mode, with exactly the white rectangle this rule exists
to prevent — on the one picture the site draws for itself rather than
photographs. `scripts/build-images.mjs` writes the pair now, reading both
palettes out of `brand.css` rather than carrying its own copy of them, and
`src/components/cover.tsx` picks between them. The dark file's name is derived
from the light one, because a second frontmatter key naming its twin is a
second thing to get wrong in every post.

The social cards are the deliberate exception: `public/og.png` and every
page's own card in `public/og/` are rendered by platforms that have no theme
to respect, so they're the light palette and only that
(`scripts/build-images.mjs:126`, `scripts/build-images.mjs:327`).

**Two widths as well as two themes.** Each screenshot also ships at 1200px,
and `<picture>` carries both candidates with a `sizes` that matches the CSS.
1600px is right for the widest place these render — a full-span shot is 1092
CSS pixels on a 1280px screen, which wants 2184 at 2x, so 1600 is already a
compromise _downwards_ on a desktop. A phone renders the same picture at about
356, and a 3x screen was being handed four and a half times what it could show
on the connection least able to afford it. Measured: 300 KB of screenshots
across the homepage before, 187 KB after.

**A `sizes` that does not match the CSS is worse than none**, because the
browser trusts it, picks from it, and gets the wrong file with nothing to
notice. So there is one value per layout, each the CSS's own arithmetic, and
`src/components/shot.tsx` names them: `full` across the page, `half` beside
the claim it proves, `pair` for the two screens under the feature grid, and
`prose` inside an article or a doc. There were two, and three layouts had
drifted from them unnoticed: the pair sits side by side from 912px while its
`sizes` claimed 92% of the window up to 992px, so a 2x screen between the two
fetched the 1600px files for pictures 414px wide; the hero had grown to 1092
while it still claimed 1024; and a picture in an article claimed 92% of the
window where the text column stops at 746. Two candidates, not a
ladder: a third rung is another file for every screenshot, for a saving
nothing on this page is waiting for.

_Checked by:_ `tests/home-page.test.tsx` for the screenshots — both themes,
both widths, and that the narrow candidate reaches the built page;
`tests/a11y.test.ts`, "tells the browser how wide each screenshot renders",
for each `sizes` against the rendered width on the homepage, a docs page and
a guide at eleven widths, failing at more than 5% too narrow or 20% too wide;
`tests/blog-features.test.ts` for the covers.

### 5.3 Every image carries its real dimensions

**Binding.** `width` and `height` are the file's actual pixels.

Without them the page reflows as each image arrives, and on a page that is
mostly screenshots that is the difference between a calm load and a jumping
one.

**The covers went without them** after the screenshots had them, so a post
opened by pushing its own first paragraph down the page once the picture
above it arrived. `src/components/cover.tsx` declares the size
`scripts/build-images.mjs` draws every cover at.

_Checked by:_ `tests/home-page.test.tsx` for the screenshots, and
`tests/blog-features.test.ts` for the covers, against the files themselves.

### 5.4 Alt text describes what the picture shows

**Binding.** WCAG 1.1.1. "Screenshot of the reports page" tells a reader who
cannot see it nothing the heading above it did not.

The alt text on this site's screenshots names what is _in_ the figure — which
currencies, which columns, what the numbers do — because that is the content
the picture is carrying.

**Write it with the picture open.** Three of the six screenshots shipped alt
text describing a state the image does not contain: the import shot was
described as a populated import when it is the empty drop target, the hero as
showing dollars and euros when it shows euros only, and the budgets shot as a
planned-against-spent comparison when it is the form for setting one. Each was
written from what the section argued rather than from what the capture held,
and each is what a reader who cannot see the image is given _instead of_ it.

The one alt text that was right — the payee list, "three for most, fifteen for
the local market" — was the one written while looking at the file.

**A pulled screenshot can change under its own alt text.** `sync-from-app`
brings new bytes; nothing re-reads the sentence describing them. That is the
step most likely to be skipped, so it is named in that skill.

_Checked by:_ `tests/home-page.test.tsx`, which refuses alt text under forty
characters or starting with "screenshot of". Whether it describes _this_
picture is `human`, and no test here can be more than a length check.

### 5.5 Invented figures say they are invented

**Binding.** The screenshots show a seeded demo ledger, and the page says so
once, plainly, beside them.

A finance page showing invented balances without disclosing it is the same
defect as a testimonial from nobody.

**On the homepage it is the caption of the first picture**, the dashboard
rising out of the hero, and it is worded for every picture on the page: "the
money in these pictures is made up". That is the one screenshot a reader sees
before deciding to scroll, so it is where the disclosure is read, and once is
the rule; a caption repeating it under every shot below would be the same
sentence once per picture.

A screenshot inside an article or a doc opens full size (`ProseShot` in
`src/components/shot.tsx`). On a phone a capture is drawn about 360px wide and
the application's words in it are three pixels tall, while the guides point
at details in them by name. It opens the file for the reader's own theme,
through one link per theme, because the page has no script to choose.

_Checked by:_ `tests/home-page.test.tsx`.

### 5.6 A code block follows the page theme

**Binding.** `.code-block` paints its surface from `--fill-subtle` and its
border from `--line`, both of which change with the theme.

`rehype-pretty-code` emits _both_ Shiki themes as custom properties on one copy
of the markup, and the rules at the end of `site.css` pick between them. So the
surface underneath has to switch with them. The first version painted the block
on `--art-base`, the always-dark illustration surface, which left github-light's
dark text on a dark green card: legible in dark mode and nearly invisible in
light.

The homepage's assistant used to be the deliberate exception, a terminal
sample hand-colored on the art surface. It is a chat now, drawn on the art
panel's colors for 1.3's reason, and is not a code block at all.

**A sample carries no comment lines.** Both themes color a comment below
4.5:1 on these surfaces — 4.22 in light and 3.58 in dark — so a `#` line
fails WCAG 1.4.3 on whatever page it lands on. Say it in the sentence around
the block instead. `tests/a11y.test.ts` caught the first one the day it was
written. Shell keywords are the same in light: `until`, `do` and `done` came
out at 4.01:1, so a sample is a list of commands rather than a loop, and the
sentence says what to wait for.

**It fills the column the text does.** `rehype-pretty-code` wraps every block
in a `<figure>`, which nothing styled, so every code block on the site kept
the browser's own 40px a side and sat inset from the tables and callouts
around it.

_Checked by:_ `tests/docs-features.test.ts` for both themes being emitted, and
`tests/a11y.test.ts`, "layout", for the width; whether the contrast is right
is `human`, and it was found by looking.

### 5.7 A picture is drawn on the application's art panel

**House.** Every learn article opens on a picture, and the same picture is its
card on the index. The homepage, the docs index and the blog draw the same
way. Each picture is drawn on the application's own sign-in art panel
(`.auth-art` in the app's stylesheet): `--art-base` lit from two corners by
`--art-glow-a` and `--art-glow-b`, a dot grid fading toward the far corner,
two hairline orbit rings, frosted `--art-veil` cards and mint `--art-bar`
accents. `.art-panel` in `site.css` is that panel, and the drawing on it uses
the `art-*` classes and nothing else.

The obvious alternative was an illustration style of its own, and that is how
a marketing site comes to look like a different company from its product. The
app already has a picture language. Copying it means a reader who signs up
recognizes the place.

The panel is the same in both themes, for 1.3's reason: it is a picture of a
dark thing. It is hidden from assistive technology, because a hero says
nothing its title does not, and a picture described aloud next to a heading
that says the same thing is the same sentence twice. What a picture
_explains_ belongs in a diagram (5.8).

**Fun like the logo.** The logo is one bold object in round strokes on a tile.
A hero is one object too, drawn at the logo's weight: a receipt, a jar, a
scale. Each article also has a glyph on the logo's own 24-unit grid at its
2-unit stroke (`src/components/learn-art/glyphs.tsx`), and the index's own
picture puts the logo among all of them.

**The homepage draws the same way**, because it sat beside `/learn` as the
plain page and the two read as different sites. Four places use this system
and one uses 5.8's:

- **The hero is the panel at the page's full width** (`.home-hero`), with one
  drawing on it: three payments arriving in an account and the balance they
  come to (`HeroArt` in `src/components/home-art.tsx`). Its sum is real
  arithmetic, because a drawing about money adding up that did not add up is
  the one joke this page cannot make.
- **The jobs are learn cards** (`.learn-card`), each carrying its guide's own
  picture through `LearnThumb`, so a reader meets the article's picture before
  the article.
- **The assistant is a conversation in the panel's colors** (`.home-chat`):
  the question, the two tools it calls on Simple Balance and the answer, on
  `--art-base` with a frosted bubble. It's real text rather than a drawing, so
  it isn't hidden the way a picture is, and 8.6 says how words that move are
  read.
- **It closes on the panel again**, beside the plans, with the learn index's
  own picture: every guide's glyph around the logo (`LearnIntroArt`). The page
  ends where `/learn` begins.
- **The correction beside the second proof is a diagram**, in the page's
  colors by 5.8's rules, because it is evidence in a row of evidence: it sits
  on the same green wash as the screenshots either side of it and re-themes
  with them, where a dark panel would read as decoration among proof.

The hero, the correction and the chat loop, each with a control that stops
it; 8.2 lists what moves on which clock.

On the panel, the words sit on the dark base and the light sits behind the
drawing. The learn intro measured its lede at 3.6:1 with a glow behind the
words, and the fix there is the rule for both homepage panels, at both
widths: stacked, the glow moves down with the drawing. 5.9 has the rest of
what words and controls on the panel take.

**The docs and blog indexes draw on the same panel.** `/docs/` opens on it
with a drawing of binder dividers, search and three starting points, and
gives each group its own picture beside its pages as cards, each page with a
mark from `src/components/docs-art/`. `/blog/` opens on a masthead with a
stack of posts and the feeds, then a lead story and a card grid
(`src/components/blog-art.tsx`, `blog-front.tsx`, `blog-header.tsx`). Both
follow the panel rule above: words on the base, light behind the drawing.
How the docs index lays its groups out is 4.6, and how its sidebar folds on a
phone is 4.7.

A card rises into view and never fades into it; 8.3 has the measurement.

_Checked by:_ `tests/learn.test.ts` that every article has a drawing and a
glyph and nothing else does; `tests/home-page.test.tsx` that every drawing on
the homepage is hidden from assistive technology and that the hero's sum adds
up; `tests/docs-features.test.ts` that every doc page is a card with its own
mark and each group its own picture; `tests/blog-features.test.ts` for the
front page's lead, grid and series; and `tests/a11y.test.ts` for contrast in
both themes, of whatever frame the audit lands on. On a page that comes to
rest that's the finished picture. The homepage never comes to rest, so there
it's an arbitrary frame of each loop, and the finished picture is checked on
purpose by 8.7. Whether it is on-brand is `human`.

### 5.8 A diagram re-themes, and reads on a phone

**Binding.** A learn diagram is inline SVG drawn in the page's own colors, so
it follows the theme like the text around it. Every color is a contract token,
set by class or by `css({ "--c": "var(--…)" })`, never a literal and never a
`fill` or `stroke` attribute, which cannot hold a `var()` at all.

It is drawn on a grid at most 560 units wide, with text of at least 22 units,
and shown at its own size and no larger. That is about 13px of label on a
390px phone. A diagram drawn to fill the article's column was the first
version, and it was legible on a desktop and nowhere else.

Labels sit beside a colored shape, never on it, because the fill changes with
the theme and the text on it would not. Each diagram has a caption saying
what to notice and a description, the SVG's own `<title>`, saying everything
that is drawn, numbers included, for a reader who cannot see it.

_Checked by:_ `tests/learn.test.ts`, for the width, the colors, and every
diagram being used and existing. That the labels clear each other is
`human`, and the way to check it is to look at both themes at 390px.

### 5.9 Words and controls on the art panel take the panel's colors

**House.** The panel is dark in both themes (1.3), so HTML on it takes the
panel's tokens and never the page's. Today's set, which a new panel copies:

- **Eyebrow:** the mint, `--art-bar`, because the page's green measures under
  3:1 on the base (`src/styles/site.css:3190`).
- **Title:** `--art-ink`. **Lede and every muted line:** `--on-art-muted`.
- **Primary button:** mint with `--art-base` text, turning `--art-ink` on
  hover (`src/styles/site.css:3217`). The page's green button disappears on
  the panel.
- **Second button:** outlined, so it reads as the second
  (`.home-button-ghost`).
- **Field:** frosted, `--art-veil` behind an `--art-hairline` border
  (`src/styles/site.css:3893`). The page's white field was a hole punched in
  the panel in light mode and nearly invisible in dark, where `--surface` is
  almost the panel's own green. Its clear button is the browser's, drawn
  through a mask in the field's own ink (`.docs-search-input`'s cancel-button
  rule), because Chrome and Safari paint it a blue from neither theme.
- **The stop control** takes the page's colors by default, and today only
  the hero's panel restyles it (`.home-hero .mo-stop`,
  `src/styles/site.css:3603`). A loop placed on another panel adds the same
  rule for that panel, or its control is a `--surface` pill on the dark
  base. Generalizing the rule to `.art-panel .mo-stop` is the alternative,
  worth taking the day a second panel gets a loop.
- **Focus ring:** `--art-ink`, by redefining `--focus-ring` on the panel
  rather than writing a second ring (6.6). The page's green measured 2.36:1
  on the base in light, under the 3:1 a focus indicator needs. `.home-hero`
  is named beside `.art-panel`, because it paints the panel without being
  one, and what hangs off a panel onto a page surface takes the page's ring
  back, as the docs search's results do through `--page-focus-ring`.

**A text wrapper is `position: relative`**, so it paints above the panel's
dot grid, which is an absolutely placed `::before` (`.learn-intro-text`,
`.docs-intro-text`, `.home-closing-text`).

**The light goes behind the drawing, never the words.** The app's panel puts
its brightest glow top left, which is exactly where the words start on a
panel with text, and the learn intro's eyebrow and lede measured 2.7:1 and
3.6:1 on it (`src/styles/site.css:1481`). When the panel stacks below 62rem,
the glow moves down with the drawing (`src/styles/site.css:3690`).

**Hover answers with the border, not a brighter veil, under muted text.** The
docs starting points' kicker fell under 4.5:1 on a veil lightened for hover
(`src/styles/site.css:3940`).

**`.art-panel` clips its drawing**, so a panel that has to let something hang
out of it sets `overflow: visible`, as the docs intro does for its search
results. A clipped dropdown is a search that shows its first two results.

**The obvious alternative is the page's own tokens on the panel**, which is
what every component brings with it by default. They give dark text on dark
green in light mode, and they look fine in dark mode, which is why nobody
notices until somebody opens it in light.

_Checked by:_ `tests/a11y.test.ts`, for contrast in both themes, of whatever
frame the audit lands on (8.7 is how a loop's finished picture is checked),
and for the ring on the panel at 3:1 against its base in light, which axe
never measures. Whether it looks like the app's panel is `human`.

### 5.10 Building a drawing

**Guidance.** How a drawing here is usually made, so a new one sits beside the
others without a reader noticing a second hand. Where it lives in the code is
`code/react.md` 6; this is how it looks, and 8.3 to 8.5 are how it moves.

**Where each kind lives:**

- **A learn hero:** `src/components/learn-art/<slug>.tsx`, drawn on the 1200
  by 600 grid inside `ArtFrame` (`src/components/learn-art/frame.tsx:24`),
  usually over the panel's two rings from `Orbits`
  (`src/components/learn-art/frame.tsx:50`), with its words in
  `src/content/learn-art/<slug>.ts`.
- **A docs group's picture:** an entry in `groupArt`
  (`src/components/docs-art/pictures.tsx:308`), built from the group's own
  page marks.
- **The blog's:** `src/components/blog-art.tsx`. **The homepage's:**
  `src/components/home-art.tsx`, with its words in `src/content/home.ts`.
- **A glyph or a page mark:** the logo's 24-unit grid at its 2-unit round
  stroke, in `src/components/learn-art/glyphs.tsx` for an article and
  `src/components/docs-art/glyphs.tsx` for a docs page.

**Composition:**

- One bold object at the logo's weight, drawn with `.art-line`, a 10-unit
  round stroke: a receipt, a jar, a scale.
- Frosted cards (`.art-veil`), one of them tilted −3 to −5°, the way the app
  tilts its own ledger card.
- Mint (`.art-mint`, `.art-line-mint`) for the one thing that matters, and
  for nothing else.
- What matters inside roughly x 120 to 1080 and y 40 to 560 of the grid, so it
  still reads when the panel shrinks to a card thumbnail or a 390px hero.
- Small labels (`.art-text-muted`, 26 units) only for what the title beside
  the picture already says. They hide when the picture is under 30rem wide,
  where they'd be under about 10px, measured by the picture's own width
  through a container query rather than the window's. Keyed to the window,
  the same picture at the same size kept them at 7.8px in a phone's hero and
  8px on the Keep reading cards at 1280, and showed them at 5px on a tablet's
  cards, while the phone's index hid them.

**A veil card that overlaps another sits on an `--art-base` rectangle
first**, because two translucent cards overlapping read as one bright smear
(`Card` at `src/components/blog-art.tsx:57`).

**Words and numbers are the page's.** Every word in a drawing comes from a
content module and goes through `typeset` (3.3), so the copy checks read it
and its quotes match the prose. Every number obeys real arithmetic, and a
figure in a drawing is a figure on the page: the homepage hero's sum is
tested (`tests/home-page.test.tsx:334`).

**Color means the same thing in every diagram.** `--green` for what you own,
money in, or good; `--red` for what you owe or money out; `--amber` for a
warning or a card; `--blue` for anything neutral. A reader who learns it in
one article keeps it in the next.

**The obvious alternative is a style per picture**, chosen for what it
depicts. That's how the pictures drift from the app's picture language, which
is 5.7's whole argument, and a color that means "out" in one diagram and "in"
the next makes a reader relearn every chart.

_Checked by:_ `tests/learn.test.ts` and `tests/docs-features.test.ts`, that
every drawing is registered, every page and group has its picture, and every
color is a contract token, the docs sweep reading `home-art.tsx` and
`blog-art.tsx` too; `tests/home-page.test.tsx` for the hero's sum;
`tests/a11y.test.ts`, "layout", that every small label still shown on the
learn index and a guide is large enough to read, at 1280, 600 and 390. The
drawing itself is `human`, looked at by 8.7.

## 6. Controls

### 6.1 A control that cannot act is not a control

**Binding.** The sign-up control is a link to `site.appUrl`, in the header
(wider than a phone, 4.3), the homepage's hero and its closing plans panel,
both plan cards on the pricing page and the end of every learn article, and
nothing that looks like a button is left on a page as text that does
nothing.

It was a `<span>` reading "Sign-ups open soon" until 7 October 2026, when the
application went live. A `<button disabled>` would have implied something on
the page could enable it, and a link to `app.smpl.money` would have 404'd for
every reader, so a phrase that stated the situation was the honest control.
It became a link in the same commit that made it true, which is what this
rule asked for.

**The rule outlives the launch.** If the application is ever down for long
enough to matter, or a section of the site points at something not built
yet, the answer is the same: say what is happening in text, and do not leave
a control that leads nowhere. The blog's front page, with no posts, offered
its three feeds directly above the sentence saying there was nothing to
subscribe to; the feeds sit under the same guard as the post count now.

_Checked by:_ `tests/home-page.test.tsx`, which finds the label three times
on the homepage, the header's, the hero's and the closing panel's, asserts
each is a link to the application, and that nothing reaches the application
under another label, and that the header's alone is hidden on a phone, by a
rule inside the `34rem` block; `tests/pricing.test.tsx` for the two plan cards;
`tests/learn.test.ts` for the link at the end of an article; and
`tests/blog-empty.test.tsx` for an empty blog offering no feed.

### 6.2 A sign-up control says what it costs

**House.** The control reads **"Sign up free"**.

A sign-up button raises one question, which is what it is about to cost, and
the free plan is the answer, so the label gives it. Premium's card carries the
same label because it is the same door: everybody starts free, and Premium is
chosen afterwards from the application's own plan page.

While the application was not deployed it read "Sign-ups open soon", and
before that "Hosted version soon", which named the thing accurately in the
product's vocabulary rather than the reader's. `content.md` 1.3 is the rule
that moved it.

**It is one string, not one per control.** `src/content/pricing.ts` imports
`hero.primaryLabel` rather than repeating it, because a header saying one
thing and a pricing button saying another describes two different doors to
one place — and two literals that happen to match today are two literals. The
address is one value too, `site.appUrl`.

_Checked by:_ `tests/copy.test.ts` for the label naming the price, fitting a
button and being the only sign-up label, and for the address being written
once; the exact wording is `human`.

### 6.3 A breadcrumb's current page is not a link

**House.** The last crumb is a `<span>` with `aria-current="page"`. A link to
the page you are on is a control that does nothing.

The separator is a CSS pseudo-element rather than a character in the markup, so
a screen reader reads "Docs, Reference, Configuration" and not "Docs slash
Reference slash Configuration".

### 6.4 Link text makes a promise it keeps

**House.** No "click here", no "read more". The text says where it goes.

_Checked by:_ `tests/home-page.test.tsx`.

### 6.5 No third-party branding, and no third-party script

**Binding.** No vendor logo, badge, "powered by" mark, script, image, font,
widget, analytics tag or consent vendor from anybody else's domain. Every
page, script, style, font and picture comes from this origin.

A marketing site is an argument about one product. A second brand in the
corner is advertising the reader did not ask for, and on a page about
somebody's money it is a second party to wonder about. It is also somebody
else's decision about what this page says. A vendor's script is the same
thing with more reach: a request from every page to somebody else, a cookie
in the reader's browser, and a paragraph the privacy policy has to carry.

**Ads are no exception.** They run in the application, not here. An ad
loader is a vendor script like any other: even with no unit to fill it
fetches its owner's script on every page and can set an advertising cookie
the privacy policy then has to disclose.

`public/ads.txt` stayed, and is not an exception to this rule: it is a file
Google's crawler reads for the application's ads, and no page here loads it
(`operations.md` 2).

**One exception to the branding half, and it is the opposite of branding.**
The privacy policy names the hosting provider and the payment processor,
because a policy that hides who processes the data is not a policy.
`tests/branding.test.ts` names those two pages and requires them to exist.

**A host can inject its own badge into the response**, which no test here can
see. Netlify does exactly that on free projects created on or after 19 August
2026, and it is turned off in **Project configuration → General → Powered by
Netlify badge** — a dashboard setting, not a repository one.
`operations.md` 8 carries it as a launch step, because a rule whose violation
arrives from outside the repository needs somewhere to live that is not a
test.

_Checked by:_ `tests/branding.test.ts`, `tests/export-shape.test.ts`, "lets
the page reach nothing but its own origin", and `tests/legal.test.tsx`. What
each holds, and why the policy check is the one that reaches past the markup,
is in `AGENTS.md`.

### 6.6 Focus looks the same on every control

**Binding.** WCAG 2.4.7. One focus ring, `--focus-ring`, on every link,
button, field and focusable element, from one `:focus-visible` rule that
names no element.

The rule used to be a list. It named links, buttons and `[tabindex]`, so the
docs search, the site's one field, wore the browser's own blue ring — a color
from neither theme — while every link beside it wore the site's. It gained
`input`, and still missed the pricing questions' `<summary>` and any table
that scrolls inside its box on a phone, which the browser makes a stop of its
own: three on the configuration page, and the comparison table at 390. **The
obvious alternative was to add those two to the list**, and a list is a claim
about what can take focus, made by somebody who couldn't see what would be
added next.

**A surface changes the ring's color, not the rule.** Where the page's green
can't be seen, a surface redefines `--focus-ring` for what's on it, as the art
panel does (5.9), so there is still one ring.

_Checked by:_ `tests/a11y.test.ts`, "layout", which compares the field's ring
to a link's in both themes, walks every Tab stop on the pricing page at 390 in
both themes for the link's ring, and measures the ring on the art panel
against its base.

## 7. Structure

### 7.1 One h1, and levels never skip

**Binding.** WCAG 1.3.1. The document outline is the only navigation this page
has for a screen-reader user.

_Checked by:_ `tests/home-page.test.tsx`.

### 7.2 Every section is a named landmark

**House.** `aria-labelledby` pointing at the section's own heading.

_Checked by:_ `tests/home-page.test.tsx`.

### 7.3 Decorative icons are hidden

**Binding.** Every icon here sits beside text that already says what it means,
so an unhidden one is announced as a second, meaningless label.

_Checked by:_ `tests/home-page.test.tsx`.

### 7.4 A skip link, first

**Binding.** WCAG 2.4.1. First focusable element, lands in `<main>`.

_Checked by:_ `human`. The markup is one element in `layout.tsx` and nothing
asserts it; worth adding the day a second layout appears.

## 8. Motion and preference

### 8.1 Reduced motion is honored globally

**Binding.** WCAG 2.3.3. A reader who asked for less motion gets none. Every
`animation:` or `animation-name:` declaration that isn't `none` sits inside
`@media (prefers-reduced-motion: no-preference)`, and a global block catches
whatever escapes it. An effect class naming its keyframes through a custom
property (`--mo`, `--mo-loop`) sits outside, correctly: naming a keyframe
starts nothing, and the rule that reads the property and starts it is the
one inside the block.

**Where the blocks are.** The global block sits near the top of `site.css`,
after the page's base layout (`src/styles/site.css:572`): every animation and
transition cut to 0.01ms and one play. A second reduce block hides the stop
control, because a reader with nothing moving has nothing to stop
(`src/styles/site.css:3616`).

A global block rather than per-component opt-in, because the failure mode of
per-component is a new animation that forgot, and nobody tests with the setting
on.

**The obvious alternative is the global block alone**, which is what this
rule once said, and it's wrong for two kinds of motion the site added after
it. What the block does is shorten a timed animation and hold its last frame
through `both`. For a play-once animation that's right: every play-once keyframe
moves from somewhere else toward the element's own state, so the held frame
is the finished picture. A loop is the opposite. Each looping keyframe builds,
holds and fades, and ends at opacity 0 (loop-rise and the keyframes after it,
`src/styles/site.css:2275`, and the chat's), so a loop that escaped the
no-preference block would be cut to one play and held on its last frame,
which shows a reduced-motion reader an empty panel. And the global block
does nothing useful to a scroll-driven animation, which ignores the 0.01ms
duration it sets, so that has to be kept out rather than shortened. So the
no-preference block is the rule, and the global block is the second net.

_Checked by:_ `tests/learn.test.ts`, "starts only inside the no-preference
block", which reads every `animation:` or `animation-name:` declaration that
isn't `none`, a shorthand over several lines included, and fails on any
outside every such block (`tests/learn.test.ts:447`). It once matched only two
spellings, and the loops, the chat's spinner and dots, the card rise and the
orbits were all outside what it could see. What a reader with the setting on
actually sees is `human`, and it's the picture `npm run frames` captures by
default (8.7).

### 8.2 Anything that moves on its own for more than five seconds can be stopped

**Binding.** WCAG 2.2.2. Anything that moves by itself for longer than five
seconds owes the reader a way to pause, stop or hide it. This rule used to
read "so nothing does", because a site with three client components had no
control to offer. The owner then asked for the homepage's drawings to loop,
and the control turned out to need no script at all: a native checkbox, and
`:has()` in the stylesheet. So a loop is allowed where it carries one, and
everywhere else the old rule still holds.

**What moves, and on which clock.** 8.3 says how to pick a clock for
something new, and 8.4 and 8.5 how to write it.

| What moves                                                          | Clock                                                                                                             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| A learn hero; the learn, docs and blog intros and their marks       | Once, on load, at rest within about three and a half seconds                                                      |
| Learn cards, the homepage's job cards, a docs card's mark           | Replays after the pointer rests 250ms on the card, or on focus; on a touch screen, once its picture is in view    |
| A blog post card                                                    | Lifts after the pointer rests 250ms, or on focus                                                                  |
| Learn diagrams, docs group pictures, the homepage's closing picture | Built by scroll, finished at `entry 100%`                                                                         |
| The closing picture's two rings                                     | Turn only while a pointer rests on the panel or focus is in it; on a touch screen, a quarter turn with the scroll |
| The homepage's hero and correction                                  | The shared loop keyframes, on a 10s cycle                                                                         |
| The homepage's chat                                                 | Its own keyframes, one per role, on a 16s cycle                                                                   |

Everything above the loops stops by itself or is started by the reader, and
motion a reader starts owes no control. Swing and float, the two effects
that move in place, run twice and stop.

**Each loop carries `LoopStop`**, a "Stop the animation" checkbox beside the
drawing and outside the part hidden from assistive technology
(`src/components/loop-stop.tsx:14`). Checked,
`.mo-loop:has(.mo-stop-input:checked) .mo` sets `animation: none`, and every
part rests on the finished picture. A reader who asked for less motion gets
no loop and no control (8.1).

_Checked by:_ `tests/learn.test.ts`, that every animation that repeats
forever is inside a `.mo-loop` or held `paused` until a reader starts it, and
that the stop rule sets `animation: none` (`tests/learn.test.ts:478`), beside
8.1's sweep; `tests/home-page.test.tsx`, that the homepage has exactly three
loops, each holding a labeled checkbox outside the hidden drawing
(`tests/home-page.test.tsx:257`), and that the chat rests on the finished
exchange (`tests/home-page.test.tsx:309`); and
`tests/blog-features.test.ts`, that a post card's lift waits on `--play`
(`tests/blog-features.test.ts:436`). The timing is `human`, by 8.7.

### 8.3 Pick the clock before the effect

**Guidance.** What starts a drawing moving is the first decision, because
whether it stops by itself, what a reduced-motion reader sees and whether
8.2 owes a control all follow from it. Choose by where the drawing sits and
who starts it:

1. **Once, on load.** A picture at the top of a page, on a panel.
   `.art-panel .mo` plays each part once, a step of `--s` at a time
   (`src/styles/site.css:2056`), and the picture is at rest within about
   three and a half seconds.
2. **The reader's pointer, after a 250ms rest, or focus.** A picture inside a
   card. Hover sets the registered `--play` property through a transition
   delayed 250ms, and a style query on `--play: 1` starts the motion
   (`src/styles/site.css:1941`, `src/styles/site.css:2074-2095`). Chrome
   moves `:hover` when the page scrolls under a pointer that hasn't moved, so
   on plain `:hover` a reader scrolling with the mouse parked set off every
   card it crossed, and twelve cards playing on their own are twelve moving
   pictures. The clock has two forms: replay once (the cards), or run while
   held, written `paused` and set running by the query (the closing
   picture's rings, `src/styles/site.css:3785-3823`). A browser without style
   queries never plays either, and shows the finished picture, which is the
   right way for this to fail.

   **The wait covers a card the pointer crosses, not one it stops on, and
   that's decided.** A parked pointer that a scroll leaves over another card
   for a quarter of a second plays that card, because nothing in CSS can tell
   a moving page from a moving pointer, and longer waits were measured and
   failed the same way. Parked over the first card on /learn/ while the page
   scrolled, the third, fifth and seventh played; on the homepage, the third
   job card did; and the blog's post cards lift the same way. The owner chose
   to keep the replay on every card (26 October 2026): each plays once, for
   a second or two, and only where the pointer came to rest, which a reader
   scrolling past sees as a card noticing them rather than the page moving
   on its own. So a card the pointer only crosses doesn't replay, and one a
   scroll leaves under it for a quarter second does, and neither is a
   finding. Dropping or lengthening the replay was the alternative, and
   longer waits didn't stop it, only made it later.

   **On a touch screen, the switch is the scroll.** A phone has no pointer to
   rest, so under `(hover: none)` a view timeline turns `--play` on from the
   moment a card's picture is all on screen, the switch the hover turns on,
   and the same replay plays on the clock from there, a second or two. A card
   still arriving shows its finished picture, standing still. The closing
   picture's rings turn a quarter turn as it passes through (the touch block
   before the blog index in `site.css`). Without it every card on a phone sat
   still.

   It was built by the scroll first, by clock 3's rules, and on a real phone
   nothing was seen to move: a card's picture finished within about eighty
   pixels of its edge arriving, mostly below the screen, and a flick covers
   that in a frame. Clock 3 suits a diagram because a reader stops at it to
   read; a card is scrolled past, so a card plays rather than being scrubbed.
   A learn card's trigger is on its picture, `.learn-card-art`, the top 45%
   of a phone's card, so it plays once the picture can be seen whole; a docs
   card's is on the card. It's keyed on hover, not on width: a narrow
   desktop window still waits for its pointer, and the frames script's
   `--touch` is how to see the phone's version (8.7).

3. **Scroll.** A diagram, or anything below the fold. One view timeline is
   named on the container, which doesn't move, and each part's range is set
   by `--s` so the last finishes at `entry 100%`, the moment the whole figure
   is on screen (`src/styles/site.css:2097`). An element's own `view()`
   measured a box that was itself moving, and jumped. The closing picture
   moved to this clock because, played on load, it was over before anyone
   reached it. **Name the timeline on the drawing, not on what's around
   it.** The closing picture's was named on its panel, `.home-closing`, which
   is taller than the drawing, so the parts finished as the panel's bottom
   edge arrived, and a reader who stopped with the whole drawing on screen
   saw three of its marks still popping in. It's named on `.home-closing-art`
   now (`src/styles/site.css:3833`), so the picture finishes when the
   drawing, not the panel, is on screen, the same moment a diagram does.
   **And nothing between the drawing and the page may hide its overflow.**
   A box with `overflow: hidden` is a scroll container even when nothing in
   it scrolls, and a view timeline is measured against the nearest one, so
   the move to `.home-closing-art` put the timeline inside the panel, which
   never scrolls, and it held still: the marks sat finished from the first
   frame on every screen until the touch rings, frozen at a tilt, showed it.
   The panel clips with `overflow: clip` instead (`src/styles/site.css:3652`),
   which cuts the same corners and scrolls nothing.
   Where scroll-driven animation is unsupported, the panel and diagram rule
   plays the parts once on load instead, and they're long finished by the
   time a reader scrolls to them.
4. **A loop.** Only where the owner asked for one, inside `.mo-loop`, with
   `LoopStop`. 8.5 is how to time it.

**A card rises into view, and never fades into it.** The learn cards used to
fade in as they scrolled, and a card the reader stopped at, half over the
bottom edge, held its words at half opacity: axe measured 1.2:1 to 2.9:1 on
the docs and blog indexes while they were being built
(`src/styles/site.css:2124`). So a learn card, and the homepage's job cards
with it, rises without fading, and a card that's mostly words, a docs card or
a post card, has no reveal at all.

**Source order decides between clocks.** Most clocks' rules are a container
class plus `.mo`, which is equal specificity, so whichever comes later in
`site.css` wins. The loop rule sits after the play-once and scroll rules on
purpose, and names its timeline outright, so a loop on a panel or in a
diagram loops (`src/styles/site.css:2136`). A surface rule written further
down beats it all the same: `.home-closing-art .mo`
(`src/styles/site.css:3837`) would hand its scroll timeline to any loop
nested inside the closing picture. So a new surface's motion rules go above
the loop rule, or no loop goes inside that surface. The touch block is the
second kind: it has to come after the card and ring rules it replaces, which
puts it below the loop rule, and no card or ring holds a loop. On the
homepage one would be a fourth loop, which `tests/home-page.test.tsx`
refuses by counting three; anywhere else, nothing does.

**The obvious alternative is to pick the effect first and leave the clock at
whatever the surface already does.** That's how the closing picture came to
finish on load before anybody scrolled to it, and how the cards, started by a
plain `:hover`, came to rebuild under a parked pointer.

_Checked by:_ `tests/learn.test.ts`, for the guards in 8.1 and 8.2;
`tests/a11y.test.ts`, "layout", that on a touch screen each kind of card is
still while it arrives and plays on the clock once its picture is in view,
while a pointer screen's waits (`tests/a11y.test.ts:925`), that the closing picture
builds as it arrives on every screen and its rings turn with the scroll only
on a touch screen (`tests/a11y.test.ts:961`), and that every view timeline on
every page is paced by the page's own scroll (`tests/a11y.test.ts:996`). The
choice of clock is `human`.

### 8.4 The motion vocabulary

**Guidance.** A drawing doesn't write keyframes. A part opts in with `.mo`
and one effect class, and `--s` sets its place in the order: 120ms a step on
load, 90ms on a hovered card, a share of the entry range on scroll. That
share isn't one number: 5% a step over a 35% span for a diagram and the
closing picture, so steps past 13 bunch at the end, and 7% over a 40% span
for a docs group picture, so steps past 8 do (`src/styles/site.css:2116`,
`src/styles/site.css:4354`). A card on a touch screen plays on the clock,
at the pointer's 90ms. `--dur`
changes its length from the default 0.8s, and `--n` its plays, which only
swing and float set. The typed `css()` helper sets `--s`, `--dur`, a color and
a pivot (`src/components/learn-art/frame.tsx:104`).

**`--s`, `--n` and `--dur` are reset on every `.mo`**, because a custom
property inherits: a coin inside a swinging pan once took the swing's two
plays and its 1.4s and dropped twice (`src/styles/site.css:1923`). The effect
itself (`--mo`, `--mo-loop`) isn't reset, so a bare `.mo` inside another part
runs that part's effect. Give it a class of its own if it should do
something else.

**What each effect suits:**

| Effect                               | Suits                                                                   | Loops         |
| ------------------------------------ | ----------------------------------------------------------------------- | ------------- |
| Rise                                 | A card arriving                                                         | Yes           |
| Drop                                 | Something landing in a pan or a jar                                     | No            |
| Fade                                 | Something that shouldn't move                                           | Yes           |
| Pop                                  | A total, a badge or a check                                             | Yes           |
| Grow-y                               | Bars, from their base                                                   | No            |
| Grow-x                               | Bars from the left, or another edge with a `transformOrigin` in `css()` | No            |
| Draw                                 | Strokes                                                                 | Yes           |
| Slide (`.mo-slide-l`, `.mo-slide-r`) | Rows from a side                                                        | From the left |
| Tilt                                 | A tag swinging in                                                       | No            |
| Spin                                 | A ring settling                                                         | No            |
| Swing, float                         | A last beat in place, twice and done                                    | No            |

**Pivots.** `.mo` turns and scales about its own box. To pivot about a point
it doesn't surround, a hinge or a shaft, pass `transformBox: "view-box"` and
an origin in the drawing's own units through `css()`, as the umbrella's
canopy opens from its shaft (`src/components/learn-art/emergency-fund.tsx:26`).

**One transform per element.** An animated CSS transform replaces an SVG
`transform` attribute on the same element, so the part jumps to the origin as
it moves. The placement goes on an outer `<g>` and `.mo` on an inner one
(`src/components/learn-art/net-worth.tsx:23`). A second motion on the same
thing uses an individual property, as the chat's spinner turns on `rotate:`
while it fades, or another wrapper, as each of the closing picture's marks
turns back on `.intro-token` around its own pop.

**Draw needs `pathLength={1}` on every path**, so one dash is the whole
stroke. A circle is written as two arcs, because a `<circle>` can't be
dash-drawn the same way in every browser
(`src/components/docs-art/glyphs.tsx:11`). The gap is twice the dash and the
start sits just past it, because a dash of no length under a round cap is a
dot, and every arrow showed one before it drew (`src/styles/site.css:2014`).
On a `<g>`, draw traces every stroke inside it at once.

**A new effect** gets a play-once keyframe that moves toward the element's own
state, so 8.1's held frame is the picture, and, if it will ever loop, a
looping twin on 8.5's timeline, named as the effect class's `--mo-loop`.

**The obvious alternative is keyframes per drawing.** It multiplies the
reduced-motion, loop and stop work by every drawing, and gives twelve
pictures twelve ways of arriving.

_Checked by:_ `npm run typecheck`, through the typed `css()`, for a misspelled
property. Whether an effect suits the drawing is `human`.

### 8.5 Sequencing a loop

**Guidance.** A loop's keyframes are in percentages of `--cycle`, which is
10s on `.mo-loop` (`src/styles/site.css:1937`). A part arrives over 0 to 8%,
holds to 72%, fades by 78% and stays gone to 100%
(`src/styles/site.css:2275`). `--s` delays a part's whole cycle, 120ms a step,
its exit included, so parts leave in the order they arrived.

**Two numbers to keep:**

- **The hold**, the time the whole picture is on screen, is about
  (72% − 8%) × the cycle − the largest stagger. The hero's parts go up to an
  `--s` of 10, a 1.2s stagger, so it holds 5.2s, which is the "about five
  seconds" the owner asked for.
- **The blank gap** is 22% × the cycle − the largest stagger, 1s for the
  hero, and it must stay positive. At zero or below, the picture rebuilds its
  first parts while its last are still fading, and never reads as finished.

A drawing whose stagger would eat the hold or the gap raises `--cycle` on its
own wrapper, as the chat does on `.home-chat-loop`.

**A scene that happens in an order gets one keyframe per role.** The chat is
a question, a moment's thinking, two tool calls and an answer, so each role
has its own keyframes on its own 16s cycle, holding to 78.75% and gone by
83.125%, with the timeline written in seconds in a comment above them ("1% =
160ms", `src/styles/site.css:2305`). **Its hold is measured from the last
word, not from the first part.** The owner asked for the finished picture to
hold about five seconds, and the chat isn't finished until its answer is:
whole by about 6.6s, it holds to 12.6s, about six seconds. The formula above
doesn't fit a scene whose roles arrive at their own times, so the hold is
read off the timeline comment, and a role added late in the scene shortens
it. `--s` is then only for parts that repeat a role:
the second tool call, at an `--s` of 9, a second behind the first
(`src/app/page.tsx:284`), and the answer's words.

**Two things follow from 8.2's Binding, and aren't optional:**

- **A part that exists only while playing**, the thinking indicator or a
  spinner, is `opacity: 0` in its base rule (`src/styles/site.css:3490`), so a
  stopped loop and a reduced-motion reader see the finished exchange rather
  than something still thinking.
- **The stop is `animation: none`, never `paused`.** A loop paused where it
  is can freeze in its blank gap, and with none every part drops back to its
  base rule, which is the finished picture.

**A part with a shorthand of its own** stays less specific than the stop rule,
or the box stops everything but it. The spinner runs two animations and the
thinking dots a pulse of their own, so both are written out, and both stay
below the stop in specificity (`src/styles/site.css:2153`).

**Only five effects loop**: rise, fade, pop, draw and slide from the left.
The rest have no `--mo-loop`, so inside a loop such a part either sits
finished through the blank gap or borrows its parent's loop. Nothing checks
that today, because the homepage's loops use only those five. A check that
every part of a `.mo-loop` resolves a looping keyframe is mechanizable in
jsdom, and it's the one to add the day a loop needs another effect.

**The obvious alternative is to tune a loop by watching it**, which finds a
hold that feels right and a gap that goes negative with the next part added.
The arithmetic is two lines, and 8.7 is how to check it.

_Checked by:_ `tests/home-page.test.tsx`, for the stop control and the chat at
rest, and `tests/learn.test.ts` for the guards. The timing is `human`, by 8.7.

### 8.6 Motion moves nothing around it, and moving words are read once

**House.** A loop never animates a property that changes layout: no height
or width, no margin or padding, no position offset, no font size. Each of
those moves what's around the part, twice a cycle, forever. A property that
only changes how the part is painted is fine, and the shipped loops use
several: `transform` and `opacity`, the dash offset of a stroke that draws,
`rotate:` for the spinner, and `clip-path: inset(…)` for the chat's bubble.

The bubble is the worked case. It grows as its contents arrive, the way a
model's reply does, by a clip rather than by its height, because a height
that grew would push the rest of the page down twice a cycle
(`src/styles/site.css:2334`). The clip's stops are fractions of the finished
bubble, generous enough that each part is inside before it shows at any
width, and **each step finishes before the row it uncovers starts to fade
in**. The steps used to finish just after, and for about 150ms a cycle each
tool row showed half-faded and cut off at the bubble's edge. So a row's arrival in the timeline comment is also a deadline for the clip
step above it.

**Two states that replace each other share one cell.** "Thinking" and
"Thought for 4 seconds", and each tool's spinner and check, sit in
`grid-area: 1 / 1`, so the larger reserves the space and the swap moves
nothing (`src/styles/site.css:3477`, `src/styles/site.css:3545`).

**Assistive technology hears the finished thing once:**

- **A drawing is hidden whole**: `aria-hidden` on the wrapper and on the svg,
  and `focusable="false"`, which `ArtFrame` and the homepage's drawings do
  (`src/components/learn-art/frame.tsx:24`).
- **Words that move stay real text.** The streamed answer is one visually
  hidden line plus aria-hidden word spans, so a screen reader reads the line
  whole rather than a word at a time (`src/app/page.tsx:313`).
- **What shows only while it plays is hidden**: the thinking indicator and
  each tool's spinner and check (`src/app/page.tsx:272`). The tool names stay
  readable, because they're part of the claim (`content.md` 3.3).
- **The stop control sits outside the hidden part**, or it's a focusable
  checkbox with no name.

**The obvious alternatives were a height animation**, which jumps the page,
and word spans left readable, which some screen readers announce one word at
a time.

_Checked by:_ `tests/home-page.test.tsx`, that the answer reads whole, that
the indicators are hidden and the tool names aren't, nor inside anything that
is (`tests/home-page.test.tsx:297`), and that each stop control is outside
its hidden drawing (`tests/home-page.test.tsx:257`). That nothing shifts,
and which properties a loop animates, are `human`, by 8.7.

### 8.7 Look at motion a frame at a time

**Guidance.** jsdom has no clock and no layout, and a page watched in a
browser moves too fast to judge, so motion is looked at as still frames, from
a fresh build, at 1280 and 390, in both themes. `npm run frames`
(`scripts/frames.mjs`) takes them into `.frames/`, which git ignores, and its
header lists the options. The commands, and the times worth capturing for
each kind of motion, are in one place, `draw-and-animate` §6, because a
better command written here as well would leave two to drift.

**One look per clock** (8.3):

- **The finished picture**, which is what the script captures with no option:
  the page under reduced motion, which is what a stopped loop and a reader
  who asked for less motion both see.
- **A timed animation, part-way**: every animation on the document's clock
  paused at the same moment, at a handful of moments across its play. For a
  loop that's one whole cycle, the blank gap included, with the moments read
  from the timeline comment above its keyframes rather than guessed.
- **A drawing built by scroll**, scrolled into view gradually, as a reader
  does, so its timeline passes every position rather than jumping to the
  last.
- **A card**, which the script doesn't drive with a pointer: it plays after
  the pointer rests on it, and not as a pointer passes over it. A scroll that
  leaves a parked pointer resting on a card plays that card once, by decision
  (8.3). On a touch screen it plays once its picture is in view, which the
  script's `--touch` with `--scroll` and a `--selector` on the card's list
  item shows, a step at a time.
- **Several drawings at once**, tiled on a contact sheet, which is how one
  that's busier or emptier than the rest is found.

**And one read of the schedule.** `--report` prints, for each width and
theme, how many animations the page runs and when the longest play-once
ends, which should be under about three and a half seconds; then a row per
animation with its clock (once, loop or scroll), its keyframes, its timing
and the element it runs on. A timed row gives its delay, the length of one
play and when it ends, which for a loop is never; a scroll-built row says
"paced by scroll", because its clock is a position. Last, it takes each
element that names a view timeline, found by its computed style rather than
a list, and names any with a part already under way while its top edge is
still below the screen, a timeline the page's scroll isn't moving, and any
with a part not yet finished once its bottom edge is on screen, where every
part that ends in `entry` should be. The top edge is the layout box's, which
is what a view timeline measures, because a learn card's picture rides the
card's rise up to 32px below it, and measured where it showed, its timeline
read as frozen. The second line is how the closing picture's timeline was
found on the wrong element (8.3); the first is how it was found frozen inside
its panel, which the second passed, because a timeline that never moves is
never late.

**Check the finished picture's contrast on purpose.** On the homepage the
axe audit measures whichever frame of each loop network idle lands on
(`tests/a11y.test.ts:120`), so it can pass a frame with half the picture
faded out and never see the finished one. Check the stop box, or capture the
finished picture, and measure that.

Of every frame, ask: does it read at a glance, does anything float before
what holds it arrives, do the labels clear at 390 in both themes, are the
numbers the page's, and does the page's height hold across a loop's cycle.

**The obvious alternatives were watching it play**, which shows the motion and
hides every frame a reader might stop on, and a timing check in
`npm run verify`, which would measure the machine rather than the artifact.
The script is a way of looking, and it stays out of the gate.

_Checked by:_ `human`.

## 9. What is checked, and what is not

| Rule                                | Held by                                                           |
| ----------------------------------- | ----------------------------------------------------------------- |
| 1.1 Color from the contract         | `tests/brand-tokens.test.ts`                                      |
| 1.2 Two theme blocks                | `tests/brand-tokens.test.ts`                                      |
| 1.3 Named same-in-both tokens       | `tests/brand-tokens.test.ts`                                      |
| 1.4 Tokens all declared             | `tests/brand-tokens.test.ts`                                      |
| 4.3 No sideways scroll              | `tests/a11y.test.ts`, at 320px and 390px                          |
| 5.2 Both themes, both widths        | `tests/home-page.test.tsx`                                        |
| 5.2 `sizes` matches the layout      | `tests/a11y.test.ts`, "layout"                                    |
| 5.2 Covers in both themes           | `tests/blog-features.test.ts`                                     |
| 5.3–5.5 Images                      | `tests/home-page.test.tsx`                                        |
| 6.1 The sign-up control             | `tests/home-page.test.tsx`, `tests/pricing.test.tsx`              |
| 6.1 An empty blog offers no feed    | `tests/blog-empty.test.tsx`                                       |
| 6.4 Link text                       | `tests/home-page.test.tsx`                                        |
| 6.5 No third-party branding         | `tests/branding.test.ts`                                          |
| 6.5 No host but this origin         | `tests/export-shape.test.ts`, `tests/legal.test.tsx`              |
| 2.2 Title-to-text spacing           | `tests/a11y.test.ts`, "layout", the legal sections included       |
| 4.2 The pricing list's own heading  | `tests/a11y.test.ts`, "layout"                                    |
| 4.4, 4.5 Box edges, figures in rows | `tests/a11y.test.ts`, "layout"                                    |
| 4.6 Index shelves, one stop a card  | `tests/docs-features.test.ts`; the layout is `human`              |
| 4.7 The sidebar folds on a phone    | `tests/a11y.test.ts`, "layout"                                    |
| 4.8 Two widths in an article        | `human`                                                           |
| 4.9 A short page ends in its footer | `tests/a11y.test.ts`, "layout"                                    |
| 5.3 Cover dimensions                | `tests/blog-features.test.ts`                                     |
| 5.6 Code blocks fill the column     | `tests/a11y.test.ts`, "layout"                                    |
| 6.6 One focus ring                  | `tests/a11y.test.ts`, "layout", every stop on pricing at 390      |
| 7.1–7.3 Structure                   | `tests/home-page.test.tsx`                                        |
| 2.1 The gap under a list            | `tests/a11y.test.ts`, "layout"                                    |
| 2.1 Spacing scale                   | `human` — mechanizable, and the best candidate left               |
| 3.1 Type scale                      | `human` — sweep `font-size:` for a digit                          |
| 3.2 Font stack                      | `human` — against the app's stylesheet, over HTTP                 |
| 4.2 Every class styles something    | `tests/dead-css.test.ts`, both directions                         |
| 4.1, 4.2 Layout and class ownership | `human`                                                           |
| 5.1 Screenshot provenance           | `human`                                                           |
| 6.2 The sign-up label               | `tests/copy.test.ts`; the exact words are `human`                 |
| 6.3 Crumb wording                   | `human`                                                           |
| 7.4 Skip link                       | `human`                                                           |
| 5.7 A picture for every article     | `tests/learn.test.ts`                                             |
| 5.7 The homepage's drawings         | `tests/home-page.test.tsx`; on-brand is `human`                   |
| 5.8 Diagram colors and width        | `tests/learn.test.ts`; the labels are `human`                     |
| 5.9 Words and the ring on the panel | `tests/a11y.test.ts`; on-brand is `human`                         |
| 5.10 Building a drawing             | `tests/learn.test.ts`, `tests/docs-features.test.ts`              |
| 5.10 Small labels large enough      | `tests/a11y.test.ts`, "layout"                                    |
| 8.1 Reduced motion                  | `tests/learn.test.ts`                                             |
| 8.2 Motion stops, or can be stopped | `tests/learn.test.ts`, `tests/home-page.test.tsx`; timing `human` |
| 8.3–8.5 Clocks, effects and loops   | `tests/learn.test.ts`, `tests/home-page.test.tsx`; timing `human` |
| 8.3 Scroll timelines, touch cards   | `tests/a11y.test.ts`, "layout"                                    |
| 8.6 Nothing shifts, words read once | `tests/home-page.test.tsx`; the shift is `human`                  |
| 8.7 Frames                          | `human`                                                           |
| 3.3 Quotes outside the prose        | `tests/typeset.test.ts`, the legal pages and the 404 included     |

Nothing here can check rhythm, balance, or whether a section is in a sensible
place. jsdom has no layout engine, so every visual judgment is a person
looking at a rendered page at each breakpoint. `design-review` is that pass.
