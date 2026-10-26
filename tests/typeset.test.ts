import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { serialize } from "next-mdx-remote/serialize";
import { remarkPlugins } from "@/components/prose";
import * as learnArtContent from "@/content/learn-art";
import { learnIndex } from "@/content/learn";
import { section } from "@/content/sections";
import { allEntries, tableOfContents } from "@/content/collections";
import { privacy, terms } from "@/content/legal";
import { notFound } from "@/content/not-found";
import { typeset } from "@/lib/typeset";

/**
 * The words outside the prose are set the way the prose sets them.
 *
 * `typeset` is a three-line stand-in for `remark-smartypants`, applied to the
 * strings that never pass through Markdown: the contents list, the titles and
 * summaries on the cards, a callout's title, and every word in a learn
 * picture. A stand-in can disagree with what it stands in for, so each of
 * those strings is run through both and the two have to match. A quote the
 * helper turns the wrong way fails here, beside the string that showed it,
 * rather than on a page under a heading that has it the right way round.
 */

/** Every string in a copy module, wherever it sits. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const articles = allEntries("learn");

const inputs = [
  ...strings(learnArtContent),
  ...strings(learnIndex.groups),
  section("learn").description,
  ...articles.flatMap((article) => [
    article.frontmatter.title,
    article.frontmatter.description,
    // The contents list's source text: what is typed after the hashes.
    ...article.body
      .split("\n")
      .flatMap((line) => /^#{2,3}\s+(.+?)\s*$/.exec(line)?.[1] ?? [])
      .map((text) => text.replace(/[*_`]/g, "")),
    ...[...article.body.matchAll(/<Callout\b[^>]*\btitle="([^"]+)"/g)].map((m) => m[1]!),
  ]),
  // The legal pages and the 404, typeset where they're rendered. A bold run
  // is set on its own, so the parts are checked apart, a sentence at a time:
  // a whole paragraph also holds an email address, which the prose would
  // make a link and so split the text the comparison looks for.
  ...strings([privacy, terms]).flatMap((text) =>
    text.split(/\*\*|(?<=[.!?])\s+/).map((part) => part.trim()),
  ),
  ...strings(notFound),
].filter((text) => /['"]/.test(text));

/** How the compiled MDX writes a string: non-ASCII as `\uXXXX`, or as itself. */
function forms(text: string): readonly string[] {
  const escaped = text.replace(
    /[^\x20-\x7e]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
  return [text, escaped];
}

/** What a reader sees: the body's text, without markup, scripts or styles. */
function visibleText(html: string): string {
  const body = html.slice(html.indexOf("<body"));
  return body
    .replace(/<script\b[^]*?<\/script>/g, "")
    .replace(/<style\b[^]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");
}

describe("typeset", () => {
  it("has strings with quotes to check", () => {
    // If this falls to nothing the test below passes by checking nothing.
    expect(inputs.length).toBeGreaterThan(20);
  });

  it("sets every quote the way the prose pipeline does", async () => {
    // A leading word, so a heading that starts "3. " stays a paragraph
    // rather than becoming a numbered list with the number taken off.
    const compiled = await Promise.all(
      inputs.map((text) => serialize(`Z ${text}`, { mdxOptions: { remarkPlugins } })),
    );
    const wrong = inputs.filter(
      (text, index) =>
        !forms(`Z ${typeset(text)}`).some((form) => compiled[index]!.compiledSource.includes(form)),
    );
    expect(wrong, "typeset and remark-smartypants disagree on these").toEqual([]);
  });

  it("leaves the contents list's anchors where the headings put them", () => {
    const [entry] = tableOfContents("## Where most people's money goes\n");
    expect(entry?.text).toBe("Where most people’s money goes");
    expect(entry?.id).toBe("where-most-peoples-money-goes");
  });
});

/*
 * The learn pages first, where the mismatch was found, and then the two
 * marketing pages, which typeset their copy too: the homepage at its render
 * points and the pricing page where its copy is imported. The pricing page's
 * new heading, "What's different between the plans.", was the straight quote
 * that showed it had never been typeset at all. The legal pages and the 404
 * were the same omission found later, 79 straight apostrophes in the privacy
 * policy alone, under a header that curled its own.
 */
describe("a learn, home, pricing, legal or 404 page, as built", () => {
  const pages = [
    "out/index.html",
    "out/pricing/index.html",
    "out/privacy/index.html",
    "out/terms/index.html",
    "out/404.html",
    "out/learn/index.html",
    ...readdirSync("out/learn", { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `out/learn/${entry.name}/index.html`),
  ];

  it("shows no straight quote anywhere", () => {
    const straight = pages.flatMap((path) =>
      [
        ...visibleText(readFileSync(path, "utf8")).matchAll(
          /.{0,30}(?:'|"|&#x27;|&#39;|&quot;).{0,30}/g,
        ),
      ].map((m) => `${path}: ${m[0].trim()}`),
    );
    expect(pages.length).toBeGreaterThan(10);
    expect(straight).toEqual([]);
  });
});
