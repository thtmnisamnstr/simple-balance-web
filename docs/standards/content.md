# Content

The words on this site, and the pipeline behind `/blog` and `/docs`.

## 1. Voice

### 1.1 No marketing vocabulary

**Binding.** Seamless, effortless, revolutionary, game-changing, cutting-edge,
best-in-class, unlock, empower, leverage, supercharge, delight, magical, robust,
blazing, 10x, next-generation, synergy, paradigm.

Each of those asks the reader to feel something instead of telling them
something. This product is a ledger; it is bought on trust, and trust is not
built by a page that sounds like every other page.

_Checked by:_ `tests/copy.test.ts`, over every string in the content module.

### 1.2 The page never claims the product is simple, easy or fast

**Binding.** Including "simply" and "quickly". The product is _called_ Simple
Balance, and that is the only place the word appears.

A claim of simplicity is the reader's to make. A page that makes it for them is
arguing with somebody who has not tried it yet.

_Checked by:_ `tests/copy.test.ts`, which strips the product name and any URL
before testing — the naive version reported the repository URL and the word in
the product's own name.

### 1.3 Headings are sentences

**House.** Sentence case, not Title Case. "Budgets that carry", not "Budgets
That Carry".

_Checked by:_ `tests/copy.test.ts`, which counts capitalised words past the
first.

## 2. Claims

### 2.1 Every claim is true of the shipped application

**Binding.** A marketing page for a ledger that overstates what the ledger does
is the one kind of copy that loses a reader permanently, because the product
they then use disproves it.

When a feature is not built, the page says so or says nothing. It does not
describe a plan in the present tense.

_Checked by:_ `human`. Nothing here can read the application — it is a
different repository — so this is the rule that most needs a person, and the
`merge-prep` skill asks for it by name.

### 2.2 Invented figures say so

**Binding.** See `web.md` 5.5. The screenshots show a seeded ledger and the
page discloses it.

_Checked by:_ `tests/home-page.test.tsx`.

### 2.3 Nothing links to what does not exist

**Binding.** No link to `app.smpl.money` while the app is not deployed, and no
empty or `#` hrefs.

_Checked by:_ `tests/copy.test.ts` and `tests/home-page.test.tsx`.

## 3. Structure

### 3.1 Copy lives in a module, not in markup

**House.** The homepage's text is in `src/content/home.ts`.

Two reasons, both about keeping it honest: it can be read by a test, and it can
be reviewed as prose in one file without JSX around it. A claim about the
product is something somebody has to be able to check, and claims scattered
through markup do not get checked.

_Checked by:_ `tests/copy.test.ts` exists at all, which is only possible
because of this.

### 3.2 Section order is an argument

**House.** The reader arrives not knowing what this is: the hero says what it
is, the problems say why they would want it, the showcase shows it, the
features say what else is in the box, self-hosting answers the question a
finance product always raises, and agents is the thing nothing else does.

Reordering is fine. Reordering without a reason is what this rule is about.

## 4. Contact

### 4.1 Two addresses, each labelled

**House.** `info@smpl.money` for general enquiries, `support@smpl.money` for
help with a deployment.

An unlabelled pair is how a support question reaches a mailbox nobody reads on
a weekday.

_Checked by:_ `tests/copy.test.ts` and `tests/home-page.test.tsx`.

## 5. The content pipeline

`/blog` and `/docs` are Markdown files under `content/`, read at build time by
`src/content/collections/index.ts` and rendered by this site's own layouts.

### 5.1 No docs framework, and when to revisit

**Contested, decided for now.** Fumadocs, Starlight and Docusaurus each do this
better than a few hundred lines can — generated sidebars, full-text search,
versioning.

Each also brings its own theme system, and this site's whole design argument is
that one token set is shared with the application. Adopting one means either
overriding its theme until nothing of it is left, or letting the docs look like
a different product from the page that links to them.

**The trigger to revisit:** when search becomes the way people find a doc, or
when there are enough pages that a hand-ordered sidebar is a chore. The escape
hatch is deliberate — these are plain Markdown files with conventional
frontmatter, which is exactly what all three of those frameworks read.

### 5.2 Frontmatter is the conventional vocabulary

**House.** `title`, `description`, `date`, `updated`, `authors`, `tags`,
`featured`, `image`, `imageAlt`, `section`, `order`, `draft`, `slug`,
`canonical`.

Deliberately the set somebody arriving from Jekyll, Hugo or Astro already
expects, so a writer does not learn a vocabulary invented here. An unknown key
is kept rather than rejected: a key this site does not use yet is not an error,
and failing a build over one would make adding a feature a two-step change.

`title` and `description` are required everywhere; `date` is required for a
post. A missing one fails the build, because the alternative is a published
page with an empty `<title>` discovered by a reader.

_Checked by:_ `tests/content.test.ts`.

### 5.3 A date is a calendar day

**Binding.** Stored and rendered as `YYYY-MM-DD`, formatted in UTC.

`gray-matter` returns a `Date` object for an unquoted `2026-09-17`, because
that is what YAML says it is. Interpolated into a string it becomes
"Wed Sep 17 2026 …" and then an Invalid Date — which failed a build here, and
would otherwise have rendered the day before for every reader west of
Greenwich. Normalising at the parser means every consumer gets one shape
however the file was written.

_Checked by:_ `tests/content.test.ts`.

### 5.4 Authors are keys, not names

**Binding.** A post names authors by key into `src/content/authors.ts`. A key
that does not exist fails the build.

Two posts spelling one person's name differently is the ordinary failure, and
it shows up as a missing photo on one of them. A typo that fails a build is a
typo nobody ships.

Multiple authors are the normal case: every one is rendered with their photo,
not "and 2 others". A co-author visible only in a tooltip was not credited.

_Checked by:_ `tests/content.test.ts`.

### 5.5 Sidebar order is one file

**House.** `content/docs/_sections.json` names the group order; each page's
`order` places it within its group.

Groups need an order that is not alphabetical — "Install" belongs above
"Reference" — and there is nowhere in per-page frontmatter to say so without
repeating it on every page in the group and letting two disagree. A section
missing from the file sorts last, so adding a group is a one-file change.

A page with no `order` sorts after every page that has one, rather than
alphabetically among them. That is what makes adding `order: 2` to one page do
the obvious thing without renumbering its neighbours.

_Checked by:_ `tests/content.test.ts`.

### 5.6 A draft is absent from production

**House.** `draft: true` builds in development and is excluded from the
production export entirely, so an unfinished page cannot be reached by guessing
its URL on the live site.

_Checked by:_ `human`. The production build is where it would show, and the
test tier builds in production mode — worth a case the first time a draft
exists.

### 5.7 The table of contents ignores fenced code

**Binding.** A `## ` inside a code fence is a shell comment, not a heading.

This is the bug every hand-rolled contents list has.

_Checked by:_ `tests/content.test.ts`.

### 5.8 Heading ids match the renderer's

**Binding.** `slugify` in the collections module has to agree with
`rehype-slug`, or every anchor in a contents list points at nothing.

That coupling is the fragile part of this pipeline, and it is pinned with cases
carrying punctuation, inline code and formatting.

_Checked by:_ `tests/content.test.ts`.

## 6. Announced versus built

### 6.1 One flag decides three things

**Binding.** `announced` in `src/content/sections.ts` controls whether a
section is linked, whether its pages are indexed, and whether it enters the
sitemap.

Today both sections are built, styled, reachable by URL, and announced nowhere.
That is the shipped state: the machinery is finished so that publishing is
writing a Markdown file rather than building a blog, and an empty blog
advertised in the header is worse than no blog.

One flag rather than three habits, because a section half-launched by somebody
adding a link is the failure this prevents.

_Checked by:_ `tests/sections.test.tsx`, which asserts all three.

### 6.2 Crawling is allowed; indexing is not

**Binding.** `robots.txt` allows everything. Unannounced pages carry `noindex`.

`Disallow: /blog` is the reflex and it is exactly wrong: a crawler that cannot
fetch the page never sees the `noindex`, so a URL somebody links to can still
be indexed — as a bare link with no description, which is the worst of both.

_Checked by:_ `tests/sections.test.tsx`.
