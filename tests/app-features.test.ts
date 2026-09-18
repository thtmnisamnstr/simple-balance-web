import { describe, expect, it } from "vitest";
import pulled from "@/content/app-features.json";
import { agents, features, privacy, problems } from "@/content/home";

/**
 * This site's words against the application's feature list.
 *
 * `src/content/app-features.json` is the application's own list, pulled
 * verbatim by `sync-from-app` and never edited here. `src/content/home.ts`
 * is this site's rewrite of it for a reader who has never heard of
 * double-entry bookkeeping.
 *
 * **The rewrite is the point, so these do not compare wording.** A test that
 * required the site to repeat the application's sentences would make the
 * rewrite impossible, which is the opposite of what this pipeline is for.
 * What is checkable is the relationship: the site may say less than the
 * product does, and never more.
 */
const byTier = (tier: string) => pulled.features.filter((f) => f.tier === tier);

describe("the pulled feature list", () => {
  it("records where it came from", () => {
    expect(pulled.source.repository).toBe("https://github.com/thtmnisamnstr/simple-balance");
    expect(pulled.source.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(pulled.features.length).toBeGreaterThan(10);
  });

  it("is the application's, not something rewritten on the way in", () => {
    // Every entry must still carry the fields the application publishes. If
    // `why` has been stripped, somebody has been editing the record.
    for (const feature of pulled.features) {
      expect(feature.plain?.length, `${feature.id}`).toBeGreaterThan(20);
      expect(feature.why?.length, `${feature.id}`).toBeGreaterThan(20);
      expect(["A", "B", "C"]).toContain(feature.tier);
    }
  });
});

describe("what this site chose to say", () => {
  /** Every application feature this site claims to cover, from its own copy. */
  const covered = new Set([
    ...problems.flatMap((p) => p.covers),
    ...features.flatMap((f) => f.covers),
    ...privacy.covers,
    ...agents.covers,
  ]);

  it("covers every tier A feature", () => {
    // Tier A is the application's judgement of what a stranger reads first.
    // The site may word it however it likes; dropping one drops the reason
    // somebody would use the product.
    const uncovered = byTier("A")
      .map((feature) => feature.id)
      .filter((id) => !covered.has(id));
    expect(uncovered, "tier A features this site does not cover").toEqual([]);
  });

  it("covers most of tier B, and says which it skipped", () => {
    // Looser on purpose: tier B is "why they stay", and a landing page is
    // allowed to leave some of it for the docs. Most of it, though.
    const b = byTier("B").map((feature) => feature.id);
    const hit = b.filter((id) => covered.has(id));
    expect(hit.length / b.length, `covers ${hit.length} of ${b.length} tier B`).toBeGreaterThan(
      0.6,
    );
  });

  it("claims nothing the application does not publish", () => {
    // The site may say less. Saying more is a claim about a product that
    // does not exist, which `content.md` 2.1 is Binding about.
    const published = new Set(pulled.features.map((feature) => feature.id));
    const invented = [...covered].filter((id) => !published.has(id));
    expect(invented, "these are not in the application's feature list").toEqual([]);
  });

  it("does not simply reprint the application's sentences", () => {
    // If the site's copy were the pulled copy, the rewrite never happened
    // and a reader gets prose written for whoever read the code.
    const pulledText = new Set(pulled.features.map((feature) => feature.plain));
    const copied = features.map((feature) => feature.body).filter((body) => pulledText.has(body));
    expect(copied, "these were pasted rather than rewritten").toEqual([]);
  });
});
