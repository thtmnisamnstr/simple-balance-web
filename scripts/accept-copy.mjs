/**
 * Record that this site's words have been re-read against the application's.
 *
 * `src/content/copy-source.json` holds the application's description of each
 * feature **as it was when the copy here was written**.
 * `tests/copy-provenance.test.ts` compares it against the current pull and
 * fails for any feature whose description has moved, naming that feature.
 *
 * That is the whole mechanism for keeping the copy stable across releases.
 * Without it, every sync is an invitation to rewrite the homepage, and the
 * words drift release to release for no reason a reader could name. With it,
 * a release that changes three features prompts three rewrites and leaves
 * the other fourteen alone.
 *
 *   npm run copy:accept            # accept everything
 *   npm run copy:accept -- budgets # accept one feature
 *
 * **Run it after changing the copy, never instead of.** Accepting without
 * rewriting turns a failing test green and leaves the page describing the
 * old product — the same trap as refreshing the facts snapshot, and the
 * reason both files say so at the top.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "src/content/copy-source.json";
const PULLED = "src/content/app-features.json";

const pulled = JSON.parse(readFileSync(PULLED, "utf8"));
const accepted = JSON.parse(readFileSync(SOURCE, "utf8"));
const only = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

const current = new Map(pulled.features.map((feature) => [feature.id, feature]));
const changed = [];
const added = [];
const removed = [];

for (const [id, feature] of current) {
  const was = accepted.entries[id];
  if (!was) {
    added.push(id);
    continue;
  }
  if (was.plain !== feature.plain || was.why !== feature.why || was.name !== feature.name) {
    changed.push(id);
  }
}
for (const id of Object.keys(accepted.entries)) {
  if (!current.has(id)) removed.push(id);
}

const touch = (id) => only.length === 0 || only.includes(id);

for (const [id, feature] of current) {
  if (!touch(id)) continue;
  accepted.entries[id] = {
    name: feature.name,
    plain: feature.plain,
    why: feature.why,
    tier: feature.tier,
    rank: feature.rank,
  };
}
// A feature the application dropped stops being something this site owes
// copy for. Removing it here is what lets the test stay strict.
for (const id of removed) {
  if (touch(id)) delete accepted.entries[id];
}

if (only.length === 0) {
  accepted.acceptedFor = pulled.source.commit;
  accepted.acceptedAt = new Date().toISOString().slice(0, 10);
}

writeFileSync(SOURCE, `${JSON.stringify(accepted, null, 2)}\n`);

const report = (label, ids) => (ids.length > 0 ? `${label}: ${ids.join(", ")}` : null);
const lines = [
  report("changed", changed),
  report("added", added),
  report("removed", removed),
].filter(Boolean);

console.log(
  lines.length > 0
    ? `Accepted. ${lines.join(" | ")}`
    : "Accepted. Nothing had changed — the copy was already current.",
);
if (only.length > 0) console.log(`Only: ${only.join(", ")}. The commit marker was left alone.`);
