import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sections } from "@/content/sections";

/**
 * The sitemap against the pages the build actually emitted.
 *
 * A sitemap is a list, and `code/testing.md` 2.2 is about what lists do: this
 * one is maintained by hand in `src/app/sitemap.ts`, so a page added without
 * touching it is a page no search engine is told about — and nothing else
 * would ever notice, because the page works perfectly.
 *
 * The population is discovered from `out/`. The exceptions are named here with
 * the argument for each.
 */

/** Every route the export emitted, as a trailing-slash path. */
function emittedRoutes(dir = "out", prefix = "/"): readonly string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "_next") continue;
      out.push(...emittedRoutes(full, `${prefix}${entry}/`));
    } else if (entry === "index.html") {
      out.push(prefix);
    }
  }
  return out;
}

/**
 * Routes that exist and are deliberately absent from the sitemap.
 * Each is an exception with a reason, not a population.
 */
const NOT_INDEXED: Record<string, string> = {
  "/404/": "An error page. Indexing it is how a 404 ends up in search results.",
  "/_not-found/": "Next's own name for the same page.",
};

describe("the sitemap", () => {
  const xml = readFileSync("out/sitemap.xml", "utf8");
  const listed = [...xml.matchAll(/<loc>https:\/\/smpl\.money([^<]*)<\/loc>/g)].map((m) => m[1]!);
  const routes = emittedRoutes();

  it("found routes to compare", () => {
    expect(routes.length).toBeGreaterThan(8);
    expect(listed.length).toBeGreaterThan(0);
  });

  it("lists every announced page that the build emitted", () => {
    const unannounced = sections.filter((s) => !s.announced).map((s) => s.href);
    const missing = routes.filter((route) => {
      if (route in NOT_INDEXED) return false;
      // A page under an unannounced section is covered by its own rule in
      // `tests/sections.test.tsx`, which asserts it is absent.
      if (unannounced.some((href) => route.startsWith(href))) return false;
      return !listed.includes(route);
    });
    expect(missing, "add these to src/app/sitemap.ts").toEqual([]);
  });

  it("lists nothing that the build did not emit", () => {
    const phantom = listed.filter((url) => !routes.includes(url));
    expect(phantom, "the sitemap points at pages that do not exist").toEqual([]);
  });

  it("keeps the error page out", () => {
    for (const route of Object.keys(NOT_INDEXED)) expect(listed).not.toContain(route);
  });
});
