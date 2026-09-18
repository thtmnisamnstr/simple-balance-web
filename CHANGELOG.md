# Changelog

Written for somebody deciding whether a change matters to them, in the voice of
`docs/standards/writing.md` §The changelog. This site has no releases — every
visitor gets whatever is deployed — so this is a record for maintainers rather
than a contract with readers.

## Unreleased

### Added

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
