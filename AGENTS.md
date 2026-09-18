# Simple Balance website agent guide

The marketing site at **smpl.money**. The application it advertises lives in a
separate repository and is served from **app.smpl.money**.

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
  output — `noindex`, the sitemap and `robots.txt` are what a crawler sees.

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

Five skills in `.claude/skills/` hold the procedures that repeat:

- `merge-prep` — verify everything, commit, push, ready to merge. Does not
  merge.
- `update-dependencies` — move everything to its newest supported version and
  fix what that breaks.
- `guides-update` — bring the guides and `CHANGELOG.md` back to true.
- `design-review` — review the rendered pages against `web.md`, in both themes
  and at both widths.
- `capture-screenshots` — re-capture the application screenshots, with the four
  traps already paid for.

## Definition of done

- `npm run verify` green.
- Anything visual looked at in a browser, in both themes, at both widths.
  jsdom has no layout engine and the suite cannot see it.
- Any document the change made false, changed in the same commit.
- Tests for changed behaviour, and every new check mutation-proved.
