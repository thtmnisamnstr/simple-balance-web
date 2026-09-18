import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allEntries, docsBySection } from "@/content/collections";

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
    expect(html).toContain("Reference");
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

  it("links its series, its tags and its neighbours", () => {
    expect(html).toContain("/blog/tags/bookkeeping/");
    expect(html).toContain("/blog/double-entry-for-one-person/");
    expect(html).toContain('aria-labelledby="series-title"');
  });
});

describe("the docs grouping", () => {
  it("puts every page in a section that _sections.json orders", () => {
    const order = (
      JSON.parse(readFileSync("content/docs/_sections.json", "utf8")) as { order: string[] }
    ).order;
    for (const group of docsBySection()) {
      expect(order, `"${group.section}" is not in _sections.json`).toContain(group.section);
    }
  });
});
