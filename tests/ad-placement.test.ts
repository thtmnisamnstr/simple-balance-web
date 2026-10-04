import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { adsense } from "@/content/ads";

/**
 * Which pages carry the banner unit, exhaustively.
 *
 * The decision is "every page except the legal pages", and the two named
 * here are the whole exception — a new page added later gets the banner by
 * doing nothing, which is the safe direction for a default to be wrong in,
 * and a legal page added later has to be named here deliberately or this
 * test fails rather than silently showing somebody an ad beside the policy
 * that discloses it. The 404 is a third, smaller exception: a confirmed
 * navigational mistake is not a page to monetize, and it is named rather
 * than merely not mentioned, so a reader of this file does not have to
 * reconstruct the reasoning from a gap in a list.
 *
 * This duplicates `pages()` from `tests/branding.test.ts` and
 * `tests/adsense.test.ts` rather than importing a shared helper — the same
 * habit those two follow, and for the same reason: three copies written at
 * the same site are three places a change to how pages are walked gets
 * noticed, instead of one shared function silently becoming load-bearing for
 * tests that never meant to depend on each other.
 */
const NO_BANNER = new Set(["/privacy/", "/terms/", "/404.html", "/404/", "/_not-found/"]);

function pages(dir = "out", prefix = "/"): readonly { route: string; html: string }[] {
  const out: { route: string; html: string }[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "_next") continue;
      out.push(...pages(full, `${prefix}${entry}/`));
    } else if (entry === "index.html") {
      out.push({ route: prefix, html: readFileSync(full, "utf8") });
    }
  }
  if (dir === "out" && existsSync("out/404.html")) {
    out.push({ route: "/404.html", html: readFileSync("out/404.html", "utf8") });
  }
  return out;
}

/**
 * Needs a build the account was actually configured for; skipped on a
 * contributor's machine with no `.env`, not skipped in CI, where
 * `.github/workflows/verify.yml` sets the fixture values. Same gate as
 * `tests/adsense.test.ts`'s "the built pages", for the same reason.
 */
describe.skipIf(!adsense && !process.env.CI)(
  "where the banner unit does and does not render",
  () => {
    const all = pages();

    it("found pages to check", () => {
      // Guards the walk. Finding nothing would pass both assertions below.
      expect(all.length).toBeGreaterThan(12);
      expect(all.map((page) => page.route)).toEqual(
        expect.arrayContaining(["/", "/pricing/", "/privacy/", "/terms/"]),
      );
    });

    it("names every legal page and the 404 as the exception, and nothing else", () => {
      // The other direction a mistake in NO_BANNER could take: naming a page
      // that was never built, which would silently pass the assertion below
      // without ever having excluded a real page.
      const routes = new Set(all.map((page) => page.route));
      const phantom = [...NO_BANNER].filter((route) => !routes.has(route));
      expect(phantom, "NO_BANNER names a route this build did not emit").toEqual([]);
    });

    it("renders the banner on every page except the named exceptions", () => {
      const offenders: string[] = [];
      for (const page of all) {
        const hasBanner = page.html.includes('<ins class="adsbygoogle"');
        const shouldHaveBanner = !NO_BANNER.has(page.route);
        if (shouldHaveBanner && !hasBanner) {
          offenders.push(`${page.route} is missing the banner`);
        }
        if (!shouldHaveBanner && hasBanner) {
          offenders.push(`${page.route} has the banner and should not`);
        }
      }
      expect(offenders).toEqual([]);
    });

    it("keeps the banner off the legal pages specifically, not by coincidence", () => {
      // The assertion above would also pass if NO_BANNER were empty and every
      // page happened to have the banner except these two by some unrelated
      // bug. This pins the two routes by name, independent of the loop above.
      const privacy = all.find((page) => page.route === "/privacy/");
      const terms = all.find((page) => page.route === "/terms/");
      expect(privacy, "no build of /privacy/ to check").toBeDefined();
      expect(terms, "no build of /terms/ to check").toBeDefined();
      expect(privacy!.html).not.toContain('<ins class="adsbygoogle"');
      expect(terms!.html).not.toContain('<ins class="adsbygoogle"');
    });
  },
);
