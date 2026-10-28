# smpl.money

The marketing site for [Simple Balance](https://github.com/thtmnisamnstr/simple-balance),
a free budget app and spending tracker that people use at app.smpl.money or
self-host. That is how the site itself describes it
(`docs/standards/content.md` 1.3). This line used to say "a self-hosted
double-entry ledger", which is the vocabulary the homepage was rewritten to
drop. The homepage, pricing, the learn articles and the documentation are
announced; the blog is built and deliberately is not.

## Running it

```sh
npm install
npm run dev          # http://localhost:3000
```

```sh
npm run verify       # typecheck → lint → format:check → build → test
npm run build        # static export into out/
npx serve out        # serve the export exactly as Netlify will
npm run frames -- --path /   # the built drawings and motion as stills, in .frames/
```

## Which skill to run

The procedures live in `.claude/skills/`. Ask for one by name ("run
`merge-prep`").

**Before you merge a pull request, run `merge-prep`, and only that.** It runs
the others itself, in this order, because each can change what the ones after
it have to look at:

1. `update-dependencies`: moves every package to its newest supported version
   and fixes what that breaks. First, because an upgrade can change how a page
   renders.
2. `legal-review`: brings the privacy policy and terms back to true if
   anything changed what data is handled or who handles it. A branch that
   didn't stops after its first check.
3. `design-review`: looks at the pages the branch changed (every page, when a
   shared style or a rendering dependency moved) in both themes, at a phone
   width and a wide one, motion included, and fixes what's wrong.
4. `seo-review`: reads what a search engine reads on those pages, their
   titles, descriptions, structured data, sitemap dates and cards, past what
   the tests already hold.
5. `aeo-review`: reads what an AI assistant quotes from them, each page's
   opening answer, the Markdown copies and `/llms.txt`, and lists what only
   you can do off the site, such as Search Console.
6. `optimize`: page weight, images, fonts and what the browser is asked to do.
7. `guides-update`: brings the standards, `AGENTS.md`, the README and
   `CHANGELOG.md` back to true. Last, because every step before it can change
   what they have to say.
8. `npm run verify`, then one commit, one push and a pull request. Every push
   is a Netlify build on your credits, so there is exactly one.

`merge-prep` never merges. What's left is yours: open the Netlify deploy
preview (it's behind your login, so an agent can't), look at it, and press
merge.

**When the application ships a release, run `sync-from-app`, and only that.**
It updates everything on this site that describes the product: the homepage,
pricing, the docs, and the privacy policy and terms. It doesn't rewrite the
learn guides or the blog, but it lists any learn guide whose steps name a
button the release changed. It ends by running `merge-prep` itself, so don't
run that again afterward: a second run is a second push.

**For the work itself:**

| To                                                    | Run                                               |
| ----------------------------------------------------- | ------------------------------------------------- |
| Write a post, a docs page or a learn guide            | `write-content`                                   |
| Make or change a picture, a diagram or an animation   | `draw-and-animate`                                |
| Document a feature, or check the docs against the app | `sync-from-app`, its §5 alone (it doesn't commit) |
| Upgrade dependencies on their own                     | `update-dependencies`                             |
| Review the design without preparing a merge           | `design-review`                                   |
| Check the site is ready for search and AI answers     | `seo-review`, then `aeo-review`                   |

## What this is

A Next.js App Router project with `output: "export"`, so the build is plain
HTML, CSS and JS with no server. That is deliberate: the artifact runs on
Netlify today and would run unchanged on any other static host.

```
src/app/            routes — /, /pricing, /privacy, /terms, /learn/*, /docs/*, /blog/*
src/components/     the components: server components, and three client islands in client/
src/content/        the homepage copy, the authors, the section flags
src/styles/         brand.css (shared with the app) and site.css
content/blog/       posts, as Markdown with frontmatter
content/docs/       documentation pages
content/learn/      guides to everyday money jobs
docs/standards/     the design, content and code standards
.claude/skills/     eleven procedures that repeat
scripts/            images, motion frames, copy acceptance, the app-sync check, the link check
```

## Writing

A post is a Markdown file in `content/blog/`:

```yaml
---
title: Double-entry bookkeeping, for one person
description: Why a ledger nobody audits still benefits from books that balance.
date: 2026-09-17
authors: [gavin]
tags: [bookkeeping]
featured: true
---
```

A documentation page is the same with `section`, `order` and `updated` in
place of `date` and `authors`. A learn article takes `date`, `section` and
`order`, and no `authors`. Group order lives in `content/docs/_sections.json`
and `content/learn/_sections.json`.

`title` and `description` are required everywhere, and `date` is required for a
post and a learn article; a missing one fails the build rather than publishing
a page with an empty title. A docs page has no `date`, so its `updated` is what
the sitemap dates it by, and the sitemap test refuses a page without one.
Authors are keys into `src/content/authors.ts`, so a typo is a build
error rather than a byline with no name.

Markdown supports GitHub tables, footnotes and task lists, real quotation
marks, headings that link to themselves, and syntax highlighting in both themes
with a copy button on every block. `<Callout>`, `<Shot>`, `<Diagram>` and
`<CodeTabs>` work inside it on any page, and `<Figure>` on a post only, because
it has no conversion for the plain Markdown copy every docs page and learn
guide carries.

The blog ships with tag archives, author pages, pagination, a by-year archive,
related posts, multi-part series, share links and three feeds — RSS, Atom and
JSON Feed. The docs ship with search, breadcrumbs, edit links, previous/next
and a contents list that tracks your position.

The `write-content` skill in `.claude/skills/` is the procedure. A page's
pictures are `draw-and-animate`, and checking a docs page's claims against the
application is part of `sync-from-app`.

## The learn articles and the docs are announced; the blog is not

One flag per section in `src/content/sections.ts` controls the link, the
`noindex` and the sitemap together, and publishing is flipping it. The learn
articles and the docs are flipped. The blog is built, styled and reachable, and nothing links to it,
because an empty blog advertised in the header is worse than no blog.

The header and footer links are _derived_ from that flag rather than listed
beside it (`src/content/home.ts`), and that is what makes the three actually
move together. They were listed by hand once, and `announcedSections()` had a
single caller — the sitemap — so announcing a section indexed it, listed it,
and linked it from nowhere.

## Deployment

Netlify, publishing `out/`, Node 24. Its build command is `npm run verify`,
not `npm run build` — a deploy preview whose tests fail is a preview somebody
approves. GitHub Actions runs the two things Netlify's image cannot: the
accessibility audit, which needs Chromium, and the internal link check.

**`netlify.toml` must never gain a catch-all rewrite** — `AGENTS.md` says why,
and it is the one mistake here that costs money silently.

## Pages

`/` the homepage, `/pricing` the two plans and self-hosting, `/learn` guides
to everyday money jobs, `/docs` the documentation, `/privacy` and `/terms`.
`/blog` is built and announced nowhere.

Every docs page and learn guide also has a plain Markdown copy beside it at
`index.md`, and `/llms.txt` lists them, for AI assistants and coding tools.
Both are generated from the pages' own sources and kept out of search
results (`docs/standards/content.md` 5.15). Each of those pages, and the
pricing page, has its own link-preview card in `public/og/`, drawn by
`npm run build:images`, which needs running after a page is added,
retitled, renamed or removed. It never deletes a card, so a removed page's
card is deleted by hand.

## Outstanding work

**There is none in this repository.** [`docs/roadmap.md`](docs/roadmap.md)
says so and shows the working: what waits on the application being deployed,
what waits on an account or asset only the owner has, and what was decided
against with the argument.

This site shows no ads and loads no script from anybody else. The ads run in
the application, and the one thing this site owns of them is `public/ads.txt`,
which makes it responsible for revenue earned on a different domain:
[`docs/standards/operations.md`](docs/standards/operations.md) 2 says why it
stays.

## Staying in sync with the application

The application publishes `docs/product/` — its contract, a feature list
tiered by how much a general reader would care, and a screenshot of every
screen. This site consumes it:

|                                        |                                            |
| -------------------------------------- | ------------------------------------------ |
| Does the site agree with its snapshot? | `npm run verify`, every build              |
| Has the application moved?             | A weekly workflow, which opens an issue    |
| Which sections need rewriting?         | `tests/copy-provenance.test.ts` names them |
| Do the rewrite                         | The `sync-from-app` skill                  |
| Record that it is done                 | `npm run copy:accept`                      |

Only the sections whose source description changed get rewritten, which is
what keeps the voice steady between releases.

## Standards

[`docs/standards/`](docs/standards/index.md) for the design, content and
operations; [`docs/standards/code/`](docs/standards/code/index.md) for the
source. [`AGENTS.md`](AGENTS.md) holds the invariants and wins over both.

## License

MIT. The application it advertises is AGPL-3.0.
