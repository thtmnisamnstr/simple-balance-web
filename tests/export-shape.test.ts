import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { site } from "@/content/home";
import { repoFile } from "./support/source";

/**
 * The shape of what gets published.
 *
 * These are the checks that protect a revenue path nothing else in this
 * repository can see. `smpl.money/ads.txt` authorizes the advertising
 * inventory running on app.smpl.money, and the ways to break it are all
 * silent: a catch-all rewrite that answers it with HTML, a wrong content
 * type, or a build that stops emitting plain files at all.
 * `docs/standards/operations.md` 2 has the argument.
 */

const netlify = repoFile("netlify.toml");
const nextConfig = repoFile("next.config.mjs");

/**
 * Whether a redirect rule can answer `smpl.money/ads.txt` with something that
 * is not the file.
 *
 * Two conditions, and a rule is only dangerous when it meets both. **It has to
 * match the path.** `/*` does, and so does a placeholder such as `/:page`,
 * which stands for any one segment, `ads.txt` included. `/blog/*` never can,
 * and neither can a rule scoped to another host: the www redirect in
 * `netlify.toml` matches nothing on the apex, which is the only host Google
 * reads `ads.txt` from. **And it has to answer with a document.** A 200
 * serves HTML in the file's place and a 3xx sends the crawler to HTML, and
 * either is the state that demonetizes. A 4xx is the harmless state of a file
 * that is not there, which is what `/* /404.html 404` says.
 *
 * It used to fail any `from` ending in `/*`, which failed a moved-path
 * redirect such as `/old-docs/* /docs/:splat 301` that can never reach the
 * file, and passed `/:page /index.html 200`, which can. `code/testing.md` 2.5.
 *
 * A trailing `/*` is compiled as optional, the slash included, because a
 * splat can be empty and Netlify matches a rule whether or not the address
 * ends in a slash. So `/:page/*` is treated as reaching `/ads.txt`, the same
 * way `/*` covers `/`. Compiled as a literal slash followed by anything, it
 * needed a second segment, so `/:page/*` passed although it can reach the
 * file; `/blog/*` cannot reach it either way. For the same reason a `from`
 * that ends in a slash is read without it, so `/ads.txt/` is `/ads.txt`.
 *
 * `status` is what Netlify would use, so a rule that gives none is a 301. A
 * trailing `!` forces the rule over a file that exists, which changes nothing
 * about whether it matches.
 */
function answersAdsTxt(from: string, status: string): boolean {
  const host = /^https?:\/\/([^/]+)/i.exec(from)?.[1];
  if (host && host.toLowerCase() !== site.domain) return false;
  const address = host ? from.replace(/^https?:\/\/[^/]+/i, "") || "/" : from;
  const path = address.replace(/(.)\/$/, "$1");
  const splat = path.endsWith("/*");
  const pattern = (splat ? path.slice(0, -2) : path)
    .split(/(\*|:\w+)/)
    .map((part) => {
      if (part === "*") return ".*";
      if (/^:\w+$/.test(part)) return "[^/]+";
      return part.replaceAll(/[.+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("");
  const tail = splat ? "(?:/.*)?" : "";
  return new RegExp(`^${pattern}${tail}/?$`, "i").test("/ads.txt") && /^[23]/.test(status);
}

describe("the published shape", () => {
  it("publishes the static export directory", () => {
    expect(netlify).toMatch(/publish\s*=\s*"out"/);
    expect(nextConfig).toMatch(/output:\s*"export"/);
  });

  it("has no catch-all rewrite that could swallow a plain file", () => {
    // The reflex on a static host is `from = "/*"` with `status = 200`. That
    // turns every unknown path — `/ads.txt` before it is written, `/ads.tx`
    // after a typo — into a 200 of HTML. Google reads an ads.txt that does not
    // list the publisher id as an instruction to stop monetizing the domain,
    // so the failure pays nothing and looks like success.
    /*
     * Read line by line, because every way this was fooled was a line it
     * read that TOML does not, or one it skipped that TOML reads.
     *
     * - A header may carry spaces or quotes inside its brackets, so
     *   `[[ redirects ]]` and `[["redirects"]]` are the table `[[redirects]]`
     *   is. Matching only the last spelling never collected the others.
     * - A comment line is dropped before anything reads it, and `from` and
     *   `status` count only where they open a line. Unanchored, the status
     *   came from `# status = 404`, or from `?status=404` inside the `to`
     *   string, while Netlify used the 200 or the default 301.
     * - TOML writes a string in double quotes or, as a literal, in single
     *   ones, and `from = '/*'` is the same catch-all. A double-quoted value
     *   with a backslash in it is an escape this reader would take literally.
     *
     * So a `from` that is missing, empty or escaped fails here by name, and
     * so does any other line naming `redirects`, such as the inline form
     * `redirects = [{ from = "/*", ... }]` at the top of the file. A status
     * this cannot read is Netlify's default, 301, which the predicate counts
     * as dangerous. A `[redirects.conditions]` table ends the block, because
     * the keys under it are the condition's and not the rule's.
     */
    const header = /^[ \t]*\[\[[ \t]*(["']?)redirects\1[ \t]*\]\]/;
    const subTable = /^[ \t]*\[[ \t]*(["']?)redirects\1[ \t]*\./;
    const blocks: string[][] = [];
    const unreadable: string[] = [];
    let block: string[] | undefined;
    for (const [index, line] of netlify.split("\n").entries()) {
      if (/^\s*#/.test(line)) continue;
      if (header.test(line)) {
        block = [line];
        blocks.push(block);
        continue;
      }
      if (/^\s*\[/.test(line)) block = undefined;
      else block?.push(line);
      if (/\bredirects\b/.test(line) && !subTable.test(line)) {
        unreadable.push(`netlify.toml:${index + 1} ${line.trim()}`);
      }
    }
    const rewrites = blocks.map((lines) => lines.join("\n"));
    // The www redirect is always there, so finding none means the matcher
    // has stopped matching rather than that the file is clean.
    expect(rewrites.length, "found no [[redirects]] block, not even www").toBeGreaterThan(0);
    const catchAll = rewrites.filter((rule) => {
      const quoted = /^\s*from\s*=\s*(?:"([^"\\\n]*)"|'([^'\n]*)')/m.exec(rule);
      const from = (quoted?.[1] ?? quoted?.[2])?.trim();
      if (!from) {
        unreadable.push(rule.replaceAll(/\s+/g, " ").slice(0, 80));
        return false;
      }
      const status = /^\s*status\s*=\s*(\d+)/m.exec(rule)?.[1] ?? "301";
      return answersAdsTxt(from, status);
    });

    expect(unreadable, "a redirect rule in netlify.toml this check cannot read").toEqual([]);
    expect(catchAll, "a redirect rule can answer /ads.txt with HTML").toEqual([]);
  });

  it("has no catch-all in a _redirects file either", () => {
    /*
     * Netlify reads rules from a `_redirects` file in the publish directory
     * as well as from `netlify.toml`, and `public/_redirects` becomes
     * `out/_redirects` on every build. `/* /index.html 200` there is the
     * reflex fix for a client-side route, and the check above never opens
     * that file, so a rule written there would pass it.
     *
     * Neither file exists today. Each is read with the same predicate rather
     * than banned outright, so a moved-path redirect that cannot reach
     * `/ads.txt` is not a failing test, and `out/` is read too because it is
     * what Netlify actually publishes.
     *
     * The status is the first three-digit field after the path rather than
     * the third field, because a rule can match on a query parameter between
     * its path and its target.
     */
    for (const path of ["public/_redirects", "out/_redirects"]) {
      if (!existsSync(path)) continue;
      const catchAll = repoFile(path)
        .split("\n")
        .map((line) => line.replace(/#.*/, "").trim())
        .filter(Boolean)
        .filter((line) => {
          const [from = "", ...rest] = line.split(/\s+/);
          const status = rest.find((field) => /^\d{3}!?$/.test(field)) ?? "301";
          return answersAdsTxt(from, status);
        });
      expect(catchAll, `${path} has a rule that can answer /ads.txt with HTML`).toEqual([]);
    }
  });

  it("tells a rule that can reach /ads.txt from one that cannot", () => {
    // Fixtures, so the predicate is tested directly rather than through
    // whatever `netlify.toml` says today. `code/testing.md` 2.6.
    const dangerous = [
      ["/*", "200"],
      ["/*", "301"],
      ["/*", "200!"],
      ["/:page", "200"],
      ["/:page/*", "200"],
      ["/ads.txt", "302"],
      ["/ads.txt/", "301"],
      [`https://${site.domain}/*`, "200"],
    ] as const;
    for (const [from, status] of dangerous) {
      expect(answersAdsTxt(from, status), `misses ${from} ${status}`).toBe(true);
    }
    const harmless = [
      [`https://www.${site.domain}/*`, "301"],
      ["/blog/*", "200"],
      ["/old-docs/*", "301"],
      ["/docs/:slug", "301"],
      ["/*", "404"],
      ["/ads.txt", "410"],
    ] as const;
    for (const [from, status] of harmless) {
      expect(answersAdsTxt(from, status), `too wide: ${from} ${status}`).toBe(false);
    }
  });

  it("pins the content type for ads.txt", () => {
    const block = /\[\[headers\]\]\s*\n\s*for\s*=\s*"\/ads\.txt"[\s\S]*?(?=\n\[|$)/.exec(netlify);
    expect(block, "netlify.toml declares a header block for /ads.txt").toBeTruthy();
    expect(block?.[0]).toMatch(/Content-Type\s*=\s*"text\/plain/);
  });

  it("ships no ads.txt until there is a publisher id to put in it", () => {
    // A missing ads.txt is ignored by Google and costs nothing. A present one
    // that does not name the publisher id demonetizes the domain. So the file
    // is deliberately absent, and this check is the reminder of why — when the
    // AdSense account exists, this expectation is inverted in the same commit
    // that adds the file. `docs/standards/operations.md` 2.2.
    expect(existsSync("public/ads.txt"), "see docs/standards/operations.md 2.2").toBe(false);
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
    // The CSP's own clickjacking defense, which supersedes X-Frame-Options in
    // current browsers. Asserting the header and not this left the modern
    // half of the pair untested.
    expect(netlify).toContain("frame-ancestors 'none'");
  });
});
