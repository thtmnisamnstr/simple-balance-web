import { describe, expect, it } from "vitest";
import * as content from "@/content/home";
import * as pricingContent from "@/content/pricing";

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
    // The whole reason the control is a label rather than a link. One to
    // anywhere in the copy would 404 for every reader.
    const linking = all.filter(
      ([path, text]) => path !== "content.site.appUrl" && text.includes("app.smpl.money"),
    );
    expect(linking).toEqual([]);
  });

  it("says what is coming, not merely that something is", () => {
    // "Coming soon" answered neither question a reader has: what, and why
    // wait. `web.md` 6.2. This asserts the shape rather than the exact
    // words, so rewording stays free and going back to two empty words
    // does not.
    const label = content.hero.primaryLabel;
    expect(label.length, `"${label}" is too short to name anything`).toBeGreaterThan(12);
    expect(label.toLowerCase()).not.toBe("coming soon");
    expect(label.length, `"${label}" will not fit a button`).toBeLessThanOrEqual(24);
  });

  it("uses the same pending label everywhere", () => {
    // A header saying one thing and a pricing button saying another
    // describes two different states.
    const labels = new Set(
      all.filter(([, text]) => /\bsoon\b/i.test(text) && text.length <= 24).map(([, text]) => text),
    );
    expect([...labels]).toEqual([content.hero.primaryLabel]);
  });

  it("publishes exactly one contact address", () => {
    // Two was the previous design and `content.md` 4.1 records why it was
    // wrong for this surface. This asserts the count, not just the value, so
    // adding a second is a decision with a failing test attached.
    expect(content.contact.address).toBe("info@smpl.money");
    const addresses = all
      .flatMap(([, text]) => [...text.matchAll(/[\w.]+@smpl\.money/g)].map((m) => m[0]))
      .filter((address, index, list) => list.indexOf(address) === index);
    expect(addresses).toEqual(["info@smpl.money"]);
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

describe("the claim this site must never make", () => {
  /*
   * `docs/standards/content.md` 1.5. There is no bank connection — no login,
   * nothing in the background, nothing that goes stale without saying so —
   * and a reader arriving from any competitor assumes the opposite, because
   * every hosted competitor works that way.
   *
   * **Narrow on purpose.** The obvious spelling of this bans "connect" and
   * "sync", and it fires on correct copy: the page says "nothing to connect
   * and nothing to break", "no connection to any bank to maintain", and "you
   * can connect an AI assistant". Those are the denial and a different
   * subject. `code/testing.md` 2.5 — a check that fires on correct code gets
   * narrowed rather than obeyed, so this matches only the affirmative
   * constructions, where the product is the thing doing the fetching.
   *
   * It covers the pricing page as well as the homepage, because 1.5 does.
   */
  const IMPLIES_A_CONNECTION = [
    // `link(s|ed|ing)?`, not `linked?` — the latter is "linke" with an
    // optional "d" and never matched the bare "Link your accounts", which is
    // the commonest phrasing of all. The fixture below found it.
    /\b(connect(s|ed|ing)?|link(s|ed|ing)?)\s+(to\s+)?(your\s+)?(bank|accounts?|institution)/i,
    /\b(syncs?|syncing|synced|synchroni[sz]e)/i,
    /\bautomatically\s+(updated?|imported?|fetch|pulls?|refreshe?d?)/i,
    /\b(kept|keeps?)\s+up\s+to\s+date\b/i,
    /\breal[\s-]time\b/i,
    /\blive\s+balances?\b/i,
    /\bset\s+it\s+and\s+forget\s+it\b/i,
  ];

  const everything = [...strings(content), ...strings(pricingContent, "pricing")];

  it("has both pages' copy to check", () => {
    expect(everything.length).toBeGreaterThan(80);
  });

  it("never implies the product logs in to a bank", () => {
    const offenders: string[] = [];
    for (const [path, text] of everything) {
      for (const pattern of IMPLIES_A_CONNECTION) {
        const hit = pattern.exec(text);
        if (hit) offenders.push(`${path}: "${hit[0]}" — ${text.slice(0, 60)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("still allows the sentences that are about something else", () => {
    /*
     * A guard on the guard: proof the patterns above have not been widened
     * into a ban on the word rather than the claim.
     *
     * It used to assert that a particular sentence was still in the copy,
     * which made it fail the moment that sentence was rewritten — the same
     * coupling `code/testing.md` 2.6 is about, in miniature. Fixtures test
     * the patterns directly and do not care what the page currently says.
     */
    const allowed = [
      "There is nothing to connect and nothing to break.",
      "You can connect an AI assistant and let it bring a statement in.",
      "no connection to any bank to maintain",
      "Money moved between two of your own accounts shows as one line.",
    ];
    for (const sentence of allowed) {
      const hit = IMPLIES_A_CONNECTION.find((pattern) => pattern.test(sentence));
      expect(hit, `the ban is too wide: it would reject "${sentence}"`).toBeUndefined();
    }
  });

  it("catches the claim however it is phrased", () => {
    // The other half: fixtures a competitor's page would carry happily.
    const banned = [
      "It connects to your bank and files everything.",
      "Link your accounts and we do the rest.",
      "Your balances are kept up to date.",
      "It syncs overnight.",
      "See live balances as they change.",
      "Set it and forget it.",
    ];
    for (const sentence of banned) {
      const hit = IMPLIES_A_CONNECTION.find((pattern) => pattern.test(sentence));
      expect(hit, `the ban misses "${sentence}"`).toBeDefined();
    }
  });
});
