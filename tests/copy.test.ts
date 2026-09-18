import { describe, expect, it } from "vitest";
import * as content from "@/content/home";

/**
 * The copy, held to `docs/standards/content.md`.
 *
 * These read the content module rather than the rendered page, which is the
 * point of keeping copy as data: a sentence can be checked before anybody
 * decides what it looks like.
 */

/** Every string anywhere in the content module, with the path that reached it. */
function strings(value: unknown, path = "content"): readonly (readonly [string, string])[] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => strings(v, `${path}.${k}`));
  }
  return [];
}

const all = strings(content);

describe("the homepage copy", () => {
  it("found strings to check", () => {
    // A population check. Without it every assertion below passes vacuously
    // the day the content module is renamed or restructured.
    expect(all.length).toBeGreaterThan(40);
  });

  it("uses none of the marketing words the standard bans", () => {
    // `docs/standards/content.md` 1.1 holds the list and the argument: each of
    // these asks the reader to feel something instead of telling them
    // something, and a ledger is bought on trust.
    const BANNED =
      /\b(seamless|effortless|revolutionary|game.chang\w*|cutting.edge|best.in.class|world.class|unlock|empower\w*|leverage|supercharge|delight\w*|magical?|simply put|robust|blazing|10x|next.generation|synergy|paradigm)\b/i;

    const offenders = all
      .filter(([, text]) => BANNED.test(text))
      .map(([path, text]) => `${path}: ${BANNED.exec(text)?.[0]} — ${text.slice(0, 60)}`);

    expect(offenders).toEqual([]);
  });

  it("never claims the product is simple, easy or fast", () => {
    // 1.2. A claim of simplicity is the reader's to make, not the page's.
    //
    // The product is *called* Simple Balance and its repository is
    // `simple-balance`, so the naive spelling of this check reports the
    // product name and every URL containing it. Both are removed before the
    // test rather than excluded by path, because the name occurs inside
    // sentences too — a path-based exception list would have covered
    // `site.name` and missed `agents.body`.
    const offenders = all
      .filter(([, text]) => {
        const prose = text.replaceAll(content.site.name, "").replace(/https?:\/\/\S+/g, "");
        return /\b(easy|easily|simple|simply|fast|quick(ly)?)\b/i.test(prose);
      })
      .map(([path, text]) => `${path}: ${text.slice(0, 70)}`);

    expect(offenders).toEqual([]);
  });

  it("writes headings as sentences, not Title Case", () => {
    const headings = [
      content.hero.title,
      content.privacy.title,
      content.agents.title,
      ...content.problems.map((p) => p.problem),
      ...content.features.map((f) => f.title),
    ];

    const titleCased = headings.filter((heading) => {
      const words = heading.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
      const capitalised = words.filter((w) => /^[A-Z]/.test(w));
      // Two or more capitals past the first word reads as Title Case. One is a
      // proper noun and fine.
      return capitalised.length > 2;
    });

    expect(titleCased).toEqual([]);
  });

  it("does not offer a link to the app while the app is not deployed", () => {
    // The whole reason the control says "Coming soon". A link to app.smpl.money
    // anywhere in the copy would 404 for every reader.
    const linking = all.filter(
      ([path, text]) => path !== "content.site.appUrl" && text.includes("app.smpl.money"),
    );
    expect(linking).toEqual([]);
    expect(content.hero.primaryLabel).toBe("Coming soon");
  });

  it("labels both contact addresses", () => {
    const addresses = content.contact.lines.map((line) => line.address);
    expect(addresses).toEqual(["info@smpl.money", "support@smpl.money"]);
    for (const line of content.contact.lines) {
      expect(line.label.length, `${line.address} needs a label saying which it is`).toBeGreaterThan(
        2,
      );
    }
  });

  it("has no doubled spaces or stray whitespace", () => {
    // The terminal sample is preformatted: its leading spaces are the
    // indentation of a command's output and are the one place in the content
    // module where repeated whitespace is the content.
    const offenders = all
      .filter(([path]) => !path.startsWith("content.agents.sample"))
      .filter(([, text]) => /\s\s/.test(text) || text !== text.trim())
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});

describe("the page title", () => {
  it("survives a search result without losing the half that says what it is", () => {
    // Result listings truncate near sixty characters. The full tagline
    // appended to the product name runs to seventy-nine.
    const title = `${content.site.name} — ${content.site.titleTagline}`;
    expect(title.length, `"${title}" is ${title.length} characters`).toBeLessThanOrEqual(60);
    expect(title).toContain(content.site.name);
  });

  it("names the product, not the domain, in the tab", () => {
    // The domain is in the address bar already; a tab that spends its first
    // characters repeating it tells the reader nothing new.
    expect(content.site.titleTagline).not.toContain(content.site.domain);
  });
});
