import { readFileSync } from "node:fs";
import { DOMParser } from "@xmldom/xmldom";
import { describe, expect, it } from "vitest";
import { allEntries } from "@/content/collections";

/**
 * The three feeds, read from the built output.
 *
 * Feeds are the part of a blog nobody looks at: they are consumed by software,
 * and a malformed one fails silently in somebody else's reader rather than
 * visibly here. So these parse the real XML rather than matching strings — an
 * unescaped ampersand in a post title is the classic break and a substring
 * check sails straight past it.
 */

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

  it("produces well-formed RSS with an item per post", () => {
    const { doc, errors } = parse("out/blog/feed.xml");
    expect(errors).toEqual([]);
    const items = doc.getElementsByTagName("item");
    expect(items.length).toBe(allEntries("blog").length);
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
    expect(doc.getElementsByTagName("entry").length).toBe(allEntries("blog").length);
    // Atom requires it, and a feed whose updated never moves tells a reader
    // nothing about whether to re-read it.
    const updated = doc.documentElement?.getElementsByTagName("updated")[0]?.textContent;
    expect(updated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("produces JSON Feed 1.1", () => {
    const feed = JSON.parse(readFileSync("out/blog/feed.json", "utf8"));
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items.length).toBe(allEntries("blog").length);
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

  it("is advertised in the page head, or nothing would find it", () => {
    const html = readFileSync("out/index.html", "utf8");
    expect(html).toContain("/blog/feed.xml");
    expect(html).toContain("/blog/atom.xml");
  });
});
