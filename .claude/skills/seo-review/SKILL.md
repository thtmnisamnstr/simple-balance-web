---
name: seo-review
description: Review what a search engine reads on the site, past what the tests already hold. Whether each title is the search its reader makes and the description answers it, whether two pages compete for one search, orphans and internal links, indexing and the sitemap's dates, alt text, page cards and structured data. Fixes what this repository can and reports what only the owner can do in Search Console, Bing Webmaster Tools and GitHub. Run by merge-prep after design-review; use on its own before a launch, after adding, retitling, renaming or removing pages, or when asked to check the SEO or how the site shows up in search.
---

# Read the site the way a search engine does

A search engine reads a part of every page the reader never looks at: the
title in the tab, the description under the result, the canonical, the robots
meta, the sitemap's date, the card a shared link shows, and the JSON-LD. Most
of what can go wrong there mechanically is a test now, on every build. What's
left is judgment: whether a title is what somebody would type, whether the
description answers it, whether two pages compete for the same search, and
whether a page can be reached by anything but the sitemap. That's where this
skill spends its time.

`aeo-review` follows it under `merge-prep` and reads the same pages the way an
answer engine does, the Markdown copies and `/llms.txt` included. They meet at
one point on purpose, the opening paragraph: here the question is whether it
answers the title, there whether it can be quoted on its own.

**Run by `merge-prep` §8**, it reviews what the branch changed. **Run on its
own**, when somebody asks to check the SEO, whether the site is ready to
launch, or after pages were added, retitled, renamed or removed, it reviews
every page the sitemap lists, and it ends at its report (§11).

## 1. Scope

Run the scope block in `merge-prep` §1 again, rather than reusing the list it
wrote. Fixes from `merge-prep` §3 to §7 came after that list, and so did the
policy `legal-review` rewrote and any heading `design-review` moved, and each
is a title, a description or a link this review should see. After a sync the
list is the whole branch, the sync's pages included.

**Run on its own**, the scope is every page in the sitemap, which §3 shows how
to feed in. Fetch first all the same, because the only fetch is in the block
in `merge-prep` §1, which a run on its own skips:

```sh
git fetch origin main --quiet
```

§4's renames and §5's dates still read the branch's diff against
`origin/main`, and a stale copy of it reports work that already merged as
this branch's.

**Some files reach every page**, and a branch that touched one gets the whole
site, not the page you were thinking of:

- `src/app/layout.tsx`, which holds the title template and the root metadata
  every route inherits or replaces (`code/next.md` 1.1);
- `src/app/open-graph.ts`, `src/lib/indexing.ts` and `src/lib/feed.ts`, the
  helpers a route asks for its preview, its robots meta and its alternates;
- `src/components/structured-data.tsx`;
- `src/content/sections.ts`, which decides what's announced, linked, indexed
  and in the sitemap (`content.md` 7.1), and `src/content/llms.ts`;
- `src/app/sitemap.ts` and `src/app/robots.ts`;
- the headers in `netlify.toml`, which can put `X-Robots-Tag` on a page.

§3's listing widens for those by name. Two more widen it and need you to
notice: a change to `site` in `src/content/home.ts`, whose name ends every
title through the template, and a Next upgrade from `merge-prep` §2, which
can change what every route's metadata replaces.

**A branch that changed nothing a search engine reads**, only guides, skills,
tests or workflows, says so in the report and hands back. A Markdown file
under `content/` is something it reads. A post on the unannounced blog is
`noindex` (`content.md` 7.1), so check that it still is and move on: its title
and description matter the day the blog is announced, which is a review of
its own.

## 2. What the tests already hold

Don't count title lengths, parse JSON-LD or compare the sitemap with the
build by hand. Each of these runs on every `npm run verify`, after the build,
and names what failed:

- **`tests/sitemap.test.ts`**: the sitemap lists every announced page the
  build emitted and nothing it didn't, keeps the error page out, dates every
  URL with nothing in the future or before the site existed, and holds every
  listed page to a title of at most 70 characters, a description of 70 to 160
  and the large-image-preview directive, and no title but the homepage's
  naming the site itself.
- **`tests/sections.test.tsx`**: an announced section is linked from the
  header and the footer, indexable and in the sitemap, an unannounced one is
  none of the three, the links are derived from the flag rather than written
  out, and `robots.txt` is one group for every crawler with no `Disallow`.
- **`tests/structured-data.test.ts`**: every payload parses, nothing claims a
  rating or a review, the homepage's graph has its ids and its
  `alternateName`, the offers quote the contract's prices, every guide and
  docs page has its article, its card and its breadcrumbs, and every docs page
  points at the application.
- **`tests/markdown.test.ts`**: a Markdown copy of every guide and docs page,
  linked from the page, with absolute links, and `/llms.txt` listing only what
  is announced.
- **`tests/export-shape.test.ts`**: no redirect that could answer `/ads.txt`,
  the copies and `/llms.txt` served `noindex`, and every card the page's own,
  1200 by 630, drawn from its current title.
- **The homepage's card**, `public/og.png`:
  `scripts/build-images.sources.json` records the hero title, the tagline and
  the price line the card was drawn with, and `tests/export-shape.test.ts`
  compares them with `src/content/home.ts` and `src/content/app-facts.json`,
  and the record's hash with the committed file. So a card nobody
  redrew after the hero or the price moved fails the way a stale page card
  does. What none of them can see is the picture itself (§6).
- **`tests/copy.test.ts`**: the homepage's title, a link preview from
  `openGraph()` on every route, `og:url` equal to the canonical, the locale on
  every page, no canonical on the 404, and none of the bank-connection
  phrasing on the homepage or the pricing page.
- **`tests/feeds.test.ts`**: the blog's feeds advertised only on its own pages
  until it's announced.
- **`tests/app-facts.test.ts`**: a price in any string of `pricingMeta`,
  the pricing page's title and description and their link-preview pair, is
  one the application charges. It reads the card script's source as well,
  which only proves the script names no stale price; the drawn card is the
  record's, above.
- **`tests/learn.test.ts`** and **`tests/pricing.test.tsx`**: a guide credits
  no author, links only pages that exist and links the docs page of every
  screen it names in bold, and the pricing page's questions in its structured
  data are the ones it shows.
- **`scripts/check-links.mjs`**: every internal link in `out/` resolves, and
  one with a `#` reaches its heading. It runs in GitHub Actions, not in
  `verify`, so run it here.

```sh
npm run build
npx vitest run tests/sitemap.test.ts tests/sections.test.tsx tests/structured-data.test.ts \
  tests/markdown.test.ts tests/export-shape.test.ts tests/copy.test.ts tests/feeds.test.ts \
  tests/app-facts.test.ts tests/learn.test.ts tests/pricing.test.tsx
node scripts/check-links.mjs
```

A failure there is a fix with a name on it. Everything below is what none of
them can decide.

## 3. Each page as a search result

One listing gives the material: for each page in scope, its title, h1 and
description with their lengths, the opening paragraph from its Markdown copy,
and the three pages whose titles and descriptions share the most words with
it. It reads §1's list on stdin, maps each file to the pages it renders, and
widens to every page for a file in §1's shared list.

```sh
{ git diff --merge-base origin/main --name-only; git ls-files --others --exclude-standard; } |
node -e '
const fs = require("node:fs");
const SHARED = /^(src\/app\/(layout\.tsx|open-graph\.ts|sitemap\.ts|robots\.ts)|src\/lib\/(indexing|feed)\.ts|src\/components\/structured-data\.tsx|src\/content\/(sections|llms)\.ts|netlify\.toml)$/;
const STOP = new Set("a an and are at by do does for from how in is it its of on or the to what when why with you your simple balance".split(" "));
const clean = (s) => (s ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "\x27")
  .replace(/&quot;/g, "\"").replace(/\s+/g, " ").trim();
const all = [...fs.readFileSync("out/sitemap.xml", "utf8").matchAll(/<loc>https:\/\/[^/<]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const routes = new Set();
for (const line of fs.readFileSync(0, "utf8").split("\n").filter(Boolean)) {
  let m;
  if (line.startsWith("/")) routes.add(line);
  else if (SHARED.test(line)) { console.log(`shared: ${line}, so every page`); all.forEach((r) => routes.add(r)); }
  else if ((m = /^content\/(learn|docs|blog)\/([^_/][^/]*)\.md$/.exec(line))) routes.add(`/${m[1]}/${m[2]}/`);
  else if ((m = /^content\/(learn|docs|blog)\/_sections\.json$/.exec(line))) routes.add(`/${m[1]}/`);
  else if (line === "src/content/home.ts") routes.add("/");
  else if (line === "src/content/pricing.ts") routes.add("/pricing/");
  else if (line === "src/content/legal.ts") ["/privacy/", "/terms/"].forEach((r) => routes.add(r));
  else if ((m = /^src\/app\/(.*?)\/?page\.tsx$/.exec(line))) {
    const dir = m[1] ? `/${m[1]}/` : "/";
    const fixed = dir.split("[")[0];
    if (fixed === dir) routes.add(dir);
    else all.filter((r) => r.startsWith(fixed) && r !== fixed).forEach((r) => routes.add(r));
  }
}
const read = (route) => {
  const html = fs.readFileSync(`out${route}index.html`, "utf8");
  const page = {
    title: clean(/<title>([^<]*)<\/title>/.exec(html)?.[1]),
    h1: clean(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1]),
    description: clean(/<meta name="description" content="([^"]*)"/.exec(html)?.[1]),
    noindex: /<meta name="robots" content="noindex/.test(html),
  };
  page.words = new Set(`${page.title} ${page.description}`.toLowerCase().split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w)).map((w) => w.replace(/(ing|s)$/, "")));
  return page;
};
const site = new Map(all.map((route) => [route, read(route)]));
for (const route of routes) {
  if (!fs.existsSync(`out${route}index.html`)) { console.log(`\n${route}\n  NOT BUILT: removed or renamed (§4), or out/ is stale`); continue; }
  const page = site.get(route) ?? read(route);
  console.log(`\n${route}${page.noindex ? "  (noindex)" : ""}`);
  console.log(`  title  ${page.title} (${page.title.length})\n  h1     ${page.h1}\n  desc   ${page.description} (${page.description.length})`);
  if (fs.existsSync(`out${route}index.md`)) {
    const paragraphs = fs.readFileSync(`out${route}index.md`, "utf8").split(/\n\s*\n/);
    const body = paragraphs.slice(paragraphs.findIndex((p) => p.startsWith("From Simple Balance:")) + 1);
    console.log(`  opens  ${clean(body.find((p) => !/^(#|!\[|_|>|\||`{3})/.test(p.trim())))}`);
  }
  const near = [...site].filter(([other]) => other !== route)
    .map(([other, o]) => [other, [...page.words].filter((w) => o.words.has(w)).length])
    .sort((a, b) => b[1] - a[1]).slice(0, 3);
  console.log(`  beside ${near.map(([other, n]) => `${other} (${n})`).join("  ")}`);
}'
```

**Run on its own**, feed it every route in the sitemap instead of the diff,
by replacing the first line with
`sed -n 's|.*<loc>https://smpl.money\(/[^<]*\)</loc>.*|\1|p' out/sitemap.xml |`.

Read each page down the listing:

- **Is the title the search?** `content.md` 5.16 has the recipe: a guide's
  title is the question as people type it, or the noun they search where
  that's the search; a docs page's is the app's own name for the feature or
  the task in its -ing form, with an acronym in parentheses after the plain
  words; an index's is its `metaTitle`, because "Money basics" says nothing
  in a list of ten results. About 53 characters fit before the template's
  " — Simple Balance". A title that already names the product reads it twice
  once the template adds it, "Self-hosting Simple Balance — Simple Balance",
  and spends room the search's own words could use on a repeat;
  `tests/sitemap.test.ts` refuses that now, so it reaches this read only as
  a failure to fix.
- **Does the description answer it, in its first sentence?** The test holds
  the length. What it can't hold is whether the first sentence is the answer
  rather than a teaser, and whether the words somebody searched come early,
  since a result is cut from the end.
- **Do title, h1 and description agree?** On a guide or a docs page the h1
  is the frontmatter title, so those two can't part, and the comparison that
  matters is title against description and opening. An index's heading and
  its `metaTitle` differ on purpose, and the homepage's and the pricing
  page's h1 is the argument while the title names the category (`content.md`
  5.16), so there they should share a subject, not words. The usual find is a
  page retitled whose description kept the old subject.
- **Does the opening paragraph answer the title?** It's the first thing in
  the Markdown copy after the title and the description, and the first thing
  anything summarizing the page reads (`content.md` 5.16 and 5.17). The
  `opens` line is the first paragraph after the copy's `From Simple Balance:`
  line that isn't a heading, a picture, the made-up-money line, a quote, a
  table or a code block, so a docs page that opens on its bold screen name
  prints that paragraph rather than the one after it. Read it alone: does it
  say what the title asked?
- **Is this the one page on the site for its search?** Two pages that answer
  the same search split the links and the clicks between them, and a search
  engine picks one, often not the one you'd choose. The `beside` line points
  at the likeliest competitors; read the page against them and against its
  obvious counterpart. A learn guide and a docs page on the same feature are
  the usual pair, and they don't compete when each says whose search it is:
  the guide is the job with any tool ("How to make a budget"), the docs page
  is the screen ("Budgets"). Two docs pages are the other: an explainer and
  the feature page it describes. Settle it by intent, by making each title
  name the search its own reader makes and linking each to the other in its
  text, and where two pages really are one, merge them and redirect the
  address that goes (§4). Report any pair you left competing, with why.

Then the whole site at once, which costs nothing and catches what one page
can't show: two indexable pages with the same title or description, a
canonical that isn't the page's own address, and every page that isn't
indexable, which §5 reads.

```sh
node -e '
const fs = require("node:fs");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === "_next" ? [] : walk(`${dir}/${e.name}`)) : e.name === "index.html" ? [`${dir}/`] : []);
const clean = (s) => (s ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "\x27")
  .replace(/&quot;/g, "\"").replace(/\s+/g, " ").trim();
const seen = new Map();
for (const dir of walk("out")) {
  const route = dir.slice("out".length);
  const html = fs.readFileSync(`${dir}index.html`, "utf8");
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) { console.log(`noindex      ${route}`); continue; }
  const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
  if (canonical !== `https://smpl.money${route}`) console.log(`CANONICAL    ${route} names ${canonical ?? "none"}`);
  for (const key of ["title", "description"]) {
    const text = clean(key === "title" ? /<title>([^<]*)<\/title>/.exec(html)?.[1] : /<meta name="description" content="([^"]*)"/.exec(html)?.[1]);
    if (seen.has(key + text)) console.log(`SAME ${key.padEnd(7)} ${seen.get(key + text)} and ${route}: ${text}`);
    seen.set(key + text, route);
  }
}'
```

**Where the words live**, for a rewrite:

| Page                   | Title and description                                 | Its date                                            |
| ---------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `/`                    | `site.titleTagline` and `site.description`, `home.ts` | `homeUpdated`                                       |
| `/pricing/`            | `pricingMeta` in `src/content/pricing.ts`             | `pricingUpdated`                                    |
| `/learn/` and `/docs/` | `metaTitle` and `description`, `sections.ts`          | its newest page                                     |
| a guide                | `title` and `description` in its frontmatter          | `date` never moves; add `updated` when it's revised |
| a docs page            | `title` and `description` in its frontmatter          | `updated` in its frontmatter                        |
| `/privacy/`, `/terms/` | `src/content/legal.ts`                                | `legalUpdated`, `legal-review`'s                    |

**A rewrite is copy, so it's a claim.** Read it against the shipped
application (`content.md` 2.1) and against the privacy policy, which no
marketing sentence may outpromise (`content.md` 2.4). On the homepage and the
pricing page, read it too against the reader those pages are for, who has
never used a finance product (`content.md` 1.3), and against the
bank-connection rule (`content.md` 1.4): a title or description is the worst
place to imply a connection and the wrong place to disclaim one, since the
disclosure goes after the value, inside the import copy. A docs page under
Self-hosting may use an operator's words (`content.md` 5.18), and that's
where "self-hosted" and "open source" earn their place.

**Keep a rewrite only where it serves the reader the page is for.** A title
bent toward a phrase that page's reader wouldn't type is worse than the one it
replaced, whatever its volume. The homepage's and the pricing page's words
were chosen on purpose and say why (`content.md` 5.16), so a rewrite there
wants a reason a searcher would name; when the reason is yours rather than
the reader's, put the proposal in the report with the old words beside it
and leave the page. A retitled guide or docs page needs its card redrawn
(§6) and its `updated` set (§5).

## 4. Internal links

A page only the sitemap knows about is one a search engine finds and then
ranks as unimportant, and the words of a link are part of how it learns what
the target is about. So every indexable page should be reachable from its
hub, the section index, and from at least one sibling in the text of a page,
not only from a menu.

This counts, for every page in the sitemap, the other indexable pages that
link it, split into menus (header, footer and every `<nav>`, which holds the
docs sidebar and the pagers) and text. It names an orphan, a page linked only
from menus, and a page whose only link in text is its hub. It names any link
in text whose words are "here", "this page", "read more" or the like, or
that point at a page without naming it, as "a page of their own" did. And it
names the two cross links the sections owe each other: `NO DOCS LINK` is a
guide whose text links no docs page, and `NO LEARN LINK` is a docs page
outside Self-hosting whose text links no guide. A guide that links some docs
page and not the page of a screen it names is the test's to find (§2), since
this count can't tell the two apart.

```sh
node -e '
const fs = require("node:fs");
const routes = [...fs.readFileSync("out/sitemap.xml", "utf8").matchAll(/<loc>https:\/\/[^/<]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const inbound = new Map(routes.map((r) => [r, { menus: new Set(), text: new Set() }]));
const outbound = new Map(routes.map((r) => [r, new Set()]));
const CHROME = /<(header|footer|nav)\b[\s\S]*?<\/\1>/g;
const VAGUE = /^(here|click here|this|this page|read more|learn more|more|link|see here)$|^(a|the|this|that) (page|guide|one)\b|\bof (its|their) own\b/i;
for (const from of routes) {
  const html = fs.readFileSync(`out${from}index.html`, "utf8");
  for (const [part, kind] of [[(html.match(CHROME) ?? []).join(""), "menus"], [html.replace(CHROME, ""), "text"]]) {
    for (const [, href, words] of part.matchAll(/<a\b[^>]*\shref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const to = href.replace(/^https:\/\/smpl\.money/, "").replace(/[?#].*$/, "");
      if (inbound.has(to) && to !== from) inbound.get(to)[kind].add(from);
      if (kind === "text") outbound.get(from).add(to);
      const label = words.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (kind === "text" && to.startsWith("/") && VAGUE.test(label)) console.log(`VAGUE "${label}" on ${from} -> ${to}`);
    }
  }
}
for (const [route, { menus, text }] of inbound) {
  const hub = route.split("/").slice(0, 2).join("/") + "/";
  if (route === "/" || menus.size >= routes.length - 1) continue;
  if (menus.size + text.size === 0) console.log(`ORPHAN       ${route}: only the sitemap knows it`);
  else if (text.size === 0) console.log(`MENUS ONLY   ${route}`);
  else if (hub !== route && [...text].every((from) => from === hub)) console.log(`HUB ONLY     ${route}`);
}
const group = (slug) => /^section:\s*(.+)$/m.exec(fs.readFileSync(`content/docs/${slug}.md`, "utf8"))?.[1].trim();
for (const [from, to] of outbound) {
  const [, key, slug] = from.split("/");
  const owed = !slug ? "" : key === "learn" ? "docs" : key === "docs" && group(slug) !== "Self-hosting" ? "learn" : "";
  if (owed && ![...to].some((r) => r.startsWith(`/${owed}/`) && r !== `/${owed}/`)) console.log(`NO ${owed.toUpperCase()} LINK ${from}`);
}'
```

For what it prints, the link belongs on the page whose reader needs the
target next, in words that name it, and a link added only to raise a count,
from a page whose reader has no use for it, helps nobody and reads as what
it is. An orphan, a page linked only from menus or only from its hub wants a
sibling that links it in its text, and a guide links the guide its reader
wants after it.

Read each cross-link line against the screens the page describes. Every
guide ends on doing the job in Simple Balance (`content.md` 5.14), which
walks through screens, so `NO DOCS LINK` is always a missing link: the first
mention of each screen links its docs page, in words that name it. A docs
page closes on the learn guide that teaches the job with any tool
(`content.md` 5.17), so `NO LEARN LINK` on a page whose job a guide teaches
is a missing link too, and on a page about a setting or a limit that no
guide teaches it's the right answer and stays.

**A page renamed or removed on the branch** shows in the diff:

```sh
git diff --merge-base origin/main --name-status -- content src/app | grep -E '^(R|D)'
```

A rename that rewrote most of the page shows as a `D` here and an added file,
not as an `R`, so read each `D` as a rename until you've found nothing that
replaced it, as the page moved to `/docs/moving-between-cloud-and-self-hosted/`
did.

A renamed page gets a 301 from its old directory, a fixed path with a splat
like the moved-page block in `netlify.toml`, and every link to the old slug
in `content/` and `src/content/` points at the new one in the same change,
because the redirect is for links from outside the repository
(`operations.md` 2.1). `grep -rn "<old slug>" content src/content` finds them,
and `node scripts/check-links.mjs` finds one left in a built page. A removed
page whose search another page now answers redirects there; one with no
successor is left to the real 404, which tells a search engine to drop it.
Never a catch-all: `AGENTS.md` says why, and `tests/export-shape.test.ts`
refuses one that could answer `/ads.txt`.

## 5. Indexing

**`noindex` only where it belongs.** §3's site-wide listing names every page
that isn't indexable. Today that's the unannounced blog, the 404 and its
`_not-found` twin, and the Markdown copies and `/llms.txt` by header, which
the listing doesn't read. Anything else on that list is a page a route asked
to hide, and the question is whether anybody meant it to. Robots metadata
comes from `src/lib/indexing.ts` (`code/next.md` 1.1), so a page that's
`noindex` by accident usually wrote its own `robots` or took the wrong
section's.

**Canonicals.** The same listing names a page whose canonical isn't its own
address. Only page one of the blog points elsewhere, by design
(`operations.md` 1.4), and it's `noindex` while the blog is unannounced.

**The sitemap's dates moved only when the page did.** Google uses a
sitemap's dates only while they're consistently accurate, so a date bumped on
an unchanged page spends that, and a changed page that kept its date hides a
change (`operations.md` 7.3).

The two kinds of page are dated differently. A docs page has only `updated`,
the day its words last changed (`content.md` 5.2). A guide has `date`, the
day it was published, which never moves, and gets `updated` the first time
it's revised and each time after. `src/app/sitemap.ts` reads `updated` where
there is one and `date` where there isn't, and the guide's structured data
carries `date` as `datePublished` and `updated` as `dateModified`. A guide's
pictures are part of it, so a change to its art module in
`src/content/learn-art/` or to a screenshot it shows is a revision even when
the Markdown didn't move.

This names a date moved on an unchanged page, a changed page that kept its
date, and a guide whose `date` moved, for the guides and docs pages and for
the two pages dated by hand:

```sh
node -e '
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const base = git("merge-base", "origin/main", "HEAD").trim();
const existed = (file) => { try { git("cat-file", "-e", `${base}:${file}`); return true; } catch { return false; } };
const changes = (...files) => git("diff", "-U0", base, "--", ...files).split("\n")
  .filter((line) => /^[-+]/.test(line) && !/^(\+\+\+|---) /.test(line));
const pages = ["docs", "learn"].flatMap((key) => fs.readdirSync(`content/${key}`)
  .filter((name) => /^[^_].*\.md$/.test(name)).map((name) => `content/${key}/${name}`));
for (const file of pages) {
  if (!existed(file)) continue;
  const lines = changes(file);
  const words = lines.filter((line) => !/^[-+]date:|^[-+]updated:/.test(line));
  const dated = lines.some((line) => line.startsWith("+updated:"));
  const slug = /^content\/learn\/(.+)\.md$/.exec(file)?.[1];
  const shots = [...fs.readFileSync(file, "utf8").matchAll(/<Shot\s+name="([^"]+)"/g)]
    .flatMap(([, name]) => [`public/screenshots/${name}-light.webp`, `public/screenshots/${name}-dark.webp`]);
  const pictures = slug
    ? git("diff", "--name-only", base, "--", `src/content/learn-art/${slug}.ts`, ...shots).split("\n").filter(Boolean)
    : [];
  if (slug && lines.some((line) => line.startsWith("-date:"))) console.log(`date moved: ${file}, so put it back and set updated`);
  if (words.length + pictures.length === 0) {
    if (dated) console.log(`only the date moved: ${file}`);
    continue;
  }
  if (!dated) console.log(`changed, date kept: ${file}${pictures.length ? ` (pictures: ${pictures.join(", ")})` : ""}`);
}
for (const [file, name] of [["src/content/home.ts", "homeUpdated"], ["src/content/pricing.ts", "pricingUpdated"]]) {
  const lines = changes(file);
  if (lines.length && !lines.some((line) => line.startsWith(`+export const ${name} `))) console.log(`changed, ${name} kept: ${file}`);
}'
```

A page new on the branch is skipped, since it has no old date to compare.
Read each line it prints before acting: a typo fixed may keep its date and a
fact changed may not, and a change to a comment or a menu in `home.ts` isn't
a change to the homepage's words. `legalUpdated` is `legal-review`'s, moved
for a material change and not otherwise.

**Crawling is allowed everywhere** and `tests/sections.test.tsx` holds it. If
a change reaches for `Disallow` to keep a page out, the page wants `noindex`
instead, which a crawler can only read on a page it's allowed to fetch
(`content.md` 7.2).

## 6. Images and cards

**Alt text says what the picture shows**, in the words the page's reader
would use, which is also what an image search reads.
`tests/home-page.test.tsx` holds the homepage's screenshots to that, and
nothing holds the guides' and the docs'. This names a short or generic one on
any indexable page:

```sh
node -e '
const fs = require("node:fs");
for (const [, route] of fs.readFileSync("out/sitemap.xml", "utf8").matchAll(/<loc>https:\/\/[^/<]+(\/[^<]*)<\/loc>/g)) {
  for (const [img] of fs.readFileSync(`out${route}index.html`, "utf8").matchAll(/<img\b[^>]*>/g)) {
    const alt = /\salt="([^"]*)"/.exec(img)?.[1];
    if (alt === undefined || alt.length < 40 || /^(screenshot|image|picture) of/i.test(alt))
      console.log(`${route}  ${/\ssrc="([^"]*)"/.exec(img)?.[1]}  alt="${alt ?? "none"}"`);
  }
}'
```

A learn hero is hidden from assistive technology by design and a diagram is
described in full (`web.md` 5.7 and 5.8), so neither is a missing alt.

**A card is redrawn when a test says it's stale.** The card is what a shared
link and an image result show, and the script that draws it redraws every
card, cover and screenshot copy on every run, so it runs on a test's word
rather than a guess, and an audit that changed nothing doesn't run it. §2's
tests decide. `tests/export-shape.test.ts` fails, naming the card, when a
guide, a docs page, an index or the pricing page has no card or has one
drawn from an old title, and the homepage card's test fails when its record
no longer matches the copy. When either fails, and only then:

```sh
npm run build:images
```

Then rerun §2's tests, and open each card the failure named. Two things the
tests can't see. The script never deletes, so a removed or renamed page's
old card ships with every test green (`operations.md` 7.1); this names one,
to delete by hand in the same change:

```sh
node -e '
const fs = require("node:fs");
const { cards } = JSON.parse(fs.readFileSync("scripts/build-images.sources.json", "utf8"));
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
for (const file of walk("public/og")) if (!(file.slice("public/".length) in cards)) console.log(`no page draws ${file}`);'
```

And nobody has looked at what a redrawn card says: open it as an image. A
title wraps at 27 characters and a fourth line throws (`operations.md` 7.1).
`public/og.png`, the homepage's, is held to its words by the record (§2),
which can't see the picture: after it's redrawn, look at it beside the
homepage.

What a card weighs is `optimize`'s, like every other picture.

## 7. Structured data

`tests/structured-data.test.ts` holds a good deal of it on every build:
every payload on every page parses and claims no rating or review; the
homepage's graph has the organization, the site with its `alternateName`,
the application at its own address and the source repository, with the
offers at the contract's prices; and every guide and docs page has an
article of its type whose address is the page's and whose headline is its
title, crediting no author, with a card that exists and breadcrumbs that
end on the page, and every docs page's article is about the application.
`tests/pricing.test.tsx` holds the pricing page's questions to the ones it
shows. Don't check any of that by eye.

What they can't hold is `content.md` 5.13's rule itself: every field is true
of something a reader can see on that page. This compares the two fields a
machine can, a description against the page's own and a date against the
dates the page shows, and prints in full every node that isn't an article or
a trail, to read beside its page. It reads routes on stdin; for the branch,
name the pages §3 listed:

```sh
printf '%s\n' / /pricing/ |
node -e '
const fs = require("node:fs");
const clean = (s) => (s ?? "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "\x27").replace(/&quot;/g, "\"");
const HELD = new Set(["Article", "TechArticle", "BreadcrumbList"]);
for (const route of fs.readFileSync(0, "utf8").split("\n").filter(Boolean)) {
  const html = fs.readFileSync(`out${route}index.html`, "utf8");
  const description = clean(/<meta name="description" content="([^"]*)"/.exec(html)?.[1]);
  const shown = new Set([...html.matchAll(/<time\b[^>]*datetime="([^"]+)"/gi)].map((m) => m[1].slice(0, 10)));
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(json);
    for (const node of data["@graph"] ?? [data]) {
      const type = node["@type"];
      if (typeof node.description === "string" && node.description !== description)
        console.log(`${route}  ${type}: description differs from the meta description: ${node.description}`);
      for (const key of ["datePublished", "dateModified"])
        if (node[key] && !shown.has(node[key].slice(0, 10))) console.log(`${route}  ${type}: ${key} ${node[key]} is not a date the page shows`);
      if (!HELD.has(type)) console.log(route, JSON.stringify(node, null, 2));
    }
  }
}'
```

**Run on its own**, feed it the whole site by replacing the first line with
`sed -n 's|.*<loc>https://smpl.money\(/[^<]*\)</loc>.*|\1|p' out/sitemap.xml |`,
as §3 does. An article or a trail prints only when its description or a
date disagrees with the page, since the test holds the rest of it, so today
the whole site comes to the homepage's graph and the pricing page's
questions. Both comparisons are mechanical, so they belong in
`tests/structured-data.test.ts` (§10); until a line there holds them, they
run here.

- **The fields match the page.** Any line naming a description or a date is
  a field that says something the page doesn't. On the homepage, the
  `featureList` is the feature headings a reader sees, and each description
  and name is one the page would back up. A field that describes something
  only the markup says is the thing Google's policy calls spam, and it's
  also untrue.
- **The type is the right one.** A guide is an `Article`, a docs page a
  `TechArticle`, a post a `BlogPosting`, and the pricing questions a
  `FAQPage`. A new template takes the type of the nearest page that reads the
  same way, and its breadcrumbs from `src/components/breadcrumbs.tsx`, which
  writes the trail a reader sees and the one a search engine reads together.
  A new top-level route needs the six things `code/next.md` 1.2 lists.
- **Some warnings are expected.** Google's software app result needs a rating
  or a review, which this product hasn't been given, so Search Console may
  report the homepage's application as ineligible, and the answer is to leave
  it: a rating nobody gave is the invented field above. FAQ results left
  Google in May 2026, and the markup stays because it's visible and other
  engines read it (`content.md` 5.13).

## 8. Speed is `optimize`'s

Google counts how a page loads, and `optimize` measures it: the weight, the
images, the one picture loaded eagerly, the width and height that stop a page
shifting. Under `merge-prep` it runs after `aeo-review`, over the pages as
they'll ship. Here, only name what this run changed that it should weigh: a
card redrawn, a picture added near the top of a page, a page that got longer.
Measuring it twice is time not spent on §3.

## 9. The owner's half

Everything at Google, Bing, GitHub, Netlify's dashboard or a listing is the
owner's, and the agent's part is to say which of it this branch or this
launch makes due, and why. None of it is done from here. The settings
themselves are in `operations.md` 8, and the report carries this half as a
section of its own (§11), first when anything in it is due.

- **Before a launch, or run on its own**, whether each row of
  `operations.md` 8 that concerns search is in place: a Search Console domain
  property for `smpl.money`, verified by DNS, with the sitemap submitted; Bing
  Webmaster Tools imported from it; and the application repository's website
  field set to the site. Some of that can be read from here:

  ```sh
  for repo in simple-balance simple-balance-web; do
    gh api "repos/thtmnisamnstr/$repo" --jq '"\(.full_name)",
      "  website:     \(if (.homepage // "") == "" then "EMPTY, an owner item" else .homepage end)",
      "  description: \(if (.description // "") == "" then "EMPTY, an owner item" else .description end)"'
  done
  dig +short TXT smpl.money | grep google-site-verification || echo "NO Search Console record in DNS"
  ```

  An empty field prints `EMPTY`, because `gh` answers an unset one with a
  blank line and a clean exit, which is easy to read past. Each `EMPTY` goes
  in the report as an owner item. The application's website field is the
  `operations.md` 8 row and the link back from the page most linked to about
  the product, and this site's own repository wants the same link. A
  description is the snippet a search for the repository shows, and
  `aeo-review` §9 reads it against the story the site tells, so one in words
  the site no longer uses is reported once, there.

  The DNS record says the domain was verified in Search Console at some
  point, not that the property still exists or that the sitemap was
  submitted, and Bing's import leaves no trace here at all. Those two the
  owner confirms in the consoles. Verification by DNS rather than a meta tag
  or a file keeps every page as this repository builds it, so if a console
  offers the other two, DNS is the one to choose.

- **Pages added**: they reach the index through the sitemap on their own.
  Inspecting a new hub or an important guide in Search Console and asking
  for it to be indexed is the owner's optional nudge.
- **Pages renamed or removed**: once deployed, Search Console's pages report
  should show the old address as a redirect or not found, and the new one
  indexed. It's worth the owner's look a week or two after the merge, and
  nothing needs resubmitting.
- **Hosting**: that no Netlify extension or firewall rule blocks crawlers,
  which `robots.txt` can't see past. Once, before a launch, ask the deployed
  site for every page its sitemap lists, as each search engine's crawler:

  ```sh
  curl -s https://smpl.money/sitemap.xml | sed -n 's|.*<loc>\([^<]*\)</loc>.*|\1|p' | while read -r url; do
    for agent in Googlebot bingbot; do
      answer=$(curl -s -o /dev/null -w '%{http_code} %header{x-robots-tag}' -A "Mozilla/5.0 (compatible; $agent)" "$url")
      [ "$answer" = "200 " ] || echo "$agent $url: $answer"
    done
  done
  ```

  It prints nothing when every page answers 200 with no `X-Robots-Tag`.
  This is the deployed `main`, so it lists what's live rather than the
  branch. It sends the crawler's name, not its addresses, so it proves the
  host turns nobody away by name, and Search Console's URL inspection is the
  only view of what Google's own crawler got. `aeo-review` §8 asks the same
  of the answer engines' crawlers.

- **Not IndexNow.** It tells Bing and a few other engines a page changed,
  though not Google, and the owner decided against it on 29 October 2026
  (`docs/roadmap.md` 2.7), so it isn't an open item. The sitemap Bing
  already has is how it learns a page moved.

Listings, the MCP Registry and asking assistants about the product are
`aeo-review`'s half, and that report carries them.

## 10. Finish

**A finding a machine could decide becomes a test**, in the same change, so
the next run doesn't have to find it again: a title that names the product
twice, say, is a line in `tests/sitemap.test.ts`. Every new check is
mutation-proved (`code/testing.md` 2.3).

**When `merge-prep` called this**, skip the full suite: its §12 runs
`npm run verify` once, after every phase. Rebuild after a fix and run §2's
tests, since they read `out/`. Then **return to `merge-prep` with the
report**, and the run goes on to `aeo-review`. Nothing here commits or
pushes, under `merge-prep` or on its own.

**Run on its own**, finish with `npm run verify` and the report. What it
fixed stays uncommitted for `merge-prep`, which the owner starts when they
want it shipped, because every push is a build on their credits.

## 11. Report

- **Scope**: the branch's pages or the whole site, and what widened it.
- **The tests in §2**, run, and what they caught.
- **Every title, description, h1 or opening sentence rewritten**, by page,
  with the old words beside the new. Under `merge-prep` this list is what
  gets read as copy before the guides, so leave none out.
- **Proposed, not made**: a rewrite of the homepage's or the pricing page's
  words left for the owner, with the reason a searcher would give for it.
- **Pages competing for one search**, and what was decided for each pair.
- **Links**: orphans and pages linked only from menus or their hub, guides
  and docs pages missing the cross link between them and each one left
  without it on purpose, vague labels, the links added and from where, and
  every redirect and old link a rename needed.
- **Indexing**: whether the `noindex` list was the expected one, any
  canonical that wasn't the page's own, and dates moved or put back.
- **Pictures**: alt text changed, cards redrawn with the test failure that
  called for it, orphan cards deleted, and that each redrawn card was looked
  at.
- **Structured data**: any field that didn't match its page, and the fix.
- **Handed on**: what `optimize` should weigh, and anything for
  `aeo-review`.
- **The owner's half** (§9), each item with why it's due now, and what `gh`,
  `dig` and the crawler loop printed.
- **Tests added**, each mutation-proved.

Say plainly where nothing was found. "Every changed page's title, links and
dates were already right" is a result, and the most common one.
