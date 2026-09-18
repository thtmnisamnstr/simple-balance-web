import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { darkVariant } from "@/components/cover";
import {
  allEntries,
  blogNeighbours,
  paginate,
  postsByAuthor,
  postsByTag,
  postsByYear,
  relatedPosts,
  seriesOf,
  tagLabel,
  tagSlug,
} from "@/content/collections";

/** The relational parts of the blog: tags, series, neighbours, related, paging. */

const posts = allEntries("blog");

describe("tags", () => {
  it("found tagged posts to check", () => {
    expect(posts.some((p) => (p.frontmatter.tags ?? []).length > 0)).toBe(true);
  });

  it("matches a tag however it was capitalised", () => {
    // Two posts writing "Bookkeeping" and "bookkeeping" must be one tag, or
    // the archive splits in half and neither page has everything.
    expect(tagSlug("Bookkeeping")).toBe(tagSlug("bookkeeping"));
    expect(postsByTag("Bookkeeping").length).toBe(postsByTag("bookkeeping").length);
  });

  it("keeps a display spelling for every tag slug", () => {
    for (const post of posts) {
      for (const tag of post.frontmatter.tags ?? []) {
        expect(tagLabel(tagSlug(tag))).toBeTruthy();
      }
    }
  });
});

describe("authors", () => {
  it("lists a post under each of its authors", () => {
    for (const post of posts) {
      for (const key of post.frontmatter.authors ?? []) {
        expect(postsByAuthor(key).map((p) => p.slug)).toContain(post.slug);
      }
    }
  });
});

describe("series", () => {
  it("orders parts by seriesOrder, not by date", () => {
    const withSeries = posts.find((p) => p.frontmatter.series);
    expect(withSeries, "a post in a series exists to check").toBeTruthy();

    const parts = seriesOf(withSeries!);
    expect(parts.length).toBeGreaterThan(1);
    const orders = parts.map((p) => p.frontmatter.seriesOrder ?? 0);
    expect(orders).toEqual(orders.toSorted((a, b) => a - b));

    // And that this is a real test: reading order is the opposite of the
    // index's, so if it were sorting by date it would come out reversed.
    const dates = parts.map((p) => p.frontmatter.date ?? "");
    expect(dates).not.toEqual(dates.toSorted().toReversed());
  });

  it("returns nothing for a post that is not in one", () => {
    const standalone = posts.find((p) => !p.frontmatter.series);
    if (standalone) expect(seriesOf(standalone)).toEqual([]);
  });
});

describe("neighbours", () => {
  it("points previous at the earlier post", () => {
    // `allEntries` is newest first, so this is the index that trips people up.
    for (const [index, post] of posts.entries()) {
      const { previous, next } = blogNeighbours(post.slug);
      expect(previous?.slug).toBe(posts[index + 1]?.slug);
      expect(next?.slug).toBe(posts[index - 1]?.slug);
    }
  });
});

describe("related posts", () => {
  it("never includes the post itself", () => {
    for (const post of posts) {
      expect(relatedPosts(post).map((p) => p.slug)).not.toContain(post.slug);
    }
  });

  it("ranks a shared series above a shared tag", () => {
    const post = posts.find((p) => p.frontmatter.series);
    if (!post) return;
    const related = relatedPosts(post);
    if (related.length > 1) {
      expect(related[0]?.frontmatter.series).toBe(post.frontmatter.series);
    }
  });
});

describe("pagination", () => {
  it("never reports zero pages, even with nothing to page", () => {
    // "Page 1 of 0" is worse than an empty page 1.
    expect(paginate([], 1).pages).toBe(1);
    expect(paginate([], 5).page).toBe(1);
  });

  it("clamps a page number outside the range", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    expect(paginate(items, 99, 10).page).toBe(3);
    expect(paginate(items, -4, 10).page).toBe(1);
  });

  it("covers every item exactly once across its pages", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const seen = [1, 2, 3].flatMap((page) => paginate(items, page, 10).items);
    expect(seen.toSorted((a, b) => a - b)).toEqual(items);
  });

  it("points page one's canonical at the collection root", () => {
    // Two URLs hold page one because `output: "export"` refuses a dynamic
    // route with no params. The canonical is what stops them competing.
    const html = readFileSync("out/blog/page/1/index.html", "utf8");
    expect(html).toContain('rel="canonical" href="https://smpl.money/blog/"');
  });
});

describe("the archive", () => {
  it("groups every post under its own year", () => {
    const grouped = postsByYear().flatMap((g) => g.posts.map((p) => p.slug));
    expect(grouped.toSorted()).toEqual(posts.map((p) => p.slug).toSorted());
    for (const group of postsByYear()) {
      for (const post of group.posts) {
        expect(post.frontmatter.date?.slice(0, 4)).toBe(group.year);
      }
    }
  });
});

/**
 * The cover a post opens with, in both themes.
 *
 * A post used to open with one cover, drawn in the light palette, so reading
 * it in dark mode began with a bright white card across the top of a dark
 * page — the defect `docs/standards/web.md` 5.2 describes for screenshots,
 * on the one image this site draws for itself rather than photographs.
 *
 * The dark file's name is a convention rather than a stored value, which is
 * the part that can rot quietly: nothing fails if `build-images.mjs` stops
 * writing the pair, because `<source>` simply does not match and the light
 * file is served. That is a silent return to the original bug, so it is what
 * these check.
 */
describe("post covers", () => {
  it("derives the dark file's name from the light one", () => {
    expect(darkVariant("/covers/a-post.webp")).toBe("/covers/a-post-dark.webp");
    // Degrades to the input rather than to a 404 when there is no extension.
    expect(darkVariant("/covers/a-post")).toBe("/covers/a-post");
  });

  it("ships both themes for every post that has a cover", () => {
    const covered = posts.filter((post) => post.frontmatter.image);
    expect(covered.length, "no post has a cover to check").toBeGreaterThan(0);

    const missing = covered
      .flatMap((post) => {
        const light = String(post.frontmatter.image);
        return [light, darkVariant(light)];
      })
      .filter((src) => !existsSync(`public${src}`));

    expect(missing, "run `npm run build:images`").toEqual([]);
  });

  it("offers the dark file to a browser that asks for it", () => {
    // The built page, not the component: what matters is that a `<source>`
    // carrying the dark file reaches the reader.
    const html = readFileSync("out/blog/what-a-refund-actually-is/index.html", "utf8");
    expect(html).toContain("prefers-color-scheme: dark");
    expect(html).toContain("what-a-refund-actually-is-dark.webp");
  });
});
