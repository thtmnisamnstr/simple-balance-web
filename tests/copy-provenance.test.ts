import { describe, expect, it } from "vitest";
import pulled from "@/content/app-features.json";
import accepted from "@/content/copy-source.json";
import { agents, features, privacy, problems } from "@/content/home";

/**
 * Whether this site's words still answer the application's current
 * description of itself.
 *
 * **This is the mechanism that keeps the copy stable across releases.**
 * `copy-source.json` holds the application's description of each feature as
 * it was when the words here were written. A release that changes three
 * descriptions fails for those three and nothing else, so the rewrite is
 * three sections rather than a homepage — and the other fourteen keep the
 * wording somebody already agreed was good.
 *
 * Without it every sync is an open invitation to rewrite everything, and the
 * page drifts release to release for no reason a reader could name.
 *
 * Accepting is an explicit act: `npm run copy:accept`, after changing the
 * copy and never instead of it.
 */

const coveredIds = new Set([
  ...problems.flatMap((p) => p.covers),
  ...features.flatMap((f) => f.covers),
  ...privacy.covers,
  ...agents.covers,
]);

const current = new Map(pulled.features.map((feature) => [feature.id, feature]));

describe("the copy's provenance", () => {
  it("has descriptions to compare", () => {
    expect(Object.keys(accepted.entries).length).toBeGreaterThan(10);
    expect(current.size).toBeGreaterThan(10);
  });

  it("records which pull the copy was accepted against", () => {
    expect(accepted.acceptedFor).toMatch(/^[0-9a-f]{40}$/);
    // The pull the snapshot now holds, not the one before it. `sync-from-app`
    // accepts the copy in §3 and moves the snapshot's commit in §5, so an
    // accept that is not run again after §5 records the previous pull, and the
    // record says the copy was checked against a list it was not.
    expect(accepted.acceptedFor, "run `npm run copy:accept` after the pull's §5").toBe(
      pulled.source.commit,
    );
  });

  it("was written from the descriptions the application publishes now", () => {
    /*
     * The failure names the feature and shows both sentences, because
     * "something changed upstream" is not actionable and "the application
     * now says X where it said Y" is.
     */
    const stale: string[] = [];
    for (const [id, feature] of current) {
      const was = accepted.entries[id as keyof typeof accepted.entries] as
        { name: string; plain: string; why: string } | undefined;
      if (!was) continue; // §"new features" below owns this
      if (was.plain !== feature.plain) {
        stale.push(`${id}: plain\n    was: ${was.plain}\n    now: ${feature.plain}`);
      } else if (was.why !== feature.why) {
        stale.push(`${id}: why\n    was: ${was.why}\n    now: ${feature.why}`);
      } else if (was.name !== feature.name) {
        stale.push(`${id}: renamed "${was.name}" to "${feature.name}"`);
      }
    }
    expect(stale, "re-read this site's copy for these, then `npm run copy:accept`").toEqual([]);
  });

  it("has a description recorded for every feature the site covers", () => {
    // A section covering a feature with no recorded source is a section
    // whose copy nobody can tell is current.
    const unrecorded = [...coveredIds].filter((id) => !(id in accepted.entries));
    expect(unrecorded, "covered by the site with no recorded source").toEqual([]);
  });

  it("notices a feature the application has added", () => {
    // Not a failure — the site may decline it — but it must be a decision,
    // so an unrecorded new feature fails until it has been looked at.
    const unseen = [...current.keys()].filter((id) => !(id in accepted.entries));
    expect(
      unseen,
      "the application added these; cover them or run `npm run copy:accept` to note them as seen",
    ).toEqual([]);
  });

  it("holds no description for a feature the application has dropped", () => {
    // The other direction: a dropped feature the site still covers is a
    // claim about a product that no longer does that.
    const orphaned = Object.keys(accepted.entries).filter((id) => !current.has(id));
    expect(orphaned, "the application dropped these; remove the copy covering them").toEqual([]);
  });

  it("keeps the tier and rank the copy was written against", () => {
    // Tier decides where a feature appears on the page. A feature promoted
    // from C to A while the site still buries it in the grid is the
    // application saying "this matters most" and the page disagreeing.
    const moved: string[] = [];
    for (const [id, feature] of current) {
      const was = accepted.entries[id as keyof typeof accepted.entries] as
        { tier: string; rank: number } | undefined;
      if (!was) continue;
      if (was.tier !== feature.tier) moved.push(`${id}: tier ${was.tier} -> ${feature.tier}`);
    }
    expect(moved, "re-place these on the page, then accept").toEqual([]);
  });
});
