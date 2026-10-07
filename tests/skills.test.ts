import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sourceFiles, type SourceFile } from "./support/source";

/**
 * Every skill a document sends somebody to is a skill this repository has.
 *
 * A skill is named in prose far more often than it is linked, so renaming one
 * leaves its old name wherever it was cited, and nothing fails: the name is
 * only text. When `app-alignment` became `sync-from-app`, the legal review
 * went on telling its reader to run `app-alignment` first, the roadmap went on
 * citing its §0, and `brand.css` its §4, and none of it was caught until
 * somebody read the sentences. A skill is read by whoever is about to do the
 * work, so a dead name there sends them nowhere at the moment they rely on it.
 *
 * `CHANGELOG.md` is left out on purpose: it is a history, and a name that was
 * true when it was written is correct there.
 */

const SKILLS_DIR = ".claude/skills";
const skills = new Set(
  readdirSync(SKILLS_DIR).filter((entry) => statSync(`${SKILLS_DIR}/${entry}`).isDirectory()),
);

/** The guides, the skills, and the two files at the root that name skills. */
const documents: readonly SourceFile[] = [
  ...sourceFiles("docs", /\.md$/),
  ...sourceFiles(".claude", /\.md$/),
  ...["AGENTS.md", "README.md"].map((path) => ({ path, code: readFileSync(path, "utf8") })),
];

/**
 * The source and the workflows, which cite skills in comments and in the
 * issue a workflow opens. They are read only for the unambiguous forms below,
 * because they are also full of backticked hyphenated names that are CSS
 * properties and HTML attributes. `tests/` is not read at all: a test names a
 * dead skill on purpose, as this file does.
 */
const source: readonly SourceFile[] = [
  ...sourceFiles("src", /\.(ts|tsx|css|json)$/),
  ...sourceFiles("scripts", /\.(mjs|js|json)$/),
  ...sourceFiles(".github", /\.ya?ml$/),
];

/**
 * Skills that live in the application's repository, which a document here may
 * name because the application runs them. Nothing here can see that
 * repository, so these are taken on trust and named rather than inferred.
 */
const APPLICATION_SKILLS: Record<string, string> = {
  "product-kit": "captures the screenshots and writes docs/product/",
};

/**
 * Backticked hyphenated names in the documents that are not skills.
 *
 * Every other one is taken to be a skill, because that is the shape every
 * skill here has but one, and it is how most of them are cited: bare, with
 * no "skill" beside it, as in "`design-review` is that pass". Package names
 * and ARIA attributes are recognized without a list. A new name that fails
 * here and is not a skill belongs in this record with what it is.
 */
const NOT_SKILLS: Record<string, string> = {
  "deployment-and-monetization": "the application's release branch",
  "force-static": "a Next route segment setting",
  "in-sync": "a status scripts/check-app-sync.mjs reports",
  "jsx-a11y": "an oxlint plugin",
  "no-console": "a lint rule",
  "no-noninteractive-element-to-interactive-role": "a jsx-a11y lint rule",
  "node-version-file": "an actions/setup-node input",
  "prefer-tag-over-role": "a jsx-a11y lint rule",
  "prefers-color-scheme": "a CSS media feature",
  "react-jsx": "a TypeScript JSX setting",
  "scroll-padding-top": "a CSS property",
  "ui-monospace": "a CSS generic font family",
  // The policy in `netlify.toml` names hosts per directive now that an ad
  // script ships, so the documents arguing about it name the directives.
  // `script-src` was here alone while it was the only one worth mentioning.
  "base-uri": "a Content-Security-Policy directive",
  "child-src": "a Content-Security-Policy directive",
  "connect-src": "a Content-Security-Policy directive",
  "default-src": "a Content-Security-Policy directive",
  "font-src": "a Content-Security-Policy directive",
  "form-action": "a Content-Security-Policy directive",
  "frame-ancestors": "a Content-Security-Policy directive",
  "frame-src": "a Content-Security-Policy directive",
  "img-src": "a Content-Security-Policy directive",
  "object-src": "a Content-Security-Policy directive",
  "script-src": "a Content-Security-Policy directive",
  "style-src": "a Content-Security-Policy directive",
  "upgrade-insecure-requests": "a Content-Security-Policy directive",
  "worker-src": "a Content-Security-Policy directive",
};

/**
 * An identifier rather than a name: `pub-9953156598757474`.
 *
 * Narrowed rather than listed, per `code/testing.md` 2.5. The publisher id has
 * the shape this sweep looks for and is not a name at all, and writing the
 * digits into a dictionary of things that are not skills would make a check
 * about documents depend on which AdSense account owns the site.
 */
const AN_IDENTIFIER = /-\d{6,}$/;

const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const packages = new Set(Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }));

function isNamedOtherwise(name: string): boolean {
  return (
    name in NOT_SKILLS ||
    name in APPLICATION_SKILLS ||
    packages.has(name) ||
    /^(aria|data)-/.test(name) ||
    AN_IDENTIFIER.test(name)
  );
}

/**
 * The forms that are a skill whatever shape the name has. `optimize` is one
 * word, so the hyphenated sweep below cannot see it, and these can: "the
 * `optimize` skill", "the optimize-images skill", "skill `x`", "`x` §2", and a
 * path into `.claude/skills/`.
 */
const CITED_AS_A_SKILL = [
  /`([a-z][a-z0-9-]*)`\**\s+skills?\b/g,
  /\b([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\s+skills?\b/g,
  /\b[Ss]kills?\s+\**`([a-z][a-z0-9-]*)`/g,
  /`([a-z][a-z0-9-]*)`\**\s+§\s*\d/g,
  /\.claude\/skills\/([a-z0-9-]+)/g,
];

/** Every backticked hyphenated name, the shape all but one skill here has. */
const HYPHENATED = /`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`/g;

/** `path:line name` for every name `patterns` finds that is not one of `known`. */
function unresolved(
  files: readonly SourceFile[],
  patterns: readonly RegExp[],
  known: ReadonlySet<string> = skills,
): string[] {
  const offenders: string[] = [];
  for (const file of files) {
    for (const [index, line] of file.code.split("\n").entries()) {
      for (const pattern of patterns) {
        for (const [, name = ""] of line.matchAll(pattern)) {
          if (known.has(name) || name in APPLICATION_SKILLS) continue;
          if (pattern === HYPHENATED && isNamedOtherwise(name)) continue;
          offenders.push(`${file.path}:${index + 1} ${name}`);
        }
      }
    }
  }
  return [...new Set(offenders)];
}

describe("the skills a document names", () => {
  it("found skills and documents to check", () => {
    // `code/testing.md` 2.1, per source, because each clears a threshold on
    // its own and would hide the others going quiet.
    expect(skills.size).toBeGreaterThan(5);
    expect(documents.filter((d) => d.path.startsWith("docs/")).length).toBeGreaterThan(5);
    expect(documents.filter((d) => d.path.startsWith(".claude/")).length).toBeGreaterThan(5);
    expect(source.filter((f) => f.path.startsWith("src/")).length).toBeGreaterThan(20);
  });

  it("names only skills that exist, in the guides and the skills", () => {
    expect(unresolved(documents, [...CITED_AS_A_SKILL, HYPHENATED])).toEqual([]);
  });

  it("names only skills that exist, in the source and the workflows", () => {
    expect(unresolved(source, CITED_AS_A_SKILL)).toEqual([]);
  });

  it("cites only sections a skill has", () => {
    /*
     * `` `sync-from-app` §4 `` is how a guide points at one step of a skill,
     * and `tests/standards-citations.test.ts` holds the same form for the
     * guides but not for the skills. A renumbered skill is the same failure
     * as a renamed one, one level down.
     */
    const broken: string[] = [];
    for (const file of [...documents, ...source]) {
      for (const [, name = "", section] of file.code.matchAll(
        /`([a-z][a-z0-9-]*)`\**\s+§\s*(\d+)/g,
      )) {
        if (!skills.has(name)) continue; // the checks above own this case
        const skill = readFileSync(`${SKILLS_DIR}/${name}/SKILL.md`, "utf8");
        if (!new RegExp(`^## ${section}\\.`, "m").test(skill)) {
          broken.push(`${file.path} cites ${name} §${section}, which it does not have`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it("gives every skill the name of its own directory", () => {
    // The name in the frontmatter is the one somebody types. A directory
    // renamed without it keeps answering to the old name.
    const mismatched = [...skills].filter((dir) => {
      const file = `${SKILLS_DIR}/${dir}/SKILL.md`;
      const name = existsSync(file) ? /^name:\s*(.+)$/m.exec(readFileSync(file, "utf8"))?.[1] : "";
      return name?.trim() !== dir;
    });
    expect(mismatched).toEqual([]);
  });

  it("lists every skill in AGENTS.md", () => {
    // The other direction: a skill nobody is told about is a procedure
    // nobody runs.
    const agents = readFileSync("AGENTS.md", "utf8");
    expect([...skills].filter((name) => !agents.includes(`\`${name}\``))).toEqual([]);
  });

  it("catches a dead name however it is cited, and nothing else", () => {
    // Fixtures, so the patterns are tested directly rather than through what
    // the documents happen to say today, against a fixed pair of skills so a
    // rename done properly does not fail them. `code/testing.md` 2.6.
    const known = new Set(["sync-from-app", "optimize"]);
    const check = (line: string) =>
      unresolved([{ path: "fixture.md", code: line }], [...CITED_AS_A_SKILL, HYPHENATED], known);
    const dead = [
      "run **`app-alignment`** first or alongside.",
      "- `app-alignment` — check every claim",
      "| `app-alignment` §0, a one-line diff |",
      "the `tidy` skill, which owns this",
      "Refreshed by the app-alignment skill",
      "See `.claude/skills/app-alignment/SKILL.md`.",
    ];
    for (const line of dead) {
      expect(check(line), line).toHaveLength(1);
    }
    const fine = [
      "run **`sync-from-app`** first",
      "the `optimize` skill",
      "`prefers-color-scheme` and `aria-hidden` on decoration",
      "`rehype-pretty-code` emits",
      "a skill is read by whoever is about to do the work",
    ];
    for (const line of fine) {
      expect(check(line), line).toEqual([]);
    }
  });
});

/**
 * A dollar sign and a digit, or `$ARGUMENTS`, anywhere in a skill.
 *
 * Claude Code replaces each of these with the words the skill was invoked
 * with, counting from zero, before the text reaches whoever runs it. So a
 * shell function reading `$1` is a substitution site rather than an argument:
 * `sync-from-app` was invoked with a request whose second word was
 * "application", and its `kit()` helper arrived fetching
 * `docs/product/application`, which 404s, for every file it was asked for.
 * `awk`'s `$0` is the same trap, and so is a price, which is why "$3 a month"
 * is matched below rather than excused.
 */
const FILLED_IN = /\$(\{?\d|ARGUMENTS\b)/;

describe("a skill's text, as the person running it receives it", () => {
  it("leaves nothing for Claude Code to fill in", () => {
    const offenders = [...skills].flatMap((name) =>
      readFileSync(`${SKILLS_DIR}/${name}/SKILL.md`, "utf8")
        .split("\n")
        .flatMap((line, index) =>
          FILLED_IN.test(line) ? [`${name}/SKILL.md:${index + 1} ${line.trim()}`] : [],
        ),
    );
    expect(offenders).toEqual([]);
  });

  it("matches every form that is filled in, and no variable with a name", () => {
    const filled = [
      'kit() { curl -fsSL "…/docs/product/$1"; }',
      "awk '/^## / { print $0 }'",
      'echo "${2}"',
      "pass $ARGUMENTS through",
      "Premium is $3 a month",
    ];
    for (const line of filled) {
      expect(line, line).toMatch(FILLED_IN);
    }
    const kept = ['for file; do curl "…/$file"; done', 'echo "$APP@$SHA"', 'node -e "…" "$@"'];
    for (const line of kept) {
      expect(line, line).not.toMatch(FILLED_IN);
    }
  });
});
