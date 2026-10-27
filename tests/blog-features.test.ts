import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { COVER_HEIGHT, COVER_WIDTH, darkVariant } from "@/components/cover";
import {
  allEntries,
  blogFront,
  blogNeighbors,
  blogSeries,
  blogTags,
  paginate,
  POSTS_PER_PAGE,
  postsByAuthor,
  postsByTag,
  postsByYear,
  relatedPosts,
  seriesOf,
  tagLabel,
  tagSlug,
  type Entry,
} from "@/content/collections";

/** The relational parts of the blog: tags, series, neighbors, related, paging. */

const posts = allEntries("blog");

describe("tags", () => {
  it("found tagged posts to check", () => {
    expect(posts.some((p) => (p.frontmatter.tags ?? []).length > 0)).toBe(true);
  });

  it("matches a tag however it was capitalized", () => {
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

describe("neighbors", () => {
  it("points previous at the earlier post", () => {
    // `allEntries` is newest first, so this is the index that trips people up.
    for (const [index, post] of posts.entries()) {
      const { previous, next } = blogNeighbors(post.slug);
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

  /*
   * `web.md` 5.3: the box is reserved before the file arrives. Held against
   * the files rather than against a number written here a second time, so a
   * cover redrawn at another size fails until the component says so too.
   */
  it("declares every cover's real size", async () => {
    const files = posts
      .filter((post) => post.frontmatter.image)
      .flatMap((post) => {
        const light = String(post.frontmatter.image);
        return [light, darkVariant(light)];
      });
    expect(files.length, "no cover to check").toBeGreaterThan(0);
    const sizes = await Promise.all(
      files.map(async (src) => {
        const { width, height } = await sharp(`public${src}`).metadata();
        return { src, width, height };
      }),
    );
    for (const size of sizes) {
      expect(size).toEqual({ src: size.src, width: COVER_WIDTH, height: COVER_HEIGHT });
    }

    const html = readFileSync("out/blog/what-a-refund-actually-is/index.html", "utf8");
    const img = /<img[^>]*class="entry-cover"[^>]*>/.exec(html)?.[0] ?? "";
    expect(img).toContain(`width="${COVER_WIDTH}"`);
    expect(img).toContain(`height="${COVER_HEIGHT}"`);
  });

  it("offers the dark file to a browser that asks for it", () => {
    // The built page, not the component: what matters is that a `<source>`
    // carrying the dark file reaches the reader.
    const html = readFileSync("out/blog/what-a-refund-actually-is/index.html", "utf8");
    expect(html).toContain("prefers-color-scheme: dark");
    expect(html).toContain("what-a-refund-actually-is-dark.webp");
  });
});

/** A post that exists only in a test, for the choices two real posts cannot reach. */
function fixture(slug: string, date: string, extra: Partial<Entry["frontmatter"]> = {}): Entry {
  return {
    slug,
    collection: "blog",
    frontmatter: { title: slug, description: slug, date, ...extra },
    body: "",
    readingMinutes: 1,
  };
}

/** Fifteen posts, newest first, with the featured one at `featuredAt`. */
function many(featuredAt: number): readonly Entry[] {
  return Array.from({ length: 15 }, (_, index) =>
    fixture(
      `p${index}`,
      `2026-01-${String(28 - index).padStart(2, "0")}`,
      index === featuredAt ? { featured: true } : {},
    ),
  );
}

/** A page as the build wrote it, parsed. */
function built(path: string): Document {
  return new DOMParser().parseFromString(readFileSync(`out${path}index.html`, "utf8"), "text/html");
}

function mainOf(path: string): string {
  return built(path).querySelector("main")?.innerHTML ?? "";
}

/**
 * The front page: one post leading, the rest of page one in the grid.
 *
 * The lead is the one choice on the page a reader cannot see being made, so
 * it is held here against posts that do not exist: two real posts cannot
 * show an old featured post being pulled forward, or two featured posts
 * sharing the top.
 */
describe("the front page", () => {
  it("leads with the newest featured post, or the newest when none is", () => {
    const newest = fixture("c", "2026-03-01");
    const featured = fixture("b", "2026-02-01", { featured: true });
    const oldest = fixture("a", "2026-01-01");
    expect(blogFront([newest, featured, oldest]).lead?.slug).toBe("b");
    expect(blogFront([newest, oldest]).lead?.slug).toBe("c");

    // A second featured post opens the grid rather than waiting its turn.
    const alsoFeatured = fixture("a", "2026-01-01", { featured: true });
    const both = blogFront([newest, featured, alsoFeatured]);
    expect(both.lead?.slug).toBe("b");
    expect(both.rest[0]?.slug).toBe("a");
  });

  it("shows page one's posts once each, and pulls an older featured one onto it", () => {
    // On page one: it leads, and the grid does not show it a second time.
    const onPage = blogFront(many(3));
    const shownOnPage = [onPage.lead, ...onPage.rest].map((post) => post?.slug);
    expect(onPage.lead?.slug).toBe("p3");
    expect(new Set(shownOnPage).size, "a post shown twice").toBe(shownOnPage.length);
    expect(shownOnPage.toSorted()).toEqual(
      many(3)
        .slice(0, POSTS_PER_PAGE)
        .map((post) => post.slug)
        .toSorted(),
    );

    // On page two: pulled forward, so page one shows eleven.
    const pulled = blogFront(many(12));
    const shownPulled = [pulled.lead, ...pulled.rest].map((post) => post?.slug);
    expect(pulled.lead?.slug).toBe("p12");
    expect(shownPulled.toSorted()).toEqual(
      [...many(12).slice(0, POSTS_PER_PAGE), many(12)[12]!].map((post) => post.slug).toSorted(),
    );
    expect(pulled.pages).toBe(2);
  });

  it("shows every real post on page one, and none twice", () => {
    const { lead, rest } = blogFront();
    const shown = [lead, ...rest].map((post) => post?.slug);
    expect(shown.length).toBeGreaterThan(1);
    expect(new Set(shown).size).toBe(shown.length);
    for (const post of paginate(posts, 1).items) expect(shown).toContain(post.slug);
  });

  it("is the same page at /blog/page/1/, which names /blog/ as its canonical", () => {
    // Two addresses holding one page is what the canonical says, so the two
    // hold the same page. A plainer list at the second was a second design
    // of one page that only a reader who typed the address ever saw.
    expect(mainOf("/blog/")).toContain("blog-lead");
    expect(mainOf("/blog/page/1/")).toBe(mainOf("/blog/"));
  });

  it("links the feeds every page advertises, each one a file the build wrote", () => {
    const page = built("/blog/");
    const linked = [...page.querySelectorAll(".blog-feed")].map((a) => a.getAttribute("href")!);
    const advertised = [...page.querySelectorAll('link[rel="alternate"][type]')].map(
      (link) => new URL(link.getAttribute("href")!, "https://smpl.money").pathname,
    );
    expect(linked.length).toBe(3);
    expect(linked.toSorted()).toEqual(advertised.toSorted());
    for (const href of linked) expect(existsSync(`out${href}`), href).toBe(true);
  });

  it("offers every topic, with its count, at a page the build wrote", () => {
    const links = [...built("/blog/").querySelectorAll(".blog-browse-link")];
    const tags = blogTags();
    expect(tags.length).toBeGreaterThan(0);
    for (const { tag, count } of tags) {
      const href = `/blog/tags/${tagSlug(tag)}/`;
      const link = links.find((a) => a.getAttribute("href") === href);
      expect(link, `no chip for ${tag}`).toBeTruthy();
      expect(link?.querySelector(".blog-browse-count")?.textContent).toBe(String(count));
      expect(existsSync(`out${href}index.html`), href).toBe(true);
    }
    expect(links.map((a) => a.getAttribute("href"))).toContain("/blog/archive/");
  });
});

describe("the series list", () => {
  it("lists a series once it has two parts, each in reading order", () => {
    // Newest first, as every caller passes them, so part two comes first.
    const second = fixture("a2", "2026-01-12", { series: "A", seriesOrder: 2 });
    const single = fixture("b1", "2026-01-08", { series: "B" });
    const first = fixture("a1", "2026-01-05", { series: "A", seriesOrder: 1 });
    const listed = blogSeries([second, single, first]);
    expect(listed.map((series) => series.name)).toEqual(["A"]);
    expect(listed[0]?.parts.map((part) => part.slug)).toEqual(["a1", "a2"]);
  });

  it("agrees with the series box on each post", () => {
    const listed = blogSeries();
    expect(listed.length, "no series to check").toBeGreaterThan(0);
    for (const { parts } of listed) expect(parts).toEqual(seriesOf(parts[0]!));
  });
});

/** Every page under `/blog/` the build wrote. */
function blogPages(dir = "out/blog"): readonly string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return blogPages(full);
    return name === "index.html" ? [full] : [];
  });
}

describe("every blog page, as built", () => {
  const pages = blogPages();

  it("found the pages to check", () => {
    // The index, both posts, the archive, two topics, an author, page one.
    expect(pages.length).toBeGreaterThan(7);
  });

  it("never skips a heading level", () => {
    /*
     * `web.md` 7.1. A card is an `h3` under a section's `h2`, and on a topic
     * or an author page there is no section: the cards sat straight under the
     * `h1` as `h3`s, which is a level a screen reader's outline jumps.
     */
    const skips = pages.flatMap((path) => {
      const html = readFileSync(path, "utf8");
      const levels = [
        ...new DOMParser()
          .parseFromString(html, "text/html")
          .querySelectorAll("main :is(h1, h2, h3, h4, h5, h6)"),
      ].map((heading) => Number(heading.tagName[1]));
      return levels.flatMap((level, index) =>
        level > (levels[index - 1] ?? 0) + 1 ? [`${path}: h${levels[index - 1]} to h${level}`] : [],
      );
    });
    expect(skips).toEqual([]);
  });

  it("shows no straight quote anywhere a reader can see", () => {
    /*
     * `web.md` 3.3, held to the learn pages by `tests/typeset.test.ts` and to
     * these by this. A post's summary on a card said "isn't" under a post
     * whose own text said "isn’t". Code is left out, where a straight quote
     * is what the reader has to type.
     */
    const straight = pages.flatMap((path) => {
      const html = readFileSync(path, "utf8");
      const text = html
        .slice(html.indexOf("<body"))
        .replace(/<(script|style|code|pre)\b[^]*?<\/\1>/g, "")
        .replace(/<[^>]+>/g, " ");
      return [...text.matchAll(/.{0,30}(?:'|"|&#x27;|&#39;|&quot;).{0,30}/g)].map(
        (match) => `${path}: ${match[0].trim()}`,
      );
    });
    expect(straight).toEqual([]);
  });
});

/** Where every block opening with exactly `prelude` starts and ends. */
function blocks(css: string, prelude: string): readonly { from: number; to: number }[] {
  const found: { from: number; to: number }[] = [];
  for (let at = css.indexOf(`${prelude} {`); at !== -1; at = css.indexOf(`${prelude} {`, at + 1)) {
    let depth = 0;
    for (let i = css.indexOf("{", at); i < css.length; i += 1) {
      if (css[i] === "{") depth += 1;
      if (css[i] === "}" && --depth === 0) {
        found.push({ from: at, to: i });
        break;
      }
    }
  }
  return found;
}

function inside(at: number, within: readonly { from: number; to: number }[]): boolean {
  return within.some(({ from, to }) => at > from && at < to);
}

describe("a post card's lift", () => {
  it("waits for the pointer to rest, and only where motion is welcome", () => {
    /*
     * `web.md` 8.2. Chrome moves `:hover` when the page scrolls under a
     * pointer that has not moved, so a lift on plain `:hover` lifted and
     * dropped every card a reader scrolled past. The lift waits on `--play`,
     * which turns on a quarter second into a hover, and the whole of it sits
     * inside the reduced-motion preference.
     */
    const css = readFileSync("src/styles/site.css", "utf8");
    const resting = blocks(css, "@container style(--play: 1)");
    const welcome = blocks(css, "@media (prefers-reduced-motion: no-preference)");

    const lifts = [...css.matchAll(/([^{}]*\.post-card[^{}]*)\{[^{}]*\btranslate:[^{}]*\}/g)];
    expect(lifts.length, "no rule lifts a post card").toBeGreaterThan(0);
    const early = lifts
      .filter((rule) => !inside(rule.index, resting) || !inside(rule.index, welcome))
      .map((rule) => rule[1]!.trim());
    expect(early).toEqual([]);
  });
});
