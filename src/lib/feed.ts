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

export function feedPosts(): readonly Entry[] {
  // Twenty is the conventional cap. A feed carrying every post ever written
  // grows without bound and is re-downloaded in full by every poll.
  return allEntries("blog").slice(0, 20);
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
