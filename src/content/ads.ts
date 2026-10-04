/**
 * The advertising vendor this origin loads, as data.
 *
 * `docs/adsense.md` carries the argument for serving a vendor's script here at
 * all; what belongs in this file is the configuration itself, in one place a
 * test can read. The habit is the one that put the copy in `src/content/`
 * rather than in markup: a publisher id written into a JSX attribute is a
 * number nobody can check, and this one has to agree with `public/ads.txt` or
 * the inventory it authorizes is inventory Google will not fill.
 *
 * **The id and the slot are read from the environment, in the application's
 * own shape.** `ADSENSE_CLIENT_ID`, `ADSENSE_BANNER_SLOT_ID` and
 * `ADSENSE_CONSENT_MANAGED` are the same three names `src/server/config.ts`
 * reads in the application repository, because this is the same account's
 * same banner unit running on both origins, and one parser two deployments
 * agree with is worth more than a hardcoded copy that can only drift from it.
 * `.env.example` carries the placeholder values; the real ones live in a
 * local `.env` for `next dev` and in Netlify's own environment variables for
 * the live build — never in this file, and never in `netlify.toml`, which is
 * committed.
 *
 * **`ads.txt` is not derived from this.** `public/ads.txt` is a separate,
 * static, committed file, and `tests/export-shape.test.ts` holds it to the
 * account's id written out longhand for the reason this file used to give
 * about itself: a check that reads its referent out of the file it is
 * checking passes whatever that file says. The two have to agree by the
 * operator setting them to match, once, the same way they always have —
 * what moved is which of the two is a hardcoded literal (now neither) versus
 * an environment variable (now one of them is).
 */

const adsenseClientId = /^ca-pub-\d{16}$/;
const adsenseSlotId = /^\d{10}$/;

export type AdSettings = {
  readonly clientId: string;
  readonly bannerSlotId: string;
  /** The `client` parameter, and the form the loader script tag carries. */
  readonly scriptSrc: string;
  readonly consentManaged: boolean;
};

/**
 * Reads the AdSense settings from an env-shaped object, absent, half-set or
 * malformed — the same three cases `parseAdSettings` in the application's
 * `src/server/config.ts` answers, with the same answers.
 *
 * Pure and exported on its own, separate from `adsense` below, so a test can
 * call it with any fixture object without touching `process.env` at all.
 * `adsense` is what the one real call, against the real environment, produces
 * — the only thing anything outside a test ever needs.
 */
export function parseAdSettings(
  // An index signature, deliberately, rather than the three names typed out:
  // `NodeJS.ProcessEnv` is one too, and a type with named optional properties
  // instead is not structurally assignable to it, which `process.env` below
  // is passed as.
  env: Record<string, string | undefined>,
): AdSettings | undefined {
  const clientId = env.ADSENSE_CLIENT_ID?.trim();
  const bannerSlotId = env.ADSENSE_BANNER_SLOT_ID?.trim();
  if (!clientId && !bannerSlotId) return undefined;
  if (!clientId || !bannerSlotId) {
    throw new Error(
      "ADSENSE_CLIENT_ID and ADSENSE_BANNER_SLOT_ID must be set together. Set both " +
        "to show the banner, or neither to show none.",
    );
  }
  if (!adsenseClientId.test(clientId)) {
    throw new Error(
      'ADSENSE_CLIENT_ID must be a publisher id of the form "ca-pub-" followed by ' +
        'sixteen digits. The AdSense dashboard shows it as "pub-…"; the "ca-" prefix ' +
        "belongs in front of it.",
    );
  }
  if (!adsenseSlotId.test(bannerSlotId)) {
    throw new Error("ADSENSE_BANNER_SLOT_ID must be an ad unit's slot id, which is ten digits.");
  }
  const consentManagedRaw = (env.ADSENSE_CONSENT_MANAGED ?? "false").trim().toLowerCase();
  if (consentManagedRaw !== "true" && consentManagedRaw !== "false") {
    throw new Error("ADSENSE_CONSENT_MANAGED must be true or false.");
  }
  return {
    clientId,
    bannerSlotId,
    scriptSrc: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`,
    consentManaged: consentManagedRaw === "true",
  };
}

/**
 * The real settings for this build, or `undefined` where neither variable is
 * set — which is every contributor's machine and every CI run, so the build
 * and the test suite both have to succeed in that state, showing nothing.
 */
export const adsense = parseAdSettings(process.env);

/**
 * A host the AdSense script reaches, and what it is for.
 *
 * Unconditional on whether `adsense` above is configured, because this is a
 * fact about Google's infrastructure, not about this deployment — the content
 * security policy admits these five whether or not a build has a client id to
 * put in them, and `netlify.toml` is one file serving every environment.
 *
 * These five are a **measurement**. A build of this site carrying the script
 * was served over local HTTPS as smpl.money and driven in Chromium, and these
 * are the hosts it contacted, in the directives it needed them in. That is why
 * the policy in `netlify.toml` names hosts where the application's own ads
 * policy uses a blanket `https:` — the application has no account to observe
 * and this repository does, so guessing wide was the application's only
 * option and is not this one's.
 *
 * The consequence to keep in mind: a sixth host is a thing to **measure
 * again**, not to add on a hunch. Google can change what the script loads, and
 * the symptom is a blocked subresource in a console nobody is watching, so
 * `docs/adsense.md` carries re-measuring as the step to take when an ad unit
 * stops rendering.
 *
 * **The measurement was taken with Auto ads ON and every slot unfilled.** At
 * the time of the run the script placed an `ins.adsbygoogle` and asked on
 * every page; every ask came back `unfilled` because the account was not
 * approved. The account now runs one manual banner unit instead, which can
 * only narrow what it contacts relative to Auto ads choosing the format and
 * the page — these five are a ceiling, not an exact figure, measured against
 * a busier state than the site is in now.
 *
 * A filled ad draws its creative inside the `googleads.g.doubleclick.net`
 * frame, which this origin's policy does not reach, so these five should
 * still hold now that the unit is live — should, not do. The first page that
 * fills is the one to watch a console on.
 */
export type AdHost = {
  /** The CSP directives this host appears in. */
  readonly directives: readonly ("script-src" | "img-src" | "connect-src" | "frame-src")[];
  /** What it serves, so a reader can tell a removal from a rename. */
  readonly what: string;
};

export const adHosts = {
  "pagead2.googlesyndication.com": {
    directives: ["script-src", "img-src", "connect-src"],
    what: "The loader itself, the images it fetches, and the calls it makes back.",
  },
  "googleads.g.doubleclick.net": {
    directives: ["frame-src"],
    what: "The frame an ad is rendered into.",
  },
  "ep1.adtrafficquality.google": {
    directives: ["img-src", "connect-src"],
    what: "Google's invalid-traffic checks, as pixels and as requests.",
  },
  "ep2.adtrafficquality.google": {
    directives: ["script-src", "frame-src"],
    what: "The same checks, as a script and as a frame.",
  },
  "www.google.com": {
    directives: ["frame-src"],
    what: "A frame the ad stack opens on Google's own origin.",
  },
} satisfies Record<string, AdHost>;
