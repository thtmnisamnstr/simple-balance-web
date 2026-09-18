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

const guides = sourceFiles("docs", /\.md$/).concat(
  existsSync("AGENTS.md") ? [{ path: "AGENTS.md", code: readFileSync("AGENTS.md", "utf8") }] : [],
);

/** `src/app/page.tsx:42` or `src/app/page.tsx:42-51`, inside backticks. */
const CITATION = /`((?:src|tests|scripts|content)\/[\w./[\]-]+?):(\d+)(?:-(\d+))?`/g;

describe("the guides' citations", () => {
  it("found guides to check", () => {
    expect(guides.length).toBeGreaterThan(5);
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
      for (const [, file, start] of guide.code.matchAll(CITATION)) {
        if (!existsSync(file!)) continue;
        const lines = readFileSync(file!, "utf8").split("\n");
        const line = lines[Number(start) - 1];
        if (line === undefined) drifted.push(`${guide.path} -> ${file}:${start} is past the end`);
        else if (line.trim() === "") drifted.push(`${guide.path} -> ${file}:${start} is blank`);
      }
    }
    expect(drifted).toEqual([]);
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
     */
    const CITE = /`((?:[a-z-]+\/)?[a-z-]+\.md)` (\d+)(?:\.\d+)?\b/g;
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
