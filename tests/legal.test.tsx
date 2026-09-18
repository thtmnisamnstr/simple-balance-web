import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import { legalUpdated, privacy, terms } from "@/content/legal";
import { slugify } from "@/content/collections";

/**
 * The legal pages.
 *
 * These are the documents somebody arrives at with one question, and the
 * failure mode is not a typo — it is a policy that describes a product nobody
 * built, or one that omits the disclosure a vendor's terms require. So these
 * check for the disclosures rather than for prose quality.
 */

describe("the privacy policy", () => {
  const text = privacy.sections
    .flatMap((s) => s.paragraphs)
    .join(" ")
    .toLowerCase();

  it("discloses everything Google requires of a site serving AdSense", () => {
    // Google's programme policies: third-party cookies, the vendors that set
    // them, and how to opt out. Missing any of the three is a breach, and the
    // penalty is suspension rather than the ads not rendering.
    for (const required of ["adsense", "cookies", "non-personalised", "opt out"]) {
      expect(text, `the policy never mentions "${required}"`).toContain(required);
    }
  });

  it("names every processor that sees the data", () => {
    for (const processor of ["stripe", "google", "netlify"]) {
      expect(text, `"${processor}" is not named`).toContain(processor);
    }
  });

  it("says plainly that card details are never stored here", () => {
    expect(text).toContain("never see or store your card details");
  });

  it("covers the rights the GDPR and the CCPA give", () => {
    for (const right of ["gdpr", "erased", "portable", "california"]) {
      expect(text).toContain(right);
    }
    // "We do not sell" is the CCPA disclosure that has to be explicit.
    expect(text).toContain("do not sell or share personal information");
  });

  it("distinguishes the hosted deployment from somebody else's", () => {
    // The software is self-hostable. A policy that did not say so would be
    // claiming responsibility for deployments we have never seen.
    expect(privacy.intro.join(" ").toLowerCase()).toContain("somebody else runs");
  });

  it("gives a contact address that is the published one", () => {
    expect(text).toContain("info@smpl.money");
  });

  it("says why this site has no cookie banner, rather than leaving it unsaid", () => {
    // The question a reader has, answered in the document rather than in a
    // support email. The site sets nothing, so a banner would be theatre.
    expect(text).toContain("sets no cookies at all");
    expect(text).toContain("no banner");
  });

  it("does not claim non-personalised ads are cookie-free", () => {
    // The mistake that would make this policy false. Non-personalised ads
    // still set cookies for frequency capping and fraud prevention, which is
    // why consent is asked for in the EEA regardless.
    expect(text).toContain("non-personalised is not the same as cookie-free");
    expect(text).toMatch(/frequency capping/);
  });

  it("says consent is collected before an ad cookie is set, and can be withdrawn", () => {
    expect(text).toContain("before any ad cookie is set");
    expect(text).toContain("withdraw");
  });

  it("separates service email from product email, and only one has an unsubscribe", () => {
    // Service mail rests on the contract and has no unsubscribe; product mail
    // rests on legitimate interests and must carry one in every message.
    // Conflating them is how a maintenance notice ends up unsendable.
    expect(text).toContain("there is no unsubscribe from them");
    expect(text).toContain("unsubscribe link that works immediately");
    expect(text).toContain("legitimate interests");
  });
});

describe("the terms", () => {
  const text = terms.sections
    .flatMap((s) => s.paragraphs)
    .join(" ")
    .toLowerCase();

  it("states the prices the pricing page states", () => {
    expect(text).toContain("$20 per year or $2 per month");
  });

  it("covers cancellation, refunds and the statutory right", () => {
    for (const topic of ["cancel at any time", "14 days", "non-refundable"]) {
      expect(text).toContain(topic);
    }
  });

  it("says what happens to data when a subscription ends", () => {
    // The thing people are actually afraid of.
    expect(text).toContain("nothing is deleted when a subscription ends");
  });

  it("does not claim to restrict the AGPL", () => {
    // Terms that purported to limit the licence would be both wrong and
    // unenforceable. The intro says so explicitly.
    expect(terms.intro.join(" ").toLowerCase()).toContain("nothing here restricts the rights");
  });

  it("promises notice before the service could disappear", () => {
    expect(text).toContain("60 days");
  });

  it("tells account holders which email they cannot opt out of", () => {
    expect(text).toContain("no unsubscribe from those");
  });
});

describe("both documents", () => {
  it("renders a contents entry per section, with anchors that match", () => {
    for (const [Page, doc] of [
      [PrivacyPage, privacy],
      [TermsPage, terms],
    ] as const) {
      const { container } = render(<Page />);
      const headings = [...container.querySelectorAll("h2")].map((h) => h.id);
      expect(headings).toEqual(doc.sections.map((s) => slugify(s.heading)));

      // Every contents link points at a heading that exists on the page.
      for (const link of container.querySelectorAll(".contents a")) {
        const id = (link.getAttribute("href") ?? "").slice(1);
        expect(headings, `contents links to #${id}, which is not a heading`).toContain(id);
      }
    }
  });

  it("carries a last-updated date", () => {
    expect(legalUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const path of ["out/privacy/index.html", "out/terms/index.html"]) {
      // Case-insensitively: Next serialises the attribute as `dateTime`, and
      // HTML attribute names are case-insensitive, so both parse the same.
      // Asserting on one spelling would be asserting on the serialiser.
      expect(readFileSync(path, "utf8")).toMatch(new RegExp(`datetime="${legalUpdated}"`, "i"));
    }
  });

  it("is reachable from the footer of every page", () => {
    // A policy nobody can find is a policy that does not satisfy anybody's
    // terms, Google's included.
    for (const path of ["out/index.html", "out/pricing/index.html"]) {
      const html = readFileSync(path, "utf8");
      expect(html).toContain('href="/privacy/"');
      expect(html).toContain('href="/terms/"');
    }
  });

  it("says it is not legal advice", () => {
    const { container } = render(<PrivacyPage />);
    expect(container.textContent).toContain("not legal advice");
  });
});
