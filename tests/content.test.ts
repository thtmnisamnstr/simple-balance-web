import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  allEntries,
  blogIndex,
  blogTags,
  docsBySection,
  docsNeighbours,
  slugify,
  tableOfContents,
} from "@/content/collections";
import { authors, initialsOf, isAuthorKey } from "@/content/authors";

/**
 * The content pipeline.
 *
 * These read the real `content/` directory rather than fixtures, so a file
 * somebody adds is checked by the same rules as the ones already there. That
 * is the point: the frontmatter contract is only worth having if breaking it
 * fails a build.
 */

describe("the content collections", () => {
  it("found content to check", () => {
    // Without this every claim below passes vacuously on an empty directory.
    expect(allEntries("docs").length + allEntries("blog").length).toBeGreaterThan(0);
  });

  it("gives every entry a title, a description and a slug", () => {
    for (const collection of ["blog", "docs"] as const) {
      for (const entry of allEntries(collection)) {
        expect(entry.frontmatter.title, `${entry.slug} title`).toBeTruthy();
        expect(entry.frontmatter.description, `${entry.slug} description`).toBeTruthy();
        expect(entry.slug).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("normalises every date to a calendar day, whatever YAML made of it", () => {
    // `gray-matter` hands back a Date for an unquoted `2026-09-17`. Left
    // alone it interpolates as "Wed Sep 17 2026 …" and every consumer that
    // builds a string from it produces an Invalid Date.
    for (const post of allEntries("blog")) {
      expect(post.frontmatter.date, `${post.slug} has a date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${post.frontmatter.date}T00:00:00Z`).getTime()).not.toBeNaN();
    }
  });

  it("orders posts newest first", () => {
    const dates = allEntries("blog").map((post) => post.frontmatter.date ?? "");
    expect(dates.toSorted().toReversed()).toEqual(dates);
  });

  it("names only authors that exist", () => {
    for (const post of allEntries("blog")) {
      for (const key of post.frontmatter.authors ?? []) {
        expect(isAuthorKey(key), `${post.slug} names "${key}"`).toBe(true);
        expect(authors[key].name).toBeTruthy();
      }
    }
  });

  it("separates featured posts from the rest without losing any", () => {
    const { featured, rest } = blogIndex();
    expect(featured.length + rest.length).toBe(allEntries("blog").length);
    // A post cannot be in both halves.
    const overlap = featured.filter((f) => rest.some((r) => r.slug === f.slug));
    expect(overlap).toEqual([]);
  });

  it("counts tags across posts", () => {
    const tags = blogTags();
    for (const { tag, count } of tags) {
      const actual = allEntries("blog").filter((p) => (p.frontmatter.tags ?? []).includes(tag));
      expect(actual.length, tag).toBe(count);
    }
  });
});

describe("the docs ordering", () => {
  it("puts every page in exactly one sidebar group", () => {
    const grouped = docsBySection().flatMap((group) => group.entries.map((e) => e.slug));
    expect(grouped.toSorted()).toEqual(
      allEntries("docs")
        .map((e) => e.slug)
        .toSorted(),
    );
    expect(new Set(grouped).size).toBe(grouped.length);
  });

  it("sorts groups by _sections.json, not alphabetically", () => {
    // The whole reason that file exists: "Install" belongs above "Reference",
    // and alphabetically it is below it.
    const order = (
      JSON.parse(readFileSync("content/docs/_sections.json", "utf8")) as { order: string[] }
    ).order;
    const present = docsBySection()
      .map((g) => g.section)
      .filter((s) => order.includes(s));
    const expected = order.filter((s) => present.includes(s));
    expect(present).toEqual(expected);
  });

  it("gives neighbours that agree with the sidebar order", () => {
    const all = allEntries("docs");
    for (const [index, entry] of all.entries()) {
      const { previous, next } = docsNeighbours(entry.slug);
      expect(previous?.slug).toBe(all[index - 1]?.slug);
      expect(next?.slug).toBe(all[index + 1]?.slug);
    }
  });
});

describe("the table of contents", () => {
  it("takes h2 and h3 and nothing else", () => {
    const items = tableOfContents("# One\n\n## Two\n\n### Three\n\n#### Four\n");
    expect(items.map((i) => i.text)).toEqual(["Two", "Three"]);
    expect(items.map((i) => i.depth)).toEqual([2, 3]);
  });

  it("ignores a hash inside a fenced code block", () => {
    // This is the bug every hand-rolled contents list has: a shell comment
    // looks exactly like a heading.
    const body = ["## Real", "", "```sh", "## not a heading", "```", "", "## Also real"].join("\n");
    expect(tableOfContents(body).map((i) => i.text)).toEqual(["Real", "Also real"]);
  });

  it("generates ids that match what rehype-slug will emit", () => {
    // The anchors only work because these two agree. Punctuation is where
    // hand-rolled slugifiers diverge from github-slugger.
    expect(slugify("What you need")).toBe("what-you-need");
    expect(slugify("The first account")).toBe("the-first-account");
    expect(slugify("Money, and what it costs")).toBe("money-and-what-it-costs");
    expect(slugify("`code` in a heading")).toBe("code-in-a-heading");
  });

  it("strips inline formatting from the text it shows", () => {
    expect(tableOfContents("## A **bold** word\n")[0]?.text).toBe("A bold word");
  });
});

describe("author initials", () => {
  it("takes at most two", () => {
    expect(initialsOf("Gavin Johnson")).toBe("GJ");
    expect(initialsOf("Ada")).toBe("A");
    expect(initialsOf("Jean Luc Picard")).toBe("JL");
  });
});
