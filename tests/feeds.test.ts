import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DOMParser } from "@xmldom/xmldom";
import { describe, expect, it } from "vitest";
import { allEntries } from "@/content/collections";
import { FEED_ITEMS, feedPosts } from "@/lib/feed";

/**
 * The three feeds, read from the built output.
 *
 * Feeds are the part of a blog nobody looks at: they are consumed by software,
 * and a malformed one fails silently in somebody else's reader rather than
 * visibly here. So these parse the real XML rather than matching strings — an
 * unescaped ampersand in a post title is the classic break and a substring
 * check sails straight past it.
 */

/** Every page the build emitted, discovered rather than listed. */
function emittedPages(dir: string): readonly string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "_next" ? [] : emittedPages(full);
    return entry === "index.html" || entry === "404.html" ? [full] : [];
  });
}

const parse = (path: string) => {
  const errors: string[] = [];
  const doc = new DOMParser({
    onError: (_level, message) => errors.push(String(message)),
  }).parseFromString(readFileSync(path, "utf8"), "text/xml");
  return { doc, errors };
};

describe("the feeds", () => {
  it("has posts to put in them", () => {
    expect(allEntries("blog").length).toBeGreaterThan(0);
  });

  it("carries the number of items the guide says it does", () => {
    /*
     * The counts below compare the feed against `feedPosts()`, so both sides
     * move together and the cap itself goes unchecked — changing it to five
     * would keep every one of them green while `content.md` 5.9 went on
     * saying twenty. `writing.md` §Measured numbers: a number in a guide is
     * either recounted by a test or marked as illustrative, and this is the
     * recount.
     */
    const rule = readFileSync("docs/standards/content.md", "utf8");
    const section = rule.slice(rule.indexOf("### 5.9"), rule.indexOf("### 5.10"));
    expect(section.length, "content.md has no section 5.9").toBeGreaterThan(100);
    expect(section.toLowerCase(), `the guide does not say ${FEED_ITEMS}`).toContain("twenty");
    expect(FEED_ITEMS).toBe(20);
  });

  it("produces well-formed RSS with an item per post", () => {
    const { doc, errors } = parse("out/blog/feed.xml");
    expect(errors).toEqual([]);
    const items = doc.getElementsByTagName("item");
    // `feedPosts()`, not every post ever written. The cap is twenty
    // (`src/lib/feed.ts`), so asserting against the full archive was a check
    // that would start failing on correct code at the twenty-first post —
    // `code/testing.md` 2.5, found before it could happen rather than after.
    expect(items.length).toBe(feedPosts().length);
    // Every item needs a link and a date, or a reader cannot order or open it.
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]!;
      expect(item.getElementsByTagName("link")[0]?.textContent).toMatch(/^https:\/\/smpl\.money\//);
      expect(item.getElementsByTagName("pubDate")[0]?.textContent).toBeTruthy();
    }
  });

  it("produces well-formed Atom with a feed-level updated", () => {
    const { doc, errors } = parse("out/blog/atom.xml");
    expect(errors).toEqual([]);
    expect(doc.getElementsByTagName("entry").length).toBe(feedPosts().length);
    // Atom requires it, and a feed whose updated never moves tells a reader
    // nothing about whether to re-read it.
    const updated = doc.documentElement?.getElementsByTagName("updated")[0]?.textContent;
    expect(updated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("produces JSON Feed 1.1", () => {
    const feed = JSON.parse(readFileSync("out/blog/feed.json", "utf8"));
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items.length).toBe(feedPosts().length);
    for (const item of feed.items) {
      expect(item.id).toBe(item.url);
      expect(item.date_published).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  it("escapes markup that would otherwise break the XML", () => {
    // Proving the escaper is reachable, not that today's titles need it.
    // A title with an ampersand is the ordinary way a feed stops parsing.
    const rss = readFileSync("out/blog/feed.xml", "utf8");
    expect(rss).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
  });

  it("is advertised on every page, not just the one this used to check", () => {
    /*
     * It checked `out/index.html` and stopped, which was the one page where
     * the root layout's `alternates` survived. Next *replaces* that field
     * rather than merging it, so all ten routes declaring their own canonical
     * were dropping feed autodiscovery — including `/blog/`, the URL a reader
     * is most likely handed, and the only page where a feed reader would
     * think to look.
     *
     * Checking one page could not see that. This checks the population, per
     * `code/testing.md` 2.1, and it is what makes `feedAlternates` load-
     * bearing rather than merely tidy.
     */
    const pages = emittedPages("out");
    expect(pages.length, "no pages found in out/").toBeGreaterThan(12);

    const missing = pages.filter((page) => {
      const html = readFileSync(page, "utf8");
      return (
        !html.includes("/blog/feed.xml") ||
        !html.includes("/blog/atom.xml") ||
        !html.includes("/blog/feed.json")
      );
    });
    expect(missing, "these pages advertise no feed").toEqual([]);
  });
});
