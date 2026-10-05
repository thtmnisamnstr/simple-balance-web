import { describe, expect, it } from "vitest";
import { repoFile } from "./support/source";

/**
 * `.env.example`, which a contributor copies to `.env` and the live site
 * never reads at all — its real values are Netlify's own environment
 * variables, per the file's own first paragraph.
 *
 * Two rules, both borrowed from the application repository's identically-named
 * test for its own `.env.example`: every line is commented out, so
 * uncommenting it is the act that turns a setting on, and the three names
 * written here are exactly the three `src/content/ads.ts` reads — not a
 * fourth that was renamed in one file and not the other, and not one missing
 * that a build would then refuse for with no instructions anywhere about
 * what to set.
 */
const example = repoFile(".env.example");

const commentedNames = [...example.matchAll(/^#\s*([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]!);

const assignedNames = example
  .split("\n")
  .flatMap((line) => /^([A-Z][A-Z0-9_]*)=/.exec(line)?.[1] ?? []);

describe(".env.example", () => {
  it("names exactly the three variables the parser reads, all commented out", () => {
    expect(commentedNames.toSorted()).toEqual(
      ["ADSENSE_CLIENT_ID", "ADSENSE_BANNER_SLOT_ID", "ADSENSE_CONSENT_MANAGED"].toSorted(),
    );
  });

  it("assigns nothing — every variable is a line to uncomment, not a default already in force", () => {
    expect(assignedNames).toEqual([]);
  });

  it("matches the names src/content/ads.ts actually reads", () => {
    const parser = repoFile("src/content/ads.ts");
    for (const name of commentedNames) {
      expect(parser, `src/content/ads.ts does not read ${name}`).toContain(`env.${name}`);
    }
  });
});
