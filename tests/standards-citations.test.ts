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
