# Operations

Building this site, and putting it where people can read it.

## 1. The build is a static export

### 1.1 `output: "export"`, and what it costs

**Binding.** `next.config.mjs` emits plain HTML, CSS and JS into `out/`. No
server, no platform adapter.

That is what keeps this repository portable: the same artifact is what Netlify
publishes today and what an S3 bucket or a Vercel project would publish
instead, so choosing a host again later costs a `netlify.toml` rather than a
rewrite.

The cost is every Next.js feature that answers a request: a route handler
that reads one, middleware, ISR, and the built-in image optimizer. A
marketing page needs none of them.

**A route handler that reads no request isn't on that list.** A `GET` with
`dynamic = "force-static"` runs once, at build time, and its body is written
into `out/` as a file. Seven ship that way: the three blog feeds,
`docs/search-index.json`, `llms.txt`, and the two handlers that write a
Markdown copy beside every docs page and every guide. This section used to
list route handlers among the losses, which was true of the kind that needs a
server and false of the kind this site uses, and read that way it sends
somebody to write a file into `public/` by hand. 1.2 is how to add one.

**And about 170 KB gzipped of JavaScript**, which is Next and React
themselves. The homepage pays nearly all of it while containing no client
component at all. That is the honest price of the portability above, it is not
something this repository chose line by line, and `tests/budget.test.ts`
budgets just above it so that a change of _kind_ — a fourth island, a charting
library, an analytics tag — fails while the floor is not pretended away. If
page weight ever genuinely matters, the lever is the framework.
**The day one is genuinely wanted, the decision to revisit is the host, not the
export**: adding a server here quietly makes the site Netlify-shaped again.

`images.unoptimized` is required, and without it `next build` fails the moment
anything renders `next/image`.

_Checked by:_ `tests/export-shape.test.ts`.

### 1.2 Metadata routes and route handlers need `force-static`

**Binding.** Ten files declare `export const dynamic = "force-static"`:
`sitemap.ts`, `robots.ts` and `manifest.ts`, which Next builds as route
handlers, and every `route.ts` under `src/app/`. A static export has to be
told each one will never revalidate.

Without it the build fails on the file rather than silently omitting it, which
is the right failure and an opaque message. Worth knowing before you spend
twenty minutes on it.

**What a handler loses is its headers.** The file is served by the host, not
by the handler, so a `Content-Type` set on the response describes the build
and nothing else. Netlify picks the type from the extension.

**Guidance: a file beside every page of a section.** The Markdown copies are
the example (`content.md` 5.15), and another one takes five things:

1. A folder named for the file, under the dynamic segment.
   `src/app/docs/[slug]/index.md/route.ts:11` writes
   `out/docs/<slug>/index.md`.
2. The handler exports `GET`, its own `generateStaticParams`, and
   `dynamicParams = false`. A page and a handler beside it are two routes,
   and the page's list of params doesn't reach the handler.
3. Its content type pinned in `netlify.toml` by exact pattern, because of the
   headers above, with `noindex` in the same block if the file repeats a page
   (2.3).
4. An allowance in `tests/budget.test.ts:96`, which refuses any stray `.md`
   or source file in `out/`, and a test that the file exists there, the way
   `tests/markdown.test.ts:22` reads every copy.
5. 1.4 applies. A section with no entries gives the handler no params, and
   the build fails.

The obvious alternative is a file in `public/`, written by hand or by a
script before the build. Either one is a second copy of what the collections
already know, and drift between a summary and its pages is the one real cost
of these files (`content.md` 5.15). A handler reads the same collections the
page beside it reads.

_Checked by:_ the build, which fails without `force-static`; for the files
themselves, `tests/markdown.test.ts`, `tests/feeds.test.ts` and
`tests/export-shape.test.ts`.

### 1.3 Every route is its own directory

**House.** `trailingSlash: true`, so every route emits `index.html`.

Any static host serves that shape without rewrite rules. That matters more than
it looks — see 2.

_Checked by:_ `tests/export-shape.test.ts`.

### 1.4 A dynamic route must generate at least one page

**Binding, by the platform.** Under `output: "export"`, a route whose
`generateStaticParams` returns an empty array fails the build.

That is not a footnote; it decides a design. `/blog/page/[page]` originally
generated pages two and up, leaving `/blog/` as the single canonical home for
page one — which is the tidier arrangement and returns nothing at all while
there are fewer posts than fit on one page.

So page one is generated too, and its canonical points at `/blog/`. The
alternative — lowering the posts-per-page until a second page exists — is
choosing the reader's experience to satisfy the build.

**The consequence to know about:** emptying `content/blog/` breaks the build,
because the tag and author routes derive their params from posts. That failure
names the route and is arguably correct — a site with a blog section and no
posts is a state worth noticing — but it will surprise somebody, so it is
written down here.

_Checked by:_ the build, and `tests/blog-features.test.ts` for the canonical.

## 2. `ads.txt`, and the money

### 2.1 No catch-all rewrite. Ever.

**Binding.** `netlify.toml` must not contain a `/*` rewrite.

`smpl.money/ads.txt` is what authorizes the advertising inventory running on
`app.smpl.money`. Google's own guidance is that a domain hosting an `ads.txt`
which does not list the seller's publisher id **stops being monetized**.

The reflex on a static host is `/* -> /index.html 200`. That turns every
unknown path — `/ads.txt` before it is written, `/ads.tx` after a typo — into a
200 of HTML, which is precisely the demonetizing state, and every symptom of it
is invisible: the file is served, the build is green, the ads render, the
revenue is zero.

`trailingSlash: true` already gives every route its own `index.html`, so a
fallback buys nothing here.

**This site shows no ads, and the file stays.** Google reads `ads.txt` from
the root domain, `app.smpl.money`'s root domain is this one, and so the file,
its content type and the absence of a fallback all serve the application's
revenue, and none of them looks it. Removing them as the leftovers of an ad
integration is the tidy-looking mistake `AGENTS.md` names.

**Guidance: a moved page gets a fixed-path 301.** A renamed page redirects
from its old directory with a splat, as the moved-page block in
`netlify.toml` does: `/docs/moving-to-your-own-copy/*` answers the old
address with or without its slash, and its Markdown copy too. A path that is
fixed up to the splat can't reach the root, so it can't reach `/ads.txt`. A
placeholder at the root, like `/:page`, can, and the check refuses it. In the
same change, grep `content/` and `src/content/` for the old slug and point
every link at the new one: the redirect is for links outside the repository,
and a link inside it that leans on the redirect is a hop every reader pays
for a fix that was one edit.

_Checked by:_ `tests/export-shape.test.ts`, which parses the redirect blocks
and refuses a rule only if it could match `/ads.txt` and answers with a 2xx
or a 3xx (`answersAdsTxt`, `tests/export-shape.test.ts:55`), with fixtures of
both kinds at `tests/export-shape.test.ts:176`. It reads `netlify.toml` a
line at a time with comments dropped, so a commented-out rule is not a rule.
It accepts both `[[redirects]]` spellings, reads `from` and `status` only
where they open a line, and counts a missing `status` as 301, which is
Netlify's own default. A `from` that is empty, missing or backslash-escaped
fails as unreadable rather than passing as harmless, and so does any other
line naming `redirects`, the inline `redirects = [...]` form included. A
`from` ending in a slash is read without it, so `/ads.txt/` is `/ads.txt`.
The same predicate reads a `_redirects` file, in `public/` and in `out/`,
because Netlify reads rules from there too.

### 2.2 The file names the publisher id, and nothing else

**Binding.** `public/ads.txt` holds exactly the DIRECT record for this
account's publisher id and the `ownerdomain` line, and the check names the id.

A missing `ads.txt` is ignored by Google and costs nothing. A well-formed one
that does not name the publisher id is the documented state that demonetizes
the domain. So the file arrived with the id, in one commit, and the check that
had asserted its absence was turned around in the same commit to assert its
contents.

**It is also how the domain is verified to the account**, by AdSense's
`ads.txt` method. Of the other two, the code snippet would put Google's
script on this origin, which `AGENTS.md` forbids, and the meta tag is a
second place to write the id.

**The id has two spellings, and this file holds the one the application
does not.** The dashboard and this file say `pub-…`; the application's
`ADSENSE_CLIENT_ID` says `ca-pub-…`. Nothing here reads that variable, so
the two agree only because whoever sets it matches this file.

**The content** is the DIRECT record and not a `subdomain=` referral:

```
google.com, pub-9953156598757474, DIRECT, f08c47fec0942fa0
ownerdomain=smpl.money
```

Google's page is explicit: a `subdomain=` line is needed _"only … if the
authorized seller or your publisher ID are different for the subdomain when
compared to the root domain."_ The application derives its own `ads.txt`
from its `ADSENSE_CLIENT_ID`, which names the same account as this file, so
the ids are identical and the root record already covers the subdomain.
Adding a referral would hand the whole authorization chain to a file the
application only serves while ads are configured. Re-read this before adding
a second seller, or a different id on the subdomain, which is the one case
where a referral becomes correct.

_Checked by:_ `tests/export-shape.test.ts`, which holds the file to those two
records exactly, with the id written in the test rather than read from the
file, and holds the built `out/ads.txt` to the same bytes.

### 2.3 The content type is pinned

**Binding.** A header block sets `text/plain` for `/ads.txt`.

The same is true of the two files written for readers that aren't browsers
(`content.md` 5.15): `/llms.txt` is `text/plain` and every `index.md` copy
is `text/markdown`, each with `X-Robots-Tag: noindex`, by exact pattern.
Netlify's guess at `.md` couldn't be checked without a deploy, and a looser
pattern would put `noindex` on the HTML pages beside the copies.

_Checked by:_ `tests/export-shape.test.ts`, which also holds that nothing
else is `noindex`.

### 2.4 Checking the live file

**Guidance.** The checks above read the artifact; these read what the host
serves, which can differ.

- `curl -si https://smpl.money/ads.txt` returns `200`, `text/plain` and
  2.2's two records.
- `curl -so /dev/null -w '%{http_code}\n' https://smpl.money/ads.tx` prints
  `404`. A `200` is the catch-all rewrite 2.1 is about, arriving from the
  host's settings rather than from `netlify.toml`.
- `curl -s https://app.smpl.money/ads.txt` names the same id. That file
  exists only while the application has ads configured, which is why nothing
  here may point at it.
- AdSense's **Sites** page says the file is found and authorized. A change
  takes Google days to a month to pick up, so a stale status the day after
  an edit is not yet a fault.

_Checked by:_ `human`.

## 3. Headers

### 3.1 The security headers a static page owes

**House.** `X-Content-Type-Options`, `Referrer-Policy`,
`Strict-Transport-Security`, `X-Frame-Options`, `Permissions-Policy`, and a
CSP.

**The Permissions-Policy denies the Topics API as well as the hardware.**
`browsing-topics=()` is how a page tells the browser not to hand an ad
network the reader's interests, and with no ad here allowing it answers a
question nobody on this origin asks. The privacy policy says this website
refuses it and the application does not, and `tests/legal.test.tsx` fails if
the header stops saying the same.

### 3.2 `script-src` carries `'unsafe-inline'`, and why that is tolerable here

**Contested, recorded.** Next.js emits its hydration payload as inline
`<script>` tags, and a static export has no request in which to mint a nonce.

What makes it tolerable is that this origin renders no user input and holds no
session: `form-action 'none'` and `frame-ancestors 'none'` are the directives
doing the real work, and they are absolute. There is nothing for injected
script to post anywhere, and nothing to frame this page inside.

**`connect-src 'self'` is absolute, and every other source with it.** The
policy names nothing but this origin: every source is `'self'`, `'none'`,
`'unsafe-inline'` or `data:`. So a script that did get injected would have
nowhere to send anything. A vendor script would need hosts admitted here,
and that is a decision `AGENTS.md` records first (`web.md` 6.5).

Removing it means either build-time hashing of Next's bootstrap or dropping
Next for this page. Both are real options and neither is worth it today.

_Checked by:_ `tests/export-shape.test.ts`, for `form-action 'none'` and
`frame-ancestors 'none'`, and in "lets the page reach nothing but its own
origin" for every source in the policy: it parses the policy into directives
rather than matching a substring, because a substring check passes over any
widening at all, and fails on a host, a bare scheme or a wildcard.
`tests/legal.test.tsx` holds the same header for the privacy policy's sake,
which says the website loads nothing from another origin.

## 4. Screenshots come from the application

**House.** This repository takes no screenshots. The application publishes
every screen of itself, in both themes, at `docs/product/screenshots/`, and
`sync-from-app` pulls the handful this site uses into `public/screenshots/`.

**It used to capture its own**, which meant cloning the application, seeding
a database and driving two dev servers from here. That worked and was wrong
in a way worth recording: a picture taken here, of whatever revision happened
to be checked out, was a picture nobody could reproduce — and the repository
that can actually run the application is the application's.

What this side owns is which shots ship and what they claim. The application
photographs every screen; this site ships the ones a page names, five on the
homepage (the dashboard, transactions, import, budgets and reports) and the
rest in the learn articles, because an unused screenshot is a file that goes
stale with nothing to notice, and `tests/learn.test.ts` fails on one nothing
names. `web.md` 5 governs them once
they are here, and **the alt text describes what the picture shows**, so a
refreshed screenshot means re-reading the alt text — the thing most likely
to be left behind.

One file, read from the ref the sync check resolves:

```sh
APP=thtmnisamnstr/simple-balance
REF=$(node scripts/check-app-sync.mjs --json | node -p 'JSON.parse(require("fs").readFileSync(0, "utf8")).ref')
curl -fsSL "https://raw.githubusercontent.com/$APP/$REF/docs/product/screenshots/dashboard-light.webp" \
  -o public/screenshots/dashboard-light.webp
```

`sync-from-app` §4 is the whole pull: every name `src/content/home.ts` or a
Markdown page uses, both themes, then the narrow copies and
`public/screenshots/CAPTURE.json`.

**The ref is resolved, not assumed, and not by whoever runs the command.**
Until 0.2.0 merged, `docs/product/` existed only on the release branch, and a
fetch against `main` returned 404 rather than something stale — which is the
right failure and an easy one to misread as "no screenshots". A release that
adds to the kit will do the same again.
`scripts/check-app-sync.mjs` resolves the ref itself: `main` once `main`
carries the kit, and the head of the open pull request into `main` that
carries it until then. The weekly workflow sets no ref, and the `curl` above
takes the one the script printed rather than naming its own. A `null` there
is either a kit published nowhere yet or a check that could not reach
GitHub, and `sync-from-app` §0 says how to tell them apart.

_Checked by:_ `tests/home-page.test.tsx` for alt text and dimensions;
`tests/budget.test.ts` for weight; `scripts/check-app-sync.mjs`, weekly, that
every original shipped here is byte for byte the one the kit publishes.
Whether a picture is any good, and whether its alt text still describes it,
is `human`.

## 5. Continuous integration

**House.** Two systems, and they do different jobs.

**Netlify is the gate.** Its build command is `npm run verify`, not
`npm run build` — so typecheck, lint, formatting and the whole test suite run
before anything is published, and a failing test fails the deploy. That
matters more than it sounds on a host with deploy previews: a preview that
renders a page whose tests fail is a preview somebody approves.

It builds a preview for every pull request and every push to one, and deploys
`main`. `SKIP_BROWSER_TESTS=1` is set there, and only there.

**So a branch is pushed once.** Every push to a pull request is a preview
build of `npm run verify` on the owner's Netlify credits, whether or not
anybody looks at the result. A branch is verified and looked at locally
first (`npm run verify`, then `npx serve out` in both themes and at both
widths), pushed once, and the changes a review asks for are batched into one
later push. The previews sit behind Netlify's login, so looking at one is
the owner's step: an agent reports the link and leaves the look to them. The
obvious alternative is to push and look at the preview, which is what
previews are for on most projects, and here it fails twice: an agent can't
open the preview, and every push costs a build.

**GitHub Actions runs what Netlify cannot.** `tests/a11y.test.ts` drives
Chromium, and this build image is not guaranteed to have the libraries it
needs — a deploy that fails because a browser would not install is a deploy
that failed for a reason unrelated to the change. So the accessibility suite
runs in Actions, which installs Chromium, alongside an internal link check
that reads every link in the build, page and file, and the heading after a
`#` (`content.md` 2.3).

The skip is an explicit named variable rather than "skip if Chromium is
missing", because the second form is indistinguishable from a machine where
Chromium silently stopped installing, and a suite that quietly stops checking
contrast is worse than one that fails.

**The weekly sync reports into one issue.** `.github/workflows/app-sync.yml`
runs `scripts/check-app-sync.mjs` and keeps a single open issue titled "The
site is out of step with the application": it edits the open one, takes over
one still open under the old title, "The application has changed", and
reopens the latest closed one rather than opening a second. Both titles live
once each, in the check job's own `env:` block, because a title spelled
twice is two titles the moment one is edited. `tests/app-sync.test.ts` holds
that, and runs the issue step against a stand-in `gh` for each case.

**Turn on branch protection** requiring the `verify` check, or Actions reports
a failure that nothing acts on.

Node comes from `.nvmrc` via `node-version-file` in Actions and from
`NODE_VERSION` in `netlify.toml`, and both say 24 — one number, three
consumers, and `update-dependencies` moves them together.

Chromium only, in Actions: the WCAG rules axe checks do not vary by engine,
and three browsers would triple the run for nothing.

**The link check is internal only.** An external link checker fails when
somebody else's site is down, which trains people to ignore a red build.
External rot is real and is a periodic job, not a merge gate.

## 6. Dependencies

### 6.1 Everything is on its latest release

**House.** `npm outdated` is empty and `npm audit` finds nothing, and the
`update-dependencies` skill is how both are kept that way.

### 6.2 Every pre-1.0 dependency is named, with its fallback

**Contested, recorded.** Three are `0.x`, and only one of them ships.

**`rehype-pretty-code` — runtime.** The standard Shiki integration for MDX,
widely used, and a `0.x` version makes no compatibility promise. Its output is
in every docs page, so a change in behavior is a change a reader sees. The
fallback is Shiki directly, which is already a dependency here, so the
exposure is a few hours of work rather than a rewrite.

**`sharp` — dev-only.** Draws `public/og.png`, the page cards and the post
covers in `scripts/build-images.mjs`. Its output is committed, so it runs on a
developer's machine and never on Netlify: a break stops new images being
drawn, it does not stop a deploy. The fallback is any rasterizer that reads
SVG, and the drawings are SVG source in that one file.

**`@xmldom/xmldom` — dev-only.** `tests/feeds.test.ts` parses the feeds with
it rather than matching substrings, because an unescaped ampersand in a title
is the classic break and a substring check sails straight past it. A break
fails the suite loudly, which is the cheapest failure mode on this list.

**This section said "one" for a while and there were three.** Two arrived
without anybody re-reading the rule that counts them, which is why the count
is now checked rather than written down.

_Checked by:_ `tests/repo-references.test.ts` — every `0.x` dependency in
`package.json` is named in this section.

### 6.3 Node is pinned to the LTS Netlify supports

**House.** `24`, in both `.nvmrc` and `netlify.toml`.

Netlify supports 22, 24 and 26. Node 26 is Current and becomes LTS in October
2026; a marketing site is not where a pre-LTS runtime earns its risk. The two
files carry the same number so a developer using nvm builds on what Netlify
builds on.

`sharp` and `playwright` are native and dev-only, and neither runs on
Netlify: `sharp` draws the images a developer commits, and the browser suite
is skipped there by `SKIP_BROWSER_TESTS` and run on GitHub Actions instead.
So the usual native-module-across-Node-versions hazard does not reach the
build.

They used to be described as "used by the screenshot script". That script is
gone — the application publishes its own screenshots now (§4), and `sharp`
outlived it.

### 6.4 An override is a patch somebody upstream hasn't shipped yet

**House.** `package.json` carries one, and each one says when it can go.

**`serve` → `compression` `^1.8.2`.** `serve`, which `npx serve out` uses to
look at the built site, pins `compression` at exactly 1.8.1, which has a
denial-of-service advisory (GHSA-vc2v-76pw-4v95) fixed in the 1.8.2 patch.
`npm audit fix --force` offered to "fix" it by moving `serve` back to 10.0.2,
four majors and several years old, which trades a dev server's advisory for
a dev server nobody maintains. The override takes the patch instead. It is
dev-only and never runs on Netlify.

**Remove it** when `serve` releases a version whose own range admits 1.8.2 or
later: delete the `overrides` block, `npm install`, and `npm audit` should
still say nothing.

## 7. What the build emits besides pages

### 7.1 A social card, built rather than rendered

**House.** `scripts/build-images.mjs` draws four things: `public/og.png`, a
card per page in `public/og/` for the pricing page, both indexes and every
guide and docs page (`content.md` 5.16), a cover per post in both themes, and
a 1200px copy of every screenshot. Next's
`ImageResponse` renders per request, which is a server — the thing
`output: "export"` exists to avoid.

It reads both palettes out of `brand.css` rather than carrying its own copy of
them, so a token that changes in the contract changes the drawings on the next
run and a token that is renamed fails loudly. The output is committed, which
is why `sharp` never runs on Netlify (6.3).

The screenshot copies are the one thing here it does not draw — it resizes
what the application published, and `web.md` 5.2 has the measurements.

A link to this site without one renders a blank rectangle, which on a
marketing page is the one picture guaranteed to be seen.

**Run it after adding, retitling, renaming or removing a page.** The cards
are drawn from each page's title and committed, and the record it writes
beside the screenshot hashes names the title each card was drawn from, so a
page retitled without running it fails the build instead of previewing under
its old name.

**It never deletes a card, and the record can't tell.** The script writes a
card per page and then rewrites its record whole
(`scripts/build-images.mjs:410`–`445`), so a page removed or renamed leaves
its old card in `public/og/`, the record stops naming it, and the check that
the record matches the pages passes while the orphan PNG ships. Delete it by
hand, in the same commit.

**`public/og.png` is held to its words by the record.** It draws the hero's
title, the tagline and one price line naming the free plan and the yearly
price (`scripts/build-images.mjs:114`), each read when the script runs, the
price from `app-facts.json`. Reading them keeps a run from drawing a stale
price; it doesn't make anybody run it. So the script records the three under
`site`, with a hash of the file it drew them into, and
`tests/export-shape.test.ts` holds that record to `home.ts`, to the
contract's yearly price and to the committed file. It was held to nothing
until late October 2026, and a homepage rewritten four times went on
previewing a tagline that appeared nowhere. The colors aren't recorded, so a
change to `brand.css` or to the script still needs a run and a look.

A card's title wraps at 27 characters, and a fourth line throws, naming the
title (`scripts/build-images.mjs:336`).

_Checked by:_ `human` that it looks right, which for `public/og.png` is
everything but its words and for a cover is everything but its presence;
`tests/budget.test.ts` that it is not oversized;
`tests/blog-features.test.ts` that every post's cover ships in both themes
at its declared size; `tests/export-shape.test.ts` that every page's
`og:image` is its own card, at 1200 by 630, drawn from its current title,
and that `public/og.png` was drawn from the current hero, tagline and yearly
price. That test reads the record, not `public/og/`, which is why an orphan
card is a hand job.

### 7.2 Icons and a manifest

**House.** `favicon.svg` and `apple-touch-icon.png` are byte-identical copies
of the application's, so the two surfaces carry one mark. A 48px PNG sits
beside the SVG for clients that will not take one, and `manifest.ts` supplies
the name and icon for a home-screen shortcut.

The `.ico` container is deliberately absent: it exists for browsers this site
does not otherwise support.

### 7.3 The sitemap is a list, and a test holds it to the build

**Binding.** `src/app/sitemap.ts` is maintained by hand, so a page added
without touching it is a page nothing is told about — and nothing else would
notice, because the page works perfectly.

`tests/sitemap.test.ts` compares it against the routes the export actually
emitted, in both directions: nothing missing, and nothing listed that does not
exist. The error page is the named exception.

**Every URL carries a `lastmod`.** Google uses the dates only from a sitemap
whose dates are consistently accurate, and this one dated the guides and docs
and left the pages above them blank. The homepage and the pricing page date
from `homeUpdated` and `pricingUpdated` beside their copy, the legal pages
from `legalUpdated`, and an index from its newest page, so **change the date
when you change the words**. The test refuses a missing date and one before
the site's first commit or after today. A date bumped on an unchanged page
passes it, so `seo-review` reads a branch's dates against what moved.

**Guidance, for a known gap.** The blog's archive and its tag, author and
page-two-onward indexes are listed with no date (`src/app/sitemap.ts:75`).
Nobody sees it while the blog is unannounced, because the sitemap lists
nothing under it, and announcing it will fail `tests/sitemap.test.ts:104`
once for each of them, correctly. Date each one from its newest post in the
commit that flips the flag, the way a section's index is dated above. The
obvious alternative, excusing secondary indexes in the test, would bring
back the inconsistent sitemap whose dates Google ignores.

**`robots.txt` admits every crawler, AI ones included.** Every answer engine
answers from a search index, and an assistant can only cite a page its
crawler was allowed to fetch; a training crawler is the only way a model
learns the product's name without searching. One `User-agent: *` group, and
`tests/sections.test.tsx` fails on a second, which is how a per-bot block
would arrive.

### 7.4 A weight budget, on transferred bytes

**House.** `tests/budget.test.ts` measures gzipped size, because that is what
crosses the network; raw bytes overstate text threefold and would make every
number a fact about disk.

The budgets sit just above what the site currently meets, so the check fails
on a change of _kind_ — a fourth island, a charting library, an analytics tag
— rather than on a change of degree. About 170 KB of the JavaScript is Next
and React themselves (1.1), and pretending that floor away would make the
budget a lie.

Deliberately **not** a Lighthouse run: it measures a network and a CPU that
are not the same twice, and a flaky performance gate is one people learn to
re-run rather than read.

### 7.5 The image script runs outside the gate

**House.** Nothing checks `scripts/build-images.mjs` but formatting.
`npm run verify` never runs it, `npm run lint` reads `src` and `tests`, and
typecheck reads `.ts` and `.tsx` with `allowJs` off. So a change elsewhere can
break it with every gate green, and the break surfaces the next time somebody
runs it, which is usually right after retitling a page, when the card is the
thing they need.

Two couplings reach it from other files:

1. **It imports `src/content/sections.ts` directly**
   (`scripts/build-images.mjs:23`), and Node runs that import with its own
   type stripping rather than through Next. So `sections.ts` imports nothing
   through `@/`, which Node can't resolve, and uses only syntax that strips:
   no `enum`, no `namespace`. And Node has to strip by default. `.nvmrc`'s 24
   does, while the `engines` field's `>=22` admits early 22 releases that
   need a flag.
2. **It reads `src/content/home.ts` and `src/content/pricing.ts` as text, by
   regex**, taking the first two-space-indented key of each name
   (`scripts/build-images.mjs:71`–`76` and
   `scripts/build-images.mjs:380`–`382`).
   Moving an object with a `title:` of its own above the hero changes what
   the site card says, and only the record's check in
   `tests/export-shape.test.ts` notices, after a run has drawn it. When it
   throws that a file "has no" title, check the regex before the copy: the
   words are usually still there, at another indent or in another kind of
   quote.

The obvious alternative is to run it in `npm run verify`. Its output is
committed so that a person looks at a drawing before it ships, and in the
gate it would redraw pictures nobody had seen. It would also put `sharp` on
the deploy path, where a break in it stops a deploy instead of a drawing
(6.2). Knowing the two couplings costs less than either.

_Checked by:_ `human`, by running `npm run build:images` after a change to
`sections.ts`, the hero, the pricing title or the Node version.

## 8. Settings that live in a dashboard

**Recorded here because a rule whose violation arrives from outside the
repository needs somewhere to live that is not a test.** None of these can be
set from this tree, and each is a launch step. The search rows are the
owner's half of `seo-review` and `aeo-review`, which name any not yet done.

| Where                                     | Setting                                                                                              | Why                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Netlify → Project configuration → General | **Powered by Netlify badge: off**                                                                    | On by default for free projects created on or after 19 August 2026. It is third-party branding on the page, which `web.md` 6.5 forbids from this repository and cannot forbid from the host.                                                                                                               |
| Netlify → Project configuration → Build   | Build command is `npm run verify`                                                                    | Set from `netlify.toml`, but confirm it took. A deploy that only ran `next build` is a deploy with no gate.                                                                                                                                                                                                |
| Netlify → Deploy previews                 | On                                                                                                   | The preview is the owner's look at a change on the host that will serve it, before it ships (5).                                                                                                                                                                                                           |
| GitHub → Branch protection                | Require the `verify` check                                                                           | Otherwise Actions reports a failure nothing acts on.                                                                                                                                                                                                                                                       |
| Google Search Console                     | A domain property for `smpl.money`, verified by DNS, with `https://smpl.money/sitemap.xml` submitted | Google uses a sitemap it was told about, reports what it couldn't index and why, and is where a page dropped from the index is found. Google's AI Overviews and AI Mode answer from the same index.                                                                                                        |
| Bing Webmaster Tools                      | The site imported from Search Console, sitemap included                                              | Bing's index feeds Copilot and much of ChatGPT's search; a site Bing hasn't crawled is one neither can cite. IndexNow, which tells Bing a page changed, is a later step that needs a key file and a script, not a setting.                                                                                 |
| GitHub → the application's repository     | **Website**: `https://smpl.money`                                                                    | The repository is the page most linked to; its website field is the link back.                                                                                                                                                                                                                             |
| AdSense → Privacy and messaging           | A European regulations message, and a US state regulations message, published for `app.smpl.money`   | The ads are the application's, and so is this setting; it is here because the privacy policy this site publishes says Google's message asks before an advertising cookie in the EEA, the UK and Switzerland, and offers US readers an opt-out. Unpublish either and that page is wrong. `legal-review` §3. |

The account's other settings, Auto ads among them, are the application's
alone, and its own `docs/monetization.md`, in
`https://github.com/thtmnisamnstr/simple-balance`, is where they are listed.

## 9. DNS

The apex serves this site; `app.` serves the application, from different
infrastructure.

| Name         | Type      | Value                                        | Proxied |
| ------------ | --------- | -------------------------------------------- | ------- |
| `smpl.money` | A / ALIAS | Netlify's apex address, or their nameservers | n/a     |
| `www`        | CNAME     | the Netlify site, redirected to the apex     | n/a     |
| `app`        | A         | the application's host                       | **no**  |

Two that cost a day if they are wrong:

- **DNSSEC.** Moving nameservers with DNSSEC still enabled at the registrar
  takes the whole domain NXDOMAIN for validating resolvers — `app.` included.
  Disable it, move, then re-enable with the new DS record.
- **CAA.** A CAA record at the apex governs issuance for `app.smpl.money` too.
  If the application terminates TLS with Let's Encrypt, a CAA naming only
  Netlify's CA breaks its renewal with no symptom but a retry loop. Publish
  none, or name both.

## 10. What is checked, and what is not

| Rule                        | Held by                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1, 1.3 Export shape       | `tests/export-shape.test.ts`                                                                                                                         |
| 2.1 No catch-all rewrite    | `tests/export-shape.test.ts`                                                                                                                         |
| 2.2 `ads.txt` names the id  | `tests/export-shape.test.ts`                                                                                                                         |
| 2.3 Content types           | `tests/export-shape.test.ts`, for `ads.txt`, the Markdown copies and `/llms.txt`                                                                     |
| 3.1 Headers                 | `tests/export-shape.test.ts`                                                                                                                         |
| 3.1 The Topics API denied   | `tests/legal.test.tsx`, which holds the header to the privacy policy's sentence                                                                      |
| 3.2 The CSP's own sources   | `tests/export-shape.test.ts`, every source in every directive                                                                                        |
| 6.2 Every pre-1.0 dep named | `tests/repo-references.test.ts`                                                                                                                      |
| 7.1 Page cards              | `tests/export-shape.test.ts`, against the record, `public/og.png`'s words included; how a card looks, an orphan card and what a cover shows, `human` |
| 7.3 Sitemap                 | `tests/sitemap.test.ts`, and `tests/sections.test.tsx` for the single robots group                                                                   |
| 7.4 Weight budget           | `tests/budget.test.ts`                                                                                                                               |
| 7.5 The image script        | `human`, by running it                                                                                                                               |
| 1.2 `force-static`          | the build, which fails without it; each file beside a page, its own test                                                                             |
| 4 Screenshot provenance     | `scripts/check-app-sync.mjs`, weekly, byte for byte against the kit; whether a picture is any good, `human`                                          |
| 5 Continuous integration    | `human` — the workflows are the record                                                                                                               |
| 6.1, 6.3 Latest, and Node   | `human`, and the `update-dependencies` skill                                                                                                         |
| 9 DNS                       | `human`. Nothing in this repository can see DNS                                                                                                      |
