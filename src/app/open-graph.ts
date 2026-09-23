import type { Metadata } from "next";
import { site } from "@/content/home";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * What every page's link preview carries, whatever the page says for itself.
 *
 * **Next replaces `openGraph`, it does not merge it**, which is the same trap
 * `feedAlternates` in `src/lib/feed.ts` exists for. The root layout's block
 * held the locale, the site name and the card image, and every route that
 * declared its own title and description dropped all three: `/pricing/`, both
 * posts and every docs page shipped with no `og:locale`, and `/pricing/` with
 * no `og:image`, `og:site_name` or `og:url` either, so a link to the page
 * most likely to be shared previewed as a blank rectangle. The routes that
 * declared nothing had the opposite fault. They inherited the root's block
 * whole, and `/privacy/` and `/terms/` previewed as the homepage, with the
 * homepage's title and its address.
 *
 * So a route asks for its block rather than writing one, and fixing either
 * fault in one place fixes it on every page. `tests/copy.test.ts` holds every
 * emitted page to the locale.
 */
const SITE_WIDE = {
  type: "website",
  siteName: site.name,
  // The site sells in US dollars to a US reader and its copy is written in
  // American English. It said en_GB, which is the locale a link preview and
  // a crawler are told to expect.
  locale: "en_US",
  /*
   * The card a link to this site shows in Slack, Bluesky, LinkedIn or a
   * message. Without it they render a blank rectangle, which on a marketing
   * page is the one picture guaranteed to be seen. Built by
   * `scripts/build-images.mjs` rather than per request, because a
   * per-request renderer is a server and this site does not have one. A post
   * with a cover of its own passes `images` and replaces this.
   */
  images: [
    { url: "/og.png", width: 1200, height: 630, alt: `${site.name} — ${site.titleTagline}` },
  ],
} satisfies OpenGraph;

/**
 * A page's `openGraph`: the site-wide defaults, then the page's own fields.
 *
 * `title`, `description` and `url` are required so that each route states its
 * own preview rather than leaving it to Next. Leaving one out would not
 * describe the homepage: Next fills a missing title and description from the
 * page's own metadata, and a missing `url` only drops `og:url`. What described
 * the homepage was declaring no block at all, and a type cannot see a call
 * that was never made, so the route guard in `tests/copy.test.ts` is what
 * stops that.
 *
 * `url` is the page's canonical, the same path it hands `feedAlternates`, and
 * resolves against `metadataBase`. The 404 is served at every address that
 * does not exist, so it has none to give and says `null` on purpose.
 */
export function openGraph(
  page: OpenGraph & {
    readonly title: string;
    readonly description: string;
    readonly url: string | null;
  },
): OpenGraph {
  return { ...SITE_WIDE, ...page };
}
