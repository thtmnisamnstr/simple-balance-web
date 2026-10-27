import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sections } from "@/content/sections";
import { site } from "@/content/home";

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
  "/blog/page/1/":
    "The same content as /blog/, and its own canonical says so. Next refuses a " +
    "dynamic route whose generateStaticParams returns nothing, so page one is " +
    "generated rather than skipped; listing it would ask a crawler to index a " +
    "duplicate this site has already disclaimed.",
};

/** The five entities React writes into an attribute or a title. */
const decode = (text: string) =>
  text
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

/** The repository's first commit, the earliest date any page here can carry. */
const SITE_STARTED = "2026-09-17";

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

  it("dates every page, and none from the future or before this site existed", () => {
    // Google uses `lastmod` only from a sitemap whose dates are consistently
    // accurate, and this one dated the guides and docs and left the six pages
    // above them blank. A date before the site's first commit, or later than
    // today, is a date that can't be true.
    //
    // The floor was the app snapshot's `fetched` date, which refused every
    // correct page the day a sync moved the snapshot: refreshing it changes
    // no page's date, so every guide and doc written before it failed, and
    // `sync-from-app` could never finish. Narrowed per `code/testing.md` 2.5.
    const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]!);
    expect(urls.length).toBe(listed.length);
    const undated = urls.filter((url) => !/<lastmod>/.test(url));
    expect(undated, "urls with no lastmod").toEqual([]);
    const floor = SITE_STARTED;
    const today = new Date().toISOString().slice(0, 10);
    const impossible = urls
      .map((url) => [/<loc>([^<]+)/.exec(url)?.[1], /<lastmod>([^<T]+)/.exec(url)?.[1]] as const)
      .filter(([, date]) => !date || date < floor || date > today)
      .map(([loc, date]) => `${loc}: ${date}`);
    expect(impossible).toEqual([]);
  });

  it("gives every listed page a title and a description a result can show whole", () => {
    // Google shows about 160 characters of a description and about 600
    // pixels of a title, and cuts the rest; under 70, a description is
    // usually replaced with a sentence Google picks from the page. Two learn
    // guides ran past 170, so the cut fell in their second sentence, and the
    // pricing page's ran to 202 and lost its third option. 70 for a title,
    // with the site's name on the end, is about where 600 pixels runs out.
    const problems = listed.flatMap((route) => {
      const html = readFileSync(`out${route}index.html`, "utf8");
      const title = decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "");
      const description = decode(
        /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "",
      );
      return [
        ...(title.length > 70 ? [`${route} title is ${title.length}: ${title}`] : []),
        ...(description.length < 70 || description.length > 160
          ? [`${route} description is ${description.length}: ${description}`]
          : []),
      ];
    });
    expect(problems).toEqual([]);
  });

  it("names the site once in a title, because the template already adds it", () => {
    // "Self-hosting Simple Balance — Simple Balance" spent 15 of a result's
    // 70 characters saying the name a second time, and the length check above
    // passed it. Every route but the homepage gets ` — Simple Balance` from
    // the layout's template, so its own title has no reason to say it. The
    // homepage's title is absolute and leads with the name, which is the
    // search it answers, so it is the one page this doesn't apply to.
    const doubled = listed
      .filter((route) => route !== "/")
      .map((route) => {
        const html = readFileSync(`out${route}index.html`, "utf8");
        return [route, decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "")] as const;
      })
      .filter(([, title]) => title.split(site.name).length > 2)
      .map(([route, title]) => `${route}: ${title}`);
    expect(doubled).toEqual([]);
  });

  it("asks for large image previews on every listed page", () => {
    // Set once in the layout, it reached four pages of forty-five: a route's
    // `robots: undefined` replaces the layout's value in Next rather than
    // inheriting it (`src/lib/indexing.ts`).
    const missing = listed.filter(
      (route) =>
        !readFileSync(`out${route}index.html`, "utf8").includes(
          '<meta name="robots" content="max-image-preview:large"/>',
        ),
    );
    expect(missing).toEqual([]);
  });
});
