import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { repoFile } from "./support/source";

/**
 * The shape of what gets published.
 *
 * These are the checks that protect a revenue path nothing else in this
 * repository can see. `smpl.money/ads.txt` authorises the advertising
 * inventory running on app.smpl.money, and the ways to break it are all
 * silent: a catch-all rewrite that answers it with HTML, a wrong content
 * type, or a build that stops emitting plain files at all.
 * `docs/standards/operations.md` 2 has the argument.
 */

const netlify = repoFile("netlify.toml");
const nextConfig = repoFile("next.config.mjs");

describe("the published shape", () => {
  it("publishes the static export directory", () => {
    expect(netlify).toMatch(/publish\s*=\s*"out"/);
    expect(nextConfig).toMatch(/output:\s*"export"/);
  });

  it("has no catch-all rewrite that could swallow a plain file", () => {
    // The reflex on a static host is `from = "/*"` with `status = 200`. That
    // turns every unknown path — `/ads.txt` before it is written, `/ads.tx`
    // after a typo — into a 200 of HTML. Google reads an ads.txt that does not
    // list the publisher id as an instruction to stop monetising the domain,
    // so the failure pays nothing and looks like success.
    const rewrites = [...netlify.matchAll(/\[\[redirects\]\][\s\S]*?(?=\n\[|$)/g)].map((m) => m[0]);
    const catchAll = rewrites.filter((block) => {
      const from = /from\s*=\s*"([^"]+)"/.exec(block)?.[1] ?? "";
      const status = /status\s*=\s*(\d+)/.exec(block)?.[1] ?? "";
      // A 301 from the www host is a redirect, not a rewrite: it sends the
      // reader to the apex and serves nothing itself.
      const isHostRedirect = from.startsWith("http") && status.startsWith("3");
      return (from === "/*" || from.endsWith("/*")) && !isHostRedirect;
    });

    expect(catchAll, "a catch-all rewrite can answer /ads.txt with HTML").toEqual([]);
  });

  it("pins the content type for ads.txt", () => {
    const block = /\[\[headers\]\]\s*\n\s*for\s*=\s*"\/ads\.txt"[\s\S]*?(?=\n\[|$)/.exec(netlify);
    expect(block, "netlify.toml declares a header block for /ads.txt").toBeTruthy();
    expect(block?.[0]).toMatch(/Content-Type\s*=\s*"text\/plain/);
  });

  it("ships no ads.txt until there is a publisher id to put in it", () => {
    // A missing ads.txt is ignored by Google and costs nothing. A present one
    // that does not name the publisher id demonetises the domain. So the file
    // is deliberately absent, and this check is the reminder of why — when the
    // AdSense account exists, this expectation is inverted in the same commit
    // that adds the file. `docs/standards/operations.md` 2.1.
    expect(existsSync("public/ads.txt"), "see docs/standards/operations.md 2.1").toBe(false);
  });

  it("serves every route as its own directory, so no rewrite is needed", () => {
    expect(nextConfig).toMatch(/trailingSlash:\s*true/);
  });

  it("sends the security headers a static marketing page owes", () => {
    // All six `operations.md` 3.1 names. It asserted four, and the coverage
    // table in `operations.md` 10 credited this test with the whole rule — so
    // deleting `X-Frame-Options` or `Permissions-Policy` kept the suite green
    // while a guide said otherwise.
    for (const header of [
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Strict-Transport-Security",
      "X-Frame-Options",
      "Permissions-Policy",
      "Content-Security-Policy",
    ]) {
      expect(netlify, `${header} is not set`).toContain(header);
    }
    // The page talks to nothing and takes no input. These two directives are
    // what make the 'unsafe-inline' that Next.js forces on `script-src`
    // tolerable, so they are the ones worth asserting.
    expect(netlify).toContain("connect-src 'self'");
    expect(netlify).toContain("form-action 'none'");
    // The CSP's own clickjacking defence, which supersedes X-Frame-Options in
    // current browsers. Asserting the header and not this left the modern
    // half of the pair untested.
    expect(netlify).toContain("frame-ancestors 'none'");
  });
});
