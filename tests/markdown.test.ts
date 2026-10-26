import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allEntries } from "@/content/collections";
import { sections } from "@/content/sections";
import appFacts from "@/content/app-facts.json";

/**
 * The two things this site publishes for readers that aren't browsers:
 * `/llms.txt`, and a plain-Markdown copy of every docs page and learn guide
 * beside it at `index.md` (`content.md` 5.15). Both are built, so both are
 * read from `out/`, and both are held to the pages they copy.
 */

const docs = allEntries("docs");
const learn = allEntries("learn");

describe("the Markdown copies", () => {
  const copies = [
    ...docs.map((entry) => ({ section: "docs", entry })),
    ...learn.map((entry) => ({ section: "learn", entry })),
  ].map(({ section, entry }) => ({
    path: `out/${section}/${entry.slug}/index.md`,
    page: `out/${section}/${entry.slug}/index.html`,
    href: `/${section}/${entry.slug}/index.md`,
    entry,
  }));

  it("exist for every docs page and every learn guide", () => {
    expect(copies.length).toBeGreaterThan(20);
    expect(copies.filter((copy) => !existsSync(copy.path)).map((copy) => copy.path)).toEqual([]);
  });

  it("open on the page's title and description, and say where the page is", () => {
    for (const { path, entry } of copies) {
      const text = readFileSync(path, "utf8");
      expect(text.startsWith(`# ${entry.frontmatter.title}\n`), path).toBe(true);
      expect(text, path).toContain(`> ${entry.frontmatter.description}`);
      expect(text, path).toContain("https://smpl.money/");
    }
  });

  it("leave no component behind, and keep the made-up-money line with every picture", () => {
    // A `<Shot>` or `<Diagram>` left as a tag is markup a reader of Markdown
    // can't use; a picture without its line is a finance page showing
    // invented balances without saying so (`web.md` 5.5).
    for (const { path } of copies) {
      const text = readFileSync(path, "utf8");
      expect(text, path).not.toMatch(/<[A-Z][A-Za-z]*[\s>/]/);
      const pictures = text.match(/!\[[^\]]*\]\(https:\/\/smpl\.money\/screenshots\//g) ?? [];
      const lines = text.match(/The money in this picture is made up\./g) ?? [];
      expect(lines.length, path).toBe(pictures.length);
    }
  });

  it("are linked from their pages, so a crawler that reads Markdown finds them", () => {
    for (const { page, href } of copies) {
      const html = readFileSync(page, "utf8");
      expect(html, page).toMatch(
        // Absolute, because Next resolves it against `metadataBase`.
        new RegExp(`<link rel="alternate" type="text/markdown" href="https://smpl.money${href}"`),
      );
    }
  });

  it("use only absolute links back into the site, to headings that exist", () => {
    // A fragment alone, `](#carry-over)`, passed the root-relative check
    // while leading nowhere: a `text/markdown` file has no anchors, and a
    // sentence lifted out of one carries a link with no page in it. Nine
    // copies had them (`content.md` 5.15). Each now names the HTML page, so
    // that page has to have the heading.
    for (const { path } of copies) {
      const text = readFileSync(path, "utf8");
      expect(text, path).not.toMatch(/\]\((\/|#)/);
      for (const [, page, anchor] of text.matchAll(
        /\]\(https:\/\/smpl\.money(\/[^)#\s]*)#([^)\s]+)\)/g,
      )) {
        const html = readFileSync(`out${page}index.html`, "utf8");
        expect(html, `${path} links ${page}#${anchor}`).toContain(`id="${anchor}"`);
      }
    }
  });
});

describe("/llms.txt", () => {
  const text = readFileSync("out/llms.txt", "utf8");
  const links = [...text.matchAll(/\]\((https:\/\/smpl\.money[^)]*)\)/g)].map((m) => m[1]!);

  it("has the format's shape: a title, a summary, then lists of links", () => {
    // What Lighthouse's audit and the llmstxt.org format both look for.
    expect(text.startsWith("# Simple Balance\n")).toBe(true);
    expect(text).toMatch(/^> .{100,}/m);
    expect(text.match(/^## /gm)?.length).toBeGreaterThanOrEqual(3);
    expect(links.length).toBeGreaterThan(20);
  });

  it("links only to files the build wrote", () => {
    const missing = links.filter((url) => {
      const path = url.replace("https://smpl.money", "out");
      return !existsSync(path.endsWith("/") ? `${path}index.html` : path);
    });
    expect(missing).toEqual([]);
  });

  it("lists every docs page and learn guide, and nothing from an unannounced section", () => {
    for (const entry of docs) expect(text).toContain(`/docs/${entry.slug}/index.md`);
    for (const entry of learn) expect(text).toContain(`/learn/${entry.slug}/index.md`);
    for (const unannounced of sections.filter((section) => !section.announced)) {
      expect(text, unannounced.href).not.toContain(`smpl.money${unannounced.href}`);
    }
  });

  it("quotes the application's own prices", () => {
    const { monthly, yearly } = appFacts.facts.declared.prices;
    expect(text).toContain(`$${Number(monthly)} a month`);
    expect(text).toContain(`$${Number(yearly)} a year`);
  });
});
