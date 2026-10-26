---
name: write-content
description: Write or edit a blog post, a documentation page or a learn article, with the right frontmatter, and publish it correctly. Use when asked to write a post, add a doc, write a guide or a learn article, draft an article, publish something to the blog, the docs or /learn, or fix a learn guide sync-from-app reported, whose steps name something a release removed or sit under a screenshot it refreshed.
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
  a date and no author, and appears in neither the feeds nor the search.

If it would need "as of September 2026" to stay honest, it is a post. If it
explains how to use, run or configure the product, it is a doc. If it would be
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

**A quoted app message is the app's sentence, not this site's.** Quote it
exactly as the screen shows it, contracted or not and spelled however the
app spells it, and keep it out of every contraction or spelling pass. If its
wording breaks a rule here, tell the owner rather than fixing it on the page:
a corrected quote is a message the reader will never see on the screen
(`content.md` 1.6). /docs/limits/ promises its quotes are word for word.

The guides under `docs/` are the exception and stay as they are. They are
prose for somebody reading closely; this is copy for somebody skimming.

## 2. Frontmatter

Required everywhere: `title`, `description`. Required for a post and a learn
article: `date`. A missing one **fails the build**, which is the intended
behavior — the alternative is a published page with an empty `<title>`.

```yaml
---
title: What a refund actually is
description: One sentence. It is the search result and the feed summary, so write it for somebody who has not decided to read yet.
date: 2026-09-17
authors: [gavin] # keys into src/content/authors.ts, never names
tags: [bookkeeping]
featured: false # the newest featured post leads the front page
series: Keeping your own books
seriesOrder: 2
image: /covers/refund.webp
imageAlt: Required whenever image is set.
draft: false # true builds in dev and is absent from production
---
```

**Don't copy `authors: [gavin]` from that example** onto a post you drafted.
A key in `authors` says that person wrote the words, so ask whose name goes
on it; a post with no `authors` renders a clean byline with no name
(`content.md` 5.4).

Docs take `section`, `order` and `updated` instead of `date` and `authors`.

Group order lives in `content/docs/_sections.json`, and every group has to be
named there or the grouping test fails. A new docs group is three changes:
its place in that file, its words in `docsIndex.groups`
(`src/content/sections.ts`), and its picture in `groupArt`
(`src/components/docs-art/pictures.tsx`). A new learn group is two: its place
in `content/learn/_sections.json` and its words in `learnIndex.groups`
(`src/content/learn.ts`). `content.md` 5.5.

Learn articles take `date`, for the line under the title and the structured
data, which the build refuses without, `section` and `order` for where they
sit in `content/learn/_sections.json`'s reading order, and an optional
`updated`. They take **no `authors`**: they credit nobody (`content.md`
5.14), and the build refuses one.
A page with no `order` sorts after every page that has one, so adding
`order: 2` to one page does not mean renumbering its neighbors.

**`updated` is the day a page's facts last changed**, defined here once for
every skill that moves it. It's the "Updated" line under a docs page's or an
article's title, the page's `lastmod` in the sitemap, `dateModified` in its
structured data and the date on its Markdown copy, so it's a claim made to a
reader and to a crawler at once.

- **A docs page has to have one.** The parser lets you leave it out and the
  build doesn't: a docs page has no `date`, so without `updated` its sitemap
  entry has no date, and `tests/sitemap.test.ts` refuses that (`content.md`
  5.2).
- **A learn article may have one, beside a `date` that never moves.** `date`
  is the day it was published, and `updated` arrives the first time a fact in
  it changes, which is most often a release renaming a button its last part
  names.
- **A post may have one** for a correction, though a post is true on the day
  it was written and is usually left alone.

Move it to the day when something a reader acts on or repeats changes: a
step, a label, a limit, a figure, a source. Leave it for a typo, a smoother
sentence or a new picture. Google uses a sitemap's dates only while they're
consistently accurate, and a date bumped with nothing behind it spends that
for every page on the site. The `seo-review` skill checks a branch for both
mistakes: a date that moved alone, and a fact that changed without one.

The same test refuses a date in the future, or one before the site's first
commit, 2026-09-17, because neither can be true. **The floor used to be the
application snapshot's `source.fetched`**, which `sync-from-app` §7 sets to
the day it runs, so every sync failed every page in the sitemap dated before
that day, whether or not anything on it changed, and the only way to pass was
the bumped date above, on every page at once. Refreshing the snapshot changes
no page's date, so the check was narrowed per
`docs/standards/code/testing.md` 2.5 rather than obeyed. A date that fails it
now is wrong, not merely old.

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

|                                                                |                                                                                                                                                                                               |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Callout kind="note\|tip\|warning\|danger" title="…">`        | An aside. The kind shows a word as well as a color.                                                                                                                                           |
| `<Shot name="dashboard" alt="…" width="1600" height="1000" />` | A screenshot, theme-aware, from `public/screenshots/`.                                                                                                                                        |
| `<Diagram name="…" />`                                         | A learn guide's diagram, defined in that guide's art module and placed where the text explains it. Learn guides only.                                                                         |
| `<Figure src="…" alt="…" caption="…" />`                       | Posts only. An image whose caption is connected to it. It has no conversion for the Markdown copies, so on a docs page or a guide `tests/markdown.test.ts` fails on the tag left in the copy. |
| `<CodeTabs><CodeTab label="npm">…</CodeTab></CodeTabs>`        | Alternatives, both rendered. Not tabs — see `code-tabs.tsx`.                                                                                                                                  |

Fenced code gets syntax highlighting and a copy button automatically; there is
no component to reach for.

### A docs page

`docs/standards/content.md` 5.17 is the shape the docs follow and 5.18 is who
they're for: the cloud app first, with a self-hosted difference in a note
rather than in the steps. Whether what a page says is true is `content.md`
2.7, and `sync-from-app` §5 is the procedure: the page is written with the
application's source open, then every claim on it is listed against the line
in the source that makes it true and handed to a second reader to refute.
Read `content/docs/recurring-transactions.md` first; it's the worked example.

A new page needs seven things. The build and the tests refuse a page missing
the first, the second or the last, and a third that names something gone;
the other three are for a reader, and nothing checks them but you:

1. **A mark** in `src/components/docs-art/glyphs.tsx`, keyed by the page's
   slug: its one object on the 24-unit grid, written as separate stroke
   paths, with a circle as two arcs so it can draw itself in. `docGlyph`
   throws on a slug with no mark, so a page without one fails the build
   rather than showing an empty tile.
2. **Its group**: an existing `section`, or for a new group the three changes
   in §2, with its picture drawn by `draw-and-animate`.
3. **A place on the index, if it earns one.** `docsIndex.starts` in
   `src/content/sections.ts` names a page by slug as a starting point, and
   `docsIndex.steps` lists a page's own `##` heading ids as the steps on its
   card, so each of those headings is an imperative step name.
   `tests/docs-features.test.ts` fails on a slug or an id that doesn't exist,
   so renaming one of those headings is a change in both places.
4. **A first paragraph that answers**, with no heading above it: what the
   thing is, what it does and what it doesn't. The Markdown copy and an
   answer engine take the opening first (`content.md` 5.16).
5. **Labels in bold, spelled exactly as the app spells them**, and bold used
   for little else. The label sweep in `sync-from-app` §1 can only check what's
   bold, so a label left plain goes unchecked, and bold emphasis is noise the
   next run has to dismiss.
6. **A stated limit repeated on /docs/limits/**, which promises every limit in
   one place.
7. **Its card**: `npm run build:images`, and what it draws in
   `public/og/docs/` goes in the same commit as the page.

**Which commit a page is written from depends on who runs what it
describes.** A Self-hosting page follows the release tag it tells a reader to
clone, `v` and `facts.derived.appVersion`; every other page follows the commit
app.smpl.money runs. `sync-from-app` §5 says how to pin each, and to ask the
owner when it isn't clear what the cloud runs.

**A single page is written here**, with its claims put through those steps
of `sync-from-app` §5: pinning the source, listing the claims, the second
reader, and reconciling the page with its neighbors and with the pricing,
legal and homepage copy. A release's worth of pages, or a whole feature, is
that section from its start, because its inventory and its map are what find
the page nobody thought to write.

### A learn article

**Pick the topic from the queue** in `docs/roadmap.md` 4, which is ordered by
fit with the product and by what people search. The 50/30/20 rule isn't on
it: that guide was written and taken out at the owner's call, so its search
volume isn't a reason to write it again. A guide in a group that doesn't
exist yet is §2's two changes.

`docs/standards/content.md` 5.14 is the contract, and `tests/learn.test.ts`
fails without its shape. Three `##` headings, in this order:

1. one beginning **"Why"** — why the job matters, to somebody who has never
   done it;
2. one beginning **"How"** — how to do it with a notebook, a spreadsheet or
   anything else;
3. the last, ending **"in Simple Balance"** — how to do it here.

Other headings may sit around them ("What it is" first, "How much" between).
Write for the reader `content.md` 1.3 describes, and gloss an accounting word
where it first appears. Say what the product can't do where the method asks
for it.

**The third part is held to what a docs page is held to**, because it's the
part a newcomer is most likely to try (`content.md` 2.7). Every button,
label, message and step in it goes through the steps of `sync-from-app` §5
that a single docs page does: the source read at the commit
`src/content/app-facts.json` records as `source.commit`, or, during a sync,
at `$SHA` in `/tmp/app-sync.env`, because the snapshot goes on naming the
previous pull's commit until `sync-from-app` §7 records the new one, and a
guide fixed in the sync's own pull against that commit is checked against
the release it's replacing. Either way it's fetched over the network as
`AGENTS.md` says and never from a checkout beside this one; each
claim listed with the line that makes it true; the part handed to a second
reader who tries to prove it wrong; and every finding settled against the
code before it changes a word. The app's `docs/how-to.md` names the buttons,
but it's a map rather than the truth, and the labels live in the components
the pages share as well as in `src/client/pages/`, which that section's
inventory lists. A label that's close is wrong; `content.md` 5.14 has the
two that were.

**When `sync-from-app` reports a guide**, whose steps name a label, button
or message a release removed (its §1), or sit under a screenshot it
refreshed (its §4), the fix is made here, because a sync reports the learn
guides and doesn't rewrite them. Rewrite the step against the new source
through the same check, make sure each screenshot under it shows the screen
the step now describes (the published set in `public/screenshots/` is all
there is; nothing here takes a new one), and give the guide an `updated`
(§2) if a step changed.

**Credit what you borrowed.** A method somebody named, a rule of thumb, a
statistic: each gets a link at the point it is used and a line in a closing
`## Sources` section, and the test fails on an outside link that is missing
from it. Use government, regulator, university-extension or originating
sources, never a personal-finance personality (`content.md` 5.14 has the
order and the reason).

Each line under `## Sources` has one shape:
`Author, Organization. [Title](https://…). Publication or type, Date.` Leave the
author out when the organization wrote it, italicize a periodical's name, and
put "Updated" before the date where the page says it was updated.
`content/learn/emergency-fund.md` has every variant.

**Write for a 5th to 8th grader**, and measure it rather than guess:

```sh
python3 -m venv /tmp/rl && /tmp/rl/bin/pip install -q textstat
/tmp/rl/bin/python - content/learn/<file>.md <<'PY'
import re, sys, textstat as t
for path in sys.argv[1:]:
    md = open(path).read().split("---", 2)[2]
    md = re.split(r"\n## Sources\n", md)[0]
    md = re.sub(r"`{3}[\s\S]*?`{3}", "", md)
    md = re.sub(r"<Shot[\s\S]*?/>|<Diagram[^>]*/>|</?Callout[^>]*>|^#+ .*$|^\|.*\|$", "", md, flags=re.M)
    md = re.sub(r"^\s*(?:[-*]|\d+\.)\s+(.*?)\s*$",
                lambda m: m.group(1) + ("" if m.group(1)[-1:] in ".!?:" else "."), md, flags=re.M)
    md = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", md)
    text = re.sub(r"\s+", " ", re.sub(r"[*_`]", "", md)).strip()
    print(f"{t.flesch_kincaid_grade(text):4.1f}  {t.text_standard(text)}  {path}")
    longest = sorted(re.split(r"(?<=[.!?])\s+", text), key=t.lexicon_count, reverse=True)
    for sentence in longest[:5]:
        print(f"      {t.lexicon_count(sentence):2d} words: {sentence[:140]}")
PY
```

Grade 8 or below on both. It measures only what a reader reads as sentences:
fenced code, pictures, callout tags, headings, tables and the sources are
taken out first. It ends every list item with a period and drops a numbered
list's numbers, because an item with no period runs into the next one and
the formula reads the whole list as one long sentence. Then it prints the
five longest sentences, which is where to start cutting. Keep it, and any
edit to it, free of a dollar sign before a digit: a skill's text has those
filled in before anybody reads it, which is why the backreference is
Python's `\1`.

The same script measures a docs page. Outside Self-hosting the docs are
written for the same reader as the guides (`content.md` 5.18); a Self-hosting
page is read by somebody deploying, and its grade may climb.

Then read it aloud: short words and short sentences are the means, and a page
of nothing but short sentences reads as choppy as a long one reads as hard.
The three passes in `sync-from-app` §3 (the tells, the rhythm, whether
somebody would say it) were written for the homepage and are how to read
back any page here.

### A learn article's pictures

`tests/learn.test.ts` fails until a new article has all of them.

1. **A glyph** in `src/components/learn-art/glyphs.tsx`: the article's one
   object on the logo's 24-unit grid, 2-unit round stroke.
2. **A drawing**, `src/components/learn-art/<slug>.tsx`, exporting
   `art: ArticleArt`, its `Hero` drawn on the 1200 by 600 grid with the
   `art-*` classes only (`docs/standards/web.md` 5.7), and listed in
   `registry.ts`. `net-worth.tsx` is the one to read first.
3. **At least one diagram** in the same module, at most 560 units wide, colored
   only through `css({ "--c": "var(--…)" })` and the `dg-*` classes, labels
   beside fills rather than on them (`web.md` 5.8), placed in the Markdown as
   `<Diagram name="<slug>-<thing>" />` where the article explains it. Its
   numbers are the article's numbers.
4. **Every word the pictures show** in `src/content/learn-art/<slug>.ts`,
   exported through its `index.ts`, so the copy checks read it.
5. **Screenshots** of the screens the "in Simple Balance" part walks through,
   each under its own subsection.

How to compose the pictures, move them and look at them, frame by frame in
both themes at 1280 and 390 wide, is `draw-and-animate`, by
`docs/standards/web.md` 5.10 for the drawing and 8.3 to 8.7 for the motion
and the frames. A label that overlaps a bar is invisible to every test here,
so the look isn't optional.

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
  preview. Read it on its own. **70 to 160 characters**, and the title 53 or
  fewer, so it fits in 70 with " — Simple Balance" on the end:
  `tests/sitemap.test.ts` measures both on the built page (`content.md`
  5.16). Answer the page's question in it, in the words somebody would
  search.
- **Its card, for a doc or a learn article.** Run `npm run build:images` after
  adding a page or changing its title, and what it draws in `public/og/` goes
  in the same commit as the page. The build fails on a page with no card or a card drawn from
  an old title, because otherwise a shared link previews under the old name.
  The script never deletes (`docs/standards/operations.md` 7.1), so a page
  you removed or renamed leaves its old card for you to delete in the same
  change.
- **Its date, on a page you changed rather than wrote.** A fact that moved
  moves `updated` to the day, and nothing else moves it (§2).
- **Its Markdown copy.** A doc or a learn article gets one at
  `<page>/index.md` and a line in `/llms.txt` with nothing to do. A new
  component in the Markdown needs a conversion in `src/lib/markdown.ts`, or
  `tests/markdown.test.ts` fails on the tag left in the copy.
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

`npm run verify`, then **`merge-prep`**. When another skill sent you here
for one page, `sync-from-app` §5 most often, return to it instead: it ends
in `merge-prep` itself, and running it from here pushes half a release.
