/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * The weekly drift check's decisions, held offline.
 *
 * `scripts/check-app-sync.mjs` is the only thing in this repository that
 * reads the application over the network, and it runs on a schedule nobody
 * watches. Its first version read `main` unless told otherwise, where the kit
 * is not yet, and compared only the contract and the feature list. So every
 * scheduled run could only report "could not tell", and pointed at the
 * release branch by hand it said "in sync" while eight of the homepage's
 * twelve pictures were a capture the application had replaced. Both were
 * decisions nothing had ever exercised.
 *
 * So the decisions live in `scripts/lib/app-sync.mjs` as functions of what
 * they are handed, and the ones that have to ask the network ask through an
 * `io` or a `send` these tests fake. The link scan it shares with the build
 * is held by `tests/app-links.test.ts`; what the drift check does with it is
 * here.
 */

/*
 * Imported through a path held in a variable, and typed by hand below.
 *
 * `tsconfig.json` sets `allowJs: false`, so a literal import of an `.mjs`
 * fails the typecheck with "could not find a declaration file", and a
 * declaration beside the script would be a second description of it that
 * nothing checks against the first. A variable specifier is typed `any`;
 * the `AppSync` shape is what these tests rely on, and a function that stops
 * matching it fails here at run time, by name. `process.cwd()` for the same
 * reason as `tests/support/source.ts`: Vitest runs from the project root.
 */
const LIB = join(process.cwd(), "scripts/lib/app-sync.mjs");

type Pull = {
  number: number;
  head: { ref: string; sha: string; repo: { full_name: string } | null };
};
type Io = {
  hasKit: (repository: string, ref: string) => Promise<boolean>;
  openPulls: () => Promise<Pull[]>;
};
type Resolution = {
  ref: string | null;
  read: string | null;
  pullRequest: number | null;
  why: string;
};
type Change = { what: string; detail: string; side?: string; files?: string[] };
type Source = { ref?: string; commit?: string } | undefined;
type Feature = { id: string; plain: string; why: string; tier: string };
type Link = { file: string; line: number; kind: string; target: string; url: string };
type Sent = { url: string; method: string; headers: Record<string, string> };
type Send = (
  url: string,
  init: { method: string; headers: Record<string, string> },
) => Promise<{ status: number; ok: boolean }>;
type AppSync = {
  request: (
    options: { url: string; method?: string; token?: string | null },
    send: Send,
  ) => Promise<{ status: number } | null>;
  compareLinks: (resolution: Resolution, links: Link[]) => Change[];
  formatReport: (input: {
    repository: string;
    resolution: Resolution | null;
    status: string;
    changes: Change[];
    note: string | null;
  }) => string;
  refFromEnv: (env: Record<string, string | undefined>) => string | null;
  resolveRef: (
    options: { repository: string; appRef: string | null },
    io: Io,
  ) => Promise<Resolution>;
  describeResolution: (repository: string, resolution: Resolution) => string;
  shippedScreenshots: (names: string[]) => string[];
  compareScreenshots: (input: {
    files: string[];
    site: Map<string, Uint8Array | null>;
    app: Map<string, Uint8Array | null>;
    capturedAt?: { app?: string | null; site?: string | null };
  }) => Change[];
  compareProvenance: (
    resolution: Resolution,
    snapshots: { file: string; source: Source }[],
  ) => Change[];
  compareFacts: (published: unknown, snapshot: { facts: unknown }) => Change[];
  compareFeatures: (
    published: { appVersion?: string; features: Feature[] },
    snapshot: { appVersion?: string; features: Feature[] },
  ) => Change[];
  statusOf: (input: { unreachable: string | null; changes: Change[] }) => string;
  EXIT_CODES: Record<string, number>;
};

const sync = (await import(LIB)) as AppSync;

const APP = "thtmnisamnstr/simple-balance";
const RELEASE_SHA = "0d62baadb80938800f4616721b7225b6a982c413";

const pull = (number: number, ref: string, sha: string, repo: string | null = APP): Pull => ({
  number,
  head: { ref, sha, repo: repo === null ? null : { full_name: repo } },
});

/*
 * The repository as it stood the week this was written: `main` has no kit,
 * the release is PR #39, and the Dependabot pull requests into `main` carry
 * nothing because they branch from it.
 */
const TODAY = [
  pull(40, "dependabot/docker/bases-80bbe5f662", "a".repeat(40)),
  pull(39, "deployment-and-monetization", RELEASE_SHA),
  pull(45, "dependabot/npm_and_yarn/majors-248eb536e2", "b".repeat(40)),
];

const bytes = (text: string) => new TextEncoder().encode(text);

const feature = (id: string, tier = "A", plain = "p", why = "w"): Feature => ({
  id,
  tier,
  plain,
  why,
});

/** Both snapshots, recording the same source. */
const both = (ref: string, commit = RELEASE_SHA) => [
  { file: "src/content/app-facts.json", source: { ref, commit } },
  { file: "src/content/app-features.json", source: { ref, commit } },
];

/** A fake GitHub: which refs carry the kit, and a record of what it was asked. */
function github({ kit, pulls = TODAY }: { kit: string[]; pulls?: Pull[] }) {
  const asked: string[] = [];
  const io: Io = {
    hasKit: async (repository, ref) => {
      asked.push(`${repository}@${ref}`);
      return kit.includes(ref);
    },
    openPulls: async () => {
      asked.push("pulls");
      return pulls;
    },
  };
  return { io, asked };
}

describe("which ref the check reads", () => {
  it("reads main whenever main carries the kit, and asks nothing more", async () => {
    // Asking main first is what moves the check back after the merge. The
    // application's delete_branch_on_merge was off when this was written, so
    // GitHub leaves a merged branch in place, and whether somebody deletes it
    // by hand is anybody's guess. A rule that preferred the branch could keep
    // reading it forever.
    const { io, asked } = github({ kit: ["main", RELEASE_SHA] });
    const resolved = await sync.resolveRef({ repository: APP, appRef: null }, io);
    expect(resolved).toMatchObject({ ref: "main", read: "main", pullRequest: null });
    expect(resolved.why).toMatch(/main carries the kit/);
    expect(asked).toEqual([`${APP}@main`]);
  });

  it("reads the open release pull request's head while main does not carry it", async () => {
    const { io } = github({ kit: [RELEASE_SHA] });
    const resolved = await sync.resolveRef({ repository: APP, appRef: null }, io);
    expect(resolved).toMatchObject({
      ref: "deployment-and-monetization",
      // By commit, so every file comes from one version of the kit.
      read: RELEASE_SHA,
      pullRequest: 39,
    });
    expect(sync.describeResolution(APP, resolved)).toBe(
      `Reading unmerged PR ${APP}#39 (deployment-and-monetization), because main does not carry the kit yet.`,
    );
  });

  it("takes the lowest-numbered of several, and says so", async () => {
    const other = "c".repeat(40);
    const { io } = github({
      kit: [RELEASE_SHA, other],
      // Out of order on purpose: the rule is the number, not the order the
      // API happened to return them in.
      pulls: [pull(52, "next-release", other), ...TODAY],
    });
    const resolved = await sync.resolveRef({ repository: APP, appRef: null }, io);
    expect(resolved.pullRequest).toBe(39);
    expect(resolved.ref).toBe("deployment-and-monetization");
    expect(resolved.why).toContain(`${APP}#39, ${APP}#52`);
    expect(resolved.why).toMatch(/lowest number wins/);
  });

  it("writes every pull request with its repository, so the site's issue links the application's", async () => {
    // The report is the body of an issue in this site's repository, where a
    // bare #39 is the site's own #39.
    const { io } = github({
      kit: [RELEASE_SHA, "c".repeat(40)],
      pulls: [pull(52, "next-release", "c".repeat(40)), ...TODAY],
    });
    const text = sync.describeResolution(
      APP,
      await sync.resolveRef({ repository: APP, appRef: null }, io),
    );
    expect(text.match(/[^\s(]*#\d+/g)).toEqual([`${APP}#39`, `${APP}#39`, `${APP}#52`]);
  });

  it("ignores a fork's branch, even one that carries the kit", async () => {
    const fork = "d".repeat(40);
    const { io } = github({
      kit: [fork],
      pulls: [pull(12, "main", fork, "stranger/simple-balance"), pull(13, "gone", fork, null)],
    });
    const resolved = await sync.resolveRef({ repository: APP, appRef: null }, io);
    expect(resolved.ref).toBeNull();
  });

  it("finds nothing when neither main nor any open pull request carries it", async () => {
    const { io } = github({ kit: [] });
    const resolved = await sync.resolveRef({ repository: APP, appRef: null }, io);
    expect(resolved).toMatchObject({ ref: null, read: null, pullRequest: null });
    expect(resolved.why).toMatch(/no open pull request/);
  });

  it("lets APP_REF override everything, without asking GitHub anything", async () => {
    const { io, asked } = github({ kit: ["main"] });
    const appRef = sync.refFromEnv({ APP_REF: "some-branch" });
    const resolved = await sync.resolveRef({ repository: APP, appRef }, io);
    expect(resolved).toMatchObject({ ref: "some-branch", read: "some-branch", pullRequest: null });
    expect(resolved.why).toMatch(/APP_REF/);
    expect(asked).toEqual([]);
  });

  it("reads an empty APP_REF as no override", () => {
    // `${{ vars.APP_REF }}` expands to "" when the variable is unset.
    expect(sync.refFromEnv({ APP_REF: "" })).toBeNull();
    expect(sync.refFromEnv({ APP_REF: "  " })).toBeNull();
    expect(sync.refFromEnv({})).toBeNull();
  });

  // A rate limit read as a 404 would walk on to the next candidate and report
  // the wrong ref with confidence. Both probes, separately: main's failing and
  // a pull request head's failing are different lines.
  it.each(["main", RELEASE_SHA])(
    "lets a failure probing %s reach the caller rather than read as 'not here'",
    async (failing) => {
      const io: Io = {
        hasKit: async (_, ref) => {
          if (ref === failing) throw new Error("HTTP 429");
          return false;
        },
        openPulls: async () => TODAY,
      };
      await expect(sync.resolveRef({ repository: APP, appRef: null }, io)).rejects.toThrow("429");
    },
  );
});

describe("the screenshots", () => {
  it("are the images directly under public/screenshots/, in both themes", () => {
    const files = sync.shippedScreenshots([
      "1200",
      "CAPTURE.json",
      "payees-light.webp",
      "payees-dark.webp",
      "dashboard-light.webp",
      "dashboard-dark.webp",
      "import-light.webp",
    ]);
    expect(files.length).toBeGreaterThan(0);
    expect(files).toEqual([
      "dashboard-light.webp",
      "dashboard-dark.webp",
      "import-light.webp",
      // Expected because its light twin ships: the page swaps them by theme.
      "import-dark.webp",
      "payees-light.webp",
      "payees-dark.webp",
    ]);
  });

  it("report nothing when every image matches, whatever the capture dates say", () => {
    const changes = sync.compareScreenshots({
      files: ["dashboard-light.webp"],
      site: new Map([["dashboard-light.webp", bytes("usd")]]),
      app: new Map([["dashboard-light.webp", bytes("usd")]]),
      capturedAt: { app: "2026-09-21", site: "2026-09-18" },
    });
    expect(changes).toEqual([]);
  });

  it("name each image whose bytes differ from the application's", () => {
    const changes = sync.compareScreenshots({
      files: ["dashboard-light.webp", "import-light.webp"],
      site: new Map([
        ["dashboard-light.webp", bytes("euro")],
        ["import-light.webp", bytes("drop target")],
      ]),
      app: new Map([
        ["dashboard-light.webp", bytes("dollar")],
        ["import-light.webp", bytes("drop target")],
      ]),
      capturedAt: { app: "2026-09-21", site: "2026-09-18" },
    });
    expect(changes).toHaveLength(1);
    expect(changes[0]!.files).toEqual(["dashboard-light.webp"]);
    expect(changes[0]!.detail).toContain("2026-09-21");
  });

  it("report an image missing here, and one the application stopped publishing", () => {
    const changes = sync.compareScreenshots({
      files: ["import-light.webp", "import-dark.webp", "old-light.webp"],
      site: new Map([
        ["import-light.webp", bytes("x")],
        ["import-dark.webp", null],
        ["old-light.webp", bytes("y")],
      ]),
      app: new Map([
        ["import-light.webp", bytes("x")],
        ["import-dark.webp", bytes("z")],
        ["old-light.webp", null],
      ]),
    });
    expect(changes.map((c) => c.files)).toEqual([["import-dark.webp"], ["old-light.webp"]]);
    // A missing copy is this checkout's gap; an image the kit dropped is the
    // application's change.
    expect(changes.map((c) => c.side)).toEqual(["site", "app"]);
  });
});

describe("where the snapshots say they came from", () => {
  const onMain: Resolution = { ref: "main", read: "main", pullRequest: null, why: "" };
  const onRelease: Resolution = {
    ref: "deployment-and-monetization",
    read: RELEASE_SHA,
    pullRequest: 39,
    why: "",
  };

  it("flags a branch snapshot once main carries the kit, which is what switches the site back", () => {
    // The week the release merges, the content is identical and every other
    // comparison passes. This is the only thing that says to re-pull.
    const changes = sync.compareProvenance(onMain, both("deployment-and-monetization"));
    expect(changes).toHaveLength(1);
    expect(changes[0]!.detail).toContain("re-pull from main");
    expect(changes[0]!.detail).toContain("src/content/app-facts.json");
  });

  it("is quiet when both snapshots came from main and the check reads main", () => {
    expect(sync.compareProvenance(onMain, both("main"))).toEqual([]);
  });

  it("is quiet while the check itself is reading the release branch", () => {
    // Before the merge, naming the branch is the truth rather than drift.
    expect(sync.compareProvenance(onRelease, both("deployment-and-monetization"))).toEqual([]);
  });

  it("flags two snapshots that name different refs or different commits", () => {
    const refs = sync.compareProvenance(onRelease, [
      {
        file: "src/content/app-facts.json",
        source: { ref: "frozen-accounts", commit: RELEASE_SHA },
      },
      {
        file: "src/content/app-features.json",
        source: { ref: "deployment-and-monetization", commit: RELEASE_SHA },
      },
    ]);
    expect(refs.map((c) => c.what)).toEqual(["snapshots that disagree"]);

    const commits = sync.compareProvenance(onRelease, [
      { file: "src/content/app-facts.json", source: { ref: "main", commit: "e".repeat(40) } },
      { file: "src/content/app-features.json", source: { ref: "main", commit: RELEASE_SHA } },
    ]);
    expect(commits.map((c) => c.what)).toEqual(["snapshots that disagree"]);
  });

  it("counts both as the site's own records, not as the application moving", () => {
    const changes = sync.compareProvenance(onMain, [
      { file: "src/content/app-facts.json", source: { ref: "frozen-accounts", commit: "f" } },
      { file: "src/content/app-features.json", source: { ref: "main", commit: RELEASE_SHA } },
    ]);
    expect(changes).toHaveLength(2);
    expect(changes.map((c) => c.side)).toEqual(["site", "site"]);
  });
});

describe("the links into the application", () => {
  const onMain: Resolution = { ref: "main", read: "main", pullRequest: null, why: "" };
  const link = (target: string, file = "content/docs/getting-started.md", line = 88): Link => ({
    file,
    line,
    kind: "blob",
    target,
    url: `https://github.com/${APP}/blob/${target}`,
  });

  it("names every link still pointing at the release branch once the check reads main", () => {
    // The week the release merges: every link resolves, the kit is identical,
    // and nothing else here would say the links name a branch.
    const changes = sync.compareLinks(onMain, [
      link("deployment-and-monetization/docs/deployment.md"),
      link("main/LICENSE", "src/content/home.ts", 427),
      link("deployment-and-monetization/.env.example", "content/docs/configuration.md", 13),
    ]);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ side: "site" });
    expect(changes[0]!.files).toEqual([
      "content/docs/getting-started.md",
      "content/docs/configuration.md",
    ]);
    expect(changes[0]!.detail).toContain("2 links name deployment-and-monetization");
    expect(changes[0]!.detail).toContain("content/docs/configuration.md:13");
    expect(changes[0]!.detail).not.toContain("src/content/home.ts");
  });

  it("is quiet while every link names the ref the check read", () => {
    const onRelease: Resolution = { ...onMain, ref: "deployment-and-monetization" };
    expect(
      sync.compareLinks(onRelease, [link("deployment-and-monetization/docs/deployment.md")]),
    ).toEqual([]);
  });

  it("reads a ref with a slash in it whole, rather than cutting at the first one", () => {
    const slashed: Resolution = { ...onMain, ref: "release/0.2.0" };
    expect(sync.compareLinks(slashed, [link("release/0.2.0/docs/deployment.md")])).toEqual([]);
    expect(sync.compareLinks(slashed, [link("release/docs/deployment.md")])).toHaveLength(1);
    expect(sync.compareLinks(slashed, [link("release/0.2.0.1/docs/x.md")])).toHaveLength(1);
  });

  it("takes a link to the ref itself as naming it", () => {
    // Otherwise the report says "1 link names release/0.2.0 ... This check
    // read release/0.2.0; point them there."
    const slashed: Resolution = { ...onMain, ref: "release/0.2.0" };
    for (const target of ["release/0.2.0", "release/0.2.0/", "release/0.2.0#readme"]) {
      expect(sync.compareLinks(slashed, [link(target)]), target).toEqual([]);
    }
  });
});

describe("the report", () => {
  const resolution: Resolution = { ref: "main", read: "main", pullRequest: null, why: "x" };
  const report = (changes: Change[]) =>
    sync.formatReport({ repository: APP, resolution, status: "drifted", changes, note: null });

  it("does not say the application moved when only the site's records need attention", () => {
    const text = report([{ what: "snapshots that disagree", detail: "d", side: "site" }]);
    expect(text).toContain(`This site's record of ${APP}@main needs attention:`);
    expect(text).not.toContain("has moved");
  });

  it("heads the application's changes and the site's separately when there are both", () => {
    const text = report([
      { what: "snapshots that disagree", detail: "d", side: "site" },
      { what: "the product contract", detail: "c", side: "app" },
    ]);
    const moved = text.indexOf(`${APP}@main has moved:`);
    const ours = text.indexOf("needs attention:");
    expect(moved).toBeGreaterThan(-1);
    expect(ours).toBeGreaterThan(moved);
    expect(text.indexOf("the product contract")).toBeLessThan(ours);
    expect(text.indexOf("snapshots that disagree")).toBeGreaterThan(ours);
  });
});

describe("asking GitHub", () => {
  const RAW = "https://raw.githubusercontent.com/o/r/main/docs/product/facts.json";
  const API = "https://api.github.com/repos/o/r/pulls";

  function transport(...statuses: number[]) {
    const sent: Sent[] = [];
    const send: Send = async (url, init) => {
      sent.push({ url, ...init });
      const status = statuses.shift() ?? 500;
      return { status, ok: status >= 200 && status < 300 };
    };
    return { send, sent };
  }

  it.each([RAW, API])("sends the token to %s", async (url) => {
    const { send, sent } = transport(200);
    await sync.request({ url, token: "t" }, send);
    expect(sent).toHaveLength(1);
    expect(sent[0]!.headers.Authorization).toBe("Bearer t");
  });

  it("sends the API's own headers to the API and not to the raw host", async () => {
    const { send, sent } = transport(200, 200);
    await sync.request({ url: API }, send);
    await sync.request({ url: RAW }, send);
    expect(sent[0]!.headers["X-GitHub-Api-Version"]).toBeDefined();
    expect(sent[1]!.headers["X-GitHub-Api-Version"]).toBeUndefined();
  });

  it.each([401, 403])(
    "asks again without the token when it is refused with %i",
    async (refused) => {
      const { send, sent } = transport(refused, 200);
      const response = await sync.request({ url: RAW, method: "HEAD", token: "t" }, send);
      expect(response?.status).toBe(200);
      expect(sent.map((s) => s.headers.Authorization)).toEqual(["Bearer t", undefined]);
      expect(sent.map((s) => s.method)).toEqual(["HEAD", "HEAD"]);
    },
  );

  it("does not take a 404 that came back with a token as 'not on this ref'", async () => {
    // Read as an answer, a 404 the token caused would send resolveRef on to
    // the next candidate with confidence.
    const found = transport(404, 200);
    expect(await sync.request({ url: RAW, token: "t" }, found.send)).not.toBeNull();

    const missing = transport(404, 404);
    expect(await sync.request({ url: RAW, token: "t" }, missing.send)).toBeNull();
    expect(missing.sent).toHaveLength(2);
  });

  it("asks once without a token, and throws for anything but a 200 or a 404", async () => {
    const { send, sent } = transport(403);
    await expect(sync.request({ url: RAW }, send)).rejects.toThrow("HTTP 403");
    expect(sent).toHaveLength(1);
    expect(sent[0]!.headers.Authorization).toBeUndefined();
  });
});

describe("the contract and the feature list", () => {
  it("reports a moved contract, and nothing for an identical one", () => {
    expect(sync.compareFacts({ price: "3" }, { facts: { price: "3" } })).toEqual([]);
    expect(sync.compareFacts({ price: "4" }, { facts: { price: "3" } })).toHaveLength(1);
  });

  it("reports added, dropped, reworded and re-tiered features, and a new release", () => {
    const changes = sync.compareFeatures(
      {
        appVersion: "0.2.0",
        features: [feature("kept", "A", "new words"), feature("moved", "B"), feature("new")],
      },
      { appVersion: "0.1.6", features: [feature("kept"), feature("moved", "A"), feature("gone")] },
    );
    expect(changes.map((c) => c.what)).toEqual([
      "new features",
      "features removed",
      "descriptions reworded",
      "features re-tiered",
      "a new release",
    ]);
  });
});

describe("the answer", () => {
  it("keeps 'could not tell' distinct from both other answers", () => {
    const change: Change = { what: "x", detail: "y" };
    expect(sync.EXIT_CODES[sync.statusOf({ unreachable: null, changes: [] })]).toBe(0);
    expect(sync.EXIT_CODES[sync.statusOf({ unreachable: null, changes: [change] })]).toBe(1);
    // Whatever it found before it stopped, a check that could not finish
    // looking has said neither "in sync" nor "drifted".
    expect(sync.EXIT_CODES[sync.statusOf({ unreachable: "down", changes: [change] })]).toBe(2);
  });
});

describe("the boundary", () => {
  it("keeps the library free of network and filesystem access of its own", () => {
    // What makes every test above possible. A `fetch` or an `fs` read inside
    // the library would be a decision these tests cannot reach.
    // Calls and quoted module names rather than the words: the library's own
    // header names them in prose, to say they are not there. Any quoted name
    // catches a static import, an `export ... from`, a dynamic `import()` and
    // a `require()` alike, including a subpath such as fs/promises.
    const code = readFileSync(LIB, "utf8");
    expect(code).toContain("export async function resolveRef");
    expect(code).not.toMatch(/\bfetch\s*\(/);
    expect(code).not.toMatch(/\brequire\s*\(/);
    expect(code).not.toMatch(
      /["'`](?:node:)?(?:fs|https?|http2|net|tls|dgram|child_process|module)(?:\/[^"'`]*)?["'`]/,
    );
  });

  it("gives the workflow's check step a token for the pulls listing", () => {
    // Without one the API allows sixty requests an hour per address, and a
    // hosted runner's address is shared, so the weekly run would sometimes
    // report "could not tell" for no reason in the application.
    const workflow = readFileSync(join(process.cwd(), ".github/workflows/app-sync.yml"), "utf8");
    const start = workflow.indexOf("- name: Check the application");
    const step = workflow.slice(start, workflow.indexOf("- name:", start + 1));
    expect(step).toContain("node scripts/check-app-sync.mjs");
    expect(step).toMatch(/GITHUB_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/);
  });
});

/*
 * The workflow's issue steps, run as the runner runs them: `bash -e` on the
 * step's own script, read out of the YAML, with a `gh` on the PATH that
 * answers from a list of issues and records everything else it is asked.
 * The `-q` queries go through a real `jq`, the language `gh` evaluates them
 * in and a program GitHub's Ubuntu runners carry, so the query that picks the
 * issue is exercised rather than restated. The search is loose on purpose,
 * any title containing the phrase, because GitHub's is not exact either, and
 * the exact match is the query's job.
 */
type Issue = { number: number; title: string; state: "OPEN" | "CLOSED" };
const open = (number: number, title: string): Issue => ({ number, title, state: "OPEN" });
const closed = (number: number, title: string): Issue => ({ number, title, state: "CLOSED" });

describe("the issue", () => {
  const workflow = readFileSync(join(process.cwd(), ".github/workflows/app-sync.yml"), "utf8");
  /*
   * The check job's own `env:`, which every step inherits. `run` hands the
   * titles to a step as the runner would only if they are set there and only
   * there: set on the check step instead, a read of the whole file still
   * finds them while on the runner both issue steps see empty titles and
   * open an issue with none, and a second setting on a step overrides the
   * job's where `run` can't see.
   */
  const jobEnv = (() => {
    const lines = workflow.split("\n");
    const job = lines.indexOf("  check:");
    const jobEnd = lines.findIndex((line, index) => index > job && /^ {0,2}\S/.test(line));
    const start = lines.findIndex((line, index) => index > job && line === "    env:");
    if (job === -1 || start === -1 || (jobEnd !== -1 && start > jobEnd)) return "";
    const end = lines.findIndex((line, index) => index > start && /^ {0,4}\S/.test(line));
    return lines.slice(start + 1, end === -1 ? undefined : end).join("\n");
  })();
  const setting = (key: string) =>
    new RegExp(String.raw`^ {6}${key}: (.+)$`, "m").exec(jobEnv)?.[1] ?? "";
  const TITLE = setting("ISSUE_TITLE");
  const LEGACY = setting("LEGACY_TITLE");

  const GH = `#!/usr/bin/env bash
jq -cn '$ARGS.positional' --args -- "$@" >> "$GH_LOG"
[ "$1 $2" = "issue list" ] || exit 0
shift 2
state=open
while [ $# -gt 0 ]; do
  case "$1" in
    --state) state=$2; shift 2 ;;
    --search) search=$2; shift 2 ;;
    -q) query=$2; shift 2 ;;
    *) shift ;;
  esac
done
phrase=$(printf '%s' "$search" | sed -e 's/ in:title$//' -e 's/^"//' -e 's/"$//')
jq --arg state "$state" --arg phrase "$phrase" '[.[]
  | select($state == "all" or .state == ($state | ascii_upcase))
  | select(.title | ascii_downcase | contains($phrase | ascii_downcase))]' "$GH_ISSUES" \\
  | jq -r "$query"
`;

  /** The `run` script of the step named `name`, dedented. */
  function script(name: string) {
    const lines = workflow.split("\n");
    const start = lines.findIndex((line) => line.trim() === `- name: ${name}`);
    expect(start, name).toBeGreaterThan(-1);
    const next = lines.findIndex((line, index) => index > start && /^\s*- name:/.test(line));
    const step = lines.slice(start, next === -1 ? undefined : next);
    const runLine = step.findIndex((line) => /^\s+run: \|$/.test(line));
    expect(runLine, name).toBeGreaterThan(-1);
    const indent = step[runLine]!.search(/\S/);
    const body = step.slice(runLine + 1);
    const end = body.findIndex((line) => line.trim() !== "" && line.search(/\S/) <= indent);
    return body
      .slice(0, end === -1 ? undefined : end)
      .map((line) => line.slice(indent + 2))
      .join("\n");
  }

  /** What the step did to issues, one line per `gh` call that was not a lookup. */
  function run(name: string, issues: Issue[]) {
    const dir = mkdtempSync(join(tmpdir(), "app-sync-"));
    try {
      writeFileSync(join(dir, "gh"), GH, { mode: 0o755 });
      writeFileSync(join(dir, "issues.json"), JSON.stringify(issues));
      writeFileSync(join(dir, "step.sh"), script(name));
      const result = spawnSync("bash", ["--noprofile", "--norc", "-e", join(dir, "step.sh")], {
        encoding: "utf8",
        env: {
          NODE_ENV: "test",
          PATH: `${dir}:${process.env.PATH ?? ""}`,
          GH_LOG: join(dir, "log"),
          GH_ISSUES: join(dir, "issues.json"),
          GH_TOKEN: "t",
          ISSUE_TITLE: TITLE,
          LEGACY_TITLE: LEGACY,
          REPORT: "the report",
        },
      });
      expect(result.status, result.stderr).toBe(0);
      const log = join(dir, "log");
      const calls = existsSync(log)
        ? readFileSync(log, "utf8")
            .trim()
            .split("\n")
            .map((line) => JSON.parse(line) as string[])
        : [];
      return calls
        .filter(([, verb]) => verb !== "list")
        .map((args) => {
          const [, verb, number] = args;
          const title = args[args.indexOf("--title") + 1];
          if (verb === "edit") return `edit #${number} as ${title}`;
          if (verb === "create") return `create ${title}`;
          return `${verb} #${number}`;
        });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it("names both titles in the job's env, and nowhere else", () => {
    expect(TITLE).toBe("The site is out of step with the application");
    expect(LEGACY).toBe("The application has changed");
    for (const key of ["ISSUE_TITLE", "LEGACY_TITLE"]) {
      expect(workflow.match(new RegExp(String.raw`^[ \t]*${key}:`, "gm")), key).toHaveLength(1);
    }
  });

  it.each([
    ["updates the open issue", [open(3, TITLE)], [`edit #3 as ${TITLE}`]],
    [
      "takes over an open issue under the old title, and renames it",
      [open(2, LEGACY)],
      [`edit #2 as ${TITLE}`],
    ],
    [
      "reopens the latest closed issue rather than opening another",
      [closed(3, TITLE), closed(7, TITLE), closed(9, LEGACY)],
      ["reopen #7", `edit #7 as ${TITLE}`],
    ],
    [
      "reopens a closed issue under the old title when none has the new one",
      [closed(9, LEGACY)],
      ["reopen #9", `edit #9 as ${TITLE}`],
    ],
    [
      "updates an open issue under either title before reopening a closed one",
      [open(2, LEGACY), closed(8, TITLE)],
      [`edit #2 as ${TITLE}`],
    ],
    ["opens one when there is none", [], [`create ${TITLE}`]],
    [
      "does not take an issue whose title only contains the title",
      [open(4, `${TITLE}, again`), closed(5, `Re: ${LEGACY}`)],
      [`create ${TITLE}`],
    ],
  ])("when something moved, %s", (_, issues, expected) => {
    expect(run("Open or update the issue", issues)).toEqual(expected);
  });

  it.each([
    ["closes the open issue", [open(3, TITLE)], ["close #3"]],
    ["closes one still under the old title", [open(2, LEGACY)], ["close #2"]],
    ["leaves a closed one alone", [closed(3, TITLE)], []],
  ])("when it is back in sync, %s", (_, issues, expected) => {
    expect(run("Close the issue when it is back in sync", issues)).toEqual(expected);
  });
});
