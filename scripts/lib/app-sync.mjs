/**
 * The decisions behind `scripts/check-app-sync.mjs`, with none of its I/O.
 *
 * Everything here is a function of what it is handed. Nothing reaches the
 * network or the disk on its own: `resolveRef` asks its questions through the
 * `io` it is given, `request` sends through the `send` it is given, and the
 * link scan reads the text it is handed. That is so `tests/app-sync.test.ts`
 * can hold every decision offline, which matters because the check itself
 * runs weekly, on a schedule nobody watches, and the last version of it,
 * pointed at the release branch, answered "in sync" while eight of the twelve
 * pictures on the homepage were stale. A rule nobody can exercise without the
 * network is a rule nobody exercises.
 *
 * The same test reads this file's source and refuses a call to `fetch` or
 * `require` in it, and any quoted module name for the fs, http, https, http2,
 * net, tls, dgram, child_process or module built-ins, with or without the
 * node: prefix. That is what this paragraph promises, and no more: a module
 * reached some other way would get past it.
 */
import { createHash } from "node:crypto";

export const MAIN = "main";

/** Where the application publishes the kit, relative to its root. */
const KIT = "docs/product";

/**
 * The override, if there is one.
 *
 * An empty `APP_REF` is no override. `${{ vars.APP_REF }}` in a workflow
 * expands to an empty string when the variable is not set, and reading that
 * as a ref would fetch `raw.githubusercontent.com/<repo>//docs/product`,
 * which 404s and reports "could not tell" every week for a reason nobody
 * chose.
 */
export function refFromEnv(env) {
  const value = env.APP_REF?.trim();
  return value ? value : null;
}

export function rawUrl(repository, ref, file) {
  return `https://raw.githubusercontent.com/${repository}/${ref}/${KIT}/${file}`;
}

/* Statuses that, with a token attached, are asked again without it. */
const REFUSED = new Set([401, 403, 404]);

/**
 * One request to GitHub, sent through `send` (the script hands it the global
 * `fetch`). Resolves the response, `null` for a 404, and throws for anything
 * else that is not a 200.
 *
 * **The token goes to both hosts, and is dropped when a host turns it
 * down.** The pulls listing is where it matters most: unauthenticated, the
 * API allows sixty requests an hour per address, and a hosted runner shares
 * its address with strangers. The raw host limits anonymous requests too,
 * and a run makes a couple of dozen there, so a 429 from it would be the same
 * "could not tell" for no reason in the application. But the workflow's token
 * was minted for the site's repository, not the application's, and nothing
 * here has shown what either host makes of that, so a 401 or a 403 that came
 * back with the token attached is asked again without it.
 *
 * **So is a 404, and that one is not caution.** A 404 is the one status read
 * as an answer, "not on this ref". A host that met a token it would not honor
 * with a 404 would walk `resolveRef` on to the next candidate and report the
 * wrong ref with confidence. Asking again costs one request for each ref that
 * really lacks the kit, which until the release merges is `main` and the
 * dependency pull requests.
 *
 * Which headers the API wants is read from the URL, not passed in, so no
 * caller can send an API request without them.
 */
export async function request({ url, method = "GET", token = null }, send) {
  const headers = { "User-Agent": "simple-balance-web app-sync" };
  if (new URL(url).host === "api.github.com") {
    headers.Accept = "application/vnd.github+json";
    headers["X-GitHub-Api-Version"] = "2022-11-28";
  }
  let response = await send(url, {
    method,
    headers: token ? { ...headers, Authorization: `Bearer ${token}` } : headers,
  });
  if (token && REFUSED.has(response.status)) response = await send(url, { method, headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

/*
 * A pull request, written the way GitHub links across repositories. The
 * report is the body of an issue in this site's repository, where a bare #39
 * is the site's own #39: missing today, and some unrelated issue later.
 */
const pullReference = (repository, number) => `${repository}#${number}`;

/**
 * Which ref of the application this site should be compared against.
 *
 * The site tracks released behavior, so `main` wins whenever it carries the
 * kit. Until it does, the kit exists only on the release branch, and the
 * owner's decision is that the site follows that branch in the meantime.
 *
 * **The obvious rule is "use the branch while it exists", and it has no
 * reliable moment to switch back.** GitHub deletes a merged branch on its own
 * only where `delete_branch_on_merge` is on, and the application's was off
 * when this was written (read through the API on 2026-09-22). A branch can
 * still be deleted by hand, as `frozen-accounts` was after it merged, and
 * whether the release branch will be is not something this check can rely
 * on. A rule keyed to the branch either goes on reading it after the merge or
 * starts failing the day it goes. Asking whether `main` carries the kit first
 * is what moves the check onto `main` the week the release merges, without
 * anybody remembering to change a setting, and `compareProvenance` and
 * `compareLinks` are what then notice that the site's own records still name
 * the branch.
 *
 * The second-best candidate is an open pull request into `main` whose head
 * carries the kit: that is the release on its way, and a pull request is the
 * one place the repository says which branch is heading for `main`. A branch
 * with no pull request is somebody's work in progress.
 *
 * Only heads in the application's own repository count. A fork's branch is a
 * stranger's proposal, and this site does not advertise one.
 *
 * `io.hasKit(repository, ref)` resolves true for a 200 and false for a 404,
 * and throws for anything else. Throwing matters: a rate limit or an outage
 * read as "not here" would walk on to the next candidate and report the
 * wrong ref with confidence. `io.openPulls()` resolves the GitHub pulls API's
 * list. Both are called only when the answer depends on them, so an override
 * costs no requests and a `main` that carries the kit costs one.
 */
export async function resolveRef({ repository, appRef }, io) {
  if (appRef) {
    return { ref: appRef, read: appRef, pullRequest: null, why: "APP_REF is set" };
  }

  if (await io.hasKit(repository, MAIN)) {
    return { ref: MAIN, read: MAIN, pullRequest: null, why: "main carries the kit" };
  }

  const own = (await io.openPulls())
    .filter((pull) => pull.head?.repo?.full_name?.toLowerCase() === repository.toLowerCase())
    .toSorted((a, b) => a.number - b.number);

  // Every head is asked, not just until one answers, because "several carry
  // it" is worth saying and cannot be said without asking them all. The head's
  // commit rather than its branch name: the branch can move while this runs,
  // and reading every file from one commit is what makes the comparison about
  // one version of the kit. `Promise.all` keeps the sorted order.
  const answers = await Promise.all(own.map((pull) => io.hasKit(repository, pull.head.sha)));
  const carrying = own.filter((_, index) => answers[index]);

  const [chosen] = carrying;
  if (!chosen) {
    return {
      ref: null,
      read: null,
      pullRequest: null,
      why: "main does not carry the kit, and no open pull request into main does either",
    };
  }

  // Several at once is unusual enough to say out loud rather than decide
  // silently. The lowest number is the oldest, which is the release that has
  // been heading for `main` longest. Each is written with its repository for
  // the reason `pullReference` gives.
  const why =
    carrying.length === 1
      ? "main does not carry the kit yet"
      : `main does not carry the kit yet, and of the open pull requests that do (${carrying
          .map((pull) => pullReference(repository, pull.number))
          .join(", ")}), the lowest number wins`;

  return { ref: chosen.head.ref, read: chosen.head.sha, pullRequest: chosen.number, why };
}

/** The first line of the report: what was read, and the reason it was that. */
export function describeResolution(repository, resolution) {
  if (typeof resolution.pullRequest === "number") {
    return `Reading unmerged PR ${pullReference(repository, resolution.pullRequest)} (${resolution.ref}), because ${resolution.why}.`;
  }
  if (resolution.ref === null) return `Nothing to read, because ${resolution.why}.`;
  return `Reading ${repository}@${resolution.ref}, because ${resolution.why}.`;
}

/*
 * Every change carries a `side`. "app" is the application having moved.
 * "site" is this site's own record of it having come apart: an image missing
 * here, two snapshots that disagree, a link naming another ref. A pull fixes
 * those, but nothing about the product changed. The report heads the two
 * differently, because an issue saying the application changed when only the
 * site's records did sends somebody looking for a release that isn't there.
 */
const APP_SIDE = "app";
const SITE_SIDE = "site";

/**
 * The contract: plans, labels, the free account limit, the prices.
 *
 * Compared as serialized JSON, which is sensitive to key order, and that is
 * right here: the snapshot is a verbatim copy, so an order change means the
 * copy was not verbatim.
 */
export function compareFacts(published, snapshot) {
  if (JSON.stringify(published) === JSON.stringify(snapshot.facts)) return [];
  return [
    {
      what: "the product contract",
      detail:
        "Plans, labels, the free account limit or the prices have moved. " +
        "This changes the pricing page and possibly the terms.",
      side: APP_SIDE,
    },
  ];
}

/**
 * The feature list, by `id`.
 *
 * Only the fields the site's copy is written from. A change to anything else
 * in an entry is the application's bookkeeping and prompts no rewrite.
 */
export function compareFeatures(published, snapshot) {
  const changes = [];
  const was = new Map(snapshot.features.map((f) => [f.id, f]));
  const now = new Map(published.features.map((f) => [f.id, f]));

  const added = [...now.keys()].filter((id) => !was.has(id));
  const dropped = [...was.keys()].filter((id) => !now.has(id));
  const reworded = [...now.entries()]
    .filter(
      ([id, f]) => was.has(id) && (was.get(id).plain !== f.plain || was.get(id).why !== f.why),
    )
    .map(([id]) => id);
  const retiered = [...now.entries()]
    .filter(([id, f]) => was.has(id) && was.get(id).tier !== f.tier)
    .map(([id]) => `${id} (${was.get(id).tier} to ${now.get(id).tier})`);

  const moved = (what, ids) => {
    if (ids.length) changes.push({ what, detail: ids.join(", "), side: APP_SIDE });
  };
  moved("new features", added);
  moved("features removed", dropped);
  moved("descriptions reworded", reworded);
  moved("features re-tiered", retiered);

  const localVersion = snapshot.appVersion ?? "unknown";
  if (published.appVersion && published.appVersion !== localVersion) {
    changes.push({
      what: "a new release",
      detail: `The site describes ${localVersion}; the application is on ${published.appVersion}.`,
      side: APP_SIDE,
    });
  }
  return changes;
}

const SHOT = /^(.+)-(light|dark)\.webp$/;

/**
 * The images the site ships, from a listing of `public/screenshots/`.
 *
 * Discovered from the directory rather than listed, because a list is a claim
 * about what exists made by somebody who could not see what would be added —
 * the skill's own copy loop left `payees` out while the homepage shipped it.
 * `1200/` is not in the population: those are derived by
 * `npm run build:images` from the files here, so comparing them with the
 * application would report every re-capture twice, and the application does
 * not publish them anyway.
 *
 * Each screen the site ships in one theme is expected in both. The page
 * swaps them with the reader's theme, so a lone light file is a dark-mode
 * reader looking at a missing image.
 */
export function shippedScreenshots(names) {
  const screens = new Set();
  for (const name of names) {
    const match = SHOT.exec(name);
    if (match) screens.add(match[1]);
  }
  return [...screens]
    .toSorted()
    .flatMap((screen) => [`${screen}-light.webp`, `${screen}-dark.webp`]);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

const list = (files) => `${files.join(", ")} ${files.length === 1 ? "is" : "are"}`;

/**
 * Every image the site ships, byte for byte against the application's.
 *
 * `site` and `app` map a file name to its bytes, or to `null` where there is
 * no such file. The bytes decide, not `capturedAt`: the application
 * re-captures every screen at once, and a screen whose pixels did not move
 * (the empty import drop target, the last time) is not a change a reader
 * could see. The dates are only there to make the report readable.
 *
 * **This is the check the first version did not have.** It compared the
 * contract and the feature list, called the release branch "in sync", and
 * meanwhile eight of the twelve images the homepage ships were a capture the
 * application had replaced three days earlier, the hero among them showing a
 * lone euro account on a page that prices in dollars.
 */
export function compareScreenshots({ files, site, app, capturedAt = {} }) {
  const recaptured = [];
  const missingHere = [];
  const unpublished = [];

  for (const file of files) {
    const ours = site.get(file) ?? null;
    const theirs = app.get(file) ?? null;
    if (ours === null) missingHere.push(file);
    else if (theirs === null) unpublished.push(file);
    else if (sha256(ours) !== sha256(theirs)) recaptured.push(file);
  }

  const changes = [];
  if (recaptured.length) {
    const when =
      capturedAt.app && capturedAt.site && capturedAt.app !== capturedAt.site
        ? ` The application captured its set on ${capturedAt.app}; the site's copies record ${capturedAt.site}.`
        : capturedAt.app
          ? ` The application captured its set on ${capturedAt.app}.`
          : "";
    changes.push({
      what: "screenshots re-captured",
      detail:
        `${recaptured.join(", ")} ${recaptured.length === 1 ? "differs" : "differ"} from the application's.${when} ` +
        "Pull them, run npm run build:images, and re-read their alt text against the new pictures.",
      side: APP_SIDE,
      files: recaptured,
    });
  }
  if (missingHere.length) {
    changes.push({
      what: "screenshots missing here",
      detail: `${list(missingHere)} not in public/screenshots/, though the other theme is.`,
      side: SITE_SIDE,
      files: missingHere,
    });
  }
  if (unpublished.length) {
    changes.push({
      what: "screenshots the application no longer publishes",
      detail:
        `${list(unpublished)} not in the application's kit. ` +
        "The screen was renamed or removed, and the site is showing a picture nothing can refresh.",
      side: APP_SIDE,
      files: unpublished,
    });
  }
  return changes;
}

const short = (commit) =>
  typeof commit === "string" ? commit.slice(0, 7) : "an unrecorded commit";

/**
 * Where the two snapshots say they came from, against where this check read.
 *
 * `snapshots` is `[{ file, source }]`, one per snapshot file, with `source`
 * the `{ ref, commit }` block each records.
 *
 * **The first rule is what switches the site back to `main` after the
 * merge.** Until then the snapshots honestly name the release branch. The
 * week the release merges, `resolveRef` starts reading `main`, the content
 * is still identical (it is the same kit, merged), and every other comparison
 * here passes — so without this, nothing would ever say the site's record of
 * its source names a branch. Nothing else is sure to draw attention to it
 * either: a merged branch stays on GitHub unless it is deleted, and until
 * then everything that names it still resolves.
 *
 * It applies only when the check is reading `main`. While it is reading the
 * release branch, a snapshot naming that branch is correct, and one naming
 * some other branch is caught by the content comparisons if it matters.
 *
 * **The second is that one pull records one source.** Three records naming
 * three commits and two refs is how the site ended up with no answer to
 * "which version of the application does this describe", one of them a
 * branch that had been deleted.
 */
export function compareProvenance(resolution, snapshots) {
  const changes = [];

  if (resolution.ref === MAIN) {
    const offMain = snapshots.filter((s) => s.source?.ref !== MAIN);
    if (offMain.length) {
      changes.push({
        what: "a snapshot taken from an unmerged branch",
        detail:
          offMain.map((s) => `${s.file} names ${s.source?.ref ?? "no ref"}`).join("; ") +
          ". The snapshot was taken from an unmerged branch; re-pull from main.",
        side: SITE_SIDE,
      });
    }
  }

  const refs = new Set(snapshots.map((s) => s.source?.ref));
  const commits = new Set(snapshots.map((s) => s.source?.commit));
  if (refs.size > 1 || commits.size > 1) {
    changes.push({
      what: "snapshots that disagree",
      detail:
        snapshots
          .map((s) => `${s.file} names ${s.source?.ref ?? "no ref"} at ${short(s.source?.commit)}`)
          .join("; ") + ". One pull records one source; re-pull both from the same commit.",
      side: SITE_SIDE,
    });
  }

  return changes;
}

/**
 * Where the site links into the application's repository.
 *
 * Markdown under `content/` and TypeScript under `src/`, which between them
 * hold every such link a reader can follow: the docs link the deployment
 * guides, and the footer links the license, the changelog and the deployment
 * reference. Directories and extensions rather than files, for the reason
 * `shippedScreenshots` discovers its population.
 */
export const LINK_SOURCES = [
  { dir: "content", match: /\.md$/ },
  { dir: "src", match: /\.tsx?$/ },
];

/**
 * The names the site's source uses for the application's URL, besides
 * writing it out.
 *
 * The footer builds its links as `${site.sourceUrl}/blob/...`, and a scan for
 * the literal URL alone would read straight past all three. Named rather than
 * guessed from the shape, because any interpolation in front of `/blob/`
 * would also take in a link to some other repository. `tests/app-links.test.ts`
 * holds `site.sourceUrl` to the application's URL, and refuses any `/blob/`
 * or `/tree/` the scan can't attribute, so a new name for it is reported
 * rather than read past.
 */
export const URL_ALIASES = ["site.sourceUrl"];

const escapeRegExp = (text) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/* Where a link stops: whitespace, or what closes it in Markdown or in a
   string. Anything else is kept, so a link that swallowed a period is caught
   by `linkProblem` rather than trimmed into looking right. */
const TARGET = String.raw`([^\s)"'\x60<>\]]*)`;

/* A link into any repository on GitHub, so one into another repository is
   attributed rather than reported as a spelling the scan can't read. It
   matches the application's links too, which is harmless only because the
   application's own spelling in `appLinks` takes every one of them as well,
   `http:` included. A spelling of the application that one missed would be
   covered here and read past in silence, which is how `http:` went
   unchecked. */
const ANY_REPOSITORY = /https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:blob|tree)\//gi;

/**
 * Every link into `repository` that names a ref, in the `[{ path, text }]`
 * it is handed.
 *
 * Returns `links`, each `{ file, line, kind, target, url }` with `kind` blob
 * or tree and `target` everything after it (the ref, the path, any anchor),
 * and `unrecognized`: every `/blob/` or `/tree/` that is neither in one of
 * those links nor in a written-out link to another repository. That second
 * list is how a new spelling of the application's URL gets noticed. Without
 * it, the scan would find nothing in the new spelling and report nothing
 * wrong with it, which looks exactly like a site with nothing wrong.
 *
 * **`http:` is the application's link too.** Written that way, it used to
 * fall to `ANY_REPOSITORY` and count as a link somewhere else, so it passed
 * the ref check, the shape check and the spelling check without being read
 * by any of them. It is taken here, so its ref is held like any other, and
 * `linkProblem` refuses the scheme.
 */
export function appLinks(repository, files) {
  const spellings = [
    `https?://github\\.com/${escapeRegExp(repository)}`,
    ...URL_ALIASES.map((alias) => String.raw`\$\{\s*${escapeRegExp(alias)}\s*\}`),
  ];
  const pattern = new RegExp(`(?:${spellings.join("|")})/(blob|tree)/${TARGET}`, "gi");

  const links = [];
  const unrecognized = [];
  for (const { path, text } of files) {
    const lineOf = (index) => text.slice(0, index).split("\n").length;
    const covered = [];
    for (const match of text.matchAll(pattern)) {
      covered.push([match.index, match.index + match[0].length]);
      links.push({
        file: path,
        line: lineOf(match.index),
        kind: match[1].toLowerCase(),
        target: match[2],
        url: match[0],
      });
    }
    for (const match of text.matchAll(ANY_REPOSITORY)) {
      covered.push([match.index, match.index + match[0].length]);
    }
    for (const match of text.matchAll(/\/(?:blob|tree)\//gi)) {
      if (covered.some(([start, end]) => match.index >= start && match.index < end)) continue;
      const line = lineOf(match.index);
      unrecognized.push({ file: path, line, text: text.split("\n")[line - 1].trim().slice(0, 80) });
    }
  }
  return { links, unrecognized };
}

/**
 * The path a link points at if it names `ref`, or `null` if it names another.
 * A link to the ref itself, `.../tree/<ref>`, names it with the path `""`.
 * One with only an anchor or a query after the ref names it too, and comes
 * back as that `#...` or `?...` for `linkProblem` to judge. Otherwise the
 * report would say a link names the very ref it asks it to be pointed at.
 *
 * By prefix rather than by cutting at the first slash, because a ref can
 * contain one: `release/0.2.0/docs/x.md` is ambiguous on its own, and GitHub
 * settles it by knowing which refs exist. Knowing which ref is expected
 * settles it the same way. The prefix has to end where a URL's path segment
 * does, at a slash, a `?`, a `#` or the end, or `mainline` would count as
 * naming `main`.
 */
export function linkPath(link, ref) {
  if (!link.target.startsWith(ref)) return null;
  const rest = link.target.slice(ref.length);
  if (rest === "" || rest.startsWith("?") || rest.startsWith("#")) return rest;
  return rest.startsWith("/") ? rest.slice(1) : null;
}

/** The ref a link names, for a report. The first segment, so a guess when a
    ref has a slash in it; it is only ever printed. */
function namedRef(link) {
  return link.target.split("/")[0] || "no ref";
}

const SEGMENT = /^[\w.-]+$/;
const ANCHOR = /^[\w-]+$/;

/**
 * What is wrong with a link, or `null` when nothing is: its scheme, and the
 * path it names.
 *
 * Offline, "well-formed" is as far as this goes; whether the file is there at
 * that ref is a question for the network. Each rule is a way a link is easily
 * typed wrong: `http:` for `https:`, a period swallowed from the end of a
 * sentence, a doubled slash, a `.` or `..` that GitHub resolves somewhere
 * nobody meant, a space or a query string. GitHub redirects `http:` to
 * `https:`, and github.com is on the HSTS preload list (hstspreload.org
 * reported it "preloaded" on 2026-09-22), so a browser carrying that list,
 * as the major ones do, rewrites the link before it sends anything. A client
 * without the list, such as a feed reader or a command-line fetch, sends the
 * first request in the clear. Either way the link says something other than
 * what's meant.
 *
 * A tree link may end in a slash, because a directory's URL often does, and
 * may name no path at all, because the ref's root is a directory: the
 * repository as that ref has it. A blob is a file and may do neither. Only
 * one trailing slash comes off, and not when it's all there is, or
 * `<ref>//` would be trimmed to the root and pass as a link to it.
 */
export function linkProblem(link, ref) {
  if (/^http:/i.test(link.url)) return "http: where it should be https:";
  const path = linkPath(link, ref) ?? link.target.split("/").slice(1).join("/");
  const [file, anchor, ...more] = path.split("#");
  if (more.length > 0) return "more than one #";
  if (anchor !== undefined && !ANCHOR.test(anchor)) return `a malformed anchor, #${anchor}`;
  const trimmed =
    link.kind === "tree" && file.endsWith("/") && file !== "/" ? file.slice(0, -1) : file;
  if (trimmed === "") return link.kind === "tree" ? null : "no path";
  for (const segment of trimmed.split("/")) {
    if (segment === "") return "an empty segment, from a doubled or trailing slash";
    if (segment === "." || segment === "..") return `a ${segment} segment`;
    if (!SEGMENT.test(segment)) return `a character no path here carries, in ${segment}`;
    if (segment.endsWith(".")) return `a segment ending in a period, ${segment}`;
  }
  return null;
}

/**
 * The site's links into the application, against the ref this check read.
 *
 * They are written to name the ref the snapshots came from, so the week the
 * release merges they name a branch exactly as the snapshots do, and they
 * need the same thing to notice. Every one of them still resolves while the
 * branch is there, and nothing breaks until somebody deletes it, at which
 * point every one of them is a 404 at once.
 */
export function compareLinks(resolution, links) {
  const off = links.filter((link) => linkPath(link, resolution.ref) === null);
  if (off.length === 0) return [];

  const byRef = new Map();
  for (const link of off) byRef.set(namedRef(link), [...(byRef.get(namedRef(link)) ?? []), link]);
  const named = [...byRef]
    .map(
      ([ref, group]) =>
        `${group.length === 1 ? "1 link names" : `${group.length} links name`} ${ref} ` +
        `(${group.map((link) => `${link.file}:${link.line}`).join(", ")})`,
    )
    .join("; ");

  return [
    {
      what: "links into the application naming another ref",
      detail: `${named}. This check read ${resolution.ref}; point them there.`,
      side: SITE_SIDE,
      files: [...new Set(off.map((link) => link.file))],
    },
  ];
}

/**
 * Three answers, and the third is deliberately distinct.
 *
 * "The application has not changed" and "I could not look" must never be
 * reported the same way, so anything that stopped the check from looking
 * wins over whatever it found before it stopped.
 */
export function statusOf({ unreachable, changes }) {
  if (unreachable) return "unknown";
  return changes.length > 0 ? "drifted" : "in-sync";
}

export const EXIT_CODES = { "in-sync": 0, drifted: 1, unknown: 2 };

/**
 * The human-readable report, which the workflow also puts in the issue.
 *
 * What the application changed and what the site's own records got wrong
 * are headed separately, and only the first is "has moved". A partial pull
 * leaves only the second kind, and a report that opened on "has moved" would
 * send somebody to the application's changelog to find a release that
 * doesn't exist. Anything without a `side` counts as the application's,
 * because that heading is the one that sends somebody to look.
 */
export function formatReport({ repository, resolution, status, changes, note }) {
  const lines = [];
  if (resolution) lines.push(describeResolution(repository, resolution), "");
  const at = resolution?.ref ? `${repository}@${resolution.ref}` : repository;

  if (status === "unknown") {
    lines.push("Could not tell.", "", note);
  } else if (status === "in-sync") {
    lines.push(`In sync with ${at}. Nothing a reader could see has changed.`);
  } else {
    const sections = [
      [`${at} has moved:`, changes.filter((change) => change.side !== SITE_SIDE)],
      [
        `This site's record of ${at} needs attention:`,
        changes.filter((change) => change.side === SITE_SIDE),
      ],
    ];
    for (const [heading, group] of sections) {
      if (group.length === 0) continue;
      lines.push(heading, "");
      for (const change of group) lines.push(`  ${change.what}: ${change.detail}`);
      lines.push("");
    }
    lines.push("Run the sync-from-app skill.");
  }
  return lines.join("\n");
}
