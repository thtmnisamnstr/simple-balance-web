# React

## 1. Server components by default, islands by exception

### 1.1 A client component is an island, and it earns its place

**Binding.** Almost everything here runs at build time and ships HTML. A
`"use client"` component is allowed only where all four of these hold:

1. **The behavior is impossible without the browser.** Clipboard access,
   scroll position, a keyboard shortcut. Not "it would be nicer".
2. **The page is correct before it hydrates.** The island adds; it never
   supplies content. `ActiveContents` highlights a contents list the server
   already rendered in full; remove the island and every link still works.
3. **It holds no application state.** Nothing is persisted, and nothing else
   on the page depends on it.
4. **A control that does not work yet does not look like one.** An island's
   button is inert until hydration, so it either says so or is disabled until
   mounted.

There are three, and each is named here so a fourth is a decision rather than
a habit:

| Island                       | Why it cannot be done on the server                          |
| ---------------------------- | ------------------------------------------------------------ |
| `client/copy-button.tsx`     | The clipboard is a browser API.                              |
| `client/docs-search.tsx`     | Matching as you type, against an index fetched on first use. |
| `client/active-contents.tsx` | Which heading you are looking at is a scroll position.       |

**This rule replaced an absolute one.** The guide said "nothing here is a
client component", which was true when the site was one page and stopped being
true the moment docs needed search. The absolute version would have been
satisfied by shipping documentation with no search and code blocks nobody can
copy, which is the wrong trade — so the rule became a test the exception has
to pass rather than a prohibition that would have been quietly broken.

_Checked by:_ `human` for the four conditions. The count is visible —
`src/components/client/` is the whole list, and a client component outside
that directory is the thing to look for in review.

### 1.2 Markdown is compiled on the server

**Binding.** `next-mdx-remote/rsc` inside a server component, so Shiki and the
remark/rehype pipeline run during the build and the reader downloads colored
HTML rather than a highlighter.

**Guidance: a component Markdown can use touches three places.** The map in
`src/components/prose.tsx:50`, which is what lets a page write the tag; a
conversion in `src/lib/markdown.ts`, which turns the tag back into Markdown
for the copy served beside every docs page and learn guide (`content.md`
5.15); and a home for its words that the copy checks read, which is the
Markdown itself or a module `tests/copy.test.ts` already lists. Forgetting the
conversion fails `tests/markdown.test.ts:48`, which refuses a capitalized tag
left in a copy. `<Figure>` is in the map with no conversion, and that is why
it's for posts only: the blog has no copies, so nothing there needs one, and
the first docs page to use it would fail that test.

_Checked by:_ `tests/markdown.test.ts` for a component with no conversion;
that the compile stays on the server is `human`, and the shipped weight in
`tests/budget.test.ts` would show a highlighter arriving in the browser.

## 2. Props

### 2.1 Props are readonly

**House.** `{ readonly title: string }`. A component that mutates its props is
a bug, and the type saying so is free.

### 2.2 A required prop is required

**House.** `alt`, `width` and `height` on `Shot` are required, not optional
with a default. A default would let a caller omit the thing the rule exists to
enforce — see `web.md` 5.3 and 5.4.

## 3. Composition

### 3.1 One component per concept, and it owns its class

**Binding.** See `web.md` 4.2. Two components sharing a class can no longer
differ, and the fix is always to give the second its own — even when the
declarations are identical today.

### 3.2 A list item is a list item

**House.** `PostCard` renders its own `<li>` so the parent can be a `<ul>`
without a wrapper. A card whose whole surface is a link swallows text selection
and gives a screen reader one enormous link name; the title is the link.

## 4. Interactive patterns

### 4.1 Do not declare an ARIA pattern you have not implemented

**Binding.** The docs search was written as a `role="combobox"` with a
`listbox` and `option` children, and that declaration obliges the whole
contract: arrow keys moving a virtual cursor, `aria-activedescendant`, Home
and End, Enter to select. Half of it — the roles without the keyboard — tells
a screen reader to expect behavior that is not there.

It is now a search field and a list of links. They are reachable by Tab,
announced correctly by every reader, and a live region gives the result count.
Fewer claims, all of them true.

_Checked by:_ `npm run lint`. `jsx-a11y`'s `prefer-tag-over-role` and
`no-noninteractive-element-to-interactive-role` both fired on the first
version, which is how this was found.

### 4.2 Prefer the element with the behavior built in

**House.** `<details>` for the narrow-screen docs sidebar rather than a
scripted drawer: it works before hydration, find-in-page can open it, and it
needs no focus trap, no Escape handler and no state. It starts closed in the
markup and the stylesheet shows it on a wide screen (`web.md` 4.7); rendered
open, it put twenty-seven links between a phone reader and every docs page's
first line. `<output>` for a live region rather than `role="status"`.

`LoopStop` (`src/components/loop-stop.tsx:14`) is the second example. A
native checkbox, read by `:has()` in the stylesheet, stops a looping drawing
with no island: it works before anything hydrates, and a screen reader
announces its state without an ARIA pattern to get wrong. A pause button
would have been a fourth island, inert until hydration while the loop it
stops was already running.

**Guidance.** For anything that shows and hides, or turns on and off, try
`<details>`, a checkbox, `:hover` or `:focus-within` before a client
component. Each keeps its state in the browser, so the page is right before
any script arrives and 1.1's four conditions never come up.

_Checked by:_ `tests/a11y.test.ts:572` for the sidebar at both widths and
`tests/home-page.test.tsx:228` for a labeled checkbox beside every loop; the
choice of element is `human`.

## 5. Icons

**House.** Hand-written inline SVG in `src/components/icons.tsx`, on the same
24-unit grid and 1.75 stroke as the application's set.

An icon package would ship a few hundred glyphs for the seven this site uses
and put the largest asset outside review. Seven is not enough to justify a
dependency.

The logo mark is copied from the application's `favicon.svg` rather than drawn
again, because two nearly-matching logos is worse than one.

**Guidance: which set a mark comes from.** `icons.tsx` holds the interface's
affordances, at the application's 1.75 stroke. Two more sets are drawn at the
logo's 2-unit stroke, keyed by slug and held one for one with their pages: the
learn glyphs (`src/components/learn-art/glyphs.tsx`) and the docs marks
(`src/components/docs-art/glyphs.tsx`). Choose by what the mark stands for. A
feature or a control takes an icon; a page takes its own glyph. Never borrow
a learn glyph for a docs page: the learn set is held to the articles one for
one, so a docs page in it would be an article with no article
(`src/components/docs-art/glyphs.tsx:7`).

_Checked by:_ `tests/home-page.test.tsx` for `aria-hidden`, and
`tests/learn.test.ts` and `tests/docs-features.test.ts` for the two glyph sets
held to their pages; which set a mark comes from is `human`.

## 6. A drawing is a component, and its words are content

**House.** Each learn article has one module,
`src/components/learn-art/<slug>.tsx`, exporting `art` as an `ArticleArt`:
its hero, and its diagrams keyed by the name the article's Markdown uses.
`registry.ts` lists every one by hand
(`src/components/learn-art/registry.ts:15`–`24`).

**Written out rather than discovered.** A static export resolves its imports
at build time, and `tests/learn.test.ts:352` holds the list and the articles
to one set in both directions (`code/testing.md` 2.8). The list costs a line
per article, and in exchange a misnamed file fails rather than shipping.

**The words live in `src/content/learn-art/<slug>.ts`**, re-exported from
`src/content/learn-art/index.ts`, which is how `tests/copy.test.ts` reads
every word a picture shows. The drawing imports them and typesets them once
with `typesetAll`. A caption typed into the JSX is a sentence no copy check
reads, and a new module left out of the index is the same sentence.

**The frames carry the accessibility.** `ArtFrame` hides a hero whole from
assistive technology, and `DiagramFrame` names the svg by its own `<title>`
and puts a caption under it (`src/components/learn-art/frame.tsx:24`, `:69`).
A drawing module adds neither, so twelve drawings by twelve hands agree on
both.

**Style goes through `css()`** (`src/components/learn-art/frame.tsx:104`),
which types the motion order, the two colors and the duration. A misspelled
custom property is a compile error rather than a picture that never moves,
and a color can only be a `var()`.

**Keys are drawn values**, composed where two parts would share one
(`src/components/learn-art/emergency-fund.tsx:86`), never the index
(`code/index.md` 3).

**The rest follow the same shape.** The docs marks are
`src/components/docs-art/glyphs.tsx`, keyed by slug; the group pictures are
`groupArt` in `src/components/docs-art/pictures.tsx`, keyed by group, with
their words in the index's copy in `src/content/sections.ts`. The homepage's
drawings are `src/components/home-art.tsx`, with their words in
`src/content/home.ts`; the blog's pictures, `src/components/blog-art.tsx`,
have none.

How a drawing looks and moves is `web.md` 5.7 to 5.10 and 8. This section is
only where its code goes.

**The obvious alternative** is discovering the art files by glob, which needs
no list and turns a misnamed file into a page with no picture, found by
whoever opens it.

_Checked by:_ `tests/learn.test.ts` for the registry and
`tests/docs-features.test.ts` for the docs marks and pictures, both in both
directions; `npm run typecheck` for `css()`; that the words have a home the
copy checks read is `human`.
