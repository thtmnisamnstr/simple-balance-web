import { describe, expect, it } from "vitest";
import { sourceFiles } from "./support/source";

/**
 * How this repository refers to the application's repository.
 *
 * It refers to it by URL, because it is public and reading it over the
 * network always gets its real state. A relative path assumes a clone sits
 * beside this one in whatever state it was left in, and a claim checked
 * against a stale working tree is worse than an unchecked claim: it arrives
 * with confidence.
 *
 * `capture-screenshots` is the exception and says so — it has to *run* the
 * application, which a URL cannot do.
 */

const APP_REPO = "https://github.com/thtmnisamnstr/simple-balance";
const docs = sourceFiles("docs", /\.md$/).concat(sourceFiles(".claude", /\.md$/));

/** Files allowed to describe a local clone, with the reason each is. */
const NEEDS_A_CLONE: Record<string, string> = {
  ".claude/skills/capture-screenshots/SKILL.md":
    "Drives the running application with Playwright, which a URL cannot do.",
  "docs/standards/operations.md": "Carries the screenshot runbook, for the same reason.",
};

describe("references to the application", () => {
  it("found documents to check", () => {
    expect(docs.length).toBeGreaterThan(8);
  });

  it("never assumes the application sits beside this repository", () => {
    const offenders: string[] = [];
    for (const doc of docs) {
      for (const [index, line] of doc.code.split("\n").entries()) {
        if (!/\.\.\/simple-balance/.test(line)) continue;
        offenders.push(`${doc.path}:${index + 1} ${line.trim().slice(0, 60)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("names the repository by its URL wherever it reads it", () => {
    // The alignment skill is the one that reads the application. If it
    // stopped naming the URL, it would be reading something else.
    const alignment = docs.find((d) => d.path.endsWith("app-alignment/SKILL.md"));
    expect(alignment, "the app-alignment skill exists").toBeTruthy();
    expect(alignment!.code).toContain(APP_REPO);
    expect(alignment!.code).toContain("raw.githubusercontent.com");
  });

  it("makes the alignment skill resolve a ref before reading anything", () => {
    // Reading the default branch is the failure this guards: unreleased work
    // sits on a branch, and a check against the wrong ref finds nothing and
    // concludes the site is wrong about everything.
    const alignment = docs.find((d) => d.path.endsWith("app-alignment/SKILL.md"))!;
    // Matching the caution rather than one wording of it: the phrasing has
    // already changed once, and pinning a sentence makes a rewrite fail for
    // no reason while pinning nothing lets the caution disappear.
    expect(alignment.code).toMatch(/not always `main`|do not assume `main`/i);
    expect(alignment.code).toContain("gh pr list");
    // And it must actually read the published contract rather than grep.
    expect(alignment.code).toContain("product-facts.json");
  });

  it("lets only the procedures that must run the app ask for a clone", () => {
    const cloning = docs
      .filter((doc) => /git clone|from the clone/.test(doc.code))
      .map((doc) => doc.path)
      .filter((path) => !(path in NEEDS_A_CLONE));
    expect(cloning, "these ask for a clone without being named as needing one").toEqual([]);
  });
});
