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

The cost is every server-only Next.js feature — route handlers, middleware,
ISR, and the built-in image optimizer. A marketing page needs none of them.

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

### 1.2 Metadata routes need `force-static`

**Binding.** `sitemap.ts` and `robots.ts` are route handlers, and a static
export has to be told they will never revalidate.

Without it the build fails on the file rather than silently omitting it, which
is the right failure and an opaque message. Worth knowing before you spend
twenty minutes on it.

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

_Checked by:_ `tests/export-shape.test.ts`, which parses the redirect blocks
and allows only a host-level 301. It reads `netlify.toml` a line at a time
with comments dropped, so a commented-out rule is not a rule. It accepts both
`[[redirects]]` spellings, reads `from` and `status` only where they open a
line, and counts a missing `status` as 301, which is Netlify's own default. A
`from` that is empty, missing or backslash-escaped fails as unreadable rather
than passing as harmless, and so does any other line naming `redirects`, the
inline `redirects = [...]` form included. A `from` ending in a slash is read
without it, so `/ads.txt/` is `/ads.txt`. The same predicate reads a
`_redirects` file, in `public/` and in `out/`, because Netlify reads rules
from there too.

### 2.2 The file is absent until there is a publisher id

**Binding.** `public/ads.txt` does not exist yet, and its absence is checked.

A missing `ads.txt` is ignored by Google and costs nothing. A well-formed one
that does not name the publisher id is the documented state that demonetizes
the domain. So the file arrives with the id, in one commit, and this
expectation is inverted in the same commit.

**The id comes early.** AdSense shows it as soon as the account exists, before
review, and this file is how the site is verified for that review, so it lands
before the review request rather than after approval. `docs/adsense.md` §3 has
the order.

**The content, when it exists**, is the DIRECT record and not a `subdomain=`
referral:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
ownerdomain=smpl.money
```

Google's page is explicit: a `subdomain=` line is needed _"only … if the
authorized seller or your publisher ID are different for the subdomain when
compared to the root domain."_ The app derives its `ads.txt` from the same
`ADSENSE_CLIENT_ID`, so the ids are identical and the root record already
covers the subdomain. Adding a referral would hand the whole authorization
chain to a file the app only serves while ads are configured.

_Checked by:_ `tests/export-shape.test.ts`.

### 2.3 The content type is pinned

**Binding.** A header block sets `text/plain` for `/ads.txt`.

_Checked by:_ `tests/export-shape.test.ts`.

## 3. Headers

### 3.1 The security headers a static page owes

**House.** `X-Content-Type-Options`, `Referrer-Policy`,
`Strict-Transport-Security`, `X-Frame-Options`, `Permissions-Policy`, and a
CSP.

### 3.2 `script-src` carries `'unsafe-inline'`, and why that is tolerable here

**Contested, recorded.** Next.js emits its hydration payload as inline
`<script>` tags, and a static export has no request in which to mint a nonce.

What makes it tolerable is that this origin renders no user input, holds no
session, and talks to nothing: `connect-src 'self'` and `form-action 'none'`
are the directives doing the real work, and they are absolute.

Removing it means either build-time hashing of Next's bootstrap or dropping
Next for this page. Both are real options and neither is worth it today.

_Checked by:_ `tests/export-shape.test.ts` asserts the two directives that
carry the argument.

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
photographs all thirteen screens; this site uses six — dashboard, reports,
payees, import, transactions and budgets — because an unused screenshot is a
file that goes stale with nothing to notice. `web.md` 5 governs them once
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

`sync-from-app` §4 is the whole pull: every name `src/content/home.ts` uses,
both themes, then the narrow copies and `public/screenshots/CAPTURE.json`.

**The ref is resolved, not assumed, and not by whoever runs the command.**
Until 0.2.0 merges, `docs/product/` exists only on the release branch, and a
fetch against `main` returns 404 rather than something stale — which is the
right failure and an easy one to misread as "no screenshots".
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

**GitHub Actions runs what Netlify cannot.** `tests/a11y.test.ts` drives
Chromium, and this build image is not guaranteed to have the libraries it
needs — a deploy that fails because a browser would not install is a deploy
that failed for a reason unrelated to the change. So the accessibility suite
runs in Actions, which installs Chromium, alongside an internal link check.

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

**House.** `npm outdated` is empty, and the `update-dependencies` skill is how
it is kept that way.

### 6.2 Every pre-1.0 dependency is named, with its fallback

**Contested, recorded.** Three are `0.x`, and only one of them ships.

**`rehype-pretty-code` — runtime.** The standard Shiki integration for MDX,
widely used, and a `0.x` version makes no compatibility promise. Its output is
in every docs page, so a change in behavior is a change a reader sees. The
fallback is Shiki directly, which is already a dependency here, so the
exposure is a few hours of work rather than a rewrite.

**`sharp` — dev-only.** Draws `public/og.png` and the post covers in
`scripts/build-images.mjs`. Its output is committed, so it runs on a
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

## 7. What the build emits besides pages

### 7.1 A social card, built rather than rendered

**House.** `scripts/build-images.mjs` draws three things: `public/og.png`, a
cover per post in both themes, and a 1200px copy of every screenshot. Next's
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

_Checked by:_ `human` that it looks right; `tests/budget.test.ts` that it is
not oversized.

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

## 8. Settings that live in a dashboard

**Recorded here because a rule whose violation arrives from outside the
repository needs somewhere to live that is not a test.** None of these can be
set from this tree, and each is a launch step.

| Where                                     | Setting                           | Why                                                                                                                                                                                          |
| ----------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Netlify → Project configuration → General | **Powered by Netlify badge: off** | On by default for free projects created on or after 19 August 2026. It is third-party branding on the page, which `web.md` 6.5 forbids from this repository and cannot forbid from the host. |
| Netlify → Project configuration → Build   | Build command is `npm run verify` | Set from `netlify.toml`, but confirm it took. A deploy that only ran `next build` is a deploy with no gate.                                                                                  |
| Netlify → Deploy previews                 | On                                | The preview is the only place anybody looks at a change before it ships.                                                                                                                     |
| GitHub → Branch protection                | Require the `verify` check        | Otherwise Actions reports a failure nothing acts on.                                                                                                                                         |
| AdSense → Privacy and messaging           | A European regulations message    | Required before ads may serve to the EEA, the UK or Switzerland, and published before any ad setting goes on the application. `docs/adsense.md` §3 step 7 and §5.                            |
| AdSense → account                         | Auto ads **off**                  | An account setting no code can override, injecting formats the application promises not to show.                                                                                             |

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

| Rule                        | Held by                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1.1, 1.3 Export shape       | `tests/export-shape.test.ts`                                                                                |
| 2.1 No catch-all rewrite    | `tests/export-shape.test.ts`                                                                                |
| 2.2 No premature `ads.txt`  | `tests/export-shape.test.ts`                                                                                |
| 2.3 Content type            | `tests/export-shape.test.ts`                                                                                |
| 3.1, 3.2 Headers            | `tests/export-shape.test.ts`                                                                                |
| 6.2 Every pre-1.0 dep named | `tests/repo-references.test.ts`                                                                             |
| 7.4 Weight budget           | `tests/budget.test.ts`                                                                                      |
| 1.2 `force-static`          | the build, which fails without it                                                                           |
| 4 Screenshot provenance     | `scripts/check-app-sync.mjs`, weekly, byte for byte against the kit; whether a picture is any good, `human` |
| 5 Continuous integration    | `human` — the workflows are the record                                                                      |
| 6.1, 6.3 Latest, and Node   | `human`, and the `update-dependencies` skill                                                                |
| 9 DNS                       | `human`. Nothing in this repository can see DNS                                                             |
