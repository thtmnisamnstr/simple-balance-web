import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { adsense, parseAdSettings } from "@/content/ads";
import { repoFile } from "./support/source";

/**
 * The parser, the real build's output, and the policy that lets it run.
 *
 * Three different things fail silently and none is visible in a diff. The
 * parser throws or does not on an environment nobody else reads — a
 * misconfigured deployment finds out only when the build it is driving stops.
 * The script and the banner unit are hoisted or rendered into HTML that
 * nothing here executes — `npm start` and the accessibility suite both serve
 * `out/` with no headers at all — so losing a host is a blocked subresource
 * on the live site and a green suite here. The policy is a string in a TOML
 * file that nothing in this repository can execute either.
 *
 * So the parser is tested directly, against fixtures, never against
 * `process.env`; the build is exercised once for real, with the fixture
 * values below set in `.github/workflows/verify.yml`; and the built output
 * and the policy text are read back and asserted, written to fail in the
 * direction each actually breaks.
 */

/**
 * The real account's publisher id, written out rather than imported.
 *
 * `tests/export-shape.test.ts` gives the argument about `ads.txt` and it is
 * the same one here: a check that reads its referent out of the file it is
 * checking passes whatever that file says. This is not a secret — it is
 * published in `public/ads.txt` and in every page's rendered HTML — so using
 * the real value is what actually proves the two files still agree, which a
 * placeholder could not.
 */
const PUBLISHER = "pub-9953156598757474";
const CLIENT_ID = `ca-${PUBLISHER}`;

/**
 * A well-formed slot id for the parser's own cases, and the placeholder
 * `.github/workflows/verify.yml` builds with. The built pages are held to
 * whatever slot their build was given rather than to this, because these
 * tests are about the mechanics of rendering the configured slot, not about
 * which unit it is — and the live build carries the real one.
 */
const SLOT_ID = "1234567890";

describe("parseAdSettings", () => {
  it("is absent when neither variable is set", () => {
    expect(
      parseAdSettings({ ADSENSE_CLIENT_ID: undefined, ADSENSE_BANNER_SLOT_ID: undefined }),
    ).toBeUndefined();
  });

  it("refuses a client id with no banner slot, and the other way round", () => {
    expect(() => parseAdSettings({ ADSENSE_CLIENT_ID: CLIENT_ID })).toThrow(/must be set together/);
    expect(() => parseAdSettings({ ADSENSE_BANNER_SLOT_ID: SLOT_ID })).toThrow(
      /must be set together/,
    );
  });

  it("refuses a client id missing the ca- prefix or the wrong digit count", () => {
    expect(() =>
      parseAdSettings({ ADSENSE_CLIENT_ID: PUBLISHER, ADSENSE_BANNER_SLOT_ID: SLOT_ID }),
    ).toThrow(/ca-pub-/);
    expect(() =>
      parseAdSettings({ ADSENSE_CLIENT_ID: "ca-pub-123", ADSENSE_BANNER_SLOT_ID: SLOT_ID }),
    ).toThrow(/ca-pub-/);
  });

  it("refuses a slot id that is not ten digits", () => {
    expect(() =>
      parseAdSettings({ ADSENSE_CLIENT_ID: CLIENT_ID, ADSENSE_BANNER_SLOT_ID: "123" }),
    ).toThrow(/ten digits/);
  });

  it("refuses a consent flag that is not true or false", () => {
    expect(() =>
      parseAdSettings({
        ADSENSE_CLIENT_ID: CLIENT_ID,
        ADSENSE_BANNER_SLOT_ID: SLOT_ID,
        ADSENSE_CONSENT_MANAGED: "yes",
      }),
    ).toThrow(/true or false/);
  });

  it("defaults the consent flag to false, and builds the script source from the client id", () => {
    const settings = parseAdSettings({
      ADSENSE_CLIENT_ID: CLIENT_ID,
      ADSENSE_BANNER_SLOT_ID: SLOT_ID,
    });
    expect(settings).toEqual({
      clientId: CLIENT_ID,
      bannerSlotId: SLOT_ID,
      scriptSrc: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`,
      consentManaged: false,
    });
  });

  it("asks for the publisher that ads.txt authorizes", () => {
    // Two files, one account, two spellings of its id. Authorizing one
    // publisher and loading another's script is a state in which the pages
    // render, the ad unit stays empty, and nothing says why.
    const settings = parseAdSettings({
      ADSENSE_CLIENT_ID: CLIENT_ID,
      ADSENSE_BANNER_SLOT_ID: SLOT_ID,
    });
    expect(settings?.clientId).toBe(CLIENT_ID);
    expect(repoFile("public/ads.txt")).toContain(`google.com, ${PUBLISHER}, DIRECT,`);
  });
});

describe("the AdSense hosts", () => {
  it("records the hosts that were measured, and no others", async () => {
    const { adHosts } = await import("@/content/ads");
    const MEASURED: Record<string, readonly string[]> = {
      "pagead2.googlesyndication.com": ["script-src", "img-src", "connect-src"],
      "googleads.g.doubleclick.net": ["frame-src"],
      "ep1.adtrafficquality.google": ["img-src", "connect-src"],
      "ep2.adtrafficquality.google": ["script-src", "frame-src"],
      "www.google.com": ["frame-src"],
    };
    expect(Object.keys(adHosts).toSorted()).toEqual(Object.keys(MEASURED).toSorted());
    for (const [host, directives] of Object.entries(MEASURED)) {
      expect(adHosts[host as keyof typeof adHosts].directives.toSorted()).toEqual(
        directives.toSorted(),
      );
    }
  });
});

/**
 * Every page the build emitted, as `route -> html`.
 *
 * Walked rather than listed, the same way `tests/branding.test.ts` and
 * `tests/a11y.test.ts` do it: a check that names its pages only ever covers
 * the ones somebody remembered, and a page added without the layout is
 * exactly the page nobody would remember. `404.html` is added by hand because
 * it is the one emitted page that is not an `index.html`, and it is served to
 * a real visitor.
 */
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
  if (dir === "out" && existsSync("out/404.html")) {
    out.push({ route: "/404.html", html: readFileSync("out/404.html", "utf8") });
  }
  return out;
}

/**
 * These depend on the build being ad-configured, and most builds are not —
 * every contributor's machine, by default. Skipped there, the same idiom the
 * application repository uses for its own database-dependent integration
 * tier (`describe.skipIf(!connection)`): absence is not a defect to report,
 * it is simply nothing to check yet.
 *
 * **Not skipped in CI.** `.github/workflows/verify.yml`'s `verify` job sets
 * the fixture values above, specifically so this exercises a real, ad-bearing
 * export rather than an empty one — so if CI is running and `adsense` is
 * still `undefined`, that is the workflow's own `env:` block having regressed,
 * and these fail loudly rather than skipping over it.
 */
describe.skipIf(!adsense && !process.env.CI)("the built pages", () => {
  const all = pages();

  it("found pages to check", () => {
    expect(all.length).toBeGreaterThan(12);
    expect(all.map((page) => page.route)).toEqual(
      expect.arrayContaining(["/", "/docs/getting-started/", "/privacy/", "/404.html"]),
    );
  });

  it("carries the loader above </head> on every page", () => {
    // Matched as an element, with real quotes. The host also appears inside
    // Next's inline flight payload, where the quotes are escaped, so a plain
    // substring search would find the data and call it the tag.
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`;
    const tag = new RegExp(
      `<script[^>]*\\ssrc="${src.replaceAll(/[.?*+^$[\]\\(){}|-]/g, "\\$&")}"[^>]*>`,
      "g",
    );
    const offenders: string[] = [];
    for (const page of all) {
      const found = [...page.html.matchAll(tag)];
      const headEnd = page.html.indexOf("</head>");
      if (found.length !== 1) {
        offenders.push(`${page.route} has ${found.length} loaders`);
        continue;
      }
      // The whole point of the assertion. React hoists a <script> only when
      // it is async with a src and no event handler; drop `async`, write
      // `defer`, or add an `onLoad`, and it renders in <body> instead with no
      // build error and no warning.
      if (found[0]!.index >= headEnd) offenders.push(`${page.route} has it below </head>`);
      if (!/\sasync(=|\s|>)/.test(found[0]![0])) offenders.push(`${page.route} is not async`);
      if (!/crossorigin="anonymous"/.test(found[0]![0])) {
        offenders.push(`${page.route} is not anonymous`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * Every page except the legal pages and the 404, which
   * `tests/ad-placement.test.ts` holds by name: this file only asks that
   * wherever the banner does appear, it is the account's own snippet,
   * unmodified.
   */
  it("renders the banner unit and its push script together, wherever it appears", () => {
    const offenders: string[] = [];
    for (const page of all) {
      const insMatch = /<ins class="adsbygoogle"[^>]*><\/ins>/.exec(page.html);
      if (!insMatch) continue;
      const ins = insMatch[0];
      if (!ins.includes(`data-ad-client="${CLIENT_ID}"`)) {
        offenders.push(`${page.route} ins has the wrong client id`);
      }
      // The slot this build was given, not CI's placeholder. Holding the
      // page to `SLOT_ID` failed every build carrying the real unit, which
      // is Netlify's for the live site and a developer's with a real `.env`,
      // and the gate is `npm run verify` on both. What this checks is that
      // the configured slot reaches the page, whichever one it is.
      if (!ins.includes(`data-ad-slot="${adsense!.bannerSlotId}"`)) {
        offenders.push(`${page.route} ins has the wrong slot id`);
      }
      if (
        !ins.includes('data-ad-format="auto"') ||
        !ins.includes('data-full-width-responsive="true"')
      ) {
        offenders.push(`${page.route} ins is missing a documented attribute`);
      }
      // The push has to be the very next script, with no src: that is what
      // keeps it from being hoisted away from the <ins> it is for.
      const after = page.html.slice(insMatch.index + ins.length, insMatch.index + ins.length + 400);
      if (!/^\s*<script>\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)/.test(after)) {
        offenders.push(`${page.route} has no push script immediately after the unit`);
      }
      if (!after.includes("requestNonPersonalizedAds = 1")) {
        offenders.push(`${page.route} does not force non-personalized ads`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /*
   * The privacy policy says the ad on smpl.money is non-personalized, as a
   * fact, because this build forces it rather than asking. A build with
   * `ADSENSE_CONSENT_MANAGED=true` stops forcing it, which is right only once
   * a certified consent message is published from the account and the policy
   * says so, and neither is true: `window.googlefc` is undefined on every
   * page. So the setting fails the gate by name, here, rather than as one
   * line in the rendering check above, because the thing to change first is
   * the policy and `legal-review` is where that happens.
   */
  it("is the non-personalized ad the privacy policy says it is", () => {
    expect(
      adsense!.consentManaged,
      "ADSENSE_CONSENT_MANAGED is true, and the privacy policy says the ad is non-personalized",
    ).toBe(false);
  });
});

describe("the content security policy", () => {
  const netlify = repoFile("netlify.toml");

  /** The CSP as a map of directive to its source list. */
  function policy(): Record<string, readonly string[]> {
    const line = /Content-Security-Policy\s*=\s*"([^"]+)"/.exec(netlify)?.[1];
    expect(line, "no Content-Security-Policy in netlify.toml").toBeTruthy();
    const out: Record<string, readonly string[]> = {};
    for (const directive of line!.split(";")) {
      const [name, ...sources] = directive.trim().split(/\s+/);
      if (name) out[name] = sources;
    }
    return out;
  }

  const directives = policy();
  const MEASURED: Record<string, readonly string[]> = {
    "pagead2.googlesyndication.com": ["script-src", "img-src", "connect-src"],
    "googleads.g.doubleclick.net": ["frame-src"],
    "ep1.adtrafficquality.google": ["img-src", "connect-src"],
    "ep2.adtrafficquality.google": ["script-src", "frame-src"],
    "www.google.com": ["frame-src"],
  };

  it("names every measured host in the directive it was measured in", () => {
    const missing: string[] = [];
    for (const [host, names] of Object.entries(MEASURED)) {
      for (const name of names) {
        if (!(directives[name] ?? []).includes(`https://${host}`)) {
          missing.push(`${name} does not allow ${host}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("permits Google and not anybody", () => {
    // The reason this policy is narrower than the application's, which uses a
    // blanket `https:` because it had no account to observe. A wildcard here
    // would be the same policy with the observation thrown away, and it would
    // read as tightened while allowing every origin on the web.
    const offenders: string[] = [];
    for (const [name, sources] of Object.entries(directives)) {
      for (const source of sources) {
        if (source === "https:" || source === "http:" || source === "*") {
          offenders.push(`${name} allows ${source}`);
        }
        if (source.includes("*")) offenders.push(`${name} allows the wildcard ${source}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("allows no vendor host that was not measured", () => {
    // The other direction. A host added because a documentation page listed
    // it is exactly the widening the measurement exists to prevent.
    const known = new Set(Object.keys(MEASURED).map((host) => `https://${host}`));
    const offenders: string[] = [];
    for (const [name, sources] of Object.entries(directives)) {
      for (const source of sources) {
        if (!source.startsWith("https://")) continue;
        if (!known.has(source)) offenders.push(`${name} allows the unmeasured ${source}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps every directive the vendor did not widen", () => {
    // The widening is four directives. These are the rest, asserted whole
    // rather than by substring, so a source appended to one of them fails
    // here instead of passing as "still contains 'self'".
    expect(directives["default-src"]).toEqual(["'self'"]);
    expect(directives["style-src"]).toEqual(["'self'", "'unsafe-inline'"]);
    expect(directives["font-src"]).toEqual(["'self'"]);
    expect(directives["base-uri"]).toEqual(["'none'"]);
    expect(directives["form-action"]).toEqual(["'none'"]);
    expect(directives["frame-ancestors"]).toEqual(["'none'"]);
    expect(directives["object-src"]).toEqual(["'none'"]);
    expect(directives["upgrade-insecure-requests"]).toEqual([]);
  });

  it("keeps the first-party half of each widened directive", () => {
    // `script-src` and `img-src` and `connect-src` still have to serve this
    // site. A rewrite that dropped 'self' while adding the vendor would leave
    // the ads working and the page broken.
    expect(directives["script-src"]).toContain("'self'");
    expect(directives["script-src"]).toContain("'unsafe-inline'");
    expect(directives["img-src"]).toContain("'self'");
    expect(directives["img-src"]).toContain("data:");
    expect(directives["connect-src"]).toContain("'self'");
    // `frame-src` names no 'self', deliberately: a directive that is set
    // replaces `default-src` for frames, and nothing same-origin is framed.
    // Asserted so it reads as a decision rather than an omission.
    expect(directives["frame-src"]).not.toContain("'self'");
  });
});

describe("the permissions policy", () => {
  const netlify = repoFile("netlify.toml");
  const header = /Permissions-Policy\s*=\s*"([^"]+)"/.exec(netlify)?.[1] ?? "";
  const features = new Map(
    header.split(",").map((part) => {
      const [name, ...rest] = part.trim().split("=");
      return [name!, rest.join("=")] as const;
    }),
  );

  it("denies what this site has no use for", () => {
    for (const feature of ["camera", "microphone", "geolocation", "payment"]) {
      expect(features.get(feature), `${feature} is not denied`).toBe("()");
    }
  });

  it("leaves the interest APIs alone, and neither token pretends otherwise", () => {
    // Both absences are deliberate and they are different kinds of absence.
    //
    // `interest-cohort` named FLoC, withdrawn by Chrome in 2022 and
    // implemented by no shipping browser, so the token denied nothing while
    // reading as a stance. It is gone because it was theater.
    //
    // `browsing-topics` is its live successor and really would deny the
    // targeting signal — that was measured. It is allowed because advertising
    // is how this site is paid for, and the privacy policy states that Google
    // may use interest signals rather than the header implying it cannot.
    // Re-adding it is a revenue decision, not a security fix, so it should not
    // arrive as a tidy-up: this assertion is here to make that deliberate.
    expect(features.has("interest-cohort")).toBe(false);
    expect(features.has("browsing-topics")).toBe(false);
  });
});

/**
 * Confidence that `adsense` really is `AdSettings | undefined`, not always on
 * — and, in CI specifically, a clearly-named failure if it is not. Gated the
 * same way the describe block above is: skipped on a contributor's machine
 * with nothing configured, not skipped in CI, where `adsense` being
 * `undefined` means `.github/workflows/verify.yml`'s fixture env vars have
 * regressed, and this says so by name rather than leaving "found pages to
 * check" above to fail first with no indication why nothing was found.
 */
describe.skipIf(!adsense && !process.env.CI)("the real build's own settings", () => {
  it("resolved from this build's actual environment", () => {
    expect(
      adsense,
      "ADSENSE_CLIENT_ID / ADSENSE_BANNER_SLOT_ID are not set for this test run",
    ).toBeDefined();
  });
});
