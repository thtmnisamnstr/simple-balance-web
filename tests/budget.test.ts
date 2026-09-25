import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A weight budget for what the site ships.
 *
 * A static marketing site is fast until somebody adds a hero video, and the
 * commit that does it will not feel heavy to write. These are the numbers
 * this site currently meets with room to spare, so the check fails on a
 * change of kind rather than on a change of degree — and the point of it is
 * the conversation, not the number: raising a budget is fine, raising one
 * without noticing is not.
 *
 * Deliberately **not** a Lighthouse run. That measures a network and a CPU
 * neither of which is the same twice, and a flaky performance gate is one
 * people learn to re-run rather than read.
 */

function walk(dir: string): readonly string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk("out");
const kb = (bytes: number) => Math.round(bytes / 1024);

/**
 * Gzipped, because that is what crosses the network. Raw bytes overstate
 * text by roughly three to one and would make every budget here a number
 * about disk rather than about a reader waiting.
 */
const transferred = (paths: readonly string[]) =>
  paths.reduce((total, path) => total + gzipSync(readFileSync(path)).length, 0);

describe("what the site ships", () => {
  it("found a build to measure", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("keeps the JavaScript under 200 KB over the wire", () => {
    /*
     * About 170 KB of that is Next.js and React themselves, and the homepage
     * — which has no client component on it at all — pays nearly all of it.
     * That is the price of the framework rather than of anything written
     * here, and it is the honest cost of choosing Next for portability:
     * `docs/standards/operations.md` 1.1 records the trade and
     * `docs/roadmap.md` 8 records that the lever, if page weight ever
     * matters, is the framework and not the code.
     *
     * The budget is therefore set just above that floor. It catches a fourth
     * island, a charting library, an analytics script — a change of kind —
     * and it does not pretend the floor is something this repository chose
     * line by line.
     */
    const js = files.filter((f) => f.endsWith(".js"));
    const total = kb(transferred(js));
    expect(total, `${js.length} scripts totaling ${total} KB gzipped`).toBeLessThan(200);
  });

  it("keeps the CSS under 20 KB over the wire", () => {
    const total = kb(transferred(files.filter((f) => f.endsWith(".css"))));
    expect(total, `${total} KB of CSS gzipped`).toBeLessThan(20);
  });

  it("keeps every image under 200 KB", () => {
    // One oversized image costs more than every script on the page.
    const heavy = files
      .filter((f) => /\.(png|jpe?g|webp|gif|avif)$/.test(f))
      .filter((f) => statSync(f).size > 200 * 1024)
      .map((f) => `${f} is ${kb(statSync(f).size)} KB`);
    expect(heavy).toEqual([]);
  });

  it("keeps the homepage's own HTML under 40 KB over the wire", () => {
    const total = kb(transferred(["out/index.html"]));
    expect(total, `${total} KB of HTML gzipped`).toBeLessThan(40);
  });

  it("ships no source maps to production", () => {
    // They are a build artifact, they are large, and they hand a reader the
    // original source of every dependency.
    expect(files.filter((f) => f.endsWith(".map"))).toEqual([]);
  });

  it("ships no stray development files", () => {
    const strays = files.filter((f) => /\.(ts|tsx|md|mdx)$/.test(f));
    expect(strays).toEqual([]);
  });
});
