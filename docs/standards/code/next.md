# Next.js, where it surprises

The places where Next does something other than what its options seem to
say. Each one below shipped here as a defect, and each looked like a bug in
this site's code until somebody read how Next resolves the setting. What the
static export gives up, and how a file beside a page is built, is
`operations.md` 1, not this guide.

## 1. Metadata

### 1.1 Metadata replaces per key, so a route asks a helper for each block

**Binding, by the platform.** Next merges a route's metadata into its
layout's one level deep. A key the route declares replaces the layout's whole
value for that key, with nothing of the parent's left inside it:
`alternates`, `openGraph`, `robots` and `twitter` each arrive whole from the
deepest segment that names them. So a route asks a helper for each block
rather than writing one:

- `openGraph()` (`src/app/open-graph.ts:77`), which lays the page's own
  title, description and address over the site-wide locale, name and card;
- `feedAlternates(canonical, markdown)` (`src/lib/feed.ts:102`), which
  carries the canonical, the feeds while the page advertises them, and the
  page's Markdown copy;
- `sectionRobots(key)` (`src/lib/indexing.ts:18`), which asks for large
  image previews when the section is announced and `noindex` until then.

**It bit four times, once in each of those keys.**

- `alternates`: only six of twenty-three pages advertised the feeds, because
  every route that declared its own canonical dropped the three links the
  root layout set, `/blog/` among them.
- `openGraph`: the ten pages that wrote their own block lost the locale, the
  site name and the card, so a link to the pricing page previewed as a blank
  rectangle. The pages that wrote none inherited the homepage's whole, and the
  privacy policy previewed with the homepage's title and address.
- `robots`: large image previews, set once in the root layout, reached four
  pages of forty-five, because every announced section's route wrote
  `robots: undefined` to mean "no `noindex`".
- `twitter`: the root declared the homepage's title, description and image
  for the X card. Next fills a page's X card from that page's own
  `openGraph`, but only where the root is silent, so every page previewed on
  X as the homepage. The root declares only the card size now
  (`src/app/layout.tsx:67`).

**Omitting a key and writing it as `undefined` are different.** Omitted, the
route inherits the parent's value. Written as `undefined`, it replaces the
parent's value with nothing, which is the robots defect above. The pricing
page omits `robots` and gets the root's preview directive; a section's route
asks `sectionRobots` and never writes the key empty. It is the same
distinction `exactOptionalPropertyTypes` makes in the types (`code/index.md`
1.1), arriving at run time where no compiler sees it.

**The obvious alternative** is to spread the parent's value into each route
by hand, through `generateMetadata`'s parent argument or an exported object.
It works for the keys somebody remembered to spread, and misses the next one
the root adds. A helper is called, so a change to it lands on every route at
once, and a route that skips it is visible to a test.

_Checked by:_ `tests/copy.test.ts:582` for a route that writes its
`openGraph` by hand or writes none, and the locale on every built page;
`tests/sitemap.test.ts:155` for the preview directive on every listed page;
`tests/feeds.test.ts:117` for the feeds; `tests/markdown.test.ts:55` for the
Markdown alternate. The X card has no check, and it's `human`: look at the
`twitter:` meta tags of a page that isn't the homepage after touching the
root layout.

### 1.2 A new route asks for six things

**Guidance.** `metadataBase` in the root layout (`src/app/layout.tsx:15`)
makes every metadata URL absolute: a route writes `/pricing/` as its canonical
and `og:url`, and the page says `https://smpl.money/pricing/`. It resolves
nothing else. The JSON-LD and the Markdown copies are written into a page's
body and a copy's text, where Next doesn't look, so each builds its own
absolute URLs from the site's domain (`src/components/structured-data.tsx:6`,
`src/lib/markdown.ts:5`). A path written there ships as a path.

A new top-level route asks for six things, and each has been missing from at
least one route until a test caught it:

1. **A bare title and a description of 70 to 160 characters.** The layout's
   template adds " — Simple Balance", so the route's title is the page's name
   alone, and about 53 characters are left of the 70 a result shows
   (`content.md` 5.16).
2. **`openGraph()` with the canonical URL**, and the page's own title and
   description.
3. **`pageCard()` for its image**, an entry in `cardPages`
   (`scripts/build-images.mjs:384`) and in the card test's list of pages
   (`tests/export-shape.test.ts:327`), then `npm run build:images`. A learn
   guide or a docs page gets both entries from its Markdown and needs only
   the run.
4. **`feedAlternates(canonical)`**, and under a section, `sectionRobots(key)`.
   A page outside every section omits `robots` and inherits the root's, by
   1.1.
5. **A line in `src/app/sitemap.ts:41`**, dated from the page's own copy
   module the way `homeUpdated` and `pricingUpdated` are, never from the
   build.
6. **`Breadcrumbs`**, which writes its own `BreadcrumbList`
   (`src/components/breadcrumbs.tsx:15`), so the trail a reader sees and the
   one a search engine reads can't part.

The pricing route (`src/app/pricing/page.tsx:33`) has all six and is the one
to copy.

**The obvious alternative** is to copy the nearest route's metadata and edit
it, which carries over whatever that route was missing and adds nothing a
newer route needs.

_Checked by:_ `tests/sitemap.test.ts` for the lengths, the site's name in a
title twice, the dates, the preview directive and a built page missing from
the sitemap;
`tests/copy.test.ts` for `openGraph()`; `tests/export-shape.test.ts` for the
card, once the route is in its list; `tests/feeds.test.ts` for the feeds.
That a new route arrived with all six at once is `human`.
