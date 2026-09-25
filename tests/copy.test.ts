import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import * as content from "@/content/home";
import * as pricingContent from "@/content/pricing";
import * as legalContent from "@/content/legal";
import * as notFoundContent from "@/content/not-found";
import * as sectionsContent from "@/content/sections";
import { formatDate } from "@/lib/format";
import { openGraph } from "@/app/open-graph";
import NotFound, { metadata as notFoundMetadata } from "@/app/not-found";
import { feedAlternates } from "@/lib/feed";
import { GET as rssFeed } from "@/app/blog/feed.xml/route";
import { GET as atomFeed } from "@/app/blog/atom.xml/route";
import { GET as jsonFeed } from "@/app/blog/feed.json/route";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { serialize } from "next-mdx-remote/serialize";
import { remarkPlugins } from "@/components/prose";
import { sourceFiles } from "./support/source";

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

/**
 * Every hit of `pattern` in the Markdown under `content/`, the blog and the
 * docs.
 *
 * **Two passes, because the first one has a blind spot.** Reading line by
 * line gives a line number, which is what makes a failure actionable, and
 * it cannot see a phrase Markdown has wrapped: a blog post carried "your
 * own current\naccount", which a reader sees as "current account" and a
 * per-line check never matches. So the whole file is swept again with its
 * whitespace collapsed, at the cost of a line number on that one.
 *
 * `view` rewrites each file before either pass reads it, and has to leave
 * every line where it was so the line numbers still point at the source.
 */
function inMarkdown(
  pattern: RegExp,
  view: (markdown: string) => string = (markdown) => markdown,
): readonly string[] {
  const offenders: string[] = [];
  for (const file of sourceFiles("content", /\.md$/)) {
    const code = view(file.code);
    for (const [index, line] of code.split("\n").entries()) {
      const hit = pattern.exec(line);
      if (hit) offenders.push(`${file.path}:${index + 1} ${hit[0]}`);
    }
    const wrapped = pattern.exec(code.replaceAll(/\s+/g, " "));
    if (wrapped && !offenders.some((o) => o.startsWith(file.path))) {
      offenders.push(`${file.path} (wrapped across lines) ${wrapped[0]}`);
    }
  }
  return offenders;
}

/**
 * The Markdown with what MDX publishes as typed blanked out, line for line.
 *
 * A fenced block, an inline code span and a link's destination reach the page
 * character for character, so `--no-owner` in a code span is a flag and not a
 * dash. The frontmatter is left in: a title is shown exactly as typed, so
 * `--` or `&mdash;` there reads as ASCII or as a raw entity, which is wrong
 * either way. A component's attributes and an image's alt text are left in
 * for the same reason.
 */
function withoutCode(markdown: string): string {
  let fence: string | undefined;
  return markdown
    .split("\n")
    .map((line) => {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
      if (fence === undefined) {
        if (marker === undefined) return line;
        fence = marker;
        return "";
      }
      const closes =
        marker !== undefined && marker[0] === fence[0] && marker.length >= fence.length;
      if (closes && line.trim() === marker) fence = undefined;
      return "";
    })
    .join("\n")
    .replaceAll(/(`+)(?!`)(?:[^\n]|\n(?![^\S\n]*\n))*?[^`]\1(?!`)/g, blank)
    .replaceAll(/\]\([^)]*\)/g, (link) => `](${blank(link.slice(2))}`);
}

/** `text` with every character but a line break turned into a space. */
function blank(text: string): string {
  return text.replaceAll(/[^\n]/g, " ");
}

/**
 * What remark-smartypants turns into an em dash, typed some other way.
 *
 * `prose.tsx` runs every post and docs page through it, and its second pass
 * keeps retext-smartypants' default `dashes: true`: exactly two hyphens
 * become an em dash wherever they stand, `one--two` and a `--flag` in a
 * sentence included, and a backslash escaping either hyphen changes nothing.
 * Three or more are left as typed, which is what keeps a table's delimiter
 * row and the frontmatter fence out of this. MDX decodes a character
 * reference, in text and in a component's attribute alike, so `&mdash;`,
 * `&#8212;` and `&#x2014;` are the character itself. A JavaScript expression
 * would be one more spelling, but `MDXRemote` strips expressions before
 * anything renders.
 */
const TYPED_EM_DASH = /(?<![-\\])(?:\\?-){2}(?!\\?-)|&mdash;|&#0*8212;|&#[xX]0*2014;/;

/** Every page the build emitted, discovered rather than listed. */
function emittedPages(dir: string): readonly string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "_next" ? [] : emittedPages(full);
    return entry === "index.html" || entry === "404.html" ? [full] : [];
  });
}

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
      const capitalized = words.filter((w) => /^[A-Z]/.test(w));
      // Two or more capitals past the first word reads as Title Case. One is a
      // proper noun and fine.
      return capitalized.length > 2;
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

describe("the reader is American", () => {
  /*
   * `docs/standards/content.md` 1.6. The site prices in US dollars and the
   * application's own screens say Checking; the copy said "current account",
   * and `layout.tsx` declared `en_GB` to every crawler and link preview.
   *
   * **The rule's own first draft argued this could not be mechanized**,
   * on the grounds that "a word list would catch the spellings and miss the
   * register". That is an argument for a word list on the spellings, not
   * against one. The register — contractions, whether it sounds like
   * somebody talking — is what stays `human`, exactly as 1.4 does. The
   * spellings are this.
   */
  /*
   * `analys`, `realis` and `organis` exclude the American words that share
   * the stem, because each stem is also the start of one: analysis, analyst,
   * analyses, realistic, realism, realist, organism. Listing the British
   * endings instead lost the ones nobody listed, organisational, realisable
   * and analysable among them. `analyses` is excluded as the plural of
   * analysis, so the British verb is caught as analyse, analysed and
   * analysing, and not in "it analyses". `code/testing.md` 2.5.
   */
  const BRITISH =
    /\b(recognis\w+|organis(?!m)\w+|personalis\w+|analys(?!is\b|ts?\b|es\b)\w+|apologis\w+|realis(?![tm])\w+|cancelling|colour\w*|behaviour\w*|favour\w*|whilst|licence|centre|catalogue|programme|cheque|grey|per cent|current account)\b/i;

  /*
   * Words rather than spellings. Each is spelled the same on both sides of
   * the Atlantic and is still a British sentence: an American checks a box,
   * keeps using something, can be reached, and saves in a retirement account.
   * The spelling pass could not see any of them, and all four survived it.
   *
   * `carr(y|ies|ied|ying) on` rather than `carry`, because "carries the
   * remainder" and "carries one logo" are the ordinary verb.
   */
  const BRITISH_WORDS =
    /\b(tick ?box(es)?|tick(s|ed|ing)? the box|carr(y|ies|ied|ying) on|contactable|a pension)\b/i;

  /*
   * A price in the wrong currency. The site sells in dollars, and a blog
   * post pricing its example in pounds tells an American reader the product
   * was not written for them, on the page that is meant to persuade them it
   * was.
   *
   * The euro is deliberately not here: the product holds more than one
   * currency and its screenshots show a euro payment, so a sentence about a
   * second currency is describing the product. What this catches is a British
   * writer's default unit.
   *
   * The pound sign sits outside the `\b` group because it is not a word
   * character. `\b£` needs a letter or digit on one side of it and never
   * matches "£40" after a space, so written inside the group it would pass
   * every price it exists to catch.
   */
  const NOT_DOLLARS = /\b(pounds?|pence|sterling|quid)\b|£/i;

  /**
   * Every string a reader sees: the two marketing pages, the legal pages, the
   * 404, and the blog's and docs' own headings and empty states.
   */
  const readerFacing = [
    ...strings(content),
    ...strings(pricingContent, "pricing"),
    ...strings(legalContent, "legal"),
    ...strings(notFoundContent, "not-found"),
    ...strings(sectionsContent, "sections"),
  ];

  function inCopy(pattern: RegExp): readonly string[] {
    return readerFacing
      .filter(([, text]) => pattern.test(text))
      .map(([path, text]) => `${path}: ${pattern.exec(text)?.[0]} — ${text.slice(0, 50)}`);
  }

  it("has copy to check", () => {
    expect(readerFacing.length).toBeGreaterThan(150);
    expect(sourceFiles("content", /\.md$/).length).toBeGreaterThan(5);
  });

  it("uses American spelling everywhere a reader can see", () => {
    expect(inCopy(BRITISH)).toEqual([]);
  });

  it("uses American spelling in the published Markdown too", () => {
    // `content/` is the blog and the docs. The docs said "a current account,
    // a savings account" — both British and a disagreement with the
    // application's own interface — on the page that explains what an
    // account is.
    expect(inMarkdown(BRITISH)).toEqual([]);
  });

  it("uses American words, not only American spelling", () => {
    expect(inCopy(BRITISH_WORDS)).toEqual([]);
    expect(inMarkdown(BRITISH_WORDS)).toEqual([]);
  });

  it("prices every example in dollars", () => {
    expect(inCopy(NOT_DOLLARS)).toEqual([]);
    expect(inMarkdown(NOT_DOLLARS)).toEqual([]);
  });

  it("catches the words it is for, and only those", () => {
    // Fixtures, so the patterns are tested directly rather than through
    // whatever the page happens to say today. `code/testing.md` 2.6.
    const british = [
      "Set a limit and tick the box.",
      "The tickbox carries the remainder forward.",
      "A tick box beside each row.",
      "Choose three you carry on using.",
      "The operator is contactable by email.",
      "A mortgage, a pension, a car loan.",
    ];
    for (const sentence of british) {
      expect(BRITISH_WORDS.test(sentence), `misses "${sentence}"`).toBe(true);
    }
    const notDollars = ["It cost £40.", "Forty pounds comes back.", "Ten pence.", "In sterling."];
    for (const sentence of notDollars) {
      expect(NOT_DOLLARS.test(sentence), `misses "${sentence}"`).toBe(true);
    }
    const britishSpellings = [
      "Analyse a month of spending.",
      "It analysed the statement.",
      "Analysing every row.",
      "You realise the total is wrong.",
      "It realised a gain.",
      "The realisation came later.",
      "Organise the categories.",
      "It organises the payees.",
      "The organisational chart.",
      "The organiser of the household.",
      "A realisable gain.",
      "An analysable statement.",
    ];
    for (const sentence of britishSpellings) {
      expect(BRITISH.test(sentence), `misses "${sentence}"`).toBe(true);
    }
    const allowed = [
      "Check the box to carry the remainder into next month.",
      "It carries the remainder forward, and carries one logo.",
      "Keep using the three you choose.",
      "A savings account in euros, compounded monthly.",
      "Forty dollars comes back.",
      "The analysis shows where it went.",
      "Ask an analyst, or read the analyses yourself.",
      "Start from a realistic budget.",
      "It's realism, not pessimism.",
      "A ledger is an organism of its own.",
      "Organisms and analysts, realists all.",
      "Realistically, it's a month.",
    ];
    for (const sentence of allowed) {
      expect(BRITISH.test(sentence), `too wide: "${sentence}"`).toBe(false);
      expect(BRITISH_WORDS.test(sentence), `too wide: "${sentence}"`).toBe(false);
      expect(NOT_DOLLARS.test(sentence), `too wide: "${sentence}"`).toBe(false);
    }
  });

  it("dates a page the way an American writes a date", () => {
    // Month first. `en-GB` rendered "Last updated 18 September 2026" on the
    // terms and the privacy policy, and on every post and docs page.
    expect(formatDate("2026-09-18")).toBe("September 18, 2026");
  });

  it("draws the social card from the copy, not from a third tagline", () => {
    /*
     * The card carried its headline and tagline as literals. By the time
     * anybody looked, the copy had been rewritten four times and the card was
     * advertising a sentence that appeared nowhere on the site.
     *
     * It reads `src/content/home.ts` now, so this asserts the mechanism
     * rather than the words: no literal, and the page's own strings present.
     */
    const script = readFileSync("scripts/build-images.mjs", "utf8");
    expect(script, "the card should read the title, not carry one").toContain('pick("title")');
    expect(script).toContain('pick("titleTagline")');
  });

  it("tells a crawler the locale the copy is actually written in", () => {
    // Nothing caught `locale: "en_GB"` on a page priced in US dollars, and
    // the document itself said only `lang="en"`.
    const page = { title: "t", description: "d", url: "/t/" };
    expect(openGraph(page).locale).toBe("en_US");
    // The page's own block is what used to drop it, so an article-shaped
    // block is the case worth asserting.
    expect(openGraph({ ...page, type: "article" }).locale).toBe("en_US");
    expect(readFileSync("src/app/layout.tsx", "utf8")).toContain('<html lang="en-US">');
  });

  it("tells a feed reader the same", async () => {
    // Each format has its own place for it. RSS and JSON Feed said `en`, and
    // the Atom feed declared no language at all.
    expect(await (await rssFeed()).text()).toContain("<language>en-us</language>");
    expect(await (await atomFeed()).text()).toContain('xml:lang="en-US"');
    expect(JSON.parse(await (await jsonFeed()).text()).language).toBe("en-US");
  });

  it("gives every route a link preview of its own", () => {
    /*
     * Next replaces a parent's `openGraph` rather than merging it, so this is
     * two faults with one cause. A route writing its own block by hand drops
     * the locale, the site name and the card image; a route writing none
     * inherits the homepage's title and address. `openGraph()` in
     * `src/app/open-graph.ts` is the remedy for both, and this is what stops
     * a new route bypassing it. The homepage alone uses the root layout's.
     */
    const routes = sourceFiles("src/app", /^(page|not-found|layout)\.tsx$/);
    expect(routes.length).toBeGreaterThan(10);
    const byHand = routes.filter((file) => /openGraph:\s*\{/.test(file.code));
    expect(byHand.map((file) => file.path)).toEqual([]);
    const inheriting = routes
      .filter((file) => file.path !== "src/app/page.tsx")
      .filter((file) => !/openGraph:\s*openGraph\(/.test(file.code));
    expect(inheriting.map((file) => file.path)).toEqual([]);
  });

  it("carries the locale on every page the build emitted", () => {
    /*
     * The artifact rather than the intent: this reads `out/`, which
     * `npm run verify` builds before it tests. It found ten pages with no
     * `og:locale` at all, because each declared an Open Graph block of its
     * own, and nine more whose preview named the homepage's address.
     */
    const pages = emittedPages("out");
    expect(pages.length, "nothing built in out/").toBeGreaterThan(15);
    const offenders: string[] = [];
    for (const path of pages) {
      const html = readFileSync(path, "utf8");
      if (!/<meta property="og:locale" content="en_US"\s*\/?>/.test(html)) {
        offenders.push(`${path}: no og:locale en_US`);
      }
      if (!/<html[^>]*\slang="en-US"/.test(html)) offenders.push(`${path}: no lang="en-US"`);
      // Where a page names an address, it is its own. An inherited block
      // named the homepage's, which is the one address guaranteed wrong.
      const url = /<meta property="og:url" content="([^"]*)"/.exec(html)?.[1];
      const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
      if (url && canonical && url !== canonical) {
        offenders.push(`${path}: og:url ${url} is not the canonical ${canonical}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps the em dash out of the copy, whatever the guides do", () => {
    /*
     * Seventeen of them in 2,349 words was the loudest tell in the rewrite,
     * and the count is the point rather than the character: one em dash is
     * punctuation, seventeen is a voice. The guides in `docs/` use them
     * freely and should — they are prose for somebody reading closely, not
     * copy for somebody skimming. The legal pages and the 404 are copy, and
     * so is every post and docs page under `content/`, which `content.md`
     * 1.6 names and this used to leave unread.
     *
     * The Markdown is read for the character and then for what the pipeline
     * makes into one. Reading only the character passed "One more thing --
     * this.", which every post and docs page publishes as an em dash.
     */
    const offenders = readerFacing
      .filter(([, text]) => text.includes("\u2014"))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
    expect(inMarkdown(/\u2014/)).toEqual([]);
    expect(inMarkdown(TYPED_EM_DASH, withoutCode)).toEqual([]);
  });

  it("reads an em dash the way the pipeline writes one", async () => {
    /*
     * Fixtures, compiled with the site's own remark plugins, so the pattern
     * above is held to the renderer rather than to a reading of its source.
     * `code/testing.md` 2.6. A change to `prose.tsx`, such as
     * `dashes: "oldschool"`, fails here instead of leaving the check
     * describing a pipeline that has gone.
     */
    const rendersOne = [
      "One -- two.",
      "One--two.",
      "Run it with --dry-run.",
      "A thing --\nthis.",
      "One \\-\\- two.",
      "One &mdash; two.",
      "One &#8212; two.",
      "One &#x2014; two.",
      "One &#X02014; two.",
      "# A heading -- here",
      "[a -- b](https://example.com/)",
      "| a -- x | b |\n| --- | --- |\n| 1 | 2 |",
      '<Callout title="a &mdash; b">x</Callout>',
      "One\u2014two.",
    ];
    const rendersNone = [
      "One --- two.",
      "One - two, one \u2013 two.",
      "One &amp;mdash; two.",
      "`a -- b` in code, and `--no-owner`.",
      "```sh\nnpm run seed -- --dry-run\n```",
      "~~~\na -- b\n~~~",
      "| a | b |\n| --- | --- |\n| 1 | 2 |",
      "[a link](https://example.com/a--b)",
    ];
    const cases = [
      ...rendersOne.map((markdown) => [markdown, true] as const),
      ...rendersNone.map((markdown) => [markdown, false] as const),
    ];
    const compiled = await Promise.all(
      cases.map(([markdown]) => serialize(markdown, { mdxOptions: { remarkPlugins } })),
    );
    for (const [index, [markdown, expected]] of cases.entries()) {
      const compiledSource = compiled[index]?.compiledSource ?? "";
      const label = JSON.stringify(markdown);
      expect(/\u2014|\\u2014/.test(compiledSource), `the pipeline changed: ${label}`).toBe(
        expected,
      );
      const read = /\u2014/.test(markdown) || TYPED_EM_DASH.test(withoutCode(markdown));
      expect(read, `${expected ? "misses" : "too wide:"} ${label}`).toBe(expected);
    }
  });
});

describe("the 404", () => {
  it("offers the homepage's way to run it yourself, in the homepage's words", () => {
    // It said "Get the source", the label the homepage retired because a
    // general reader cannot tell what it offers them, and it said it in
    // markup no copy test could read.
    render(createElement(NotFound));
    const link = screen.getByRole("link", { name: content.hero.secondaryLabel });
    expect(link).toHaveAttribute("href", content.site.sourceUrl);
    expect(screen.queryByText(/get the source/i)).toBeNull();
  });

  it("names no canonical, because it is served at every address that does not exist", () => {
    /*
     * Next replaces `alternates` rather than merging it, so a 404 that
     * declares none inherits the root layout's, and every mistyped link told
     * a crawler it was the homepage. Declaring its own with no canonical is
     * the fix, and it still has to carry the feeds every page advertises.
     */
    const alternates = notFoundMetadata.alternates;
    expect(alternates, "the 404 inherits the root layout's canonical").toBeTruthy();
    expect(alternates?.canonical).toBeUndefined();
    expect(alternates?.types).toEqual(feedAlternates("/").types);
  });

  it("ships no canonical in any file the build wrote for it", () => {
    // The built pages, because the metadata above is only what was asked
    // for. Next writes the 404 three times, and Netlify serves `404.html`.
    const files = ["out/404.html", "out/404/index.html", "out/_not-found/index.html"].filter(
      (path) => existsSync(path),
    );
    expect(files.length, "no 404 in out/").toBeGreaterThan(0);
    const canonical = files.filter((path) =>
      /<link rel="canonical"/.test(readFileSync(path, "utf8")),
    );
    expect(canonical).toEqual([]);
  });
});
