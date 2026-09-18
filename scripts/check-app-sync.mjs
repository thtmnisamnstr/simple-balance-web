/**
 * Ask whether the application has changed in a way this site should reflect.
 *
 * Everything else in this repository answers "does the site agree with the
 * snapshot it holds" — on every build, offline. **Nothing answered "has the
 * application moved since that snapshot was taken"**, because that needs the
 * network and a test that needs the network is a test that fails when
 * somebody else has an outage.
 *
 * So it lives here, run on a schedule by `.github/workflows/app-sync.yml`,
 * which opens an issue rather than changing anything. Copy is a judgement;
 * an automated pull request that rewrites the homepage is the wrong shape.
 *
 *   node scripts/check-app-sync.mjs            # human-readable
 *   node scripts/check-app-sync.mjs --json     # for the workflow
 *
 * Exits 0 when in sync, 1 when something moved, 2 when it could not tell —
 * and the third is deliberately distinct, because "the application has not
 * changed" and "I could not reach the application" must never look alike.
 */
const APP = process.env.APP_REPO ?? "thtmnisamnstr/simple-balance";
const REF = process.env.APP_REF ?? "main";
const RAW = `https://raw.githubusercontent.com/${APP}/${REF}/docs/product`;
const asJson = process.argv.includes("--json");

async function fetchKit(name) {
  const response = await fetch(`${RAW}/${name}`);
  if (response.status === 404) return { missing: true };
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return { data: await response.json() };
}

function readLocal(path) {
  return JSON.parse(require("node:fs").readFileSync(path, "utf8"));
}

const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);

const changes = [];
let unreachable = null;

try {
  const [facts, features] = await Promise.all([fetchKit("facts.json"), fetchKit("features.json")]);

  if (facts.missing || features.missing) {
    // Expected until the release that introduced the kit reaches `main`.
    // Not an error, and not "in sync" either.
    unreachable = `docs/product/ is not on ${APP}@${REF} yet. It is published by the release that introduces it; until that merges there is nothing to compare.`;
  } else {
    const localFacts = readLocal("src/content/app-facts.json");
    const localFeatures = readLocal("src/content/app-features.json");

    if (JSON.stringify(facts.data) !== JSON.stringify(localFacts.facts)) {
      changes.push({
        what: "the product contract",
        detail:
          "Plans, labels, the free account limit or the prices have moved. " +
          "This changes the pricing page and possibly the terms.",
      });
    }

    const was = new Map(localFeatures.features.map((f) => [f.id, f]));
    const now = new Map(features.data.features.map((f) => [f.id, f]));

    const added = [...now.keys()].filter((id) => !was.has(id));
    const dropped = [...was.keys()].filter((id) => !now.has(id));
    const reworded = [...now.entries()]
      .filter(
        ([id, f]) => was.has(id) && (was.get(id).plain !== f.plain || was.get(id).why !== f.why),
      )
      .map(([id]) => id);
    const retiered = [...now.entries()]
      .filter(([id, f]) => was.has(id) && was.get(id).tier !== f.tier)
      .map(([id]) => `${id} (${was.get(id).tier} to ${now.get(id).tier})`);

    if (added.length) changes.push({ what: "new features", detail: added.join(", ") });
    if (dropped.length) changes.push({ what: "features removed", detail: dropped.join(", ") });
    if (reworded.length)
      changes.push({ what: "descriptions reworded", detail: reworded.join(", ") });
    if (retiered.length) changes.push({ what: "features re-tiered", detail: retiered.join(", ") });

    const localVersion = localFeatures.appVersion ?? "unknown";
    if (features.data.appVersion && features.data.appVersion !== localVersion) {
      changes.push({
        what: "a new release",
        detail: `The site describes ${localVersion}; the application is on ${features.data.appVersion}.`,
      });
    }
  }
} catch (error) {
  unreachable = `Could not read the application's kit: ${error.message}`;
}

const status = unreachable ? "unknown" : changes.length > 0 ? "drifted" : "in-sync";
const result = { status, ref: REF, repository: APP, changes, note: unreachable };

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else if (unreachable) {
  console.log(`Could not tell.\n\n${unreachable}`);
} else if (changes.length === 0) {
  console.log(`In sync with ${APP}@${REF}. Nothing a reader could see has changed.`);
} else {
  console.log(`${APP}@${REF} has moved:\n`);
  for (const change of changes) console.log(`  ${change.what} — ${change.detail}`);
  console.log("\nRun the sync-from-app skill.");
}

process.exit(status === "in-sync" ? 0 : status === "drifted" ? 1 : 2);
