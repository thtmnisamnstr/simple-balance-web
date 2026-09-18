import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join, normalize } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility, against the built pages in a real browser.
 *
 * This is the only test here that runs a browser, and it earns the seconds it
 * costs: every other rule in `web.md` that a machine can decide is checked in
 * jsdom, and jsdom has no layout engine, no computed styles and no contrast.
 * Colour contrast in particular cannot be checked any other way, and it is the
 * rule most likely to be broken by a token change nobody rendered.
 *
 * It serves `out/` itself rather than expecting a server, so `npm run verify`
 * needs nothing running. `verify` builds before it tests, which is what makes
 * `out/` present.
 *
 * **Both themes**, because half of this site's colour lives in the
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
