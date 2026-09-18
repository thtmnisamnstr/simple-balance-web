import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { hero, shotDisclosure, site } from "@/content/home";

/**
 * The rendered page, against the rules in `docs/standards/web.md` that a
 * renderer can decide. Layout and rhythm cannot be checked here — jsdom has no
 * layout — and `docs/standards/web.md` 10 says which rules are left to eyes.
 */

describe("the homepage", () => {
  it("has exactly one h1, and it is the hero", () => {
    render(<HomePage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(hero.title);
  });

  it("steps heading levels without skipping one", () => {
    // A skipped level is invisible on screen and breaks the only navigation a
    // screen-reader user has on a page with no menu.
    const { container } = render(<HomePage />);
    const levels = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((node) =>
      Number(node.tagName[1]),
    );

    expect(levels[0]).toBe(1);
    for (const [index, level] of levels.entries()) {
      if (index === 0) continue;
      expect(
        level - levels[index - 1]!,
        `heading ${index} jumps from h${levels[index - 1]}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it("gives every section an accessible name", () => {
    const { container } = render(<HomePage />);
    const sections = [...container.querySelectorAll("section")];
    expect(sections.length).toBeGreaterThanOrEqual(4);

    const unnamed = sections.filter(
      (s) => !s.getAttribute("aria-labelledby") && !s.getAttribute("aria-label"),
    );
    expect(unnamed.map((s) => s.className)).toEqual([]);
  });

  it("renders the pending control as text, not a control", () => {
    // The app is not deployed. A <button> would imply something on this page
    // can enable it and a link would 404, so the label is a plain span.
    // `docs/standards/web.md` 6.4. When the app ships, this test changes in
    // the same commit that makes it a link — which is the point of asserting
    // it rather than leaving it to a reviewer to notice.
    render(<SiteHeader />);
    const pending = screen.getAllByText(hero.primaryLabel);
    expect(pending.length).toBeGreaterThan(0);
    for (const node of pending) {
      expect(node.tagName).toBe("SPAN");
      expect(node.closest("a")).toBeNull();
      expect(node.closest("button")).toBeNull();
    }
  });

  it("links nowhere that does not exist yet", () => {
    const { container } = render(
      <>
        <SiteHeader />
        <HomePage />
        <SiteFooter />
      </>,
    );
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href") ?? "");

    expect(hrefs.filter((href) => href.includes(site.appUrl))).toEqual([]);
    expect(hrefs.filter((href) => href === "" || href === "#")).toEqual([]);
  });

  it("gives every link text a person could act on", () => {
    const { container } = render(
      <>
        <SiteHeader />
        <HomePage />
        <SiteFooter />
      </>,
    );
    const vague = [...container.querySelectorAll("a")]
      .map((a) => (a.textContent ?? "").trim())
      .filter((text) => text.length === 0 || /^(here|click here|read more|more|link)$/i.test(text));

    expect(vague).toEqual([]);
  });

  it("offers one contact address as a mailto link", () => {
    // One, and the count is the assertion: `content.md` 4.1 records why the
    // second was removed, so a third appearing should fail rather than pass.
    const { container } = render(<SiteFooter />);
    const mailtos = [...container.querySelectorAll('a[href^="mailto:"]')].map((a) =>
      a.getAttribute("href"),
    );
    expect(mailtos).toEqual(["mailto:info@smpl.money"]);
  });

  it("marks decorative icons hidden from assistive technology", () => {
    // Every icon here sits beside text that already says what it means, so an
    // unhidden one is read out as a second, meaningless label.
    const { container } = render(<HomePage />);
    const svgs = [...container.querySelectorAll("svg")];
    expect(svgs.length).toBeGreaterThan(5);
    expect(svgs.filter((svg) => svg.getAttribute("aria-hidden") !== "true")).toEqual([]);
  });

  it("discloses that the screenshots show a demo ledger", () => {
    // Invented balances on a finance page have to say they are invented. The
    // page used to draw its own figure and caption it "illustrative"; it now
    // ships real screenshots of a seeded ledger, so the disclosure moved from
    // per-figure to one sentence covering all of them — and this checks the
    // sentence is present and sits with the screenshots rather than in a
    // footer nobody reaches.
    const { container } = render(<HomePage />);
    const shots = container.querySelectorAll("picture.shot");
    expect(shots.length, "the page ships screenshots").toBeGreaterThanOrEqual(4);

    // Matched against the string itself rather than against the words it
    // happened to use. The first version looked for "demo ledger", which is
    // the product's phrase for it and not a reader's — so rewriting the
    // sentence into plain words failed a test about whether the sentence is
    // there at all.
    expect(screen.getByText(shotDisclosure)).toBeInTheDocument();
  });

  it("gives every screenshot alt text that describes what it shows", () => {
    const { container } = render(<HomePage />);
    const images = [...container.querySelectorAll("picture.shot img")];
    expect(images.length).toBeGreaterThanOrEqual(4);
    for (const image of images) {
      const alt = image.getAttribute("alt") ?? "";
      // "Screenshot of the reports page" tells a reader who cannot see it
      // nothing the heading above did not. A real description is long.
      expect(alt.length, `alt is too short to describe anything: "${alt}"`).toBeGreaterThan(40);
      expect(alt.toLowerCase()).not.toMatch(/^screenshot of/);
    }
  });

  it("offers a narrower file for a screen that cannot use 1600px", () => {
    /*
     * The `srcset` is only as good as the file it points at, and a missing
     * candidate fails silently — the browser picks the next one up and the
     * page is merely heavier, which no gate here would notice.
     *
     * A phone renders these at about 356 CSS pixels. Without the narrow copy
     * a 3x screen is handed 1600px for a thumbnail, which measured at 300 KB
     * across the homepage against 187 KB with it.
     */
    const originals = readdirSync("public/screenshots").filter((f) => f.endsWith(".webp"));
    expect(originals.length, "no screenshots to check").toBeGreaterThan(4);

    const missing = originals.filter((f) => !existsSync(`public/screenshots/1200/${f}`));
    expect(missing, "run `npm run build:images`").toEqual([]);
  });

  it("lets the browser choose, on the built page", () => {
    // `sizes` without `srcset` is inert and `srcset` without `sizes` makes the
    // browser guess at the layout, so both have to reach the artefact.
    const html = readFileSync("out/index.html", "utf8");
    expect(html).toContain("/screenshots/1200/dashboard-light.webp 1200w");
    expect(html).toContain("/screenshots/dashboard-light.webp 1600w");
    expect(html).toMatch(/sizes="\(max-width: 62rem\)/);
  });

  it("gives every screenshot its real dimensions, so the page does not jump", () => {
    const { container } = render(<HomePage />);
    for (const image of container.querySelectorAll("picture.shot img")) {
      expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
      expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
    }
  });
});
