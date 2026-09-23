# smpl.money

The marketing site for [Simple Balance](https://github.com/thtmnisamnstr/simple-balance),
a self-hosted double-entry ledger. One homepage today, with a blog and a
documentation section built and not yet announced.

## Running it

```sh
npm install
npm run dev          # http://localhost:3000
```

```sh
npm run verify       # typecheck → lint → format:check → build → test
npm run build        # static export into out/
npx serve out        # serve the export exactly as Netlify will
```

## What this is

A Next.js App Router project with `output: "export"`, so the build is plain
HTML, CSS and JS with no server. That is deliberate: the artifact runs on
Netlify today and would run unchanged on any other static host.

```
src/app/            routes — /, /pricing, /privacy, /terms, /blog/*, /docs/*
src/components/     the components, all server components
src/content/        the homepage copy, the authors, the section flags
src/styles/         brand.css (shared with the app) and site.css
content/blog/       posts, as Markdown with frontmatter
content/docs/       documentation pages
docs/standards/     the design, content and code standards
.claude/skills/     eight procedures that repeat
scripts/            images, copy acceptance, the app-sync check, the link check
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

A documentation page is the same, with `section` and `order` instead of `date`.
Sidebar group order lives in `content/docs/_sections.json`.

`title` and `description` are required everywhere and `date` is required for a
post; a missing one fails the build rather than publishing a page with an empty
title. Authors are keys into `src/content/authors.ts`, so a typo is a build
error rather than a byline with no name.

Markdown supports GitHub tables, footnotes and task lists, real quotation
marks, headings that link to themselves, and syntax highlighting in both themes
with a copy button on every block. Four components are available inside it:
`<Callout>`, `<Shot>`, `<Figure>` and `<CodeTabs>`.

The blog ships with tag archives, author pages, pagination, a by-year archive,
related posts, multi-part series, share links and three feeds — RSS, Atom and
JSON Feed. The docs ship with search, breadcrumbs, edit links, previous/next
and a contents list that tracks your position.

The `write-content` skill in `.claude/skills/` is the procedure.

## Blog and docs are not announced

Both sections are built, styled and reachable, and nothing links to them. One
flag in `src/content/sections.ts` controls the link, the `noindex` and the
sitemap together. Publishing is flipping it.

## Deployment

Netlify, publishing `out/`, Node 24. Its build command is `npm run verify`,
not `npm run build` — a deploy preview whose tests fail is a preview somebody
approves. GitHub Actions runs the two things Netlify's image cannot: the
accessibility audit, which needs Chromium, and the internal link check.

**`netlify.toml` must never gain a catch-all rewrite** — `AGENTS.md` says why,
and it is the one mistake here that costs money silently.

## Pages

`/` the homepage, `/pricing` the two plans and self-hosting, `/privacy` and
`/terms`. `/blog` and `/docs` are built and announced nowhere.

## Outstanding work

**There is none in this repository.** [`docs/roadmap.md`](docs/roadmap.md)
says so and shows the working: what waits on the application being deployed,
what waits on an account or asset only the owner has, and what was decided
against with the argument.

[`docs/adsense.md`](docs/adsense.md) is the AdSense procedure, including the
`ads.txt` rule that makes this site responsible for revenue earned on a
different domain.

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
