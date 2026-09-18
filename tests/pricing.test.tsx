import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PricingPage from "@/app/pricing/page";
import { comparison, faq, MAX_FREE_ACCOUNTS, tiers } from "@/content/pricing";

/**
 * The pricing page.
 *
 * Pricing is where an overstatement is most expensive, so these check the
 * claims as well as the markup. `docs/standards/content.md` 2.1 is Binding
 * about every claim being true of the shipped application, and nothing here
 * can read that application — it is a different repository — so what a test
 * *can* do is hold the page to its own stated numbers and catch the shapes
 * that go wrong silently.
 */

describe("the plans", () => {
  it("offers three, including self-hosting", () => {
    // The third column is the one most pricing pages would omit, and it is
    // the reason to believe the other two.
    expect(tiers.map((t) => t.key)).toEqual(["free", "premium", "self"]);
  });

  it("agrees with itself about the free account limit", () => {
    // The number appears in the tier summary, the comparison table and the
    // FAQ. Three copies is three chances to disagree after a change.
    //
    // Found by `id`, not by the visible label. The first version looked for
    // the row called "Financial accounts", so rewording that label for a
    // general reader broke a test about a number — a copy edit failing a
    // check it has nothing to do with.
    const row = comparison.find((r) => r.id === "accounts");
    expect(row?.free).toBe(String(MAX_FREE_ACCOUNTS));
    expect(tiers[0]?.summary).toContain(String(MAX_FREE_ACCOUNTS));
  });

  it("gives every comparison row a distinct id", () => {
    // The ids are what the checks above hold, so two rows sharing one would
    // make `find` return whichever came first and quietly stop checking the
    // other.
    const ids = comparison.map((row) => row.id);
    expect(ids).toEqual([...new Set(ids)]);
  });

  it("marks exactly one tier as the recommendation", () => {
    expect(tiers.filter((t) => t.featured)).toHaveLength(1);
  });

  it("gives self-hosting a real link and the paid tiers a pending label", () => {
    // The app is not deployed, so neither paid CTA may link anywhere.
    // `web.md` 6.1 — and this fails when the app ships, which is the point.
    expect(tiers.find((t) => t.key === "self")?.cta.href).toBeTruthy();
    for (const tier of tiers.filter((t) => t.key !== "self")) {
      expect(tier.cta.pending).toBe(true);
      expect(tier.cta.href).toBeUndefined();
    }
  });

  it("never claims a feature is held back from the free plan", () => {
    // The product's actual position: Premium raises a limit and removes ads.
    // A row where Free lacks something Premium has would be a new claim, and
    // one the application does not implement.
    const heldBack = comparison.filter(
      (row) => row.free === false && row.premium === true && row.id !== "own-hardware",
    );
    expect(heldBack.map((r) => r.id)).toEqual([]);
  });
});

describe("the pricing page", () => {
  it("has one h1 and steps its headings", () => {
    const { container } = render(<PricingPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const levels = [...container.querySelectorAll("h1,h2,h3")].map((n) => Number(n.tagName[1]));
    for (const [i, level] of levels.entries()) {
      if (i > 0) expect(level - levels[i - 1]!).toBeLessThanOrEqual(1);
    }
  });

  it("gives the comparison table a caption and row headers", () => {
    const { container } = render(<PricingPage />);
    const table = container.querySelector("table");
    expect(table?.querySelector("caption")).not.toBeNull();
    expect(table?.querySelectorAll('th[scope="row"]').length).toBe(comparison.length);
    expect(table?.querySelectorAll('th[scope="col"]').length).toBe(4);
  });

  it("does not leave a tick as the only signal in a cell", () => {
    // An icon with no text is silent to a screen reader. Every tick and dash
    // carries a word beside it.
    const { container } = render(<PricingPage />);
    for (const cell of container.querySelectorAll(".compare-yes, .compare-no")) {
      expect(cell.querySelector(".visually-hidden")?.textContent).toBeTruthy();
    }
  });

  it("scrolls the table inside its own container", () => {
    // Otherwise a phone scrolls the whole page sideways.
    const { container } = render(<PricingPage />);
    expect(container.querySelector(".table-wrap table")).not.toBeNull();
  });
});

/** As React escapes it into the markup. */
const escape = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;");

describe("the FAQ", () => {
  it("answers the questions a limit actually raises", () => {
    const questions = faq.map((f) => f.q.toLowerCase()).join(" ");
    /*
     * Phrased the way a reader phrases them, which is the point of the list.
     * It used to look for "archived" and "self-hosting" — both words the
     * product uses about itself and neither one a reader would type, so the
     * check was holding the page to the vocabulary the rewrite removed.
     *
     * "bank password" is the addition: it is the question this product can
     * answer and no competitor can, and a pricing page that drops it has
     * dropped the reason somebody is reading it.
     */
    for (const topic of [
      "more than three",
      "close an account",
      "cancel",
      "running it yourself",
      "bank password",
    ]) {
      expect(questions, `no question about ${topic}`).toContain(topic);
    }
  });

  it("publishes structured data whose answers are visible on the page", () => {
    /*
     * Google treats markup describing invisible content as spam, and
     * `content.md` 5.13 is Binding about every field being true of something
     * a reader can see.
     *
     * **The first version could not fail.** It searched the whole file for
     * each question — and the questions are *in* the JSON-LD block it was
     * meant to be validating against, so the assertion was satisfied by the
     * thing under test. Deleting every `<details>` element would have kept it
     * green. It also never looked at an answer at all, which is the half of
     * the payload most likely to drift.
     *
     * So the script tags come out first, and both halves are checked against
     * what is left.
     */
    const html = readFileSync("out/pricing/index.html", "utf8");
    expect(html).toContain('"@type":"FAQPage"');

    const visible = html.replaceAll(/<script[\s\S]*?<\/script>/g, "");

    for (const item of faq) {
      expect(visible, `question not rendered: ${item.q}`).toContain(escape(item.q));
      expect(visible, `answer not rendered: ${item.q}`).toContain(escape(item.a));
    }
  });
});
