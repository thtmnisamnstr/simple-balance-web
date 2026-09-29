import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * No third-party branding in what this repository ships.
 *
 * A marketing site is an argument about one product. A vendor's logo, badge
 * or "powered by" mark in the corner is a second brand on the page, it is
 * advertising the reader did not ask for, and on a page about somebody's
 * money it is a second party to wonder about.
 *
 * **This is about what this repository emits.** A host can inject its own
 * badge into the served response, which no test here can see — Netlify does
 * exactly that on new free projects, and turning it off is a setting in their
 * dashboard rather than anything in this tree. `docs/standards/web.md` 6.4
 * carries that as a launch step; this check holds the half that is ours.
 *
 * The named exception is the privacy policy, which must name the hosting
 * provider and the payment processor because a policy that hides who
 * processes the data is not a privacy policy.
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

/** Hosts a badge or a widget would arrive from, matched against a hostname. */
const VENDOR_HOSTS =
  /netlify|vercel|cloudflare|gstatic|googleapis|googlesyndication|doubleclick|adtrafficquality/;

/**
 * Subresources from one of those hosts that this site loads on purpose, by
 * exact address, with the reason each is here.
 *
 * One entry, and it is a decision rather than a lapse: `docs/adsense.md`
 * carries the argument for serving the AdSense loader from this origin. It is
 * written out rather than imported from `src/content/ads.ts`, so that
 * changing the address there is a change this exception has to be re-granted
 * for rather than one it follows.
 */
const ALLOWED_SUBRESOURCES: Record<string, string> = {
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9953156598757474":
    "The AdSense loader, in <head> on every page. `tests/adsense.test.ts` holds it and the policy that admits it.",
};

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
    // The other shape branding arrives in: a badge served from the host.
    //
    // The host list has to name the advertising domains, or this check cannot
    // see the one subresource the site actually loads and the rule it is
    // credited with has no mechanism at all. It matched five hosting and
    // font CDNs, none of which the AdSense snippet uses, so the script
    // shipped on every page and the suite stayed green.
    const offenders: string[] = [];
    for (const page of all) {
      for (const [, url] of page.html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) {
        if (Object.hasOwn(ALLOWED_SUBRESOURCES, url!)) continue;
        const host = new URL(url!).hostname;
        if (VENDOR_HOSTS.test(host)) offenders.push(`${page.route} loads from ${host}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
