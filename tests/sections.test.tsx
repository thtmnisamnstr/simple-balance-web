import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { announcedSections, section, sections } from "@/content/sections";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { repoFile } from "./support/source";

/**
 * Announced versus merely built.
 *
 * `/docs` is announced and `/blog` is not. Three things have to be true of an
 * announced section and false of an unannounced one: a link in the header and
 * the footer, a page a crawler may index, and an entry in the sitemap. One
 * flag in `src/content/sections.ts` decides all three, and these hold it to
 * that in both directions, so a section cannot be half-launched from either
 * side.
 *
 * **The link half is checked twice, and the second check is the one that
 * matters.** For most of this file's life the flag did not move the link at
 * all: `primaryNav` and `footer.links` were hand-written literals and
 * `announcedSections()` had one caller, the sitemap. The first check below
 * would have been satisfied by somebody typing the link out, which restores
 * exactly that defect while looking correct. So the second reads
 * `src/content/home.ts` and asserts it still derives the links, because a
 * mechanism is what this flag promises and a coincidence is what a typed
 * literal gives.
 */

/** Every href the site chrome offers a reader, with the text it offers it as. */
function chromeLinks(): readonly { href: string; text: string }[] {
  return [render(<SiteHeader />), render(<SiteFooter />)]
    .flatMap((result) => [...result.container.querySelectorAll("a")])
    .map((anchor) => ({
      href: anchor.getAttribute("href") ?? "",
      text: (anchor.textContent ?? "").trim(),
    }));
}

/** The paths the sitemap lists under `href`, including `href` itself. */
function sitemapLocsUnder(xml: string, href: string): readonly string[] {
  return [...xml.matchAll(/<loc>https:\/\/smpl\.money([^<]*)<\/loc>/g)]
    .map((match) => match[1]!)
    .filter((loc) => loc.startsWith(href));
}

describe("what this site announces", () => {
  it("is the docs, and not the blog", () => {
    // The blog is built, styled and finished, and what goes in it has not
    // been decided. If this fails because the blog was announced deliberately,
    // the checks below are the ones to read: each asserts a third of the flag.
    expect(announcedSections().map((entry) => entry.key)).toEqual(["docs"]);
    expect(sections.map((entry) => entry.key).toSorted()).toEqual(["blog", "docs"]);
  });

  it("links to an announced section from the chrome, under its own label", () => {
    const links = chromeLinks();
    for (const entry of sections) {
      const mine = links.filter((link) => link.href.startsWith(entry.href));
      if (entry.announced) {
        expect(
          mine.map((link) => link.href),
          `${entry.href} is announced and linked from nowhere`,
        ).not.toEqual([]);
        /*
         * The label too, not just the href. This cannot fail through
         * `sections.ts`, because the label is derived from the same object:
         * renaming the section renames the link. What it catches is the one
         * shape the derivation check below cannot see, an anchor written
         * straight into `site-header.tsx` or `site-footer.tsx` — which is
         * where a link would go if somebody wanted one and did not find the
         * list. Proved by adding exactly that, with the text "Documentation".
         */
        for (const link of mine) expect(link.text).toBe(entry.label);
      } else {
        expect(mine, `${entry.href} is not announced and must not be linked`).toEqual([]);
      }
    }
  });

  it("derives those links rather than listing them", () => {
    /*
     * The check that makes the one above mean something. Re-hardcoding
     * `{ label: "Docs", href: "/docs/" }` passes every behavioral assertion
     * in this file and silently unpicks the flag, so what is asserted here is
     * the absence of the literal and the presence of the call.
     */
    const home = repoFile("src/content/home.ts");
    expect(home, "primaryNav and footer.links must spread announcedSections()").toContain(
      "announcedSections()",
    );
    for (const entry of sections) {
      expect(
        home,
        `src/content/home.ts writes ${entry.href} out by hand; announcing a section has to move the link on its own`,
      ).not.toContain(`"${entry.href}"`);
    }
  });

  it("lets an announced section be indexed, and tells crawlers to skip the rest", () => {
    // Read off the built page rather than the source, because the meta tag is
    // what a crawler sees and the flag reaching it is the thing under test.
    const noindex = /<meta name="robots" content="noindex/;
    for (const entry of sections) {
      const html = repoFile(`out${entry.href}index.html`);
      if (entry.announced) {
        expect(html, `${entry.href} is announced and should be indexable`).not.toMatch(noindex);
      } else {
        expect(html, `${entry.href} should be noindex`).toMatch(noindex);
      }
    }
  });

  it("puts an announced section and its pages in the sitemap, and keeps the rest out", () => {
    const xml = repoFile("out/sitemap.xml");
    // The sitemap is not empty, or the absences asserted below prove nothing.
    expect(xml).toContain("<loc>https://smpl.money/</loc>");
    for (const entry of sections) {
      const locs = sitemapLocsUnder(xml, entry.href);
      if (entry.announced) {
        expect(locs, `${entry.href} is announced and absent from the sitemap`).toContain(
          entry.href,
        );
        // And the pages under it, not just the door. `src/app/sitemap.ts`
        // walks the collection for those, so a section listed by its index
        // alone means that loop stopped running.
        expect(
          locs.filter((loc) => loc !== entry.href).length,
          `${entry.href} is in the sitemap but no page under it is`,
        ).toBeGreaterThan(0);
      } else {
        expect(locs, `${entry.href} is not announced and must not be in the sitemap`).toEqual([]);
      }
    }
  });

  it("is still allowed to be crawled either way, so the noindex can be read", () => {
    // Disallowing the path is the reflex and it is wrong: a crawler that
    // cannot fetch the page never sees the noindex, and a URL somebody links
    // to gets indexed with no description at all.
    const robots = repoFile("out/robots.txt");
    expect(robots).toContain("Allow: /");
    expect(robots).not.toContain("Disallow");
  });
});

describe("the section registry", () => {
  it("refuses a key it does not hold", () => {
    // @ts-expect-error — the point is the runtime guard behind the type.
    expect(() => section("nope")).toThrow(/no section named/);
  });

  it("gives every section an empty state that says there is nothing to miss", () => {
    for (const entry of sections) {
      expect(entry.empty.title.length).toBeGreaterThan(5);
      expect(entry.empty.body.length).toBeGreaterThan(20);
    }
  });
});
