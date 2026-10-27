import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceFiles } from "./support/source";

/**
 * The guides cite the code. This proves the citations point somewhere.
 *
 * What it can do: prove a cited file exists, that a cited line is inside it,
 * and that the line has something on it. What it cannot do is prove the line
 * still holds what the sentence claims — `docs/standards/writing.md`
 * §Citations says so out loud, so nobody trusts this further than it goes.
 *
 * "Landed on a blank line" is a cheap proxy for "drifted", and it is the one
 * mechanical signal available.
 */

/**
 * Every document that cites a rule, which includes the skills.
 *
 * `.claude/` was outside this for a while, and that is exactly how the
 * `update-dependencies` skill went on pointing at `operations.md` 5.2 and 5.3
 * through a renumbering that made them 6.2 and 6.3. A skill is read by
 * whoever is about to do the work, so a wrong citation there sends somebody
 * to the wrong rule at the moment they are relying on it — which is worse
 * than the same mistake in a guide, where the reader is already browsing.
 */
const guides = sourceFiles("docs", /\.md$/)
  .concat(sourceFiles(".claude", /\.md$/))
  .concat(
    existsSync("AGENTS.md") ? [{ path: "AGENTS.md", code: readFileSync("AGENTS.md", "utf8") }] : [],
  );

/**
 * `src/app/page.tsx:42` or `src/app/page.tsx:42-51`, inside backticks, and
 * the two spellings the guides write after one: a range's end,
 * `` `…:42`–`51` ``, and another line of the same file, `` `…:42`, `:60` ``
 * or `` `…:42` and `:60` ``, the `and` free to start the next line.
 */
const CITATION =
  /`((?:src|tests|scripts|content)\/[\w./[\]-]+?):(\d+)(?:-(\d+))?`(?:–`(\d+)`|((?:(?:,|\s+and)\s+`:\d+`)+))?/g;

/** Every line a citation names: its start, its range's end if any, and each line after it. */
function citedLines(match: RegExpMatchArray): { start: number; end?: number; more: number[] } {
  const [, , start, hyphenEnd, dashEnd, more] = match;
  const end = hyphenEnd ?? dashEnd;
  return {
    start: Number(start),
    ...(end ? { end: Number(end) } : {}),
    more: [...(more ?? "").matchAll(/`:(\d+)`/g)].map(([, line]) => Number(line)),
  };
}

describe("the guides' citations", () => {
  it("found guides to check, including the skills", () => {
    /*
     * Both halves, named separately. `code/testing.md` 2.1 — a sweep asserts
     * its population first — and here the population has two sources, so a
     * bare count would stay green if `.claude/` stopped being read: `docs/`
     * alone clears any threshold worth setting, and the check would quietly
     * return to the scope that let the stale citation through.
     */
    expect(guides.filter((g) => g.path.startsWith("docs/")).length).toBeGreaterThan(5);
    expect(
      guides.filter((g) => g.path.startsWith(".claude/")).length,
      "the skills are no longer being read",
    ).toBeGreaterThan(5);
  });

  it("names files that exist", () => {
    const missing: string[] = [];
    for (const guide of guides) {
      for (const [, file] of guide.code.matchAll(CITATION)) {
        if (!existsSync(file!)) missing.push(`${guide.path} -> ${file}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("lands on a line with something on it", () => {
    const drifted: string[] = [];
    for (const guide of guides) {
      for (const match of guide.code.matchAll(CITATION)) {
        const file = match[1]!;
        if (!existsSync(file)) continue;
        const lines = readFileSync(file, "utf8").split("\n");
        const { start, end, more } = citedLines(match);
        for (const number of [start, ...(end ? [end] : []), ...more]) {
          const line = lines[number - 1];
          if (line === undefined)
            drifted.push(`${guide.path} -> ${file}:${number} is past the end`);
          else if (line.trim() === "") drifted.push(`${guide.path} -> ${file}:${number} is blank`);
        }
      }
    }
    expect(drifted).toEqual([]);
  });

  it("ends a range after it starts", () => {
    /*
     * Only the start was read, so a pass that moved every citation by the
     * size of a diff moved a range's start and left its end, and
     * `` `tests/a11y.test.ts:329`–`309` `` named a range that ran backwards
     * beside a `` `:303` `` that now named a different function. A range end
     * before its start is the one drift this can see for certain; the other
     * is the person's read `writing.md` §Citations describes.
     */
    const backwards: string[] = [];
    let ranges = 0;
    for (const guide of guides) {
      for (const match of guide.code.matchAll(CITATION)) {
        const { start, end } = citedLines(match);
        if (end === undefined) continue;
        ranges += 1;
        if (end <= start) backwards.push(`${guide.path} -> ${match[0]}`);
      }
    }
    expect(ranges, "no range found, so this checks nothing").toBeGreaterThan(5);
    expect(backwards).toEqual([]);
  });

  it("cites section numbers that exist in the guide named", () => {
    /*
     * Prose citations of the form `` `operations.md` 9 `` — a filename and a
     * section number, with no line number for the existing check to hold.
     *
     * **What it catches, and what it does not.** It proves the section
     * number exists in the guide named. It cannot prove it is the *right*
     * section, and the bug that prompted it would have walked straight past:
     * `docs/roadmap.md` cited `operations.md` 7 for the DNS records, and
     * renumbering had moved DNS to 9 while 7 became something else. Seven
     * still existed, so this check would have passed it.
     *
     * It is worth having anyway, for the half it does catch — a renumber
     * that shortens a guide, and a number somebody invented — and it is
     * documented here so nobody trusts it further. A citation that landed on
     * a real but wrong section is a person's read, the same way
     * `writing.md` §Citations says a drifted line number is.
     *
     * **Any depth of directory**, because both spellings occur: a guide
     * writes `` `operations.md` 6.2 `` and a skill writes
     * `` `docs/standards/operations.md` 6.3 ``. The pattern allowed one
     * segment, so the second form — the one the skills mostly use — was never
     * checked, which is half of why the stale citation survived a renumber.
     */
    const CITE = /`((?:[a-z-]+\/)*[a-z-]+\.md)` (\d+)(?:\.\d+)?\b/g;
    const broken: string[] = [];

    for (const guide of guides) {
      for (const [, name, section] of guide.code.matchAll(CITE)) {
        const target = guides.find((g) => g.path.endsWith(`/${name}`) || g.path === name);
        if (!target) continue; // the filename check above owns this case
        const headings = [...target.code.matchAll(/^## (\d+)\./gm)].map((m) => m[1]);
        if (headings.length === 0) continue; // a guide with no numbered sections
        if (!headings.includes(section!)) {
          broken.push(`${guide.path} cites ${name} ${section}, which has no such section`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it("links to guide pages that exist", () => {
    const broken: string[] = [];
    const LINK = /\]\((?!https?:|#)([^)#]+)(?:#[^)]*)?\)/g;
    for (const guide of guides) {
      const dir = guide.path.includes("/") ? guide.path.replace(/\/[^/]+$/, "") : ".";
      for (const [, target] of guide.code.matchAll(LINK)) {
        const resolved = target!.startsWith("/")
          ? target!.slice(1)
          : `${dir}/${target}`.replace(/\/\.\//g, "/");
        // Resolve "../" by hand rather than pulling in path.resolve, which
        // would anchor on cwd and hide a genuinely wrong relative link.
        const parts: string[] = [];
        for (const piece of resolved.split("/")) {
          if (piece === "..") parts.pop();
          else if (piece !== "." && piece !== "") parts.push(piece);
        }
        const full = parts.join("/");
        if (!existsSync(full)) broken.push(`${guide.path} -> ${target}`);
      }
    }
    expect(broken).toEqual([]);
  });
});
