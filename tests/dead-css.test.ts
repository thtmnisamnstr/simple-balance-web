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

  it("defines a rule for every class the markup actually writes", () => {
    /*
     * The other direction, and the one nothing was checking.
     *
     * A class in the markup with no rule behind it is inert: it reads as
     * styling, it survives every refactor because deleting it looks risky,
     * and it is invisible to the sweep above, which only ever asks whether
     * CSS is reachable. Four had accumulated — on a `<section>` and a
     * `<summary>` and two wrappers, every one of them an element that earns
     * its place through `aria-label` or `aria-labelledby` rather than through
     * anything visual.
     *
     * **Deliberately conservative.** It reads only plain string literals, so
     * a composed name (`callout-${kind}`) or a conditional is skipped
     * entirely rather than guessed at. It will miss some; it will never
     * report one that is fine, which is the trade a gate wants.
     */
    const written = new Set<string>();
    for (const file of sourceFiles("src", /\.tsx$/)) {
      for (const [, list] of file.code.matchAll(/className="([^"{}$]+)"/g)) {
        for (const name of list!.split(/\s+/)) if (name) written.add(name);
      }
    }

    expect(written.size, "no classes found in the markup").toBeGreaterThan(30);

    const unstyled = [...written].filter((name) => !defined.includes(name));
    expect(unstyled, "these are in the markup and style nothing").toEqual([]);
  });

  it("keeps the composed list to names that are actually composed", () => {
    // An entry here is an exception, not a license. If the expression that
    // builds it has gone, the entry is stale and the CSS may be dead.
    for (const [name, where] of Object.entries(COMPOSED)) {
      const prefix = name.slice(0, name.lastIndexOf("-") + 1);
      expect(source, `${name} claims to come from ${where}`).toContain(`${prefix}\${`);
    }
  });
});
