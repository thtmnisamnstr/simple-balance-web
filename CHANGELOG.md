# Changelog

Written for somebody deciding whether a change matters to them, in the voice of
`docs/standards/writing.md` §The changelog. This site has no releases — every
visitor gets whatever is deployed — so this is a record for maintainers rather
than a contract with readers.

## Unreleased

### Fixed

**Five subsections of the content standard sat after the section that followed
them.** They were appended to the file and landed below `## 6`, so `5.9` to
`5.13` were orphaned. Every one read correctly on its own and the document was
wrong. `tests/guide-structure.test.ts` now refuses it, because appending is
both the natural way to add a rule and the natural way to get this wrong.

**`AGENTS.md` said there were five skills when there were six**, and did not
list the sixth.

**`npm start` fetched an unpinned `serve` through `npx`.** It is a
devDependency now.

### Added

**A pricing page.** Two plans and a third column for self-hosting, a
feature-by-feature comparison, and eight questions a plan with a limit
actually raises. Every figure is what the application enforces: three accounts
free, unlimited on Premium at $20 a year or $2 a month, and nothing else held
back from either. Self-hosting is on the page because a product that tells you
how to avoid paying it is making an honest case for paying it.

**A privacy policy and terms of use.** Written for this product rather than
from a template — the actual processors, the actual lawful bases, the actual
retention — and carrying the three disclosures Google requires of a site
serving AdSense. The privacy policy is what unblocks the AdSense application.

**Three more documentation pages** on entries, budgets and agents, taking the
docs to seven across four sections. **Generated cover images** for posts, in
the product's palette. **Tag descriptions**, **search result snippets** with
the match highlighted, and a **weight budget** on what the build ships.

**A social preview card.** A link to this site pasted anywhere used to render a
blank rectangle. `scripts/build-og-image.mjs` draws one at build time — the
alternative renders per request, which is a server, which is the thing the
static export exists to avoid.

**Continuous integration.** `npm run verify` and an internal link check on
every push and pull request, with Node taken from `.nvmrc` so CI, Netlify and a
developer using nvm cannot drift apart.

**An accessibility audit in the test suite.** axe against every page the build
emits, in both themes, in a real browser, as part of `npm run verify`. It is the only test
here that runs a browser and it earns it: contrast and computed styles cannot
be checked in jsdom, and a token change is exactly the sort of edit nobody
renders before committing.

**A roadmap and an AdSense guide.** `docs/roadmap.md` lists every outstanding
item with why it is not done and what done looks like; `docs/adsense.md` is the
full procedure, including why this site's `ads.txt` authorises revenue earned
on a different domain.

**The site, at smpl.money.** A single marketing page: what the product is, four
problems it addresses, screenshots of the running application, what
self-hosting means, and what an agent can and cannot do with the ledger. The
sign-in control reads "Coming soon" because the application is not deployed
yet, and it is a word rather than a disabled button so that nothing implies a
reader could enable it.

**Screenshots captured from a real instance.** `scripts/capture-screenshots.mjs`
seeds a ledger, drives the application with Playwright, and writes a WebP per
page per theme. Ten files, about 500 KB in total, chosen by the browser through
`<picture>` so a reader in dark mode never downloads the light ones. The page
says once, plainly, that the ledger in them is demo data.

**Three feeds.** RSS 2.0, Atom 1.0 and JSON Feed 1.1, each carrying the twenty
most recent posts as summaries rather than full bodies, and advertised in the
head of every page so a reader pointed anywhere finds them.

**Everything a post is normally expected to have.** Tag archives, author pages,
pagination, a by-year archive, previous and next, related posts ranked by
shared tags and series, multi-part series with their own navigation, share
links that are plain anchors rather than third-party widgets, and
`BlogPosting` structured data naming a real person.

**Everything a documentation page is normally expected to have.** Search across
every page — an index built at compile time, fetched on first keystroke, with
`/` to focus and Escape to clear — plus breadcrumbs, an edit-this-page link,
previous and next, a contents list that tracks the heading you are reading, and
copy buttons on every code block.

**Markdown that supports what people actually write.** Tables, footnotes, task
lists, real quotation marks, headings that link to themselves, syntax
highlighting rendered at build time in both themes from one copy of the markup,
callouts, figures with captions, and side-by-side alternatives for
instructions that differ by tool.

**A blog, built and not announced.** Markdown in `content/blog/` with the
conventional frontmatter — multiple authors with photos, tags, featured posts,
cover images, drafts, canonical URLs. Featured posts get their own block at the
top of the index.

**Documentation, built and not announced.** Markdown in `content/docs/`, with a
sidebar grouped and ordered by `content/docs/_sections.json`, previous and next
links, and a table of contents on longer pages.

Both sections are reachable by URL and linked from nowhere. One flag decides the
link, the `noindex` and the sitemap together, so neither can be half-launched.

**Markdown that supports what people actually write.** GitHub tables, footnotes
and task lists; real quotation marks and dashes; headings that link to
themselves; syntax highlighting rendered at build time in both light and dark
from one copy of the markup. Two components are available inside Markdown —
callouts and screenshots — and both are the same implementations the marketing
page uses.

**The brand contract.** `src/styles/brand.css` carries the application's
palette, the two theme blocks holding one key set, and a test that fails if a
colour appears anywhere else. A marketing page that is a slightly different
green from the product reads as a different company.

**Standards and skills.** `docs/standards/` for the design, content, operations
and source; `.claude/skills/` for the five procedures that repeat — preparing a
branch for merge, updating dependencies, bringing the guides back to true,
reviewing the design, and re-capturing screenshots.
