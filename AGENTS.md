# Simple Balance website agent guide

The marketing site at **smpl.money**. The application it advertises is a
separate, public repository, served from **app.smpl.money**.

|                 | Repository                                            | Served at        |
| --------------- | ----------------------------------------------------- | ---------------- |
| This site       | `https://github.com/thtmnisamnstr/simple-balance-web` | `smpl.money`     |
| The application | `https://github.com/thtmnisamnstr/simple-balance`     | `app.smpl.money` |

**Read the application over the network, by URL — never from a folder beside
this one.** A local checkout is whatever state it was left in, and checking a
claim against a stale working tree is worse than not checking, because it
comes with confidence. `app-alignment` does it properly, including resolving
which ref actually holds the release this site advertises: unreleased work
sits on a branch, and today the plans, prices and advertising this site
describes are **not on the application's default branch**.

The one exception is `capture-screenshots`, which has to _run_ the
application and so needs it cloned.

## Architecture boundaries

- This is a **static export**. `next.config.mjs` emits plain HTML into `out/`
  with no server and no platform adapter, and that portability is the point:
  the same artefact is what Netlify publishes and what any other static host
  would. Do not add a route handler, middleware, or anything else that needs a
  running server without changing that decision deliberately —
  `docs/standards/operations.md` 1.1.
- **Colour comes from `src/styles/brand.css` and nowhere else.** That file is
  copied from the application's stylesheet and is the one thing shared across
  the two repositories.
- Copy lives in `src/content/`, not in markup, so it can be read by a test.
- Long-form content is Markdown under `content/`, read at build time.

## Non-negotiable invariants

Break one of these and the site is wrong rather than untidy.

- **Never add a catch-all rewrite.** `smpl.money/ads.txt` authorises the
  advertising inventory running on app.smpl.money. A `/* -> /index.html 200`
  rule turns every unknown path into a 200 of HTML, and Google reads an
  `ads.txt` that does not name the publisher id as an instruction to stop
  monetising the domain. Every symptom is invisible: the file is served, the
  build is green, the ads render, the revenue is zero.
- **No `ads.txt` until there is a publisher id to put in it.** A missing file
  is ignored and costs nothing; a well-formed one that does not name the id is
  the documented demonetising state. It arrives with the id, in one commit.
- **The root `ads.txt` carries the DIRECT record, not a `subdomain=`
  referral.** Google requires a referral only when the publisher id differs
  between root and subdomain, and here it does not — both derive from one
  `ADSENSE_CLIENT_ID`. A referral would hand the authorisation chain to a file
  the application only serves while ads are configured.
- **A colour outside `brand.css` cannot re-theme.** A literal looks right in
  light mode and broken in dark, which is the mode nobody checks.
- **`announced` decides three things at once** — the link, the `noindex`, and
  the sitemap. A section half-launched by somebody adding a link is the failure
  the single flag prevents.
- **Crawling is allowed everywhere; indexing is controlled per page.**
  `Disallow` on an unannounced section is the reflex and is exactly wrong: a
  crawler that cannot fetch the page never sees the `noindex`.
- **Every price and limit on the pricing page is what the application
  enforces**, and `tests/app-facts.test.ts` proves it. The application
  publishes `docs/product-facts.json`; `src/content/app-facts.json` is a
  snapshot of it with the commit it came from. **Never refresh that snapshot
  to make a test pass** — it is the external referent, and moving it to match
  the site turns the check green while leaving the page wrong. Fix the page,
  then refresh. Whether the contract itself has moved is `app-alignment` §0,
  a one-line diff.
- **The paid tier is "Premium" to a reader and `plus` on the wire**, in both
  repositories. Two surfaces using different words at a customer is the
  failure to avoid; renaming the wire value would break clients, renaming the
  label would not.
- **The privacy policy names the real processors and carries the three
  AdSense disclosures** — third-party cookies, the vendors that set them, and
  how to opt out. A generic policy is a false statement about somebody's data,
  and a missing disclosure is a breach whose penalty is suspension.
- **No third-party branding.** No vendor logo, badge or "powered by" mark, and
  no script or image from a vendor's domain. The privacy policy naming the
  hosting provider and the payment processor is the one exception, and it is
  the opposite of branding. A host can inject its own badge into the response,
  which no test here can see — `operations.md` 8 carries those as launch steps.
- **Every claim on this site is true of the shipped application.** Nothing here
  can check that, because the application is a different repository. It is the
  rule that most needs a person.
- **Screenshots are captured from a real running instance**, never mocked up,
  and the page discloses that the ledger in them is seeded demo data.
- **A client component is an island and earns its place.** Three exist, all
  under `src/components/client/`, each because the behaviour is impossible on
  the server. The page must be correct before any of them hydrates.
- **Never declare an ARIA pattern you have not implemented.** A `combobox`
  role without arrow-key navigation tells a screen reader to expect behaviour
  that is not there, which is worse than claiming nothing.
- **Structured data describes what a reader can see.** No invented ratings, no
  author who is not in the byline. It is both a policy violation and a lie.
- **A dynamic route must generate at least one page** under `output: "export"`,
  which is why page one of the blog exists at two URLs with a canonical tag.
- **`npm run verify` builds before it tests**, because the tests read the built
  output — `noindex`, the sitemap, `robots.txt` and the shipped weight are all
  facts about the artefact rather than about the source.
- **Netlify runs the gate, not just the build.** Its build command is
  `npm run verify`, so a failing test fails the deploy instead of producing a
  preview somebody approves.

## Standards

This file holds the invariants. Two guide sets sit below it and neither
restates it.

- **[`docs/standards/`](docs/standards/index.md)** — the design, the content
  and the operations.
- **[`docs/standards/code/`](docs/standards/code/index.md)** — TypeScript,
  React, tests and comments.

Where a guide and this file disagree, this file wins and the guide records the
disagreement rather than quietly losing it.

Two habits worth knowing before the first edit, because both look like
mistakes:

- **Comments are dense on purpose.** They carry why the obvious alternative is
  wrong, not what the line does. `docs/standards/code/comments.md`.
- **A check that fires on correct code gets narrowed, not obeyed.** Both copy
  rules here were narrowed after reporting the product's own name and a
  deliberate indentation. `docs/standards/code/testing.md` 2.5.

## Commands

```sh
npm run dev
npm run verify
npm run build && npx serve out
node scripts/capture-screenshots.mjs
```

`npm run verify` is `typecheck → lint → format:check → build → test`.

## Recurring tasks

Nine skills in `.claude/skills/` hold the procedures that repeat:

- `merge-prep` — verify everything, commit, push, ready to merge. Does not
  merge.
- `update-dependencies` — move everything to its newest supported version and
  fix what that breaks.
- `guides-update` — bring the guides and `CHANGELOG.md` back to true.
- `design-review` — review the rendered pages against `web.md`, in both themes
  and at both widths.
- `capture-screenshots` — re-capture the application screenshots, with the four
  traps already paid for.
- `write-content` — write a post or a documentation page, with the frontmatter
  contract and the traps that fail a build.
- `app-alignment` — diff the application's published contract against the
  snapshot this repository holds, and reconcile whatever moved. Most runs end
  at the diff.
- `legal-review` — bring the privacy policy and terms back to true when
  something changes what data is handled or who handles it.
- `optimize` — page weight, images, fonts, metadata and findability, beyond
  what the budget gates.

`docs/roadmap.md` records that there is no outstanding engineering work, and
what remains waits on the application, on an account, or was decided against
with the argument. `docs/adsense.md` is the AdSense procedure.

## Definition of done

- `npm run verify` green.
- Anything visual looked at in a browser, in both themes, at both widths.
  jsdom has no layout engine and the suite cannot see it.
- Any document the change made false, changed in the same commit.
- Tests for changed behaviour, and every new check mutation-proved.
