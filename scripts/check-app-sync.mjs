/**
 * Ask whether the application has changed in a way this site should reflect,
 * and whether the site's own record of it still holds together.
 *
 * Everything else in this repository answers "does the site agree with the
 * snapshot it holds" — on every build, offline. **Nothing answered "has the
 * application moved since that snapshot was taken"**, because that needs the
 * network and a test that needs the network is a test that fails when
 * somebody else has an outage.
 *
 * So it lives here, run on a schedule by `.github/workflows/app-sync.yml`,
 * which opens an issue rather than changing anything. Copy is a judgment;
 * an automated pull request that rewrites the homepage is the wrong shape.
 *
 *   node scripts/check-app-sync.mjs            # human-readable; the workflow puts it in the issue
 *   node scripts/check-app-sync.mjs --json     # for the sync-from-app skill
 *   APP_REF=<ref> node scripts/check-app-sync.mjs
 *
 * Exits 0 when in sync, 1 when something needs doing, 2 when it could not
 * tell — and the third is deliberately distinct, because "the application has
 * not changed" and "I could not reach the application" must never look alike.
 *
 * **This file is only the I/O.** Which ref to read, how to ask GitHub, and
 * every comparison are in `scripts/lib/app-sync.mjs`, where
 * `tests/app-sync.test.ts` can hold them offline. The version before this one
 * kept the decisions inline, read `main` unless `APP_REF` named another ref,
 * and compared only `facts.json` and `features.json`. Pointed at the release
 * branch, it called the site "in sync" while eight of the homepage's twelve
 * pictures were a capture the application had replaced.
 */
import { readdirSync, readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appLinks,
  compareFacts,
  compareFeatures,
  compareLinks,
  compareProvenance,
  compareScreenshots,
  EXIT_CODES,
  formatReport,
  LINK_SOURCES,
  MAIN,
  rawUrl,
  refFromEnv,
  request,
  resolveRef,
  shippedScreenshots,
  statusOf,
} from "./lib/app-sync.mjs";

const APP = process.env.APP_REPO ?? "thtmnisamnstr/simple-balance";
const asJson = process.argv.includes("--json");

/* Sent to both GitHub hosts, and dropped by `request` wherever it is turned
   down; the reasons are on `request`. */
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;
const ask = (url, method = "GET") => request({ url, method, token: TOKEN }, fetch);

/* Paths from this file rather than the working directory, so the check says
   the same thing from wherever it is run. */
const local = (path) => new URL(`../${path}`, import.meta.url);
const ROOT = fileURLToPath(local(""));

/* Thrown for this checkout's own files, so the report can say which side it
   could not read. "GitHub is down" and "this checkout is missing a file" are
   different problems with different people to fix them. */
class SiteFileError extends Error {}

function readSite(path, read) {
  try {
    return read(local(path));
  } catch (error) {
    throw new SiteFileError(`${path}: ${error.message}`);
  }
}
const readJson = (path) => readSite(path, (url) => JSON.parse(readFileSync(url, "utf8")));

/* A local file that may legitimately not exist, as `null` rather than a
   throw. Only for those: a snapshot that cannot be read is a failure to look,
   and has to reach the catch at the bottom as one. */
function absent(read) {
  try {
    return read();
  } catch {
    return null;
  }
}

/* Every file `LINK_SOURCES` names, skipping what `tests/support/source.ts`
   skips (dotfiles and node_modules), so this and `tests/app-links.test.ts`
   read the same population. */
function linkSources() {
  const files = [];
  for (const { dir, match } of LINK_SOURCES) {
    const entries = readSite(dir, (url) =>
      readdirSync(url, { recursive: true, withFileTypes: true }),
    );
    for (const entry of entries) {
      if (!entry.isFile() || !match.test(entry.name)) continue;
      const path = relative(ROOT, `${entry.parentPath}${sep}${entry.name}`).split(sep).join("/");
      if (path.split("/").some((part) => part.startsWith(".") || part === "node_modules")) continue;
      files.push({ path, text: readSite(path, (url) => readFileSync(url, "utf8")) });
    }
  }
  return files.toSorted((a, b) => a.path.localeCompare(b.path));
}

async function kitJson(ref, file) {
  const response = await ask(rawUrl(APP, ref, file));
  return response ? await response.json() : null;
}

async function kitBytes(ref, file) {
  const response = await ask(rawUrl(APP, ref, `screenshots/${file}`));
  return response ? Buffer.from(await response.arrayBuffer()) : null;
}

const io = {
  // HEAD rather than GET: the probe only needs the status, and the file is
  // fetched properly once the ref is chosen.
  hasKit: async (repository, ref) =>
    (await ask(rawUrl(repository, ref, "facts.json"), "HEAD")) !== null,
  openPulls: async () => {
    // Ascending by creation, so the lowest numbers are on the first page and
    // the rule that the lowest number wins cannot be defeated by paging.
    const response = await ask(
      `https://api.github.com/repos/${APP}/pulls?state=open&base=${MAIN}&sort=created&direction=asc&per_page=100`,
    );
    if (!response) throw new Error(`${APP} was not found on api.github.com`);
    return response.json();
  },
};

const changes = [];
let resolution = null;
let unreachable = null;

try {
  resolution = await resolveRef({ repository: APP, appRef: refFromEnv(process.env) }, io);

  if (resolution.ref === null) {
    unreachable =
      `docs/product/ is not on ${APP}@${MAIN}, and no open pull request into ${MAIN} carries it. ` +
      "It is published by the release that introduces it; until then there is nothing to compare.";
  } else {
    const [facts, features, shots] = await Promise.all([
      kitJson(resolution.read, "facts.json"),
      kitJson(resolution.read, "features.json"),
      kitJson(resolution.read, "screenshots.json"),
    ]);

    if (facts === null || features === null) {
      // Reached with an APP_REF that does not carry the kit. Not an error,
      // and not "in sync" either.
      unreachable = `docs/product/ is not on ${APP}@${resolution.ref}, so there is nothing to compare.`;
    } else {
      const factsSnapshot = readJson("src/content/app-facts.json");
      const featuresSnapshot = readJson("src/content/app-features.json");

      changes.push(...compareFacts(facts, factsSnapshot));
      changes.push(...compareFeatures(features, featuresSnapshot));

      const files = shippedScreenshots(readSite("public/screenshots", readdirSync));
      const published = await Promise.all(files.map((file) => kitBytes(resolution.read, file)));
      changes.push(
        ...compareScreenshots({
          files,
          site: new Map(
            files.map((file) => [
              file,
              absent(() => readFileSync(local(`public/screenshots/${file}`))),
            ]),
          ),
          app: new Map(files.map((file, index) => [file, published[index]])),
          // CAPTURE.json is the site's own note of when its copies were
          // taken. It only decorates the report, so a missing one is not a
          // failure.
          capturedAt: {
            app: shots?.capturedAt ?? null,
            site: absent(() => readJson("public/screenshots/CAPTURE.json").capturedAt ?? null),
          },
        }),
      );

      changes.push(
        ...compareProvenance(resolution, [
          { file: "src/content/app-facts.json", source: factsSnapshot.source },
          { file: "src/content/app-features.json", source: featuresSnapshot.source },
        ]),
      );

      // Against the ref this run read, which is not always the one the
      // snapshots name: the week the release merges, this reads `main` while
      // every link still names the branch, and that is the point.
      changes.push(...compareLinks(resolution, appLinks(APP, linkSources()).links));
    }
  }
} catch (error) {
  const side = error instanceof SiteFileError ? "this site's own files" : "the application's kit";
  unreachable = `Could not read ${side}: ${error.message}`;
}

const status = statusOf({ unreachable, changes });

if (asJson) {
  const result = {
    status,
    ref: resolution?.ref ?? null,
    why: resolution?.why ?? null,
    pullRequest: resolution?.pullRequest ?? null,
    // The commit every file was read from, when the resolution pinned one.
    // A pull request's head is read by its SHA; `main` and an override are
    // read by name, and GitHub resolves them.
    commit: resolution?.pullRequest ? resolution.read : null,
    repository: APP,
    changes,
    note: unreachable,
  };
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(formatReport({ repository: APP, resolution, status, changes, note: unreachable }));
}

process.exit(EXIT_CODES[status]);
