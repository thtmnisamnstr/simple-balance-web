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
 * **The id is the same publisher in two spellings.** `ads.txt` records
 * `pub-9953156598757474` and the script asks for `ca-pub-9953156598757474`;
 * they are one account and the `ca-` prefix is the client form. Deriving the
 * second from the first is what stops a one-character edit authorizing one
 * publisher and loading another's script — a state in which everything
 * renders, every test that reads only one of the two files passes, and the
 * revenue is zero.
 */

/**
 * The publisher id, in the spelling `ads.txt` uses.
 *
 * `tests/adsense.test.ts` writes this same value out longhand rather than
 * importing it, for the reason `tests/export-shape.test.ts` gives about the
 * same id: a check that reads its referent out of the file it is checking
 * passes whatever that file says.
 */
const publisherId = "pub-9953156598757474";

/**
 * A host the AdSense script reaches, and what it is for.
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
 * **The measurement was taken with the ad slot unfilled.** Auto ads is on for
 * this account, so the script places an `ins.adsbygoogle` and asks; the ask
 * comes back `unfilled` today. A filled ad draws its creative inside the
 * `googleads.g.doubleclick.net` frame, which this origin's policy does not
 * reach, so these five should still hold — but the first page that fills is
 * the one to watch a console on.
 */
export type AdHost = {
  /** The CSP directives this host appears in. */
  readonly directives: readonly ("script-src" | "img-src" | "connect-src" | "frame-src")[];
  /** What it serves, so a reader can tell a removal from a rename. */
  readonly what: string;
};

export const adsense = {
  publisherId,
  /** The `client` parameter, and the form the script tag carries. */
  clientId: `ca-${publisherId}`,
  /**
   * The exact snippet source, from the AdSense account.
   *
   * `src/app/layout.tsx` builds its one `<script>` from this, so the id in the
   * head and the id in `ads.txt` cannot drift apart.
   */
  scriptSrc: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${publisherId}`,
  hosts: {
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
  } satisfies Record<string, AdHost>,
} as const;
