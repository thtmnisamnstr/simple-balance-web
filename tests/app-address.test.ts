import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { appAddress } from "@/components/app-linked";

/**
 * The application's address is a link wherever a page names it.
 *
 * A reader who meets "app.smpl.money" in a sentence is being told where the
 * product is, and plain text there is a dead end they have to retype. The docs
 * write the link in Markdown, and the strings that can't, the legal pages, a
 * docs group's blurb and a docs page's lede, go through `AppLinked`.
 *
 * Read from the built pages, because a mention can arrive from Markdown, a
 * content module or a template, and the page is where they meet. Two kinds
 * are left as written, and skipped here: an address with a path after it,
 * such as the `/mcp` a program connects to, and anything in a code span,
 * which is something to copy exactly rather than a place to go. The page's
 * head isn't read at all: a description there is plain text by definition.
 *
 * Nor is a card's summary on an index, which is a page's description again.
 * A card is one tab stop, named by its title (`web.md` 4.6), and a link in its
 * summary would be a second stop inside the first.
 */

function pages(dir = "out"): readonly string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "_next" ? [] : pages(full);
    return entry === "index.html" ? [full] : [];
  });
}

/** What a reader sees outside a link or a code span, as plain text. */
const unlinked = (html: string) =>
  (/<body[\s\S]*<\/body>/.exec(html)?.[0] ?? "")
    .replace(/<(script|style|svg|template|code|pre)\b[\s\S]*?<\/\1>/g, " ")
    .replace(/<p class="[\w-]*-summary">[\s\S]*?<\/p>/g, " ")
    .replace(/<a\b[\s\S]*?<\/a>/g, " ")
    .replace(/<[^>]+>/g, " ");

const bare = new RegExp(`${appAddress.replaceAll(".", "\\.")}(?!/)`, "g");

describe("the application's address", () => {
  const built = pages();

  it("is found on the pages that name it, so the check below has something to read", () => {
    const naming = built.filter((path) => readFileSync(path, "utf8").includes(appAddress));
    expect(naming.length).toBeGreaterThan(10);
  });

  it("is a link wherever a page names it", () => {
    const plain = built.flatMap((path) =>
      (unlinked(readFileSync(path, "utf8")).match(bare) ?? []).map(() => path),
    );
    expect([...new Set(plain)]).toEqual([]);
  });
});
