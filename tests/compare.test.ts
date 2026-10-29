import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import appFacts from "@/content/app-facts.json";
import {
  RECHECK_DAYS,
  compareChecked,
  compareIndex,
  compareUpdated,
  citations,
  dueForCheck,
  ours,
  rivals,
  rows,
  spell,
} from "@/content/compare";
import { faq as pricingFaq } from "@/content/pricing";
import { allEntries, faqItems } from "@/content/collections";
import { site } from "@/content/home";

/**
 * The comparison pages, and the docs' questions page (`content.md` 5.19 and
 * 5.13).
 *
 * A comparison says things about somebody else's product, so what a test can
 * hold is the shape of honesty rather than the facts: a source for every
 * claim, a day it was checked, Simple Balance's own column read from the
 * contract, and a page that shows every one of them. Whether a source still
 * says what the claim says is a person reading it, every three months
 * (`scripts/check-comparisons.mjs`).
 */

const { prices } = appFacts.facts.declared;
const freeLimit = appFacts.facts.derived.plans.free.accountLimit;
const column = ours({ prices, freeLimit });

/** As the page prints it: straight quotes curled, entities decoded, tags gone. */
const flat = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "’")
    .replace(/&quot;/g, "”")
    .replace(/\s+/g, " ")
    // A closing tag before a comma reads as a space here and never on screen.
    .replace(/ ([,.;:])/g, "$1");
const curl = (text: string) =>
  text
    .replace(/(^|[\s([])"/g, "$1“")
    .replace(/"/g, "”")
    .replace(/'/g, "’");

const iso = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);

describe("the comparisons' facts", () => {
  it("cover the apps people ask for an alternative to, once each", () => {
    expect(rivals.map((rival) => rival.slug)).toEqual([
      "ynab",
      "monarch",
      "quicken-simplifi",
      "actual-budget",
    ]);
  });

  it("give every claim about another app a source, unless it is a plain no", () => {
    // A "No" is an absence, which has no page to cite. Anything longer than
    // that is a statement about the product, and a statement needs a page.
    // The two lists and the moving paragraphs aren't held to it: a point
    // about Simple Balance alone has no page elsewhere to cite.
    const unsourced = rivals.flatMap((rival) =>
      rows
        .filter(({ key }) => citations(rival.them[key]).length === 0)
        .filter(({ key }) => rival.them[key].text !== "No")
        .map(({ key }) => `${rival.slug}.${key}: ${rival.them[key].text}`),
    );
    expect(unsourced).toEqual([]);
    for (const rival of rivals) {
      for (const claim of [...rival.chooseThem, ...rival.moving]) {
        expect(citations(claim).length, `${rival.slug}: ${claim.text}`).toBeGreaterThan(0);
      }
    }
  });

  it("number every source that exists, and cite every source it lists", () => {
    for (const rival of rivals) {
      const claims = [
        ...rows.map(({ key }) => rival.them[key]),
        ...rival.chooseThem,
        ...rival.chooseUs,
        ...rival.moving,
      ];
      const cited = new Set(claims.flatMap(citations));
      for (const number of cited) {
        expect(rival.sources[number! - 1], `${rival.slug} cites source ${number}`).toBeDefined();
      }
      // A listed source nothing cites is a page the reader is sent to for
      // nothing, or a claim that lost its number when it was rewritten.
      expect(cited.size, `${rival.slug} lists a source no claim cites`).toBe(rival.sources.length);
      for (const source of rival.sources) expect(source.url, rival.slug).toMatch(/^https:\/\//);
    }
  });

  it("date every page by the day its facts were read, never a future one", () => {
    for (const rival of rivals) {
      expect(rival.checked, rival.slug).toMatch(iso);
      expect(rival.checked <= today, `${rival.slug} is checked in the future`).toBe(true);
    }
    const days = rivals.map((rival) => rival.checked).toSorted();
    expect(compareChecked).toBe(days[0]);
    expect(compareUpdated).toBe(days.at(-1));
  });

  it("answer the comparison in a paragraph that names both apps", () => {
    // The paragraph an engine lifts. "It" and "they" lifted alone say
    // nothing about which app costs what.
    for (const rival of rivals) {
      const answer = rival.answer({ prices, freeLimit });
      expect(answer, rival.slug).toContain("Simple Balance");
      expect(answer, rival.slug).toContain(rival.name);
      expect(rival.title.split(site.name).length - 1, rival.slug).toBe(1);
      expect(rival.title, rival.slug).toContain(rival.name);
    }
    expect(compareIndex.answer).toContain("Simple Balance");
  });
});

describe("Simple Balance's own column", () => {
  it("quotes only the prices the application charges", () => {
    const allowed = new Set([0, Number(prices.monthly), Number(prices.yearly)]);
    const said = Object.values(column).flatMap((text) =>
      [...text.matchAll(/\$(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1])),
    );
    expect(said.length, "the column states no price").toBeGreaterThanOrEqual(2);
    expect(said.filter((figure) => !allowed.has(figure))).toEqual([]);
  });

  it("states the free plan's limit from the contract", () => {
    expect(column.free).toContain(`${spell(freeLimit)} accounts`);
    expect(spell(3)).toBe("three");
    expect(spell(12)).toBe("12");
  });

  it("reaches every answer from the contract, not from a figure typed into it", () => {
    // A contract nobody would sell: if a typed "$3" or "three" were in an
    // answer, this one would still say it.
    const other = { prices: { monthly: "7.00", yearly: "70.00" }, freeLimit: 5 };
    for (const rival of rivals) {
      const answer = rival.answer(other);
      expect(answer, rival.slug).toContain("$7 a month or $70 a year for Premium");
      expect(answer, rival.slug).toContain("free for five accounts");
      expect(answer, rival.slug).not.toMatch(new RegExp(`\\$${Number(prices.monthly)}(?!\\d)`));
    }
  });

  it("says plainly that it doesn't connect to a bank", () => {
    expect(column.in).toContain("There's no bank connection.");
  });
});

describe("the re-check", () => {
  const page = { slug: "x", name: "X", checked: "2026-01-01" };

  it("is due the day after the window closes, and not on the day it does", () => {
    // 2026-01-01 plus 90 days is 2026-04-01.
    expect(dueForCheck([page], "2026-04-01")).toEqual([]);
    expect(dueForCheck([page], "2026-04-02")).toEqual([page]);
    expect(RECHECK_DAYS).toBe(90);
  });

  it("lists the oldest first", () => {
    const older = { ...page, slug: "y", checked: "2025-06-01" };
    expect(dueForCheck([page, older], "2026-12-01").map((due) => due.slug)).toEqual(["y", "x"]);
  });
});

describe("the built comparison pages", () => {
  it("show every claim, its source and the day it was checked", () => {
    for (const rival of rivals) {
      const html = readFileSync(`out/compare/${rival.slug}/index.html`, "utf8");
      const text = flat(html);
      for (const { key, label } of rows) {
        expect(text, `${rival.slug} ${label}`).toContain(curl(rival.them[key].text));
        expect(text, `${rival.slug} ours ${label}`).toContain(curl(column[key]));
      }
      for (const [index, source] of rival.sources.entries()) {
        expect(html, `${rival.slug} source ${index + 1}`).toContain(
          `id="source-${index + 1}"><a href="${source.url.replaceAll("&", "&amp;")}"`,
        );
      }
      expect(html).toContain(`<time dateTime="${rival.checked}">`);
      expect(html).toContain(
        `<link rel="alternate" type="text/markdown" href="https://${site.domain}/compare/${rival.slug}/index.md"/>`,
      );
    }
  });

  it("are listed from the index and the footer", () => {
    const index = readFileSync("out/compare/index.html", "utf8");
    for (const rival of rivals) expect(index).toContain(`href="/compare/${rival.slug}/"`);
    const home = readFileSync("out/index.html", "utf8");
    expect(/<footer[\s\S]*href="\/compare\/"[\s\S]*<\/footer>/.test(home)).toBe(true);
  });

  it("have a Markdown copy with every claim and every source, linked from /llms.txt", () => {
    const llms = readFileSync("out/llms.txt", "utf8");
    for (const rival of rivals) {
      const path = `out/compare/${rival.slug}/index.md`;
      expect(existsSync(path), path).toBe(true);
      const copy = readFileSync(path, "utf8");
      expect(copy.split("\n")[0]).toBe(`# ${rival.title}`);
      for (const { key } of rows) {
        expect(copy, `${rival.slug}.${key}`).toContain(rival.them[key].text);
      }
      for (const source of rival.sources) expect(copy).toContain(`(${source.url})`);
      expect(copy, "a copy links back into the site only by full address").not.toMatch(
        /\]\((\/|#)/,
      );
      expect(llms).toContain(`(https://${site.domain}/compare/${rival.slug}/index.md)`);
    }
  });

  it("describe themselves as an article about both apps, dated by the check", () => {
    for (const rival of rivals) {
      const html = readFileSync(`out/compare/${rival.slug}/index.html`, "utf8");
      const article = [
        ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
      ]
        .map(([, json]) => JSON.parse(json!) as Record<string, unknown>)
        .find((node) => node["@type"] === "Article");
      expect(article, rival.slug).toBeDefined();
      expect(article!.dateModified).toBe(rival.checked);
      expect(JSON.stringify(article!.about)).toContain(`"@id":"https://${site.domain}/#app"`);
      expect(JSON.stringify(article!.about)).toContain(`"name":"${rival.name}"`);
    }
  });
});

describe("the questions page in the docs", () => {
  it("reads a question as a second-level heading ending in a question mark", () => {
    const body = [
      "Opening.",
      "",
      "## Is it free?",
      "",
      "Yes, [mostly](/pricing/). Press **Export CSV** or `npm`.",
      "",
      "```sh",
      "## not a heading?",
      "```",
      "",
      "## Where to go next",
      "",
      "Somewhere.",
      "",
      "## Can't it?",
      "",
      "It can't.",
    ].join("\n");
    const items = faqItems(body);
    // The fenced line is code, and the heading without a question mark ends
    // the answer before it rather than joining it.
    expect(items.map((item) => item.q)).toEqual(["Is it free?", "Can’t it?"]);
    expect(items[0]!.a.startsWith("Yes, mostly. Press Export CSV or npm.")).toBe(true);
    expect(items[0]!.a).not.toContain("Somewhere");
    expect(items[1]!.a).toBe("It can’t.");
  });

  const faqPages = allEntries("docs").filter((entry) => entry.frontmatter.extra?.faq === true);

  it("is the one docs page that marks up its questions", () => {
    expect(faqPages.map((entry) => entry.slug)).toEqual(["frequently-asked-questions"]);
  });

  it("marks up exactly the questions and answers a reader sees", () => {
    const html = readFileSync("out/docs/frequently-asked-questions/index.html", "utf8");
    const text = flat(html);
    const markup = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(([, json]) => JSON.parse(json!) as Record<string, unknown>)
      .find((node) => node["@type"] === "FAQPage") as
      { mainEntity: { name: string; acceptedAnswer: { text: string } }[] } | undefined;
    expect(markup).toBeDefined();
    expect(markup!.mainEntity.length).toBeGreaterThanOrEqual(10);
    for (const { name, acceptedAnswer } of markup!.mainEntity) {
      expect(text, name).toContain(name);
      expect(text, name).toContain(acceptedAnswer.text);
    }
  });

  it("asks nothing the pricing page already marks up", () => {
    // Google's guidance: a question repeated across a site is marked up once.
    const pricing = new Set(pricingFaq.map((item) => item.q));
    const docs = faqItems(faqPages[0]!.body).map((item) => item.q);
    expect(docs.filter((q) => pricing.has(q))).toEqual([]);
  });
});
