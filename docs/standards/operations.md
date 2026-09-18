# Operations

Building this site, and putting it where people can read it.

## 1. The build is a static export

### 1.1 `output: "export"`, and what it costs

**Binding.** `next.config.mjs` emits plain HTML, CSS and JS into `out/`. No
server, no platform adapter.

That is what keeps this repository portable: the same artefact is what Netlify
publishes today and what an S3 bucket or a Vercel project would publish
instead, so choosing a host again later costs a `netlify.toml` rather than a
rewrite.

The cost is every server-only Next.js feature — route handlers, middleware,
ISR, and the built-in image optimiser. A marketing page needs none of them.
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

`smpl.money/ads.txt` is what authorises the advertising inventory running on
`app.smpl.money`. Google's own guidance is that a domain hosting an `ads.txt`
which does not list the seller's publisher id **stops being monetised**.

The reflex on a static host is `/* -> /index.html 200`. That turns every
unknown path — `/ads.txt` before it is written, `/ads.tx` after a typo — into a
200 of HTML, which is precisely the demonetising state, and every symptom of it
is invisible: the file is served, the build is green, the ads render, the
revenue is zero.

`trailingSlash: true` already gives every route its own `index.html`, so a
fallback buys nothing here.

_Checked by:_ `tests/export-shape.test.ts`, which parses the redirect blocks
and allows only a host-level 301.

### 2.2 The file is absent until there is a publisher id

**Binding.** `public/ads.txt` does not exist yet, and its absence is checked.

A missing `ads.txt` is ignored by Google and costs nothing. A well-formed one
that does not name the publisher id is the documented state that demonetises
the domain. So the file arrives with the id, in one commit, and this
expectation is inverted in the same commit.

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
covers the subdomain. Adding a referral would hand the whole authorisation
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

## 4. Screenshots

**House.** `scripts/capture-screenshots.mjs` drives a real instance with
Playwright and writes WebP at 1600px into `public/screenshots/`.

It is not in `npm run verify`, deliberately: it needs a checkout of the
application, a throwaway PostgreSQL, the API on :3000 and Vite on :5173, and
the better part of a minute. Run it when the application's look changes, not on
every commit.

The runbook:

```sh
# 1. a throwaway database — NOT the development one
docker run -d --name sb-shots-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres -e POSTGRES_DB=sb_shots -p 55432:5432 postgres:18-alpine

# 2. the application, from its own checkout
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55432/sb_shots \
APP_BASE_URL=http://localhost:5173 PORT=3000 AUTH_MODE=local ALLOWED_EMAILS='*' \
AUTH_SECRET=screenshot-capture-secret-long-enough-for-the-validator-01 \
RECURRENCE_SCHEDULER=false npx tsx src/server/index.ts &
npx vite --port 5173 --strictPort &

# 3. capture
node scripts/capture-screenshots.mjs
```

The seed is idempotent — it looks up accounts and categories by name before
creating them, and the transaction idempotency keys are stable — so a
half-finished capture resumes rather than colliding with itself.

**Why the current month.** Every page in the application defaults to a
this-month range. A ledger seeded evenly across ninety days renders a dashboard
reporting almost nothing, which is what the first capture produced.

## 5. Continuous integration

**House.** `.github/workflows/verify.yml` runs `npm run verify` on every push
and pull request, plus an internal link check as a second job.

Node comes from `.nvmrc` via `node-version-file`, so CI, Netlify and a
developer using nvm cannot drift apart — one number, three consumers.

Chromium is installed because `tests/a11y.test.ts` drives a real browser.
Chromium only: the WCAG rules it checks do not vary by engine, and three
browsers would triple the run for nothing.

**The link check is internal only.** An external link checker fails when
somebody else's site is down, which trains people to ignore a red build.
External rot is real and is a periodic job, not a merge gate.

**Netlify builds separately from this.** CI proves the build is sound; Netlify
produces the deploy. Neither gates the other, which means a green CI run is not
a deployed site — check the Netlify dashboard for that.

## 6. Dependencies

### 6.1 Everything is on its latest release

**House.** `npm outdated` is empty, and the `update-dependencies` skill is how
it is kept that way.

### 6.2 One dependency is pre-1.0, and it is named

**Contested, recorded.** `rehype-pretty-code` is `0.x`.

It is the standard Shiki integration for MDX and is widely used, but a `0.x`
version makes no compatibility promise. The fallback if it breaks is Shiki
directly, which is a dependency this already has — so the exposure is a few
hours of work, not a rewrite.

Every other dependency is at a stable major.

### 6.3 Node is pinned to the LTS Netlify supports

**House.** `24`, in both `.nvmrc` and `netlify.toml`.

Netlify supports 22, 24 and 26. Node 26 is Current and becomes LTS in October
2026; a marketing site is not where a pre-LTS runtime earns its risk. The two
files carry the same number so a developer using nvm builds on what Netlify
builds on.

`sharp` and `playwright` are native and dev-only — they are used by the
screenshot script, which never runs on Netlify — so the usual
native-module-across-Node-versions hazard does not reach the build.

## 7. DNS

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

## 8. What is checked, and what is not

| Rule                          | Held by                                         |
| ----------------------------- | ----------------------------------------------- |
| 1.1, 1.3 Export shape         | `tests/export-shape.test.ts`                    |
| 2.1 No catch-all rewrite      | `tests/export-shape.test.ts`                    |
| 2.2 No premature `ads.txt`    | `tests/export-shape.test.ts`                    |
| 2.3 Content type              | `tests/export-shape.test.ts`                    |
| 3.1, 3.2 Headers              | `tests/export-shape.test.ts`                    |
| 1.2 `force-static`            | the build, which fails without it               |
| 4 Screenshot provenance       | `human`                                         |
| 5.1–5.3 Dependencies and Node | `human`, and the `update-dependencies` skill    |
| 6 DNS                         | `human`. Nothing in this repository can see DNS |
