# React

## 1. Server components by default

### 1.1 Nothing here is a client component

**Binding, currently.** No file in `src/` carries `"use client"`.

The whole site is static, so every component runs at build time and ships HTML.
The theme follows `prefers-color-scheme` in CSS, images are chosen by
`<picture>`, and there is no state to hold. Adding the first client component
is a real decision: it adds a hydration payload to a page whose entire
performance story is that it has almost none.

_Checked by:_ `human`. Worth a grep-based check the first time somebody adds
one.

### 1.2 Markdown is compiled on the server

**Binding.** `next-mdx-remote/rsc` inside a server component, so Shiki and the
remark/rehype pipeline run during the build and the reader downloads coloured
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

## 4. Icons

**House.** Hand-written inline SVG in `src/components/icons.tsx`, on the same
24-unit grid and 1.75 stroke as the application's set.

An icon package would ship a few hundred glyphs for the seven this site uses
and put the largest asset outside review. Seven is not enough to justify a
dependency.

The logo mark is copied from the application's `favicon.svg` rather than drawn
again, because two nearly-matching logos is worse than one.

_Checked by:_ `tests/home-page.test.tsx` for `aria-hidden`.
