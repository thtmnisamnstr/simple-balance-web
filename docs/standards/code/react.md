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
needs no focus trap, no Escape handler and no state. `<output>` for a live
region rather than `role="status"`.

## 5. Icons

**House.** Hand-written inline SVG in `src/components/icons.tsx`, on the same
24-unit grid and 1.75 stroke as the application's set.

An icon package would ship a few hundred glyphs for the seven this site uses
and put the largest asset outside review. Seven is not enough to justify a
dependency.

The logo mark is copied from the application's `favicon.svg` rather than drawn
again, because two nearly-matching logos is worse than one.

_Checked by:_ `tests/home-page.test.tsx` for `aria-hidden`.
