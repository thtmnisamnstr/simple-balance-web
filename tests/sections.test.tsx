import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { announcedSections, section, sections } from "@/content/sections";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { repoFile } from "./support/source";

/**
 * Announced versus merely built.
 *
 * `/blog` and `/docs` exist, are styled and are reachable, and nothing links
 * to them. That is one flag, and these hold the three things it has to decide
 * together — link, index, sitemap — so a section cannot be half-launched by
 * somebody adding a link and forgetting the rest.
 */

describe("an unannounced section", () => {
  it("is what this site currently ships", () => {
    // If this fails because something was announced deliberately, the tests
    // below are the ones to read: each asserts the other half of the flag.
    expect(announcedSections()).toEqual([]);
    expect(sections.map((s) => s.key).toSorted()).toEqual(["blog", "docs"]);
  });

  it("is not linked from the header or the footer", () => {
    const markup = [render(<SiteHeader />), render(<SiteFooter />)];
    const hrefs = markup
      .flatMap((r) => [...r.container.querySelectorAll("a")])
      .map((a) => a.getAttribute("href") ?? "");
    for (const unannounced of sections.filter((s) => !s.announced)) {
      expect(hrefs.filter((href) => href.startsWith(unannounced.href))).toEqual([]);
    }
  });

  it("tells crawlers not to index it", () => {
    // Read off the built page rather than the source, because the meta tag is
    // what a crawler sees and the flag reaching it is the thing under test.
    for (const unannounced of sections.filter((s) => !s.announced)) {
      const html = repoFile(`out${unannounced.href}index.html`);
      expect(html, `${unannounced.href} should be noindex`).toContain("noindex");
    }
  });

  it("stays out of the sitemap", () => {
    const xml = repoFile("out/sitemap.xml");
    for (const unannounced of sections.filter((s) => !s.announced)) {
      expect(xml).not.toContain(`${unannounced.href}`);
    }
    // And the sitemap is not empty, or the assertion above proves nothing.
    expect(xml).toContain("https://smpl.money/");
  });

  it("is still allowed to be crawled, so the noindex can be read", () => {
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
