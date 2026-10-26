import { allEntries, type Entry } from "@/content/collections";
import { authors } from "@/content/authors";
import { site } from "@/content/home";
import { section } from "@/content/sections";

/**
 * Feed generation, shared by all three formats.
 *
 * Three rather than one because they are read by different things and cost
 * almost nothing together: RSS 2.0 is what most readers still take, Atom is
 * what the strict ones prefer, and JSON Feed is what anything written this
 * decade would rather parse. A blog that publishes only RSS is choosing for
 * its readers.
 */

export const base = `https://${site.domain}`;

/** Text that is about to sit inside an XML element or attribute. */
export function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** RFC 822, which RSS requires and `toISOString` does not produce. */
export function rfc822(day: string): string {
  return new Date(`${day}T00:00:00Z`).toUTCString();
}

export function rfc3339(day: string): string {
  return new Date(`${day}T00:00:00Z`).toISOString();
}

/**
 * The three feeds, as a page's `alternates.types`.
 *
 * **Next replaces `alternates`, it does not merge it.** Declaring a canonical
 * on a page therefore drops whatever the root layout put there, so ten routes
 * that set only a canonical were silently losing feed autodiscovery — `/blog/`
 * among them, which is the URL a reader is most likely handed. One route had
 * re-declared the three by hand, which is the shape of a patch applied to the
 * symptom.
 *
 * So a route asks for its alternates rather than writing them, and forgetting
 * is no longer possible. `tests/feeds.test.ts` holds every emitted page to it.
 *
 * Deliberately not exported: `feedAlternates` below is the whole interface,
 * and a route reaching for the raw map would be a route writing its own
 * alternates again.
 */
const FEED_TYPES = {
  "application/rss+xml": "/blog/feed.xml",
  "application/atom+xml": "/blog/atom.xml",
  "application/feed+json": "/blog/feed.json",
} as const;

/**
 * The three feeds as links a reader can follow, each named by its format.
 *
 * Read from the same map as the alternates, so the blog's front page cannot
 * link a reader to one address while advertising another to their feed
 * reader. Named by format rather than described, because a reader who knows
 * what Atom is wants the word, and one who does not wants RSS.
 */
export const FEED_LINKS = [
  { name: "RSS", href: FEED_TYPES["application/rss+xml"] },
  { name: "Atom", href: FEED_TYPES["application/atom+xml"] },
  { name: "JSON Feed", href: FEED_TYPES["application/feed+json"] },
] as const;

/**
 * Whether a page advertises the blog's feeds.
 *
 * Every page, once the blog is announced; until then, only the blog's own
 * pages. It was every page always, which put three links to an unannounced
 * section in the head of the homepage, the pricing page and every guide:
 * the half-launch `src/content/sections.ts` exists to prevent, arriving
 * through `<link rel="alternate">` instead of a nav link. The flag decides
 * this the way it decides the link, the `noindex` and the sitemap.
 */
function advertisesFeeds(canonical: string | null): boolean {
  return section("blog").announced || (canonical?.startsWith("/blog/") ?? false);
}

/**
 * A page's `alternates`: its own canonical, the feeds when it advertises them,
 * and its Markdown copy when it has one.
 *
 * `null` is the 404's, which is served at every address that does not exist
 * and so has no canonical to give. Declaring its alternates at all is what
 * keeps it from inheriting the root's, which pointed every mistyped link at
 * the homepage.
 *
 * `markdown` is the address of the page's plain-Markdown copy, for the docs
 * and the learn guides (`src/lib/markdown.ts`), advertised as
 * `rel="alternate" type="text/markdown"` so a crawler that reads Markdown
 * finds it from the page. `content.md` 5.15.
 */
export function feedAlternates(canonical: string | null, markdown?: string) {
  const types = {
    ...(advertisesFeeds(canonical) ? FEED_TYPES : {}),
    ...(markdown ? { "text/markdown": markdown } : {}),
  };
  return canonical === null ? ({ types } as const) : ({ canonical, types } as const);
}

/**
 * How many items a feed carries.
 *
 * Twenty is the conventional cap: a feed carrying every post ever written
 * grows without bound and is re-downloaded in full by every poll.
 *
 * Named rather than inlined because `content.md` 5.9 states the number in
 * prose, and `writing.md` §Measured numbers says a number in a guide is
 * either recounted by a test or marked as illustrative. This is the thing the
 * test recounts.
 */
export const FEED_ITEMS = 20;

export function feedPosts(): readonly Entry[] {
  return allEntries("blog").slice(0, FEED_ITEMS);
}

export function postUrl(entry: Entry): string {
  return `${base}/blog/${entry.slug}/`;
}

export function authorNames(entry: Entry): string {
  return (entry.frontmatter.authors ?? []).map((key) => authors[key].name).join(", ");
}

/**
 * The most recent date anything in the feed changed, for the feed's own
 * timestamp. A feed whose `updated` never moves tells a reader nothing about
 * whether to re-read it.
 */
export function feedUpdated(posts: readonly Entry[]): string {
  const days = posts
    .map((post) => post.frontmatter.updated ?? post.frontmatter.date ?? "")
    .filter(Boolean)
    .toSorted();
  return rfc3339(days.at(-1) ?? new Date().toISOString().slice(0, 10));
}
