import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allEntries, bySection, slugify, tableOfContents } from "@/content/collections";
import { docsIndex } from "@/content/sections";
import { docGlyph, docGlyphs } from "@/components/docs-art/glyphs";
import { groupArt } from "@/components/docs-art/pictures";
import { sourceFiles } from "./support/source";

/** Search, breadcrumbs, the edit link, and the structured data, from the build. */

describe("the docs search index", () => {
  const index = JSON.parse(readFileSync("out/docs/search-index.json", "utf8")) as {
    slug: string;
    title: string;
    section: string;
    text: string;
  }[];

  it("holds every published page", () => {
    expect(index.length).toBe(allEntries("docs").length);
    expect(index.length).toBeGreaterThan(1);
  });

  it("indexes the body, not only the title", () => {
    // The whole point: somebody searching for a phrase in the middle of a
    // page has to find the page.
    const backups = index.find((doc) => doc.slug === "backups");
    expect(backups?.text).toContain("pg_restore");
  });

  it("keeps identifiers people actually search for", () => {
    // The flattening strips Markdown punctuation, and an over-eager strip
    // would take `AUTH_SECRET` out of a page that documents it.
    const config = index.find((doc) => doc.slug === "configuration");
    expect(config?.text).toContain("auth_secret");
    expect(config?.text).toContain("database_url");
  });

  it("carries the section, so a result can say where it lives", () => {
    for (const doc of index) expect(doc.section.length).toBeGreaterThan(0);
  });
});

describe("a docs page", () => {
  const html = readFileSync("out/docs/configuration/index.html", "utf8");

  it("offers a link to edit the source file, not the repository", () => {
    // Somebody who has spotted a typo will not go hunting for the file.
    expect(html).toContain("/edit/main/content/docs/configuration.md");
  });

  it("carries breadcrumbs naming its section", () => {
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain("Self-hosting");
  });

  it("declares itself a TechArticle to a crawler", () => {
    expect(html).toContain('"@type":"TechArticle"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it("renders a copy control per code block", () => {
    const blocks = html.match(/class="code-block"/g) ?? [];
    const buttons = html.match(/class="copy-button"/g) ?? [];
    expect(blocks.length).toBeGreaterThan(0);
    expect(buttons.length).toBe(blocks.length);
  });

  it("emits both Shiki themes so code is legible in either", () => {
    // The defect this is about: the block was painted on an always-dark
    // surface while the light theme supplied dark text, which was invisible.
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
  });
});

describe("a blog post", () => {
  const html = readFileSync("out/blog/what-a-refund-actually-is/index.html", "utf8");

  it("declares itself a BlogPosting with a real author", () => {
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"@type":"Person"');
    expect(html).toContain("Gavin Johnson");
  });

  it("escapes the JSON-LD so it cannot close its own script tag", () => {
    // `</script>` inside a JSON string ends the element early and the rest
    // of the payload becomes markup. The escape is why that cannot happen.
    const block = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html);
    expect(block).toBeTruthy();
    expect(block![1]).not.toContain("<");
  });

  it("links its series, its tags and its neighbors", () => {
    expect(html).toContain("/blog/tags/bookkeeping/");
    expect(html).toContain("/blog/double-entry-for-one-person/");
    expect(html).toContain('aria-labelledby="series-title"');
  });
});

describe.each(["docs", "learn"] as const)("the %s grouping", (collection) => {
  it("puts every page in a section that _sections.json orders", () => {
    const order = (
      JSON.parse(readFileSync(`content/${collection}/_sections.json`, "utf8")) as {
        order: string[];
      }
    ).order;
    for (const group of bySection(collection)) {
      expect(order, `"${group.section}" is not in _sections.json`).toContain(group.section);
    }
  });
});

describe("the docs index, as built", () => {
  /*
   * The index was three headings over three lists of titles, and a reader
   * could not tell where one group ended and the next began. These hold what
   * replaced it: every page on a card with its own mark, every group with its
   * own heading and picture, and the ways in at the top leading somewhere.
   */
  const doc = new DOMParser().parseFromString(
    readFileSync("out/docs/index.html", "utf8"),
    "text/html",
  );
  const pages = allEntries("docs");
  const groups = bySection("docs");
  const cards = [...doc.querySelectorAll(".docs-card, .docs-feature")];

  it("shows every page as one card, with that page's own mark", () => {
    expect(pages.length).toBeGreaterThan(5);
    expect(cards.length).toBe(pages.length);
    for (const page of pages) {
      const mine = cards.filter((card) => card.querySelector(`h3 a[href="/docs/${page.slug}/"]`));
      expect(mine, page.slug).toHaveLength(1);
      const tile = mine[0]!.querySelector(".docs-tile");
      expect(tile?.getAttribute("data-glyph"), page.slug).toBe(page.slug);
      expect(tile?.querySelectorAll("path").length, page.slug).toBe(docGlyph(page.slug).length);
    }
  });

  it("gives every group its own heading, its own picture and only its own pages", () => {
    expect(groups.length).toBeGreaterThan(1);
    const pictures = new Set<string>();
    for (const group of groups) {
      const section = doc.querySelector(`section[aria-labelledby="g-${slugify(group.section)}"]`);
      expect(section, group.section).not.toBeNull();

      // The number beside a group's name is decoration, out of its name.
      const heading = section!.querySelector("h2")!.cloneNode(true) as HTMLElement;
      for (const hidden of heading.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
      expect(heading.textContent?.trim()).toBe(group.section);

      const picture = section!.querySelector(".docs-group-head .art-panel svg");
      expect(picture?.querySelectorAll(".mo").length, group.section).toBeGreaterThan(3);
      pictures.add(picture!.innerHTML);

      const linked = [...section!.querySelectorAll("h3 a")].map((a) => a.getAttribute("href"));
      expect(linked).toEqual(group.entries.map((entry) => `/docs/${entry.slug}/`));
    }
    // One picture per group, not one picture three times.
    expect(pictures.size).toBe(groups.length);
  });

  it("opens on search and on the places most people start", () => {
    const intro = doc.querySelector("header.docs-intro");
    expect(intro?.querySelector('input[type="search"]')).not.toBeNull();
    const starts = [...intro!.querySelectorAll(".docs-starts a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(starts).toEqual(docsIndex.starts.map((start) => `/docs/${start.slug}/`));
  });

  it("links each step of a guide to a heading the guide has", () => {
    const steps = Object.entries(docsIndex.steps);
    expect(steps.length).toBeGreaterThan(0);
    for (const [slug, ids] of steps) {
      const page = pages.find((entry) => entry.slug === slug);
      expect(page, slug).toBeDefined();
      const headings = tableOfContents(page!.body).map((heading) => heading.id);
      for (const id of ids) {
        expect(headings, `${slug}#${id}`).toContain(id);
        expect(doc.querySelector(`.docs-steps a[href="/docs/${slug}/#${id}"]`), id).not.toBeNull();
      }
    }
  });
});

describe("the docs index's marks and pictures", () => {
  const slugs = allEntries("docs")
    .map((entry) => entry.slug)
    .toSorted();
  const names = bySection("docs")
    .map((group) => group.section)
    .toSorted();

  it("gives every page a mark, and keeps none for a page that does not exist", () => {
    expect(slugs.length).toBeGreaterThan(5);
    expect(Object.keys(docGlyphs).toSorted()).toEqual(slugs);
  });

  it("fails on a page with no mark rather than drawing an empty tile", () => {
    expect(() => docGlyph("a-page-nobody-drew")).toThrow(/no docs glyph/);
  });

  it("gives every group a picture and words, and keeps none for a group that does not exist", () => {
    expect(names.length).toBeGreaterThan(1);
    expect(Object.keys(groupArt).toSorted()).toEqual(names);
    expect(Object.keys(docsIndex.groups).toSorted()).toEqual(names);
  });

  it("starts a reader only on pages that exist", () => {
    for (const start of docsIndex.starts) expect(slugs, start.slug).toContain(start.slug);
  });

  it("takes every color from the contract, never a literal", () => {
    // `tests/learn.test.ts` holds the learn art to this, and these drawings
    // are made of the same art classes on the same panel. So are the
    // homepage's and the blog's, found by their `-art` name rather than
    // listed: this read neither once, and both were clean only by habit.
    const files = [
      ...sourceFiles("src/components/docs-art", /\.tsx?$/),
      ...sourceFiles("src/components", /-art\.tsx?$/),
    ];
    expect(files.map((file) => file.path)).toEqual(
      expect.arrayContaining([
        "src/components/docs-art/pictures.tsx",
        "src/components/home-art.tsx",
        "src/components/blog-art.tsx",
      ]),
    );
    const offenders = files.flatMap((file) =>
      file.code
        .split("\n")
        .map((line, index) => ({ line, index }))
        .filter(
          ({ line }) =>
            /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(line) ||
            /\b(fill|stroke|stopColor|stop-color|color)=["{](?!"none")/.test(line),
        )
        .map(({ line, index }) => `${file.path}:${index + 1} ${line.trim()}`),
    );
    expect(offenders).toEqual([]);
  });
});
