import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * No third-party branding, and no vendor subresource at all, in what this
 * repository ships.
 *
 * A marketing site is an argument about one product. A vendor's logo, badge
 * or "powered by" mark in the corner is a second brand on the page, it is
 * advertising the reader did not ask for, and on a page about somebody's
 * money it is a second party to wonder about. `docs/standards/web.md` 6.5 is
 * the rule, in both halves.
 *
 * **This is about what this repository emits, in markup.** Two things follow.
 * A host can inject its own badge into the served response, which no test
 * here can see — Netlify does exactly that on new free projects, and turning
 * it off is a setting in their dashboard rather than anything in this tree;
 * `docs/standards/operations.md` 8 carries it as a launch step.
 *
 * One named exception: the privacy policy must name the hosting provider and
 * the payment processor, because a policy that hides who processes the data
 * is not a privacy policy.
 *
 * The AdSense loader was a second exception, by its exact address, while the
 * site ran ads. The ads run in the application alone now, so the exception
 * is gone and the advertising hosts stay in the list below: a loader put back
 * on this origin fails here by name.
 */

const VENDORS = [
  "netlify",
  "vercel",
  "cloudflare",
  "powered by",
  "built with",
  "deploys by",
  "hosted on",
];

/**
 * Hosts a badge or a widget would arrive from, matched against a hostname.
 *
 * The advertising hosts are the five the AdSense loader reached when the site
 * carried it, `www.google.com` included, so putting it back is caught rather
 * than waved through.
 */
const VENDOR_HOSTS =
  /netlify|vercel|cloudflare|gstatic|googleapis|googlesyndication|doubleclick|adtrafficquality|google\.com/;

/** Pages whose subject matter is the vendors, with the reason each is here. */
const DISCLOSURES: Record<string, string> = {
  "/privacy/": "Names the hosting provider and payment processor, as a policy must.",
  "/terms/": "May reference the same processors the policy names.",
};

function pages(dir = "out", prefix = "/"): readonly { route: string; html: string }[] {
  const out: { route: string; html: string }[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "_next") continue;
      out.push(...pages(full, `${prefix}${entry}/`));
    } else if (entry === "index.html") {
      out.push({ route: prefix, html: readFileSync(full, "utf8") });
    }
  }
  return out;
}

describe("third-party branding", () => {
  const all = pages();

  it("found pages to check", () => {
    expect(all.length).toBeGreaterThan(12);
  });

  it("appears on no page this repository builds", () => {
    const offenders: string[] = [];
    for (const page of all) {
      if (page.route in DISCLOSURES) continue;
      // Strip the RSC payload: it repeats the visible text, so a match there
      // is the same match counted twice rather than a second occurrence.
      const visible = page.html.replace(/<script[\s\S]*?<\/script>/g, "").toLowerCase();
      for (const vendor of VENDORS) {
        if (visible.includes(vendor)) offenders.push(`${page.route} mentions "${vendor}"`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps the disclosures to the documents that owe them", () => {
    // The exceptions are exceptions, not a license. Each must actually be
    // the page it claims to be.
    for (const route of Object.keys(DISCLOSURES)) {
      expect(all.map((page) => page.route)).toContain(route);
    }
  });

  it("loads no script or image from a vendor's domain", () => {
    // The other shape branding arrives in: a badge served from the host, or
    // a vendor's script. The list names the advertising domains because it
    // once matched only hosting and font CDNs, and the AdSense loader shipped
    // on every page with the suite green.
    const offenders: string[] = [];
    for (const page of all) {
      for (const [, url] of page.html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) {
        const host = new URL(url!).hostname;
        if (VENDOR_HOSTS.test(host)) offenders.push(`${page.route} loads from ${host}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
