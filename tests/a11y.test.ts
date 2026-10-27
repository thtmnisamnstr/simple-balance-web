import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join, normalize } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";

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

/** One Tab stop: what it is, its ring, and whether it sits on the art panel. */
interface Stop {
  readonly name: string;
  readonly ring: string;
  readonly color: string;
  readonly onPanel: boolean;
}

/**
 * Every stop the Tab key reaches on the page, in order, until focus leaves
 * the document or comes back round to the skip link. One press at a time,
 * because each stop is wherever the last press left focus.
 */
async function tabStops(page: Page, stops: readonly Stop[] = []): Promise<readonly Stop[]> {
  if (stops.length >= 120) return stops;
  await page.keyboard.press("Tab");
  const read = await page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return null;
    const style = getComputedStyle(element);
    return {
      name: `${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim().slice(0, 30)}"`,
      ring: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
      color: style.outlineColor,
      onPanel: element.closest(".art-panel, .home-hero") !== null,
      first: element === document.querySelector(".skip-link"),
    };
  });
  if (!read || (read.first && stops.length > 0)) return stops;
  const { first: _first, ...stop } = read;
  return tabStops(page, [...stops, stop]);
}

/** WCAG's relative luminance of a color written `rgb(…)` or `#rrggbb`. */
function luminance(color: string): number {
  const channels = color.startsWith("#")
    ? [1, 3, 5].map((at) => Number.parseInt(color.slice(at, at + 2), 16))
    : color
        .match(/\d+(?:\.\d+)?/g)!
        .slice(0, 3)
        .map(Number);
  const [r, g, b] = channels.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG's contrast ratio between two colors. */
function contrast(one: string, two: string): number {
  const [light, dark] = [luminance(one), luminance(two)].toSorted((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
}

/**
 * Something built by scroll: the `index`th match of `selector` on `path`,
 * and, when the picture is only part of it, the `drawing` inside it whose
 * own bottom edge is where a reader stops.
 */
interface ScrollBuilt {
  readonly path: string;
  readonly selector: string;
  readonly index: number;
  readonly drawing?: string;
}

/** Each animation under a `ScrollBuilt`: its keyframes, whether a scroll paces it, and how far along. */
function motionUnder([selector, index]: readonly [string, number]) {
  const root = document.querySelectorAll(selector)[index]!;
  return root.getAnimations({ subtree: true }).map((animation) => ({
    name: (animation as CSSAnimation).animationName,
    scroll: animation.timeline !== document.timeline,
    progress: animation.effect!.getComputedTiming().progress ?? 0,
  }));
}

type Motion = ReturnType<typeof motionUnder>[number];

/** A part of a drawing, played by one of the `.mo` effects, rather than a card's own rise. */
const drawn = (part: Motion) => part.name.startsWith("mo-");

/** The closing picture's marks, which pop in as it arrives. */
const closingMarks = (parts: readonly Motion[]) => parts.filter((part) => part.name === "mo-pop");

/** The closing picture's two rings, and each mark turning back on them, which turn about the logo. */
const closingRings = (parts: readonly Motion[]) =>
  parts.filter((part) => part.name.startsWith("orbit-"));

/**
 * What runs under `target`, read as a reader arrives at it, a fifth of it
 * over the screen's bottom edge; with its `drawing`'s bottom edge just on
 * screen, if it names one; and once all of it is on screen, its top at the
 * screen's top or as near as the page's end allows. On a phone that touches,
 * or on a desktop: `(hover: none)` follows touch emulation, not the width.
 */
async function scrolledThrough({ path, selector, index, drawing }: ScrollBuilt, touch: boolean) {
  const context = await browser.newContext(
    touch
      ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
      : { viewport: { width: 1280, height: 900 } },
  );
  const page = await context.newPage();
  await page.goto(`http://localhost:${PORT}${path}`);
  const at = async (share: number, inner = "") => {
    await page.evaluate(
      ([css, nth, fraction, part]) => {
        const target = document.querySelectorAll(css)[nth]!;
        const box = (part ? target.querySelector(part)! : target).getBoundingClientRect();
        window.scrollBy(
          0,
          part
            ? box.bottom + 2 - window.innerHeight
            : fraction
              ? box.top + box.height * fraction - window.innerHeight
              : box.top,
        );
      },
      [selector, index, share, inner] as const,
    );
    await page.evaluate(
      () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
    );
    return page.evaluate(motionUnder, [selector, index] as const);
  };
  const arriving = await at(0.2);
  const pictured = drawing ? await at(0, drawing) : [];
  const shown = await at(0);
  await context.close();
  return { arriving, pictured, shown };
}

/**
 * Each box on the page that names a view timeline or runs an animation on
 * its own anonymous `view()`, with whether the page's own scroll paces it.
 */
function readTimelines() {
  const named = [...document.querySelectorAll("*")]
    .filter((box) => getComputedStyle(box).viewTimelineName !== "none")
    .map((box) => ({
      box,
      // The browser's own answer to which scroller it measures against.
      page: new ViewTimeline({ subject: box, axis: "block" }).source === document.scrollingElement,
    }));
  const anonymous = document
    .getAnimations()
    .filter((animation) => animation.timeline instanceof ViewTimeline)
    .map((animation) => ({
      box: (animation.effect as KeyframeEffect).target!,
      page: (animation.timeline as ViewTimeline).source === document.scrollingElement,
    }));
  return [...named, ...anonymous].map(({ box, page }) => ({
    box: `${box.tagName.toLowerCase()}.${[...box.classList].join(".")}`,
    page,
  }));
}

/** Whether the docs sidebar is open in the markup, and whether it shows. */
function readSidebar() {
  const link = document.querySelector(".docs-nav a[aria-current='page']")!;
  return {
    open: document.querySelector(".docs-nav-details")!.hasAttribute("open"),
    // Not its height: a closed `<details>` hides with `content-visibility`,
    // and a script asking for a size gets one anyway.
    shown: link.checkVisibility(),
  };
}

/**
 * Each screenshot's rendered width beside the width its `sizes` names here,
 * measured by the browser rather than by arithmetic in this file, so units
 * and `calc()` are read the way the browser picking the file reads them.
 */
function readShotSizes() {
  return [...document.querySelectorAll<HTMLImageElement>("img.shot-img")].map((image) => {
    // Top-level commas only: a `min()` or a `clamp()` holds its own.
    const entries: string[] = [];
    let depth = 0;
    let start = 0;
    for (let index = 0; index < image.sizes.length; index += 1) {
      const char = image.sizes[index];
      if (char === "(") depth += 1;
      else if (char === ")") depth -= 1;
      else if (char === "," && depth === 0) {
        entries.push(image.sizes.slice(start, index).trim());
        start = index + 1;
      }
    }
    entries.push(image.sizes.slice(start).trim());
    const length = entries
      .map((entry) => /^(\([^)]*\))\s+(.+)$/.exec(entry) ?? ["", "", entry])
      .find(([, condition]) => !condition || matchMedia(condition).matches)?.[2];
    // A length the browser can't read leaves the probe zero wide, which
    // fails the comparison rather than passing it.
    const probe = document.createElement("div");
    probe.style.cssText = `position: absolute; width: ${length}`;
    document.body.append(probe);
    const said = probe.getBoundingClientRect().width;
    probe.remove();
    return {
      src: image.getAttribute("src")!,
      rendered: image.getBoundingClientRect().width,
      said,
    };
  });
}

async function measure<T>(path: string, read: () => T, width = 1280, touch = false): Promise<T> {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    ...(touch ? { isMobile: true, hasTouch: true } : {}),
  });
  const page = await context.newPage();
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
  for (const path of [
    "/",
    "/pricing/",
    "/blog/",
    "/docs/",
    "/docs/backups/",
    "/learn/",
    "/learn/make-a-budget/",
    "/404.html",
  ]) {
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
   * `sizes` is the width the browser picks a screenshot's file by, before it
   * has laid anything out, so one the CSS disagrees with is trusted and wrong
   * with nothing to see. The two screens under the feature grid sit side by
   * side from 912px, earlier than the 62rem every `sizes` assumed, so a 2x
   * screen there fetched the 1600px files for pictures 414px wide; the hero
   * shot became as wide as the page and still said 1024; and a docs or
   * learn picture said 92% of the window where the text column stops at 746.
   *
   * Never more than 5% under, which is a blurry picture, and never more than
   * a fifth over, which is bytes. The most over is the docs sidebar
   * narrowing the column between 62rem and about 69rem, which one `prose`
   * value can't follow, at about 16%.
   */
  it("tells the browser how wide each screenshot renders", async () => {
    const views = [360, 390, 600, 768, 800, 900, 960, 1000, 1100, 1280, 1440].flatMap((width) =>
      ["/", "/docs/accounts/", "/learn/balance-your-checking-account/"].map((path) => ({
        path,
        width,
      })),
    );
    const shots = await Promise.all(
      views.map(({ path, width }) => measure(path, readShotSizes, width)),
    );
    const measured = views.flatMap((view, index) =>
      shots[index]!.map((shot) => ({ ...view, ...shot, ratio: shot.said / shot.rendered })),
    );
    expect(measured.length, "no screenshot measured, so this checks nothing").toBeGreaterThan(60);
    expect(
      measured
        .filter(({ ratio }) => ratio < 0.95 || ratio > 1.2)
        .map(
          ({ path, width, src, rendered, said }) =>
            `${path} at ${width}px: ${src} renders ${Math.round(rendered)}, ` +
            `its sizes says ${Math.round(said)}`,
        ),
    ).toEqual([]);
  }, 60_000);

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
   * The same gap twice more: the pricing questions are `<summary>`s, and a
   * table that scrolls inside its box on a phone is a stop the browser makes
   * by itself, and neither was on the shared rule's list of elements, so
   * both wore the browser's blue ring. Every stop, at 390, where the table
   * scrolls.
   */
  for (const scheme of ["light", "dark"] as const) {
    it(`rings every stop on the pricing page the way it rings a link (${scheme})`, async () => {
      const context = await browser.newContext({
        colorScheme: scheme,
        viewport: { width: 390, height: 900 },
      });
      const page = await context.newPage();
      await page.goto(`http://localhost:${PORT}/pricing/`);
      await page.waitForLoadState("networkidle").catch(() => {});
      const stops = await tabStops(page);
      await context.close();
      const link = stops.find((stop) => stop.name.startsWith("a "))!.ring;
      expect(link).toMatch(/^solid /);
      expect(stops.length, "too few stops to say anything").toBeGreaterThan(20);
      expect(stops.filter((stop) => stop.ring !== link).map((stop) => stop.name)).toEqual([]);
    }, 60_000);
  }

  /*
   * The art panel is dark in both themes, and its controls wore the page's
   * ring: green that measures 7:1 on the panel in dark and 2.4:1 in light,
   * under the 3:1 a focus indicator needs. axe's contrast rule doesn't read
   * outlines, so the audit above passed it on every page.
   */
  it("draws the ring on the art panel at 3:1 against it, in light", async () => {
    const context = await browser.newContext({ colorScheme: "light" });
    const onPanel = (
      await Promise.all(
        ["/", "/learn/", "/docs/", "/blog/"].map(async (path) => {
          const page = await context.newPage();
          await page.goto(`http://localhost:${PORT}${path}`);
          await page.waitForLoadState("networkidle").catch(() => {});
          const base = await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue("--art-base").trim(),
          );
          return (await tabStops(page))
            .filter((stop) => stop.onPanel)
            .map((stop) => ({ path, name: stop.name, ratio: contrast(stop.color, base) }));
        }),
      )
    ).flat();
    await context.close();
    expect(new Set(onPanel.map((stop) => stop.path)).size, "a page lost its panel control").toBe(4);
    expect(onPanel.filter((stop) => stop.ratio < 3)).toEqual([]);
  }, 120_000);

  /*
   * The cover's top margin is the gap under a post's byline, and leading the
   * featured card it stacked on the card's padding: twice the space above the
   * picture that the card has beside it. The lead story has the same cover
   * beside words that run taller than it, and centered in that row it sat
   * lower than its inset again, so the lead is held to it too.
   */
  it("starts the lead story's cover at the card's own padding", async () => {
    const inset = await measure("/blog/", () => {
      const card = document.querySelector(".blog-lead")!.getBoundingClientRect();
      const cover = document.querySelector(".blog-lead .entry-cover")!.getBoundingClientRect();
      return { top: Math.round(cover.top - card.top), side: Math.round(cover.left - card.left) };
    });
    expect(inset.top).toBe(inset.side);
  }, 30_000);

  /*
   * The docs sidebar is a `<details>` closed in the markup and shown by CSS
   * on a wide screen. It was rendered open, so on a phone every docs page
   * opened on twenty-seven links. jsdom can't see either half: both are
   * layout, one at each width.
   */
  it("shows the docs sidebar on a wide screen and folds it on a phone", async () => {
    expect(await measure("/docs/templates/", readSidebar, 1280)).toEqual({
      open: false,
      shown: true,
    });
    expect(await measure("/docs/templates/", readSidebar, 390)).toEqual({
      open: false,
      shown: false,
    });
  }, 30_000);

  /*
   * The legal pages put each heading and its paragraphs in a `<section>`,
   * and the prose's spacing reached direct children only, so the heading
   * sat flush on its text and a paragraph break read as a line wrap: the
   * same pair the docs space by `--s-4` on every page.
   */
  for (const path of ["/privacy/", "/terms/"]) {
    it(`spaces a section's heading and paragraphs as the prose does: ${path}`, async () => {
      const gaps = await measure(path, () =>
        [...document.querySelectorAll(".prose-body > section > :not(:first-child)")].map(
          (element) =>
            Math.round(
              element.getBoundingClientRect().top -
                element.previousElementSibling!.getBoundingClientRect().bottom,
            ),
        ),
      );
      expect(gaps.length, `no section with text in it on ${path}`).toBeGreaterThan(5);
      expect([...new Set(gaps)]).toEqual([16]);
    }, 30_000);
  }

  /*
   * A list in the prose kept the browser's own 1em under it, because the
   * spacing rule sets only a top margin: 17.44px under a list at 1280
   * against 16 under everything else.
   */
  it("leaves the scale's gap under a list, not the browser's", async () => {
    const paths = ["/docs/categories-and-payees/", "/learn/budget-categories/"];
    const pages = await Promise.all(
      paths.map((path) =>
        measure(path, () =>
          [...document.querySelectorAll(".prose-body > :is(ul, ol) + p")].map(
            (text) =>
              Math.round(
                (text.getBoundingClientRect().top -
                  text.previousElementSibling!.getBoundingClientRect().bottom) *
                  100,
              ) / 100,
          ),
        ),
      ),
    );
    for (const [index, gaps] of pages.entries()) {
      expect(gaps.length, `no list followed by a paragraph on ${paths[index]}`).toBeGreaterThan(0);
      expect([...new Set(gaps)], paths[index]).toEqual([16]);
    }
  }, 30_000);

  /*
   * Two of the same thing side by side, stretched to the taller one's
   * height: a stretched grid shares its slack between its rows, so a
   * one-line title sank 14px from its label beside a two-line one, in the
   * docs pager on every page whose neighbors wrap differently and in the
   * docs index's three starting points.
   */
  it("starts the docs pager's two titles level on every page", async () => {
    const docs = PAGES.filter((path) => /^\/docs\/[^/]+\/$/.test(path));
    const offsets = await Promise.all(
      docs.map((path) =>
        measure(path, () =>
          [...document.querySelectorAll(".doc-pager-link")].map((link) =>
            Math.round(
              link.querySelector(".doc-pager-title")!.getBoundingClientRect().top -
                link.getBoundingClientRect().top,
            ),
          ),
        ),
      ),
    );
    expect(docs.length).toBeGreaterThan(20);
    const uneven = docs.filter((_, index) => new Set(offsets[index]).size > 1);
    expect(uneven).toEqual([]);
  }, 120_000);

  it("keeps each docs starting point's kicker on its title", async () => {
    const gaps = await measure("/docs/", () =>
      [...document.querySelectorAll(".docs-start")].map((start) =>
        Math.round(
          start.querySelector(".docs-start-title")!.getBoundingClientRect().top -
            start.querySelector(".docs-start-kicker")!.getBoundingClientRect().bottom,
        ),
      ),
    );
    expect(gaps).toHaveLength(3);
    expect(new Set(gaps).size, `kicker-to-title gaps ${gaps.join(", ")}`).toBe(1);
  }, 30_000);

  /*
   * The comparison table's row headers were grids, which aren't table cells,
   * so one stopped stretching with its row: where a price wrapped and the
   * feature's name didn't, the name's divider was drawn 21px above the rest
   * of the row's, at 390.
   */
  it("ends each comparison row's header level with its row, on a phone", async () => {
    const steps = await measure(
      "/pricing/",
      () =>
        [...document.querySelectorAll(".compare tbody tr")].map((row) =>
          Math.round(
            row.getBoundingClientRect().bottom -
              row.querySelector("th")!.getBoundingClientRect().bottom,
          ),
        ),
      390,
    );
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.filter((step) => step !== 0)).toEqual([]);
  }, 30_000);

  /*
   * An unpainted copy of Premium's flag keeps the three headings level
   * side by side, and once the cards stacked it kept taking room at the top
   * of a card with nothing beside it: 56px above Free's heading, 33px at
   * every other edge.
   */
  it("gives a stacked plan card the same inset at its top as at its bottom", async () => {
    const insets = await measure(
      "/pricing/",
      () =>
        [...document.querySelectorAll(".tier")].map((tier) => {
          const box = tier.getBoundingClientRect();
          const shown = [...tier.children].filter((child) =>
            child.checkVisibility({ visibilityProperty: true }),
          );
          return [
            Math.round(shown[0]!.getBoundingClientRect().top - box.top),
            Math.round(box.bottom - shown.at(-1)!.getBoundingClientRect().bottom),
          ];
        }),
      390,
    );
    expect(insets).toHaveLength(3);
    for (const [top, bottom] of insets) expect(top).toBe(bottom);
  }, 30_000);

  /*
   * The heading over the list under the comparison table wore the section
   * title's class, and its 12px gap under an eyebrow, so it sat tight under
   * the table and twice as far above the list it introduces.
   */
  it("spaces the heading under the comparison table toward what it heads", async () => {
    const { above, below } = await measure("/pricing/", () => {
      const heading = document.querySelector(".table-wrap + h3")!;
      const box = heading.getBoundingClientRect();
      return {
        above: Math.round(box.top - heading.previousElementSibling!.getBoundingClientRect().bottom),
        below: Math.round(heading.nextElementSibling!.getBoundingClientRect().top - box.bottom),
      };
    });
    expect(above).toBeGreaterThan(below);
  }, 30_000);

  /*
   * The privacy band's list carried the checklist's margin for sitting
   * under a lede, so beside the words it started 24px below them, level
   * with nothing.
   */
  it("starts the privacy band's list level with the words beside it", async () => {
    const offset = await measure("/", () => {
      const list = document.querySelector(".home-privacy-list")!;
      return Math.round(
        list.getBoundingClientRect().top -
          list.parentElement!.firstElementChild!.getBoundingClientRect().top,
      );
    });
    expect(offset).toBe(0);
  }, 30_000);

  /*
   * A page shorter than the window ended above its bottom edge, and the
   * page's ground showed under the footer as a band of another shade, 381px
   * of it under the 404 on a 1200px-tall screen.
   */
  it("ends a short page in its footer, not in a band of the page under it", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/404.html`);
    const read = await page.evaluate(() => {
      const footer = document.querySelector(".site-footer")!;
      return {
        below: innerHeight - footer.getBoundingClientRect().bottom,
        canvas: getComputedStyle(document.documentElement).backgroundColor,
        footer: getComputedStyle(footer).backgroundColor,
      };
    });
    await context.close();
    expect(read.below <= 0 || read.canvas === read.footer, JSON.stringify(read)).toBe(true);
  }, 30_000);

  /*
   * A learn picture's small labels were hidden by the window's width, so the
   * same picture at the same size kept them at 7.8px in a phone's hero, 8px
   * on the Keep reading cards at 1280 and 5px on a tablet's cards, while the
   * phone's index hid them.
   */
  it("shows a picture's small labels only where they're large enough to read", async () => {
    const views = [1280, 600, 390].flatMap((width) =>
      ["/learn/", "/learn/balance-your-checking-account/"].map((path) => ({ path, width })),
    );
    const sizes = await Promise.all(
      views.map(({ path, width }) =>
        measure(
          path,
          () =>
            [...document.querySelectorAll<SVGTextElement>(".art-text-muted")]
              .filter((label) => label.checkVisibility())
              .map(
                (label) =>
                  Number.parseFloat(getComputedStyle(label).fontSize) *
                  label.ownerSVGElement!.getScreenCTM()!.a,
              ),
          width,
        ),
      ),
    );
    const shown = views.flatMap((view, index) =>
      sizes[index]!.map((size) => ({ ...view, size: Math.round(size * 10) / 10 })),
    );
    expect(shown.length, "no label shown anywhere, so this checks nothing").toBeGreaterThan(0);
    expect(shown.filter((label) => label.size < 10)).toEqual([]);
  }, 60_000);

  /*
   * A card's drawing replays for a resting pointer, which a touch screen
   * never has, so on a phone every card on /learn/, the homepage's job cards
   * and the docs cards' marks sat still. There, a card plays the same replay
   * once its picture is all on screen: a view timeline turns `--play` on, the
   * switch the pointer's hover turns on (`web.md` 8.3). Built by scroll
   * instead, as this first shipped, a card's picture was finished within
   * about eighty pixels of its edge arriving, mostly below the screen, and a
   * phone's flick covers that in a frame, so on a real phone nothing was seen
   * to move. So: still while it's arriving, playing on the clock once its
   * picture is in, and on a desktop nothing on scroll at all. One of each,
   * because a learn or job card's trigger is on its picture and a docs card's
   * on the card.
   */
  it("plays a card's drawing once it's on a touch screen, and waits for a pointer elsewhere", async () => {
    const cards: readonly ScrollBuilt[] = [
      { path: "/learn/", selector: ".learn-grid > li", index: 2, drawing: ".learn-card-art" },
      { path: "/", selector: ".home-job-grid > li", index: 1, drawing: ".learn-card-art" },
      { path: "/docs/", selector: ".docs-card", index: 2 },
      { path: "/docs/", selector: ".docs-feature", index: 0 },
    ];
    const [phone, desktop] = await Promise.all(
      [true, false].map((touch) => Promise.all(cards.map((card) => scrolledThrough(card, touch)))),
    );
    const wrong = cards.flatMap(({ selector, drawing }, index) => {
      const arriving = phone![index]!.arriving.filter(drawn);
      const playing = (drawing ? phone![index]!.pictured : phone![index]!.shown).filter(drawn);
      return [
        arriving.length > 0 && `${selector} moves before it's on a touch screen`,
        playing.length === 0 && `${selector} sits still once it's on a touch screen`,
        playing.some((part) => part.scroll) && `${selector} is scrubbed by the scroll`,
        playing.length > 0 &&
          playing.every((part) => part.progress === 1) &&
          `${selector} was already finished when it came on screen`,
        [...desktop![index]!.arriving, ...desktop![index]!.shown].some(drawn) &&
          `${selector} plays on scroll for a pointer`,
      ].filter(Boolean);
    });
    expect(wrong).toEqual([]);
  }, 60_000);

  /*
   * The closing picture's timeline is named on the drawing, inside a panel
   * whose `overflow: hidden` made it a scroller that never moves, so the
   * timeline held still: the marks sat finished from the first frame on
   * every screen, and the rings that turn with the scroll on a touch screen
   * sat tilted. The marks build as the picture arrives on every screen; the
   * rings turn with the scroll on a touch screen and wait for a pointer
   * elsewhere.
   */
  it("builds the closing picture as it arrives, and turns its rings with the scroll on a touch screen", async () => {
    const closing = { path: "/", selector: ".home-closing-art", index: 0 };
    const [phone, desktop] = await Promise.all(
      [true, false].map((touch) => scrolledThrough(closing, touch)),
    );
    const wrong = [
      ...(["phone", "desktop"] as const).flatMap((screen) => {
        const { arriving, shown } = screen === "phone" ? phone! : desktop!;
        return [
          closingMarks(arriving).every((part) => part.progress === 1) &&
            `${screen}: the marks are built before the picture arrives`,
          closingMarks(shown).some((part) => part.progress < 1) &&
            `${screen}: the marks are unfinished once the picture is on screen`,
        ];
      }),
      closingRings(phone!.arriving).length === 0 && "phone: no ring turns",
      closingRings(phone!.arriving).some((part) => !part.scroll) &&
        "phone: a ring isn't paced by the scroll",
      closingRings(phone!.arriving).some(
        (part, index) => part.progress >= closingRings(phone!.shown)[index]!.progress,
      ) && "phone: a ring doesn't turn as the picture passes",
      closingRings(desktop!.arriving).length === 0 && "desktop: no ring waits for a pointer",
      closingRings(desktop!.arriving).some((part) => part.scroll) &&
        "desktop: a ring turns with the scroll",
    ].filter(Boolean);
    expect(wrong).toEqual([]);
  }, 60_000);

  /*
   * A view timeline is measured against the nearest scroller above the box
   * that names it, and a box that hides its overflow is one, whether or not
   * anything in it scrolls, so a timeline named inside a clipped panel, as
   * the closing picture's was, holds still. Every page, on a touch screen,
   * where each card's trigger runs on its own view timeline as well.
   */
  it("paces every view timeline by the page's own scroll", async () => {
    const found = await Promise.all(PAGES.map((path) => measure(path, readTimelines, 390, true)));
    const named = found.flatMap((boxes, index) =>
      boxes.map((box) => ({ path: PAGES[index], ...box })),
    );
    expect(
      [...new Set(named.map(({ box }) => box))],
      "missed the closing picture's timeline, or the trigger only a touch screen runs on a card",
    ).toEqual(expect.arrayContaining(["div.home-closing-art", "a.learn-card-art"]));
    expect(named.filter((box) => !box.page)).toEqual([]);
  }, 120_000);
});
