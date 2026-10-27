import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allEntries, bySection, tableOfContents } from "@/content/collections";
import { learnIndex } from "@/content/learn";
import { learnArt } from "@/components/learn-art/registry";
import { allDiagrams } from "@/components/learn-art/pieces";
import { glyphs } from "@/components/learn-art/glyphs";
import { authors } from "@/content/authors";
import { site } from "@/content/home";
import { sourceFiles } from "./support/source";

/**
 * The learn articles, held to the job each one was written to do.
 *
 * `docs/standards/content.md` 5.14 is the contract: every article says why the
 * topic matters, how to do it with any tool, and how to do it in Simple
 * Balance, in that order. The third part is the reason the section exists on
 * this site rather than somebody else's, and the first two are the reason a
 * reader who never signs up still got something for their time. An article
 * missing either half is an advertisement or a detour, and the headings are
 * where that shows.
 *
 * Each one also ends by naming its sources, because the methods it teaches
 * were somebody's before they were ours, and the figures it quotes came from
 * somewhere a reader should be able to check.
 */

const articles = allEntries("learn");

/** The `##` headings of an article, in order. */
function sections(body: string): readonly string[] {
  return tableOfContents(body)
    .filter((heading) => heading.depth === 2)
    .map((heading) => heading.text);
}

/**
 * Whether the headings make the three-part argument: a "why", then a "how",
 * and last of all the part about this product.
 *
 * "Last" means last before the sources, which close every article and are a
 * list of where the argument came from rather than a part of it.
 *
 * A function rather than inline so the fixtures below can test it directly,
 * which is how the pattern is known to fail on the articles it is for rather
 * than only to pass on the ones that exist.
 */
function makesTheArgument(all: readonly string[]): boolean {
  const headings = all.at(-1) === "Sources" ? all.slice(0, -1) : all;
  const why = headings.findIndex((h) => /^Why\b/.test(h));
  const how = headings.findIndex((h, i) => i > why && /^How\b/.test(h));
  const last = headings.at(-1) ?? "";
  return why !== -1 && how !== -1 && /\bin Simple Balance$/.test(last) && how < headings.length - 1;
}

/** An article split at its closing `## Sources` heading, if it has one. */
function splitSources(body: string): { readonly text: string; readonly sources: string } {
  const at = body.search(/^## Sources\s*$/m);
  return at === -1
    ? { text: body, sources: "" }
    : { text: body.slice(0, at), sources: body.slice(at) };
}

/** Every address a Markdown link or a bare `<https://…>` points outside the site. */
function outsideLinks(markdown: string): readonly string[] {
  return [...markdown.matchAll(/\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>/g)].map(
    (match) => (match[1] ?? match[2])!,
  );
}

describe("the learn articles", () => {
  it("found articles to check", () => {
    // Every assertion below passes vacuously on an empty collection.
    expect(articles.length).toBeGreaterThan(5);
  });

  it("each say why, then how, then how in Simple Balance", () => {
    const offenders = articles
      .filter((article) => !makesTheArgument(sections(article.body)))
      .map((article) => `${article.slug}: ${sections(article.body).join(" / ")}`);
    expect(offenders).toEqual([]);
  });

  it("knows the argument when it sees it, and only then", () => {
    expect(
      makesTheArgument(["Why it matters", "How to do it", "How to do it in Simple Balance"]),
    ).toBe(true);
    expect(
      makesTheArgument([
        "What it is",
        "Why it matters",
        "How much",
        "How to do it",
        "How to do it in Simple Balance",
      ]),
    ).toBe(true);
    // An advertisement: no reason, and nothing a reader can do elsewhere.
    expect(makesTheArgument(["How to do it in Simple Balance"])).toBe(false);
    // A detour: useful, and never says what the product does about it.
    expect(makesTheArgument(["Why it matters", "How to do it"])).toBe(false);
    // The product first and the method after, which reads as a pitch.
    expect(
      makesTheArgument(["Why it matters", "How to do it in Simple Balance", "How to do it"]),
    ).toBe(false);
    // The sources close the article and do not count as its last part.
    expect(
      makesTheArgument([
        "Why it matters",
        "How to do it",
        "How to do it in Simple Balance",
        "Sources",
      ]),
    ).toBe(true);
    expect(makesTheArgument(["Why it matters", "How to do it", "Sources"])).toBe(false);
  });

  it("each end by naming their sources, with a link to at least one", () => {
    const unsourced = articles
      .filter((article) => {
        const headings = sections(article.body);
        const { sources } = splitSources(article.body);
        return headings.at(-1) !== "Sources" || outsideLinks(sources).length === 0;
      })
      .map((article) => article.slug);
    expect(unsourced).toEqual([]);
  });

  it("list every outside page they link to among their sources", () => {
    /*
     * The rule is that every borrowed idea and every quoted figure is
     * credited, and most of that is a person reading. What a machine can hold
     * is the half that leaves a trace: a link in the body to somebody else's
     * work is a citation, and a citation that is not in the list at the
     * bottom is credit given in passing and lost to anybody who skims to the
     * end looking for where this came from.
     */
    const uncredited = articles.flatMap((article) => {
      const { text, sources } = splitSources(article.body);
      const listed = new Set(outsideLinks(sources));
      return outsideLinks(text)
        .filter((url) => !listed.has(url))
        .map((url) => `${article.slug}: ${url}`);
    });
    expect(uncredited).toEqual([]);
  });

  it("carries a date and credits nobody", () => {
    // The loader refuses a missing date and any author, so this holds the
    // loader to both. The articles were written by an AI and name no person.
    for (const article of articles) {
      expect(article.frontmatter.date, article.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.frontmatter.authors, article.slug).toBeUndefined();
    }
  });

  it("links only to articles and docs pages that exist", () => {
    /*
     * The articles link to each other and into the docs by address, written
     * by hand, and the one way that goes wrong is an article renamed or never
     * written. `scripts/check-links.mjs` would find it in the build, and
     * nothing runs it on every build; this does, for the two collections
     * these pages link into.
     */
    const exists = {
      learn: new Set(articles.map((a) => a.slug)),
      docs: new Set(allEntries("docs").map((a) => a.slug)),
    };
    const broken: string[] = [];
    for (const article of articles) {
      for (const [, section, slug] of article.body.matchAll(/\]\(\/(learn|docs)\/([^/#)]*)/g)) {
        const known = exists[section as "learn" | "docs"];
        if (slug && !known.has(slug)) broken.push(`${article.slug} -> /${section}/${slug}/`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("links the docs page of every screen it names", () => {
    /*
     * The last part of an article walks through screens by their bold names,
     * and the docs page for each is the next thing its reader needs, and the
     * most descriptive link that page gets from anywhere. Three articles named
     * seven screens between them without linking their pages, which
     * `seo-review` §4's count could not see because each linked some other
     * docs page.
     *
     * Somewhere in the article rather than at the first mention: an article
     * may name a screen in a step and link it, in words that name it, a line
     * later ("Importing a statement has more detail"), and where the link
     * sits is the reviewer's read. "The **Categories** report" is a tab of
     * Reports rather than the Categories screen, so a name followed by
     * "report" doesn't count.
     */
    const screens: Readonly<Record<string, string>> = {
      Overview: "the-overview",
      Accounts: "accounts",
      Transactions: "transactions",
      Staged: "staged-transactions",
      "Import CSV": "importing-a-statement",
      Budgets: "budgets",
      Reports: "reports",
      Categories: "categories-and-payees",
      Payees: "categories-and-payees",
      Recurring: "recurring-transactions",
      Templates: "templates",
      Activity: "activity-history",
    };
    const unlinked: string[] = [];
    for (const article of articles) {
      for (const [name, slug] of Object.entries(screens)) {
        const named = new RegExp(`\\*\\*${name}\\*\\*(?!\\s+report\\b)`).test(article.body);
        if (named && !article.body.includes(`](/docs/${slug}/`)) {
          unlinked.push(`${article.slug} names **${name}** and never links /docs/${slug}/`);
        }
      }
    }
    expect(unlinked).toEqual([]);
  });
});

describe("a screenshot inside an article or a doc", () => {
  /*
   * `<Shot>` reads two files by name, and a name that is not in
   * `public/screenshots/` renders a broken image with nothing to fail: the
   * build does not read image paths and the link checker reads only hrefs.
   * And a picture of invented balances has to say they are invented
   * (`docs/standards/web.md` 5.5), which the homepage does once beside its
   * shots and a Markdown page has to do beside its own.
   */
  const pages = sourceFiles("content", /\.md$/)
    .map((file) => ({ ...file, shots: [...file.code.matchAll(/<Shot\s[^>]*?name="([^"]+)"/g)] }))
    .filter((file) => file.shots.length > 0);

  it("is found where it is used", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it("names a screenshot that exists in both themes", () => {
    const missing = pages.flatMap((page) =>
      page.shots.flatMap(([, name]) =>
        ["light", "dark"]
          .map((theme) => `public/screenshots/${name}-${theme}.webp`)
          .filter((file) => !existsSync(file))
          .map((file) => `${page.path}: ${file}`),
      ),
    );
    expect(missing).toEqual([]);
  });

  it("gives its size as text, which is the spelling the renderer keeps", () => {
    /*
     * `width={1600}` is an expression, and `MDXRemote` strips every
     * expression before anything renders, so the picture shipped with no
     * width and no height and the page jumped as it loaded (`web.md` 5.3).
     * `write-content` showed exactly that spelling as its example until it
     * was built and looked at.
     */
    const dropped = pages.filter((page) => /<Shot\s[^>]*?(width|height)=\{/.test(page.code));
    expect(dropped.map((page) => page.path)).toEqual([]);
  });

  it("says the money in it is made up, right after it", () => {
    const silent = pages.flatMap((page) =>
      page.code
        .split(/<Shot\s/)
        .slice(1)
        .filter((after) => !/^[^]*?\/>\s*\n\s*_The money in this picture is made up\./.test(after))
        .map(() => page.path),
    );
    expect(silent).toEqual([]);
  });
});

describe("a learn article, as built", () => {
  const html = readFileSync("out/learn/make-a-budget/index.html", "utf8");

  it("is an Article published by the site and credited to no person", () => {
    // Every learn page, not one: a single author left in one file's
    // frontmatter is the regression this guards, and the loader refusing it
    // is one half; the page and its structured data are the other.
    const pages = readdirSync("out/learn", { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => readFileSync(`out/learn/${entry.name}/index.html`, "utf8"));
    expect(pages.length).toBeGreaterThan(10);
    for (const page of pages) {
      expect(page).toContain('"@type":"Article"');
      expect(page).toContain('"publisher":{"@type":"Organization"');
      expect(page).not.toContain('"@type":"Person"');
      expect(page).not.toContain('"author"');
      expect(page).not.toContain('class="byline-name"');
      expect(page).not.toContain(authors.gavin.name);
    }
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it("ends with somewhere to try it", () => {
    expect(html).toContain('class="learn-cta"');
    expect(html).toContain(`href="${site.appUrl}"`);
    expect(html).toContain('href="/pricing/"');
  });

  it("opens on its picture", () => {
    expect(html).toContain('class="art-panel learn-hero"');
  });

  it("links the articles either side of it, with their pictures", () => {
    expect(html).toContain('class="learn-next"');
    expect(html).toContain('rel="prev"');
    expect(html).toContain('rel="next"');
    expect(html.match(/class="learn-card"/g)?.length).toBe(2);
  });

  it("draws its diagram with a description a screen reader announces", () => {
    expect(html).toMatch(/<svg class="dg-svg"[^>]*role="img"[^>]*aria-labelledby="([^"]+)"/);
    expect(html).toContain('<figure class="diagram">');
  });
});

describe("the learn index, as built", () => {
  const html = readFileSync("out/learn/index.html", "utf8");

  it("shows every article as a card with its picture", () => {
    for (const article of articles) {
      expect(html, article.slug).toContain(`href="/learn/${article.slug}/"`);
    }
    expect(html.match(/class="learn-card"/g)?.length).toBe(articles.length);
    expect(html.match(/class="art-panel"/g)?.length).toBe(articles.length);
  });

  it("describes every group it shows, and no group it does not", () => {
    const groups = bySection("learn").map((group) => group.section);
    expect(Object.keys(learnIndex.groups).toSorted()).toEqual(groups.toSorted());
  });

  it("staggers no card's picture past the steps a touch screen's scroll keeps apart", () => {
    // On a touch screen a card's picture builds by scroll, a step of `--s`
    // a share of its entry, and every step from (100 − span) / step up shares
    // the last window. At a diagram's 5% over 35% that was 13, and a check
    // popped while it swung, and coins floated while they fell (`web.md` 8.3).
    const scale = readFileSync("src/styles/site.css", "utf8").match(
      /\.learn-card \.mo,[^{]*\{[^}]*animation-range: entry min\(calc\(var\(--s, 0\) \* ([\d.]+)%\), [\d.]+%\) entry\s+min\(calc\(([\d.]+)% \+ var\(--s, 0\) \* [\d.]+%\), 100%\)/,
    );
    expect(scale, "found no touch-screen scroll rule for a card").not.toBeNull();
    const last = (100 - Number(scale![2])) / Number(scale![1]);
    const pictures = [...html.matchAll(/<a class="learn-card-art" href="([^"]+)"[\s\S]*?<\/a>/g)];
    expect(pictures.length).toBe(articles.length);
    const bunched = pictures
      .map(([picture, href]) => ({
        href,
        late: new Set(
          [...picture.matchAll(/--s:\s*([\d.]+)/g)]
            .map(([, s]) => Number(s))
            .filter((s) => s >= last),
        ),
      }))
      .filter(({ late }) => late.size > 1)
      .map(({ href, late }) => `${href}: ${[...late].join(", ")} past ${last}`);
    expect(bunched).toEqual([]);
  });
});

describe("the learn articles' pictures", () => {
  /*
   * Every article has a drawing and a glyph, every diagram an article names
   * exists, and every diagram somebody drew is used. A picture with no
   * article is work nobody sees, and an article naming a diagram that does
   * not exist fails the build, so the two directions are different failures
   * and both are held here.
   */
  const slugs = articles.map((article) => article.slug).toSorted();
  const named = articles.flatMap((article) =>
    [...article.body.matchAll(/<Diagram\s+name="([^"]+)"/g)].map((match) => ({
      slug: article.slug,
      name: match[1]!,
    })),
  );

  it("gives every article a drawing and a glyph, and draws for no other", () => {
    expect(Object.keys(learnArt).toSorted()).toEqual(slugs);
    expect(Object.keys(glyphs).toSorted()).toEqual(slugs);
  });

  it("puts at least one diagram in every article", () => {
    const without = slugs.filter((slug) => !named.some((use) => use.slug === slug));
    expect(without).toEqual([]);
  });

  it("names only diagrams that exist, and uses every one that does", () => {
    const missing = named.filter((use) => !allDiagrams.has(use.name));
    expect(missing).toEqual([]);
    const unused = [...allDiagrams.keys()].filter(
      (name) => !named.some((use) => use.name === name),
    );
    expect(unused).toEqual([]);
  });

  it("gives every diagram a name no other article's diagram has", () => {
    const total = Object.values(learnArt).reduce(
      (sum, art) => sum + Object.keys(art.diagrams).length,
      0,
    );
    expect(allDiagrams.size).toBe(total);
  });

  it("draws every diagram narrow enough to read on a phone", () => {
    // `.dg-svg` shows a diagram at its own size and no larger, so a wider
    // grid is smaller text on a phone, not a bigger picture on a desktop.
    const wide = [...allDiagrams.entries()]
      .filter(([, diagram]) => Number(diagram.viewBox.split(/\s+/)[2]) > 560)
      .map(([name, diagram]) => `${name}: ${diagram.viewBox}`);
    expect(wide).toEqual([]);
  });

  it("takes every color from the contract, never a literal", () => {
    /*
     * `docs/standards/web.md` 1.1, which `tests/brand-tokens.test.ts` holds
     * for the stylesheets and nothing held for a drawing. A fill written as
     * an attribute cannot be a `var()` at all, so the drawings color by class
     * and by `css({ "--c": "var(--…)" })`, and an attribute that sets a color
     * is the defect whatever its value.
     */
    const offenders = sourceFiles("src/components/learn-art", /\.tsx?$/).flatMap((file) =>
      file.code
        .split("\n")
        .map((line, index) => ({ line, index }))
        .filter(
          ({ line }) =>
            /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(line) ||
            /\b(fill|stroke|stopColor|stop-color|color)=["{](?!"none")/.test(line),
        )
        .map(({ line, index }) => `${file.path}:${index + 1} ${line.trim()}`),
    );
    expect(offenders).toEqual([]);
  });
});

/**
 * Every `@media <query> { … }` block in the stylesheet, as [start, end) offsets.
 *
 * Every one, not the first: the learn pictures had the only motion block,
 * and the homepage, the docs index and the blog each keep theirs beside the
 * rules it governs. Reading only the first called the second one's rules
 * "outside", which is the opposite of the fact.
 */
function mediaBlocks(css: string, query: string): readonly (readonly [number, number])[] {
  const blocks: (readonly [number, number])[] = [];
  let start = css.indexOf(`@media ${query} {`);
  while (start !== -1) {
    let depth = 0;
    for (let i = css.indexOf("{", start); i < css.length; i += 1) {
      if (css[i] === "{") depth += 1;
      if (css[i] === "}" && --depth === 0) {
        blocks.push([start, i + 1]);
        break;
      }
    }
    start = css.indexOf(`@media ${query} {`, start + 1);
  }
  return blocks;
}

describe("the motion", () => {
  /*
   * `docs/standards/web.md` 8.1. Every rule that sets a drawing moving sits
   * inside the `no-preference` block, because the global reduced-motion rule
   * shortens a timed animation to nothing and does nothing at all to a
   * scroll-driven one, and a loop it shortens rests on its last frame, which
   * is empty. A rule outside the block is one a reader who asked for less
   * motion still gets.
   */
  const stylesheet = readFileSync("src/styles/site.css", "utf8");

  it("starts only inside the no-preference block", () => {
    // Every `animation` or `animation-name` that isn't `none`, a shorthand
    // over several lines included, read with the comments blanked in place
    // so the offsets still line up. It matched only `var(--mo)` and `mo-`
    // once, and the loops, the chat's spinner and dots, the card rise and the
    // orbits were all outside what it could see.
    const css = stylesheet.replace(/\/\*[\s\S]*?\*\//g, (note) => note.replace(/[^\n]/g, " "));
    const allowed = mediaBlocks(css, "(prefers-reduced-motion: no-preference)");
    expect(allowed.length).toBeGreaterThan(0);
    const starts = [...css.matchAll(/(?<![\w-])animation(?:-name)?\s*:([^;{}]*)[;}]/g)].filter(
      (match) => match[1]!.trim() !== "none",
    );
    expect(starts.map((match) => match[1]).join(), "it cannot see the loops").toContain(
      "var(--mo-loop)",
    );
    const outside = starts.filter(
      (match) => !allowed.some(([from, to]) => match.index > from && match.index < to),
    );
    expect(outside.map((match) => match[0].replace(/\s+/g, " "))).toEqual([]);
  });
});

describe("motion that doesn't stop by itself", () => {
  /*
   * `web.md` 8.2, and WCAG 2.2.2 under it. A drawing may loop only where the
   * reader can stop it, which is a `.mo-loop` with its checkbox, or where the
   * reader started it, which is an animation held `paused` until a hover or
   * a focus runs it. Every rule that repeats forever is one or the other.
   */
  const stylesheet = readFileSync("src/styles/site.css", "utf8");

  it("loops forever only where it can be stopped or was started by the reader", () => {
    const forever = [...stylesheet.matchAll(/([^{}]+)\{([^{}]*\binfinite\b[^{}]*)\}/g)];
    expect(forever.length, "found no infinite animation to check").toBeGreaterThan(0);
    const unguarded = forever
      .filter(([, selector, body]) => !selector!.includes(".mo-loop") && !/\bpaused\b/.test(body!))
      .map(([, selector]) => selector!.trim());
    expect(unguarded).toEqual([]);
    // And the stop does stop: checked, every part of a loop rests.
    expect(stylesheet).toMatch(
      /\.mo-loop:has\(\.mo-stop-input:checked\) \.mo \{\s*animation: none;/,
    );
  });
});

describe("the screenshots", () => {
  it("are each shown somewhere", () => {
    /*
     * An unused screenshot is one that goes stale with nothing to notice,
     * and `sync-from-app` §4 deletes a file nothing names. This is the same
     * rule held on every build: a picture in `public/screenshots/` is named
     * by the homepage or by a Markdown page, or it should not be there.
     */
    const named = new Set(
      [
        ...readFileSync("src/content/home.ts", "utf8").matchAll(/name: "([a-z-]+)"/g),
        ...sourceFiles("content", /\.md$/).flatMap((file) => [
          ...file.code.matchAll(/^\s*name="([a-z-]+)"/gm),
        ]),
      ].map((match) => match[1]!),
    );
    const shipped = readdirSync("public/screenshots")
      .filter((file) => file.endsWith("-light.webp"))
      .map((file) => file.replace(/-light\.webp$/, ""));
    expect(shipped.filter((name) => !named.has(name))).toEqual([]);
  });
});
