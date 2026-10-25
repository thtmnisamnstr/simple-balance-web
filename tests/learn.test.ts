import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allEntries, tableOfContents } from "@/content/collections";
import { authors } from "@/content/authors";
import { site } from "@/content/home";
import { sourceFiles } from "./support/source";

/**
 * The learn articles, held to the job each one was written to do.
 *
 * `docs/standards/content.md` 5.14 is the contract: every article says why the
 * topic matters, how to do it with any tool, and how to do it in Simple
 * Balance, in that order. The third part is the reason the section exists on
 * this site rather than somebody else's, and the first two are the reason a
 * reader who never signs up still got something for their time. An article
 * missing either half is an advertisement or a detour, and the headings are
 * where that shows.
 */

const articles = allEntries("learn");

/** The `##` headings of an article, in order. */
function sections(body: string): readonly string[] {
  return tableOfContents(body)
    .filter((heading) => heading.depth === 2)
    .map((heading) => heading.text);
}

/**
 * Whether the headings make the three-part argument: a "why", then a "how",
 * and last of all the part about this product.
 *
 * A function rather than inline so the fixtures below can test it directly,
 * which is how the pattern is known to fail on the articles it is for rather
 * than only to pass on the ones that exist.
 */
function makesTheArgument(headings: readonly string[]): boolean {
  const why = headings.findIndex((h) => /^Why\b/.test(h));
  const how = headings.findIndex((h, i) => i > why && /^How\b/.test(h));
  const last = headings.at(-1) ?? "";
  return why !== -1 && how !== -1 && /\bin Simple Balance$/.test(last) && how < headings.length - 1;
}

describe("the learn articles", () => {
  it("found articles to check", () => {
    // Every assertion below passes vacuously on an empty collection.
    expect(articles.length).toBeGreaterThan(5);
  });

  it("each say why, then how, then how in Simple Balance", () => {
    const offenders = articles
      .filter((article) => !makesTheArgument(sections(article.body)))
      .map((article) => `${article.slug}: ${sections(article.body).join(" / ")}`);
    expect(offenders).toEqual([]);
  });

  it("knows the argument when it sees it, and only then", () => {
    expect(
      makesTheArgument(["Why it matters", "How to do it", "How to do it in Simple Balance"]),
    ).toBe(true);
    expect(
      makesTheArgument([
        "What it is",
        "Why it matters",
        "How much",
        "How to do it",
        "How to do it in Simple Balance",
      ]),
    ).toBe(true);
    // An advertisement: no reason, and nothing a reader can do elsewhere.
    expect(makesTheArgument(["How to do it in Simple Balance"])).toBe(false);
    // A detour: useful, and never says what the product does about it.
    expect(makesTheArgument(["Why it matters", "How to do it"])).toBe(false);
    // The product first and the method after, which reads as a pitch.
    expect(
      makesTheArgument(["Why it matters", "How to do it in Simple Balance", "How to do it"]),
    ).toBe(false);
  });

  it("carries a byline and a date", () => {
    // The loader refuses either missing, so this holds the loader to it.
    for (const article of articles) {
      expect(article.frontmatter.date, article.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.frontmatter.authors?.length, article.slug).toBeGreaterThan(0);
    }
  });

  it("links only to articles and docs pages that exist", () => {
    /*
     * The articles link to each other and into the docs by address, written
     * by hand, and the one way that goes wrong is an article renamed or never
     * written. `scripts/check-links.mjs` would find it in the build, and
     * nothing runs it on every build; this does, for the two collections
     * these pages link into.
     */
    const exists = {
      learn: new Set(articles.map((a) => a.slug)),
      docs: new Set(allEntries("docs").map((a) => a.slug)),
    };
    const broken: string[] = [];
    for (const article of articles) {
      for (const [, section, slug] of article.body.matchAll(/\]\(\/(learn|docs)\/([^/#)]*)/g)) {
        const known = exists[section as "learn" | "docs"];
        if (slug && !known.has(slug)) broken.push(`${article.slug} -> /${section}/${slug}/`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("a screenshot inside an article or a doc", () => {
  /*
   * `<Shot>` reads two files by name, and a name that is not in
   * `public/screenshots/` renders a broken image with nothing to fail: the
   * build does not read image paths and the link checker reads only hrefs.
   * And a picture of invented balances has to say they are invented
   * (`docs/standards/web.md` 5.5), which the homepage does once beside its
   * shots and a Markdown page has to do beside its own.
   */
  const pages = sourceFiles("content", /\.md$/)
    .map((file) => ({ ...file, shots: [...file.code.matchAll(/<Shot\s[^>]*?name="([^"]+)"/g)] }))
    .filter((file) => file.shots.length > 0);

  it("is found where it is used", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it("names a screenshot that exists in both themes", () => {
    const missing = pages.flatMap((page) =>
      page.shots.flatMap(([, name]) =>
        ["light", "dark"]
          .map((theme) => `public/screenshots/${name}-${theme}.webp`)
          .filter((file) => !existsSync(file))
          .map((file) => `${page.path}: ${file}`),
      ),
    );
    expect(missing).toEqual([]);
  });

  it("gives its size as text, which is the spelling the renderer keeps", () => {
    /*
     * `width={1600}` is an expression, and `MDXRemote` strips every
     * expression before anything renders, so the picture shipped with no
     * width and no height and the page jumped as it loaded (`web.md` 5.3).
     * `write-content` showed exactly that spelling as its example until it
     * was built and looked at.
     */
    const dropped = pages.filter((page) => /<Shot\s[^>]*?(width|height)=\{/.test(page.code));
    expect(dropped.map((page) => page.path)).toEqual([]);
  });

  it("says the money in it is made up, right after it", () => {
    const silent = pages.flatMap((page) =>
      page.code
        .split(/<Shot\s/)
        .slice(1)
        .filter((after) => !/^[^]*?\/>\s*\n\s*_The money in this picture is made up\./.test(after))
        .map(() => page.path),
    );
    expect(silent).toEqual([]);
  });
});

describe("a learn article, as built", () => {
  const html = readFileSync("out/learn/make-a-budget/index.html", "utf8");

  it("is an Article by a person whose name is in the byline", () => {
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain(`"name":"${authors.gavin.name}"`);
    expect(html).toContain('class="byline-name"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it("ends with somewhere to try it", () => {
    expect(html).toContain('class="learn-cta"');
    expect(html).toContain(`href="${site.appUrl}"`);
    expect(html).toContain('href="/pricing/"');
  });

  it("links the articles either side of it", () => {
    expect(html).toContain('aria-label="More guides"');
    expect(html).toContain('rel="prev"');
    expect(html).toContain('rel="next"');
  });
});
