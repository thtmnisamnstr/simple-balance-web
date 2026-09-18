import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceFiles } from "./support/source";

/**
 * Every class the stylesheets define is one the source can produce.
 *
 * This found 103 lines on its first run: the whole `.figure-*` family, left
 * behind when real screenshots replaced the hand-drawn ledger figure. The
 * component was deleted and its CSS was not, and nothing noticed — dead CSS
 * is invisible, it ships, and it accumulates faster than anything else in a
 * site like this.
 *
 * **Composed names are the false positives**, and they are named rather than
 * pattern-matched away: a rule loose enough to allow `callout-danger` because
 * something somewhere interpolates `callout-${kind}` is a rule loose enough
 * to allow anything with a hyphen in it.
 */

/** Classes built at runtime, with the expression that builds each. */
const COMPOSED: Record<string, string> = {
  "callout-note": "callout.tsx: `callout-${kind}`",
  "callout-tip": "callout.tsx: `callout-${kind}`",
  "callout-warning": "callout.tsx: `callout-${kind}`",
  "callout-danger": "callout.tsx: `callout-${kind}`",
};

describe("the stylesheets", () => {
  const css =
    readFileSync("src/styles/site.css", "utf8") + readFileSync("src/styles/brand.css", "utf8");

  // Only top-of-line selectors: `.foo` inside a comment or a descendant
  // selector is not a definition.
  const defined = [...new Set([...css.matchAll(/^\s*\.([a-zA-Z][\w-]*)/gm)].map((m) => m[1]!))];

  const source = sourceFiles("src", /\.tsx?$/)
    .map((file) => file.code)
    .join("\n");

  it("found classes and source to compare", () => {
    expect(defined.length).toBeGreaterThan(60);
    expect(source.length).toBeGreaterThan(5000);
  });

  it("defines no class the source cannot produce", () => {
    const dead = defined.filter((name) => !source.includes(name) && !(name in COMPOSED));
    expect(dead, "these are defined in CSS and never used").toEqual([]);
  });

  it("keeps the composed list to names that are actually composed", () => {
    // An entry here is an exception, not a licence. If the expression that
    // builds it has gone, the entry is stale and the CSS may be dead.
    for (const [name, where] of Object.entries(COMPOSED)) {
      const prefix = name.slice(0, name.lastIndexOf("-") + 1);
      expect(source, `${name} claims to come from ${where}`).toContain(`${prefix}\${`);
    }
  });
});
