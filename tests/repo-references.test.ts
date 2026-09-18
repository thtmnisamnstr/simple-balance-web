import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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
 * There is no exception any more. This repository used to capture its own
 * screenshots, which meant cloning the application to run it; the
 * application publishes them now, so nothing here needs a clone at all.
 */

const APP_REPO = "https://github.com/thtmnisamnstr/simple-balance";
const docs = sourceFiles("docs", /\.md$/).concat(sourceFiles(".claude", /\.md$/));

/**
 * Files allowed to describe a local clone.
 *
 * Empty, and that is the point: the application publishes its own
 * screenshots now, so no procedure here needs to run it. An entry appearing
 * in this record is a procedure that has started needing a checkout, which
 * is a decision worth seeing in a diff.
 */
const NEEDS_A_CLONE: Record<string, string> = {};

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
    const alignment = docs.find((d) => d.path.endsWith("sync-from-app/SKILL.md"));
    expect(alignment, "the sync-from-app skill exists").toBeTruthy();
    expect(alignment!.code).toContain(APP_REPO);
    expect(alignment!.code).toContain("raw.githubusercontent.com");
  });

  it("makes the alignment skill resolve a ref before reading anything", () => {
    // Reading the default branch is the failure this guards: unreleased work
    // sits on a branch, and a check against the wrong ref finds nothing and
    // concludes the site is wrong about everything.
    const alignment = docs.find((d) => d.path.endsWith("sync-from-app/SKILL.md"))!;
    // Matching the caution rather than one wording of it: the phrasing has
    // already changed once, and pinning a sentence makes a rewrite fail for
    // no reason while pinning nothing lets the caution disappear.
    // The caution, not one wording of it: the phrasing has already changed
    // twice, and pinning a sentence makes a rewrite fail for no reason while
    // pinning nothing lets the caution disappear.
    expect(alignment.code).toMatch(/usually `main`|not always `main`|do not assume `main`/i);
    expect(alignment.code).toContain("gh pr list");
    // And it must read the published kit rather than grep the source.
    expect(alignment.code).toContain("docs/product/");
  });

  it("lets only the procedures that must run the app ask for a clone", () => {
    const cloning = docs
      .filter((doc) => /git clone|from the clone/.test(doc.code))
      .map((doc) => doc.path)
      .filter((path) => !(path in NEEDS_A_CLONE));
    expect(cloning, "these ask for a clone without being named as needing one").toEqual([]);
  });
});

/**
 * Every pre-1.0 dependency is named in the rule that counts them.
 *
 * `operations.md` 6.2 records the `0.x` exposure and the fallback for each,
 * because a `0.x` minor is a major in every sense but the number. It said
 * "one dependency is pre-1.0" and asserted that every other was at a stable
 * major; by the time anybody re-read it there were three, and the two that
 * arrived — `sharp` and `@xmldom/xmldom` — had never been weighed.
 *
 * A count written in prose goes stale silently, which is the whole reason
 * this file exists for the *other* claim it checks. So the count is derived
 * from `package.json` rather than maintained by hand, and adding a `0.x`
 * dependency now fails until somebody has written down what breaks if it
 * breaks.
 */
describe("pre-1.0 dependencies", () => {
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const preRelease = new Set(
    Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })
      .filter(([, range]) => /^[\^~]?0\./.test(range))
      .map(([name]) => name),
  );

  const rule = readFileSync("docs/standards/operations.md", "utf8");
  /*
   * Section 6.2, sliced once for both directions below.
   *
   * It was sliced twice, identically, which oxlint noticed in an oblique way:
   * `prefer-set-has` fired on the second copy, because there it was a binding
   * used only for `.includes()`. The rule was wrong — this is a string, and
   * `String.prototype.includes` is a substring search rather than a
   * membership test, so a `Set` would be nonsense. `code/testing.md` 2.5 says
   * a check that fires on correct code gets narrowed rather than obeyed, and
   * the narrowing here is to stop writing the line twice.
   */
  const section = rule.slice(rule.indexOf("### 6.2"), rule.indexOf("### 6.3"));

  it("found some to check", () => {
    // If this ever legitimately reaches zero, the rule should say so and this
    // becomes the test that notices. An empty population passing silently is
    // the failure it is here to prevent.
    expect(preRelease.size).toBeGreaterThan(0);
  });

  it("names every one of them in operations.md 6.2", () => {
    expect(section.length, "operations.md has no section 6.2").toBeGreaterThan(200);

    const unnamed = [...preRelease].filter((name) => !section.includes(`\`${name}\``));
    expect(unnamed, "pre-1.0 and not named in operations.md 6.2").toEqual([]);
  });

  it("names nothing there that has since reached 1.0", () => {
    // The other direction: a dependency that grew up and left a paragraph
    // behind describing a risk that no longer exists.
    const declared = { ...manifest.dependencies, ...manifest.devDependencies };
    const stale = Object.keys(declared).filter(
      (name) => section.includes(`\`${name}\``) && !preRelease.has(name),
    );
    expect(stale, "named as pre-1.0 in operations.md 6.2 but no longer is").toEqual([]);
  });
});
