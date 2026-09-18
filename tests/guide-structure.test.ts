import { describe, expect, it } from "vitest";
import { sourceFiles } from "./support/source";

/**
 * The guides' own structure.
 *
 * This exists because of a defect in the guides themselves: five subsections
 * were appended to `content.md` with `>>` and landed *after* the section that
 * followed them, so `5.9` to `5.13` sat below `## 6`. Every one read correctly
 * on its own and the document was wrong, and nothing noticed — the citation
 * test checks where a rule points, not where the rule is.
 *
 * Appending to a file is the natural way to add a rule and the natural way to
 * get this wrong, so it is worth a check rather than a habit.
 */

const guides = sourceFiles("docs", /\.md$/);

/** `## 5.` / `### 5.12` headings, in the order they appear. */
function numberedHeadings(markdown: string): readonly { level: number; number: string }[] {
  const out: { level: number; number: string }[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3}) (\d+(?:\.\d+)?)[. ]/.exec(line);
    if (match) out.push({ level: match[1]!.length, number: match[2]! });
  }
  return out;
}

describe("the guides' numbering", () => {
  it("found numbered guides to check", () => {
    const withNumbers = guides.filter((g) => numberedHeadings(g.code).length > 0);
    expect(withNumbers.length).toBeGreaterThanOrEqual(3);
  });

  it("never repeats a number within one guide", () => {
    for (const guide of guides) {
      const numbers = numberedHeadings(guide.code).map((h) => h.number);
      const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
      expect(duplicates, `${guide.path} repeats a heading number`).toEqual([]);
    }
  });

  it("keeps every subsection under its own section", () => {
    for (const guide of guides) {
      const out: string[] = [];
      let section: number | undefined;
      for (const heading of numberedHeadings(guide.code)) {
        if (heading.level === 2) {
          section = Number(heading.number);
          continue;
        }
        const parent = Number(heading.number.split(".")[0]);
        if (section !== undefined && parent !== section) {
          out.push(`${guide.path}: ${heading.number} sits under section ${section}`);
        }
      }
      expect(out).toEqual([]);
    }
  });

  it("numbers sections and subsections in ascending order", () => {
    for (const guide of guides) {
      const headings = numberedHeadings(guide.code);
      const sections = headings.filter((h) => h.level === 2).map((h) => Number(h.number));
      expect(sections, `${guide.path} sections are out of order`).toEqual(
        sections.toSorted((a, b) => a - b),
      );

      for (const section of new Set(sections)) {
        const subs = headings
          .filter((h) => h.level === 3 && Number(h.number.split(".")[0]) === section)
          .map((h) => Number(h.number.split(".")[1]));
        expect(subs, `${guide.path} section ${section} subsections are out of order`).toEqual(
          subs.toSorted((a, b) => a - b),
        );
      }
    }
  });
});
