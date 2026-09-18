import { describe, expect, it } from "vitest";
import { repoFile, sourceFiles } from "./support/source";

/**
 * The brand contract.
 *
 * `src/styles/brand.css` is a copy of the application's palette, and a copy
 * with nothing watching it is a copy that drifts. These checks cannot see the
 * application — it is a different repository — so they hold what can be held
 * from here: that the two theme blocks describe the same set of tokens, that
 * every token the site uses is one the contract declares, and that colour
 * appears nowhere else.
 */

/** CSS with comments removed. Both checks below look for text that also,
 *  legitimately, appears in prose explaining it — the first version of the
 *  `[data-theme]` check failed on brand.css's own note about why there is no
 *  such block. */
function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

const brand = withoutComments(repoFile("src/styles/brand.css"));

/** The declarations inside one `{ ... }` block, as a name -> value map. */
function tokensIn(block: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const match of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out.set(match[1]!, match[2]!.trim());
  }
  return out;
}

function lightBlock(): string {
  const start = brand.indexOf(":root {");
  const end = brand.indexOf("@media (prefers-color-scheme: dark)");
  expect(start, "brand.css has a :root block").toBeGreaterThan(-1);
  expect(end, "brand.css has a dark block").toBeGreaterThan(start);
  return brand.slice(start, end);
}

function darkBlock(): string {
  const start = brand.indexOf("@media (prefers-color-scheme: dark)");
  return brand.slice(start);
}

describe("the brand token contract", () => {
  it("declares the same token set in both themes", () => {
    const light = tokensIn(lightBlock());
    const dark = tokensIn(darkBlock());

    expect(light.size, "the light block declares tokens").toBeGreaterThan(25);
    expect([...light.keys()].toSorted()).toEqual([...dark.keys()].toSorted());
  });

  it("gives every token a different value in dark than in light, or says why", () => {
    // A token identical in both themes is usually a token somebody forgot to
    // re-pick for dark. Two are legitimately the same and are named here.
    const SAME_IN_BOTH = new Set([
      // White on the accent fill in both themes: the fill is dark enough in
      // each that the same white clears contrast, and picking a dark-theme
      // variant would make one of them grey text on green.
      "--on-accent",
      // The always-dark illustration surface. It depicts a dark thing rather
      // than following the page, so both themes paint it the same. The
      // application's `--art-*` set works the same way.
      "--art-base",
      "--art-ink",
      "--art-bar",
      "--art-hairline",
      "--on-art-muted",
    ]);
    const light = tokensIn(lightBlock());
    const dark = tokensIn(darkBlock());

    const identical = [...light.entries()]
      .filter(([name, value]) => dark.get(name) === value && !SAME_IN_BOTH.has(name))
      .map(([name]) => name);

    expect(identical, "a token with one value for both themes is usually an oversight").toEqual([]);
  });

  it("carries only two blocks while nothing stamps data-theme", () => {
    // The application has a third block for its explicit toggle. This site has
    // no toggle, so a `[data-theme]` block here would be unreachable CSS. If a
    // toggle lands, this expectation changes with it — deliberately, so that
    // adding the block is a decision rather than a drift.
    expect(brand).not.toContain("[data-theme");
    expect(brand.match(/prefers-color-scheme/g)?.length).toBe(1);
  });

  it("uses no token the contract does not declare", () => {
    const declared = new Set(tokensIn(brand).keys());
    const site = repoFile("src/styles/site.css");

    // Tokens the site declares for itself: the scales. Colour comes from the
    // contract; rhythm is this site's own. `src/styles/site.css` says why.
    for (const match of site.matchAll(/^\s{2}(--[a-z0-9-]+)\s*:/gm)) declared.add(match[1]!);

    // Declared by something other than a stylesheet, and named here with the
    // reason rather than loosening the check. Shiki writes `--shiki-light`
    // and `--shiki-dark` as inline styles on each token it highlights, so the
    // stylesheet reads them and correctly never declares them.
    declared.add("--shiki-light");
    declared.add("--shiki-dark");

    const used = [...site.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]!);
    const missing = [...new Set(used)].filter((name) => !declared.has(name));

    expect(missing, "site.css reads a token nothing declares").toEqual([]);
  });

  it("keeps raw colour out of every stylesheet but the contract", () => {
    // A hex outside brand.css is a colour that cannot re-theme, which is the
    // single failure that makes a dark mode look broken rather than absent.
    const offenders: string[] = [];
    for (const file of sourceFiles("src", /\.css$/)) {
      if (file.path.endsWith("brand.css")) continue;
      for (const [index, line] of withoutComments(file.code).split("\n").entries()) {
        if (/#[0-9a-f]{3,8}\b/i.test(line) || /\brgb\(/.test(line)) {
          offenders.push(`${file.path}:${index + 1} ${line.trim()}`);
        }
      }
    }
    expect(offenders, "colour outside brand.css cannot re-theme").toEqual([]);
  });

  it("keeps the theme-colour meta tags equal to the --ground tokens", () => {
    // A <meta name="theme-color"> cannot read a custom property, so the two
    // values are duplicated into `layout.tsx`. This is what stops the copy
    // drifting from the token it copies.
    const layout = repoFile("src/app/layout.tsx");
    const light = tokensIn(lightBlock()).get("--ground");
    const dark = tokensIn(darkBlock()).get("--ground");

    expect(light, "the light block declares --ground").toBeTruthy();
    expect(dark, "the dark block declares --ground").toBeTruthy();
    expect(layout).toContain(`color: "${light}"`);
    expect(layout).toContain(`color: "${dark}"`);
  });
});
