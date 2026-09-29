import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { adsense } from "@/content/ads";
import { repoFile } from "./support/source";

/**
 * The advertising script in the head, and the policy that lets it run.
 *
 * Both halves fail silently and neither is visible in a diff. The script is
 * hoisted into `<head>` by React rather than written there, on a condition
 * narrow enough that dropping one attribute moves it into `<body>` with no
 * build error. The policy is a string in a TOML file that nothing in this
 * repository can execute — `npm start` and the accessibility suite both serve
 * `out/` with no headers at all — so losing a host is a blocked subresource on
 * the live site and a green suite here.
 *
 * So these read the built output and the policy text, and they are written to
 * fail in the direction each actually breaks: the script missing from the
 * head, and the policy losing a host or growing a wildcard.
 */

/**
 * The publisher id, written out rather than imported.
 *
 * `tests/export-shape.test.ts` gives the argument about `ads.txt` and it is
 * the same one: a check that reads its referent out of the file it is
 * checking passes whatever that file says. `src/content/ads.ts` is checked
 * against this line, not the other way around.
 */
const PUBLISHER = "pub-9953156598757474";

/**
 * The five hosts the script was observed to reach, and the directives each
 * was observed in.
 *
 * Also written out rather than imported, for the same reason, and this is the
 * half worth being strict about: `src/content/ads.ts` documents the
 * measurement and `netlify.toml` acts on it, so a host that disappears from
 * both at once would otherwise leave nothing to notice. Changing this list
 * means measuring again — serve a build over local HTTPS as smpl.money, drive
 * it in Chromium, and read the hosts off the requests.
 */
const MEASURED: Record<string, readonly string[]> = {
  "pagead2.googlesyndication.com": ["script-src", "img-src", "connect-src"],
  "googleads.g.doubleclick.net": ["frame-src"],
  "ep1.adtrafficquality.google": ["img-src", "connect-src"],
  "ep2.adtrafficquality.google": ["script-src", "frame-src"],
  "www.google.com": ["frame-src"],
};

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

describe("the AdSense snippet", () => {
  it("asks for the publisher that ads.txt authorizes", () => {
    // Two files, one account, two spellings of its id. Authorizing one
    // publisher and loading another's script is a state in which the pages
    // render, the ad slots stay empty, and nothing says why.
    expect(adsense.publisherId).toBe(PUBLISHER);
    expect(adsense.clientId).toBe(`ca-${PUBLISHER}`);
    expect(repoFile("public/ads.txt")).toContain(`google.com, ${PUBLISHER}, DIRECT,`);
    expect(adsense.scriptSrc).toBe(
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUBLISHER}`,
    );
  });

  it("records the hosts that were measured, and no others", () => {
    expect(Object.keys(adsense.hosts).toSorted()).toEqual(Object.keys(MEASURED).toSorted());
    for (const [host, directives] of Object.entries(MEASURED)) {
      expect(adsense.hosts[host as keyof typeof adsense.hosts].directives.toSorted()).toEqual(
        directives.toSorted(),
      );
    }
  });
});

describe("the built head", () => {
  const all = pages();

  it("found pages to check", () => {
    // Guards the walk. Finding nothing would pass every assertion below.
    expect(all.length).toBeGreaterThan(12);
    expect(all.map((page) => page.route)).toEqual(
      expect.arrayContaining(["/", "/docs/getting-started/", "/privacy/", "/404.html"]),
    );
  });

  it("carries the snippet above </head> on every page", () => {
    // Matched as an element, with real quotes. The host also appears inside
    // Next's inline flight payload, where the quotes are escaped, so a plain
    // substring search would find the data and call it the tag.
    const tag = new RegExp(
      `<script[^>]*\\ssrc="${adsense.scriptSrc.replaceAll(/[.?*+^$[\]\\(){}|-]/g, "\\$&")}"[^>]*>`,
      "g",
    );
    const offenders: string[] = [];
    for (const page of all) {
      const found = [...page.html.matchAll(tag)];
      const headEnd = page.html.indexOf("</head>");
      if (found.length !== 1) {
        offenders.push(`${page.route} has ${found.length} snippets`);
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
});

describe("the content security policy", () => {
  const directives = policy();

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

  it("denies the live interest API rather than the withdrawn one", () => {
    // `interest-cohort` named FLoC, which Chrome withdrew and no shipping
    // browser implements, so the token denied nothing while reading as a
    // stance. `browsing-topics` is the successor and the same objection.
    expect(features.has("interest-cohort")).toBe(false);
    expect(features.get("browsing-topics")).toBe("()");
  });
});
