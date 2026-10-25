---
name: write-content
description: Write or edit a blog post, a documentation page or a learn article, with the right frontmatter, and publish it correctly. Use when asked to write a post, add a doc, write a guide or a learn article, draft an article, or publish something to the blog, the docs or /learn.
---

# Write a post, a doc or a learn article

The pipeline is finished; writing is adding a Markdown file.
`docs/standards/content.md` 5 is the contract and this is the procedure.

## 1. Which collection

- **`content/blog/`** — something that is true on the day it is written.
  Ordered by date, carries a byline, appears in the feeds.
- **`content/docs/`** — something that should be true whenever it is read.
  Ordered by hand, carries no byline, appears in search.
- **`content/learn/`** — a guide to an everyday money job, for somebody who
  has never kept track of their money. Ordered by hand like the docs, carries
  a byline like a post, and appears in neither the feeds nor the search.

If it would need "as of September 2026" to stay honest, it is a post. If it
explains how to run or configure the product, it is a doc. If it would be
worth reading to somebody who never uses the product, it is a learn article.

## The voice

American English, with contractions. `docs/standards/content.md` 1.5, and
`tests/copy.test.ts` fails the build on a British spelling anywhere under
`content/`.

This is not a preference. The site prices in US dollars and the application's
screens say **Checking**; a docs page said "a current account, a savings
account" on the page whose job is explaining what an account is, which
disagreed with the product as well as with the reader. The banned list is in
the test: recognise, organise, personalise, analyse, licence, centre,
cancelling, colour, behaviour, whilst, current account, and the rest.

Contractions where somebody talking would use them, not everywhere — uniform
contraction reads as mechanical as none. Watch **"you have"**, which is not
always "you've": a find-and-replace turned the homepage's "See everything you
have" into "See everything you've."

The guides under `docs/` are the exception and stay as they are. They are
prose for somebody reading closely; this is copy for somebody skimming.

## 2. Frontmatter

Required everywhere: `title`, `description`. Required for a post: `date`.
A missing one **fails the build**, which is the intended behavior — the
alternative is a published page with an empty `<title>`.

```yaml
---
title: What a refund actually is
description: One sentence. It is the search result and the feed summary, so write it for somebody who has not decided to read yet.
date: 2026-09-17
authors: [gavin] # keys into src/content/authors.ts, never names
tags: [bookkeeping]
featured: false # pulls it to its own block on the index
series: Keeping your own books
seriesOrder: 2
image: /covers/refund.webp
imageAlt: Required whenever image is set.
draft: false # true builds in dev and is absent from production
---
```

Docs take `section` and `order` instead of `date` and `authors`. Group order
lives in `content/docs/_sections.json`; a section missing from it sorts last.

Learn articles take all four: `date` and `authors` for the byline and the
structured data, which the build refuses without, and `section` and `order`
for where they sit in `content/learn/_sections.json`'s reading order.
A page with no `order` sorts after every page that has one, so adding
`order: 2` to one page does not mean renumbering its neighbors.

**Two that bite:**

- **An author key that does not exist fails the build.** That is deliberate —
  a typo would otherwise render a byline with no name and no photo.
- **A date must be `YYYY-MM-DD`.** Unquoted, YAML turns it into a `Date`; the
  parser normalizes it, and anything that is not a calendar day is refused.

## 3. Writing

`docs/standards/content.md` 1 and 2 apply to every word on this site, posts
included: no marketing vocabulary, never claim the product is simple or easy,
headings as sentences, and **every claim true of the shipped application**.

Available inside Markdown, beyond GitHub's own syntax:

|                                                                |                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------ |
| `<Callout kind="note\|tip\|warning\|danger" title="…">`        | An aside. The kind shows a word as well as a color.          |
| `<Shot name="dashboard" alt="…" width="1600" height="1000" />` | A screenshot, theme-aware, from `public/screenshots/`.       |
| `<Figure src="…" alt="…" caption="…" />`                       | An image whose caption is connected to it.                   |
| `<CodeTabs><CodeTab label="npm">…</CodeTab></CodeTabs>`        | Alternatives, both rendered. Not tabs — see `code-tabs.tsx`. |

Fenced code gets syntax highlighting and a copy button automatically; there is
no component to reach for.

### A learn article

`docs/standards/content.md` 5.14 is the contract, and `tests/learn.test.ts`
fails without its shape. Three `##` headings, in this order:

1. one beginning **"Why"** — why the job matters, to somebody who has never
   done it;
2. one beginning **"How"** — how to do it with a notebook, a spreadsheet or
   anything else;
3. the last, ending **"in Simple Balance"** — how to do it here.

Other headings may sit around them ("What it is" first, "How much" between).
Write for the reader `content.md` 1.3 describes, and gloss an accounting word
where it first appears. **Every button you name in the third part is checked
against the application**, at the release `src/content/app-facts.json` names:
its `docs/how-to.md` names the buttons, and its `src/client/pages/` holds the
labels. Read them over the network, as `AGENTS.md` says, never from a checkout
beside this one. Say what the product cannot do where the method asks for it.

A `<Shot>` in any Markdown page is followed, on the next line, by
`_The money in this picture is made up. It's the real product, filled with example spending._`
and names a screenshot that is in `public/screenshots/` in both themes. A
number in an attribute is written as a string, `width="1600"`, because the
renderer drops `{1600}` along with every other expression.

## 4. Check it

```sh
npm run dev
```

Read the rendered page, not the Markdown. Then:

- **Headings.** A contents list appears at four headings on a post, three on a
  doc. Check the anchors land.
- **The description.** It is the feed summary, the search result and the link
  preview. Read it on its own.
- **A doc's neighbors.** `order` decides the previous/next links; check they
  read as a sequence.
- **Search**, for a doc: type a phrase from the middle of it.

## 5. Publishing

The learn articles and the docs are **announced**. The blog is **not** —
built, reachable, linked from nowhere (`content.md` 7.1). Adding a file to an unannounced section does not
publish it to anybody.

Announcing a section is flipping `announced` in `src/content/sections.ts`,
which changes the header link, the `noindex` and the sitemap together; both
link lists derive from the flag, so there is nothing to keep in sync by hand.
Do that only when asked. `tests/sections.test.tsx` then fails in **exactly one
place** — the assertion that names the announced set by hand — and every other
check in it follows the flag on its own, which was measured by announcing the
blog and running it rather than reasoned about. Update that one line in the
same commit. **A second failure means something other than the flag moved**,
and it is worth reading rather than fixing: the link, `noindex` and sitemap
checks all derive, so one of them failing says the derivation broke.

## 6. Finish

`npm run verify`, then **`merge-prep`**.
