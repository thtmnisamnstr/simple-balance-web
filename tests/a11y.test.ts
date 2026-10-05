import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join, normalize } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { adsense } from "@/content/ads";

/**
 * Accessibility, against the built pages in a real browser.
 *
 * This is the only test here that runs a browser, and it earns the seconds it
 * costs: every other rule in `web.md` that a machine can decide is checked in
 * jsdom, and jsdom has no layout engine, no computed styles and no contrast.
 * Color contrast in particular cannot be checked any other way, and it is the
 * rule most likely to be broken by a token change nobody rendered.
 *
 * It serves `out/` itself rather than expecting a server, so `npm run verify`
 * needs nothing running. `verify` builds before it tests, which is what makes
 * `out/` present.
 *
 * **Both themes**, because half of this site's color lives in the
 * `prefers-color-scheme` block and a light-only audit would never read it.
 */

/*
 * The one test that needs a browser, and the one that can be skipped.
 *
 * Netlify's build image is not guaranteed to have the system libraries
 * Chromium needs, and a deploy that fails because a browser would not install
 * is a deploy that fails for a reason unrelated to the change. So the Netlify
 * build sets `SKIP_BROWSER_TESTS=1` (see `netlify.toml`) and GitHub Actions
 * does not — the gate that must always run it is the one that installs it.
 *
 * The skip is explicit and named rather than "skip if Chromium is missing",
 * because the second form is indistinguishable from a machine where Chromium
 * silently stopped installing, and a suite that quietly stops checking
 * contrast is worse than one that fails.
 */
const SKIPPED = process.env.SKIP_BROWSER_TESTS === "1";

const PORT = 4399;
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

/**
 * Every page the build emitted, discovered rather than listed.
 *
 * This was a list of nine, and it went stale the moment pricing, privacy and
 * terms were added — three new pages, none of them audited, and nothing said
 * so. That is precisely the failure `code/testing.md` 2.2 is about: a list is
 * a claim about what exists, made once, by somebody who could not see what
 * would be added.
 *
 * There are no exceptions. Every page this site serves is a page somebody can
 * open, so every one is audited; if a page ever needs excusing, it is named
 * here with the argument, not quietly dropped.
 */
function emittedPages(dir = "out", prefix = "/"): readonly string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "_next") continue;
      out.push(...emittedPages(full, `${prefix}${entry}/`));
    } else if (entry === "index.html") {
      out.push(prefix);
    }
  }
  return out;
}

const PAGES = SKIPPED ? [] : emittedPages().toSorted();

let server: Server;
let browser: Browser;

beforeAll(async () => {
  if (SKIPPED) return;
  server = createServer((request, response) => {
    // `normalize` on a path joined under `out` is what stops `..` escaping it.
    const requested = normalize(decodeURIComponent((request.url ?? "/").split("?")[0]!));
    let file = join("out", requested);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) {
      response.writeHead(404).end("not found");
      return;
    }
    response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  });
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  browser = await chromium.launch();
}, 60_000);

afterAll(async () => {
  await browser?.close();
  await new Promise<void>((resolve) => server?.close(() => resolve()));
});

describe.skipIf(SKIPPED)("accessibility", () => {
  it("has pages to audit", () => {
    // `out/` is missing if somebody ran the tests without building. Say so,
    // rather than auditing nothing and passing — an empty population passes
    // every claim made over it.
    expect(existsSync("out/index.html"), "run `npm run build` first").toBe(true);
    expect(PAGES.length, "no pages discovered in out/").toBeGreaterThan(12);
  });

  for (const scheme of ["light", "dark"] as const) {
    for (const path of PAGES) {
      it(`has no WCAG 2.1 AA violations: ${path} (${scheme})`, async () => {
        const context = await browser.newContext({
          colorScheme: scheme,
          viewport: { width: 1280, height: 900 },
        });
        const page = await context.newPage();
        await page.goto(`http://localhost:${PORT}${path}`);
        await page.waitForLoadState("networkidle").catch(() => {});

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const summary = results.violations.map(
          (violation) =>
            `[${violation.impact}] ${violation.id}: ${violation.help} (${violation.nodes.length})`,
        );
        await context.close();
        expect(summary).toEqual([]);
      }, 30_000);
    }
  }
});

/**
 * WCAG 2.1 AA reflow (1.4.10), which axe cannot decide.
 *
 * The criterion is that content is readable at 320 CSS pixels without
 * scrolling in two directions. axe has no rule for it because deciding it
 * needs layout and a chosen width, so it is the accessibility failure a clean
 * axe report is most likely to be hiding — and it is invisible on a desktop,
 * because the row that overflows fits there.
 *
 * Three separate causes were live when this was written, and none of them
 * looked like an overflow in the source:
 *
 *  - the header was a flex row that could not wrap, so the brand, two links
 *    and the pending label pushed the page to 453px;
 *  - every tick in the pricing table carries a `.visually-hidden` word, and
 *    that class is `position: absolute` — so those words escaped the table's
 *    own scroll container, which was unpositioned, and sat at x=452;
 *  - `.code-tabs` is a grid, and a grid track will not shrink below its
 *    content's intrinsic width, so one unbreakable line of a code sample made
 *    it 482px wide.
 *
 * The table was never the thing overflowing. That is why this checks the
 * document rather than any element: the cause is somewhere new every time,
 * and the symptom is always the same one number.
 *
 * 390px is the second width because it is an ordinary phone rather than the
 * floor, and a page can pass at the floor while failing just above it.
 */
describe.skipIf(SKIPPED)("reflow", () => {
  for (const width of [320, 390]) {
    for (const path of PAGES) {
      it(`does not scroll sideways at ${width}px: ${path}`, async () => {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        await page.goto(`http://localhost:${PORT}${path}`);
        await page.waitForLoadState("networkidle").catch(() => {});

        const {
          viewport,
          document: scrollWidth,
          widest,
        } = await page.evaluate(() => {
          const vw = window.document.documentElement.clientWidth;
          /*
           * The thing that actually extends the page, so a failure names a
           * culprit rather than only a number.
           *
           * "Widest thing past the edge" is the obvious version and it is
           * wrong: the pricing table is 561px wide and overflows nothing,
           * because its own scroll container clips it. What made the page
           * 453px was a one-pixel `.visually-hidden` span inside it. So a
           * candidate only counts if its right edge is within the document's
           * scroll width — anything past that is being clipped by something
           * and is not the cause.
           *
           * Text runs are measured too: a long URL overflows its paragraph
           * without the paragraph's own box moving, which is how the privacy
           * policy failed.
           */
          const limit = window.document.documentElement.scrollWidth + 0.5;
          let worst = { what: "nothing", right: 0 };
          for (const element of window.document.querySelectorAll("*")) {
            const box = element.getBoundingClientRect();
            if (box.right > vw + 0.5 && box.right <= limit && box.right > worst.right) {
              worst = {
                what: `<${element.tagName.toLowerCase()} class="${element.className}">`,
                right: box.right,
              };
            }
          }
          const walker = window.document.createTreeWalker(
            window.document.body,
            NodeFilter.SHOW_TEXT,
          );
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (!node.nodeValue?.trim()) continue;
            const range = window.document.createRange();
            range.selectNodeContents(node);
            for (const box of range.getClientRects()) {
              if (box.right > vw + 0.5 && box.right <= limit && box.right > worst.right) {
                worst = { what: `text "${node.nodeValue.trim().slice(0, 40)}"`, right: box.right };
              }
            }
          }
          return {
            viewport: vw,
            document: window.document.documentElement.scrollWidth,
            widest: `${worst.what} reaches ${Math.round(worst.right)}px`,
          };
        });

        await context.close();
        expect(scrollWidth, `${path} at ${width}px: ${widest}`).toBeLessThanOrEqual(viewport);
      }, 30_000);
    }
  }
});

/** The focus ring on whatever has focus, read in the page. */
function ring(): string {
  const style = getComputedStyle(document.activeElement!);
  return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;
}

/** Open a built page with the ad loader blocked, and read something off it. */
async function measure<T>(path: string, read: () => T, width = 1280): Promise<T> {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  // The ad loader changes heights while it decides, and nothing here is
  // about the ad but the one test that blocks it on purpose.
  await page.route(/googlesyndication|doubleclick|adtrafficquality|www\.google\.com/, (r) =>
    r.abort(),
  );
  await page.goto(`http://localhost:${PORT}${path}`);
  await page.waitForLoadState("networkidle").catch(() => {});
  const result = await page.evaluate(read);
  await context.close();
  return result;
}

/**
 * Layout that only a renderer can see, each found by looking.
 *
 * `design-review` found every one of these on rendered pages after the suite
 * had passed them, which is the argument for having them here: jsdom has no
 * layout, so the rest of the suite cannot tell a lede flush against its title
 * from one with room to breathe. Each is a measurement of the defect it was
 * found as, not of the rule that fixed it, so a different way of breaking the
 * same thing fails too.
 */
describe.skipIf(SKIPPED)("layout", () => {
  /*
   * Headings and paragraphs both zero their margins, and for as long as that
   * has been true the lede under every title sat flush against it — on the
   * homepage's sections, pricing, the blog and the docs — while the 404 alone
   * had a gap, from a flex column nothing else used.
   */
  for (const path of ["/", "/pricing/", "/blog/", "/docs/", "/docs/backups/", "/404.html"]) {
    it(`leaves room between a title and the text under it: ${path}`, async () => {
      const gaps = await measure(path, () =>
        [
          ...document.querySelectorAll(
            ".section-title + .lede, .section-title + .prose, .entry-heading + .lede",
          ),
        ].map((text) => {
          const title = text.previousElementSibling!.getBoundingClientRect();
          return Math.round(text.getBoundingClientRect().top - title.bottom);
        }),
      );
      expect(gaps.length, `no title with text under it on ${path}`).toBeGreaterThan(0);
      for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(12);
    }, 30_000);
  }

  /*
   * rehype-pretty-code wraps every block in a `<figure>`, which kept the
   * browser's own 40px a side, so every code block on the site sat inset
   * from the column its tables and callouts fill.
   */
  it("lets a code block fill the column its text does", async () => {
    const { column, blocks } = await measure("/docs/backups/", () => ({
      column: document.querySelector(".prose-body")!.getBoundingClientRect().width,
      blocks: [...document.querySelectorAll(".prose-body .code-block")].map(
        (block) => block.getBoundingClientRect().width,
      ),
    }));
    expect(blocks.length, "no code block to measure").toBeGreaterThan(0);
    for (const width of blocks) expect(Math.abs(width - column)).toBeLessThan(1);
  }, 30_000);

  /*
   * The two screens under the feature grid stopped lining up whenever one
   * caption ran a line longer than the other: the figure was stretched to its
   * neighbor's height, and the shot's frame took the slack as blank surface.
   */
  it("lines up the two screens under the feature grid", async () => {
    const heights = await measure("/", () =>
      [...document.querySelectorAll(".showcase .shot")].map((shot) =>
        Math.round(shot.getBoundingClientRect().height),
      ),
    );
    expect(heights).toHaveLength(2);
    expect(heights[0]).toBe(heights[1]);
  }, 30_000);

  /*
   * The docs search is the one field on the site, and the shared focus rule
   * named links, buttons and `[tabindex]` but not `input`, so it fell back to
   * the browser's own blue ring while every link beside it wore the theme's.
   */
  for (const scheme of ["light", "dark"] as const) {
    it(`rings the search field the way it rings a link (${scheme})`, async () => {
      const context = await browser.newContext({ colorScheme: scheme });
      const page = await context.newPage();
      await page.goto(`http://localhost:${PORT}/docs/configuration/`);
      await page.focus(".docs-search-input");
      const field = await page.evaluate(ring);
      await page.focus(".header-link");
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const link = await page.evaluate(ring);
      await context.close();
      expect(link).toMatch(/^solid /);
      expect(field).toBe(link);
    }, 30_000);
  }

  /*
   * The cover's top margin is the gap under a post's byline, and leading the
   * featured card it stacked on the card's padding: twice the space above the
   * picture that the card has beside it.
   */
  it("starts the featured card's cover at the card's own padding", async () => {
    const inset = await measure("/blog/", () => {
      const card = document.querySelector(".entry-featured")!.getBoundingClientRect();
      const cover = document.querySelector(".entry-featured .entry-cover")!.getBoundingClientRect();
      return { top: Math.round(cover.top - card.top), side: Math.round(cover.left - card.left) };
    });
    expect(inset.top).toBe(inset.side);
  }, 30_000);
});

/*
 * A reader whose blocker or DNS filter stops the ad loader. The unit is then
 * never marked filled or unfilled, so the rule that collapses an unfilled one
 * never fires, and every page ended on an empty band between two rules.
 * Skipped where nothing is configured, as `tests/adsense.test.ts` is, and
 * never in CI, which builds with the ids set.
 */
describe.skipIf(SKIPPED || (!adsense && !process.env.CI))("an ad that never loads", () => {
  it("leaves no frame where the ad would have been", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.route(/googlesyndication|doubleclick|adtrafficquality|www\.google\.com/, (r) =>
      r.abort(),
    );
    await page.goto(`http://localhost:${PORT}/blog/archive/`);
    await page.waitForLoadState("networkidle").catch(() => {});
    const heights = await page.evaluate(() =>
      [...document.querySelectorAll(".ad-banner")].map(
        (banner) => banner.getBoundingClientRect().height,
      ),
    );
    await context.close();
    expect(heights, "the archive carries the banner").toHaveLength(1);
    expect(heights[0]).toBe(0);
  }, 30_000);
});
