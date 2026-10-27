import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allEntries } from "@/content/collections";
import { site } from "@/content/home";
import appFacts from "@/content/app-facts.json";

/**
 * The structured data, read from the built pages (`content.md` 5.13).
 *
 * It's the one thing every page carries that no reader sees, so nothing but
 * a test notices when it goes wrong: a price typed into it that the
 * application stopped charging, a rating somebody thought would help, an
 * image that was never drawn. Read from `out/` rather than from the
 * component, because what an engine reads is the escaped JSON in the
 * markup, and a payload that doesn't parse there is the failure to catch.
 */

const base = `https://${site.domain}`;

function pages(dir = "out"): readonly string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "_next" ? [] : pages(full);
    return entry === "index.html" ? [full] : [];
  });
}

type Node = Record<string, unknown> & { "@type"?: string; "@id"?: string };

/** Every JSON-LD payload on a page, parsed, with any `@graph` flattened. */
function nodes(path: string): readonly Node[] {
  const html = readFileSync(path, "utf8");
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(
    ([, json]) => {
      const data = JSON.parse(json!) as Node & { "@graph"?: Node[] };
      return data["@graph"] ?? [data];
    },
  );
}

const ofType = (list: readonly Node[], type: string) =>
  list.filter((node) => node["@type"] === type);

describe("the structured data", () => {
  const built = pages();
  const home = nodes("out/index.html");

  it("parses on every page, and claims no rating or review anywhere", () => {
    // Google's policy calls markup for what a reader can't see spam, and a
    // rating this product hasn't been given is the classic case.
    expect(built.length).toBeGreaterThan(30);
    for (const path of built) {
      const text = JSON.stringify(nodes(path));
      expect(text, path).not.toMatch(/aggregateRating|"review"|"Review"/);
    }
  });

  it("describes the site, its publisher and the application once, on the homepage", () => {
    const [org] = ofType(home, "Organization");
    const [website] = ofType(home, "WebSite");
    const [app] = ofType(home, "WebApplication");
    expect(org?.["@id"]).toBe(`${base}/#org`);
    // The domain is a name people type, and the site-name docs ask for it.
    expect(website?.alternateName).toBe(site.domain);
    expect(app?.["@id"]).toBe(`${base}/#app`);
    expect(app?.url).toBe(site.appUrl);
    expect(ofType(home, "SoftwareSourceCode")[0]?.codeRepository).toBe(site.sourceUrl);
  });

  it("quotes the application's own prices in its offers", () => {
    // `tests/app-facts.test.ts` sweeps the markup a reader sees; this is the
    // same price in the markup a reader doesn't.
    const [app] = ofType(home, "WebApplication");
    const offers = app?.offers as readonly { price: string; name: string }[];
    const { monthly, yearly } = appFacts.facts.declared.prices;
    expect(offers.map((offer) => offer.price).toSorted()).toEqual(
      ["0", monthly, yearly].toSorted(),
    );
  });

  it("gives every guide and docs page its article, its card and its breadcrumbs", () => {
    for (const [key, type] of [
      ["learn", "Article"],
      ["docs", "TechArticle"],
    ] as const) {
      for (const entry of allEntries(key)) {
        const url = `${base}/${key}/${entry.slug}/`;
        const list = nodes(`out/${key}/${entry.slug}/index.html`);
        const [article] = ofType(list, type);
        expect(article?.url, url).toBe(url);
        expect(article?.headline, url).toBe(entry.frontmatter.title);
        // The guides credit nobody (5.14), and the docs never did.
        expect(article, url).not.toHaveProperty("author");
        const image = String(article?.image);
        expect(existsSync(image.replace(base, "out")), image).toBe(true);
        const [crumbs] = ofType(list, "BreadcrumbList");
        const items = crumbs?.itemListElement as readonly { item: string }[];
        expect(items.at(-1)?.item, url).toBe(url);
      }
    }
  });

  it("ties every docs page to the application the homepage describes", () => {
    for (const entry of allEntries("docs")) {
      const [article] = ofType(nodes(`out/docs/${entry.slug}/index.html`), "TechArticle");
      expect(article?.about, entry.slug).toEqual({ "@id": `${base}/#app` });
    }
  });
});
