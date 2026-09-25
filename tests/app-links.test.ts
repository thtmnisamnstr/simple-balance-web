/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { join } from "node:path";
import snapshot from "@/content/app-facts.json";
import { site } from "@/content/home";
import { sourceFiles } from "./support/source";

/**
 * The site's links into the application's repository, held offline.
 *
 * The docs link the application's deployment guides and the footer links its
 * license and changelog, and every one of those URLs names a ref. They name
 * the ref `src/content/app-facts.json` was taken from, so a reader following
 * one lands on the version of the application the rest of the site was
 * checked against. A link naming `main` while the site describes an unmerged
 * release sends them to instructions for a version without half of what the
 * page just told them about.
 *
 * The weekly drift check holds the same links to the ref it read over the
 * network, which is what notices them still naming the branch after the
 * merge. This holds them to the snapshot on every build. Both read them
 * through `appLinks` in `scripts/lib/app-sync.mjs`, so the two can't disagree
 * about what a link is.
 */

/* A variable specifier, for the reason `tests/app-sync.test.ts` gives. */
const LIB = join(process.cwd(), "scripts/lib/app-sync.mjs");

type Link = { file: string; line: number; kind: string; target: string; url: string };
type LinkScan = {
  LINK_SOURCES: { dir: string; match: RegExp }[];
  URL_ALIASES: string[];
  appLinks: (
    repository: string,
    files: { path: string; text: string }[],
  ) => { links: Link[]; unrecognized: { file: string; line: number; text: string }[] };
  linkPath: (link: Link, ref: string) => string | null;
  linkProblem: (link: Link, ref: string) => string | null;
};

const sync = (await import(LIB)) as LinkScan;

const REPOSITORY = new URL(snapshot.source.repository).pathname.slice(1);
const REF = snapshot.source.ref;

const files = sync.LINK_SOURCES.flatMap(({ dir, match }) => sourceFiles(dir, match)).map(
  ({ path, code }) => ({ path, text: code }),
);
const { links, unrecognized } = sync.appLinks(REPOSITORY, files);
const where = (link: Link) => `${link.file}:${link.line} ${link.url}`;

/*
 * What each name in `URL_ALIASES` stands for. A name added there without a
 * value here fails below, so the scan never trusts a spelling nobody has
 * shown to be the application's URL.
 */
const ALIAS_VALUES: Record<string, string> = { "site.sourceUrl": site.sourceUrl };

describe("the site's links into the application", () => {
  it("found pages and links to check", () => {
    expect(files.length).toBeGreaterThan(20);
    expect(links.length).toBeGreaterThan(0);
  });

  it("reads every file under content/ and src/ that links into the application", () => {
    // `LINK_SOURCES` is a claim about where links live. A file type it leaves
    // out, or a directory dropped from it, would still pass every test above.
    const scanned = new Set(files.map((file) => file.path));
    const missed = ["content", "src"]
      .flatMap((dir) => sourceFiles(dir, /./))
      .filter((file) => !scanned.has(file.path))
      .filter((file) => {
        const found = sync.appLinks(REPOSITORY, [{ path: file.path, text: file.code }]);
        return found.links.length > 0 || found.unrecognized.length > 0;
      })
      .map((file) => file.path);
    expect(missed).toEqual([]);
  });

  it("name the ref the snapshot was taken from, every one of them", () => {
    const elsewhere = links.filter((link) => sync.linkPath(link, REF) === null).map(where);
    expect(elsewhere, `these don't name ${REF}, the ref app-facts.json came from`).toEqual([]);
  });

  it("point at well-formed paths", () => {
    const malformed = links.flatMap((link) => {
      const problem = sync.linkProblem(link, REF);
      return problem ? [`${where(link)}: ${problem}`] : [];
    });
    expect(malformed).toEqual([]);
  });

  it("are all spelled in a way the scan can read", () => {
    // A spelling the scan doesn't know yields no links, and no links is no
    // failures: exactly what a site with every link right looks like.
    expect(unrecognized.map((u) => `${u.file}:${u.line} ${u.text}`)).toEqual([]);
    for (const alias of sync.URL_ALIASES) {
      expect(ALIAS_VALUES[alias], alias).toBe(snapshot.source.repository);
    }
  });
});

const scan = (text: string) => sync.appLinks("o/app", [{ path: "page.md", text }]);
const link = (target: string, kind = "blob"): Link => ({
  file: "page.md",
  line: 1,
  kind,
  target,
  url: `https://github.com/o/app/${kind}/${target}`,
});

describe("the scan", () => {
  it("finds a Markdown link, a bare one and one in a string, each where it ends", () => {
    const { links: found } = scan(
      [
        "See [the guide](https://github.com/o/app/blob/main/docs/a.md).",
        "Or https://github.com/o/app/tree/main/deploy/x and more.",
        'const url = "https://github.com/o/app/blob/main/LICENSE";',
      ].join("\n"),
    );
    expect(found.map((l) => [l.line, l.kind, l.target])).toEqual([
      [1, "blob", "main/docs/a.md"],
      [2, "tree", "main/deploy/x"],
      [3, "blob", "main/LICENSE"],
    ]);
  });

  it("reads the footer's spelling, built from site.sourceUrl", () => {
    const { links: found } = scan("{ href: `${site.sourceUrl}/blob/main/CHANGELOG.md` },");
    expect(found.map((l) => l.target)).toEqual(["main/CHANGELOG.md"]);
  });

  it("does not take a repository whose name starts with the application's for it", () => {
    expect(scan("https://github.com/o/app-web/blob/main/AGENTS.md")).toEqual({
      links: [],
      unrecognized: [],
    });
  });

  it("takes a link written with http: as the application's, and refuses the scheme", () => {
    // Read as another repository's, it passed every check here unread.
    const { links: found, unrecognized: unread } = scan(
      "See [the license](http://github.com/o/app/blob/main/LICENSE).",
    );
    expect(unread).toEqual([]);
    expect(found.map((l) => l.target)).toEqual(["main/LICENSE"]);
    expect(sync.linkProblem(found[0]!, "main")).toContain("http:");
    expect(sync.linkProblem(link("main/LICENSE"), "main")).toBeNull();
  });

  it.each([
    ["main/docs/a.md", "docs/a.md"],
    ["main", ""],
    ["main/", ""],
    ["main#readme", "#readme"],
    ["main?plain=1", "?plain=1"],
    ["mainline/docs/a.md", null],
    ["other/main/docs/a.md", null],
  ])("reads %s as naming main with the path %j", (target, path) => {
    expect(sync.linkPath(link(target), "main")).toBe(path);
  });

  it("reports a /blob/ it can't attribute, rather than reading past it", () => {
    const { links: found, unrecognized: unread } = scan("x\n`${repo.url}/blob/main/LICENSE`");
    expect(found).toEqual([]);
    expect(unread).toEqual([{ file: "page.md", line: 2, text: "`${repo.url}/blob/main/LICENSE`" }]);
  });

  it.each([
    ["main/docs/deployment.md", "blob"],
    ["main/.env.example", "blob"],
    ["main/LICENSE", "blob"],
    ["main/docs/deployment.md#configure-the-application", "blob"],
    ["main/deploy/pulumi", "tree"],
    ["main/deploy/pulumi/", "tree"],
    ["main", "tree"],
    ["main/", "tree"],
    ["main#readme", "tree"],
  ])("accepts %s as a %s link", (target, kind) => {
    expect(sync.linkProblem(link(target, kind), "main")).toBeNull();
  });

  // Each with the reason it is refused, so every rule is shown to fail on
  // its own: `..` also ends in a period, and without the reason a missing
  // `..` rule would pass here on the period rule's account.
  it.each([
    ["main/docs/deployment.md.", "blob", "ending in a period"],
    ["main/docs//deployment.md", "blob", "empty segment"],
    ["main/docs/", "blob", "empty segment"],
    ["main/docs//", "tree", "empty segment"],
    ["main//", "tree", "empty segment"],
    ["main//#readme", "tree", "empty segment"],
    ["main/docs/../LICENSE", "blob", "a .. segment"],
    ["main/./LICENSE", "blob", "a . segment"],
    ["main/docs/a%20b.md", "blob", "a character"],
    ["main/docs/a.md?plain=1", "blob", "a character"],
    ["main?plain=1", "blob", "a character"],
    ["main/docs/a.md#one#two", "blob", "more than one #"],
    ["main/docs/a.md#a.b", "blob", "a malformed anchor"],
    ["main", "blob", "no path"],
  ])("refuses %s as a %s link, for %s", (target, kind, reason) => {
    expect(sync.linkProblem(link(target, kind), "main")).toContain(reason);
  });
});
