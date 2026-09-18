import { allEntries, type Entry } from "@/content/collections";
import { authors } from "@/content/authors";
import { site } from "@/content/home";

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
 */
export const FEED_TYPES = {
  "application/rss+xml": "/blog/feed.xml",
  "application/atom+xml": "/blog/atom.xml",
  "application/feed+json": "/blog/feed.json",
} as const;

/** A page's `alternates`: its own canonical, and the feeds every page advertises. */
export function feedAlternates(canonical: string) {
  return { canonical, types: FEED_TYPES } as const;
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
