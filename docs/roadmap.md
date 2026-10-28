# What is left to do

**There is no outstanding engineering work.** Everything in this repository
that could be built has been built. What remains is in three groups, and none
of it can be closed from inside this repository:

1. **Waiting on the application.**
2. **Waiting on an account or an asset only the owner has.**
3. **Decided not to build**, with the argument, so nobody reopens it blind.

Each item says what it is, why it is not done, and what done looks like.

---

## 1. Waiting on the application

| #   | Item                                           | What done looks like                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | **Four sign-up controls.**                     | **Done.** The application went live at `app.smpl.money` on 7 October 2026, and the header, the hero and both pricing cards became links to it reading "Sign up free", in one commit with the tests that had asserted the pending state. `web.md` 6.1 and 6.2.                                                                                                                                                                                                                                                                                                                                                     |
| 1.2 | **No screenshot of the plan and billing tab.** | The app is deployed; **the application** captures this tab into its own kit once its capture runs with Stripe configured, and `sync-from-app` §4 pulls it here. Nothing in this repository can take it.                                                                                                                                                                                                                                                                                                                                                                                                           |
| 1.3 | **Screenshots show a seeded ledger.**          | They are real captures of the real application, taken by the application's own `product-kit` against a committed seed, and correctly disclosed. Run `sync-from-app` to pull fresh ones whenever the app's look changes.                                                                                                                                                                                                                                                                                                                                                                                           |
| 1.4 | **Google's consent messages, seen working.**   | The privacy policy says that in the application Google's message asks before an advertising cookie in the EEA, the UK and Switzerland, and offers an opt-out in the US states it names. The messages were published from the AdSense account on 4 October 2026, and nobody has watched them on `app.smpl.money` yet. This site loads no Google script, so there is nothing here to measure. Done is a reading of the application from inside each region, with an ad filling: `legal-review` §5 is the procedure, and a message that never appears means the policy is promising something that is not happening. |

## 2. Waiting on an account or an asset

| #   | Item                                                           | What is needed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | **`public/ads.txt` is in, naming the publisher id.**           | **Done, and it stays.** It arrived with the id in one commit, and `tests/export-shape.test.ts` now holds it to exactly the DIRECT record and the `ownerdomain` line. It stays though this site shows no ads, because it is what authorizes the application's (`operations.md` 2). What is left is on AdSense's side: once it is live on `smpl.money`, choose the ads.txt snippet method where the site is connected and verify, then wait for the crawl, which takes a few days to a month (`operations.md` 2.4).                                                                                                                                                                                                                                                                                                                                                             |
| 2.2 | **AdSense approval.**                                          | The account exists and its publisher id is in `ads.txt`. Review takes days to weeks, and is the longest lead time in the project; real, announced content and the current privacy policy come before the review request.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2.3 | **No author photo.** Bylines render initials.                  | A square image in `public/authors/`, and `avatar` set in `src/content/authors.ts`. Initials are a deliberate fallback rather than a placeholder — the page is not broken without one.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.4 | **Netlify site and DNS.**                                      | Being handled by the owner. `netlify.toml` already carries the build, the gate, the headers and the `www` redirect; `operations.md` 9 has the DNS records and the two that cost a day if they are wrong.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2.6 | **Eight settings that live in a dashboard**, not in this tree. | `operations.md` 8 lists all eight with the reason for each. The "Powered by Netlify" badge — on by default for free projects created after 19 August 2026 — **has been turned off**; the rest are launch steps. `tests/branding.test.ts` holds only the half that is ours, because no test here can see a response this repository did not write.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2.7 | **Being found: the search consoles and the listings.**         | The site does what it can from here (`content.md` 5.15 and 5.16, `operations.md` 7.3). The rest is the owner's. **Done:** the sitemap is submitted to Google Search Console and Bing Webmaster Tools, and both repositories' website fields point at `https://smpl.money` with descriptions in the site's words (25 October 2026), and both carry the category topics budget, budgeting, budget-app, spending-tracker and expense-tracker (26 October 2026). **Still to do:** because mentions elsewhere are what answer engines weigh most, listings where people look for a budget app or a self-hosted one (AlternativeTo, openalternative.co, and awesome-selfhosted, which takes human submissions from 3 December 2026), and the MCP Registry for the assistant connection. Optional and later: an IndexNow key and a script run after a deploy, never inside `verify`. |
| 2.5 | **Announcing the blog and the docs.**                          | **Docs and the learn articles done; the blog deliberately not.** `announced: true` in `src/content/sections.ts` moves the header link, the `noindex` and the sitemap together — which was aspirational when this row was written and is true now. The links were hand-written literals and `announcedSections()` had one caller, the sitemap, so announcing a section indexed it and linked it from nowhere; `src/content/home.ts` now derives both lists from the flag. `tests/sections.test.tsx` holds all three in both directions plus the derivation. The blog stays off until there is a post to read: an empty blog in the header is worse than none, and that remains the owner's call rather than a gap.                                                                                                                                                             |

## 2a. How this site knows the product changed

Worth reading before anything else, because it is the mechanism that makes
the rest of this list maintainable.

The application publishes its user-facing contract at
`docs/product/facts.json` — plans, labels, the free account limit, which plan
sees advertising, prices, capabilities — generated from its own constants and
held to them by its own test. `src/content/app-facts.json` is a snapshot of
it, recording the commit it came from, and `tests/app-facts.test.ts` holds
this site's claims against that snapshot on every build.

So there are two different questions with two different answers:

| Question                                      | Answered by                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| Does this site still agree with the snapshot? | `npm run verify`, every build                                                    |
| Has the application moved since the snapshot? | `node scripts/check-app-sync.mjs`, weekly, then the checks in `sync-from-app` §1 |

**Never refresh the snapshot to make a test pass.** It is the external
referent; moving it to match the site turns the check green and leaves the
page wrong. Fix the page, then refresh, in that order and the same commit.

## 3. Decided, with the argument

These are not omissions. They are here so nobody reopens them without reading
why.

- **No analytics.** Netlify's own request logs already answer "how many people
  came", and a third-party tag is a second vendor on a page whose privacy
  policy has to name every one. If a counter is ever wanted, a self-hosted
  cookieless one costs no vendor and no disclosure.

  **The argument this makes is back.** It is "this origin talks to nothing,
  and `connect-src 'self'` is what makes the CSP's `'unsafe-inline'`
  tolerable". For about four weeks the origin loaded Google's ad script, so
  `connect-src` named two of Google's hosts, and the decision survived that
  on its own; the ads are the application's alone now, and every source in
  the policy is this origin again (`operations.md` 3.2).

- **No newsletter.** Three feeds already exist (`content.md` 5.9). A
  subscription form means a vendor, a CSP exception, a consent question and a
  list to look after, in exchange for a channel the reader already has.
- **No separate comparison page.** The pricing table is the comparison, and a
  page comparing this to named competitors is work to keep honest and ages
  badly. A docs page on moving from another app by exporting a file is the
  honest way to meet the same searches, and waits on the importer being
  checked against those apps' exports at a release.
- **No `llms-full.txt`, and no Markdown served by content negotiation.**
  `content.md` 5.15: nobody was measured reading the first, and the second
  needs an edge function this site doesn't have. `/llms.txt` and a linked
  `index.md` beside every docs page and guide are the cheap half, and they
  stay cheap by being generated.
- **No documentation versioning**, and **no multi-level sidebar.**
  `content.md` 5.1 and 5.5. Both are large structural changes, and building
  either early means maintaining it before anything uses it. The trigger for
  versioning is a released version whose docs must stay readable after the
  next one ships; for a deeper sidebar it is a section past roughly ten pages.
- **No search service.** `content.md` 5.10 names the index size at which the
  in-browser search stops being the right answer.
- **No theme toggle.** `web.md` 1.2 — `localStorage` is per-origin, so a
  toggle here could never have shared a choice made in the application.
- **The page weight floor is the framework's.** About 170 KB gzipped of the
  JavaScript is Next.js and React, and the homepage pays it while containing
  no client component at all. That is the cost of choosing Next for
  portability (`operations.md` 1.1), and `tests/budget.test.ts` budgets just
  above it so a change of _kind_ fails while the floor is not pretended away.
  If page weight ever genuinely matters, the lever is the framework, not the
  code.
- **`script-src` carries `'unsafe-inline'`.** `operations.md` 3.2, with the
  two ways out and why neither is worth it yet.
- **Emptying `content/blog/` breaks the build.** `operations.md` 1.4 — a
  dynamic route with no params is a build error under `output: "export"`.
- **Three dependencies are pre-1.0, and one of them ships.** `operations.md`
  6.2 names each with its fallback, and a test holds that list to
  `package.json`.

## 4. Ongoing, by nature

Not work items, and not a backlog. These are things that grow with the
product rather than being finished.

- **Writing posts.** Two exist and both are real. `write-content` is the
  procedure.
- **Documentation coverage.** Every screen and feature of the application at
  0.2.1 has a page, across five groups, checked against its source at that
  tag. A release that adds a screen adds a page. `sync-from-app` §1 finds
  the screen, both in its changelog read and in its step for a release that
  adds one, and `sync-from-app` §5 writes the page from the release's code in
  the same pull, then tries to prove it wrong.
- **More learn guides.** This is the queue, in rough order, of guides that
  fit the product and the searches people make and aren't written:
  1. how much to save each month;
  2. how to stop living paycheck to paycheck;
  3. budgeting without linking a bank account, which fits the product
     exactly and has to be written to `content.md` 1.4 rather than around it;
  4. keeping track of bills, which fits repeating payments.

  The 50/30/20 rule isn't in it. That guide was written and taken out before
  launch at the owner's call, so its search volume isn't a reason to write
  it again (`content.md` 5.14). `content.md` 5.14 is how a guide is chosen
  and written, and `write-content` is the procedure.

  **The queue lives here now, and it used to live in two places that
  disagreed.** `content.md` 5.14 closed on three next topics (the first
  three above, in that order) and this item named two, budgeting without a
  bank link and keeping track of bills, so only one topic was on both lists
  and whoever picked a guide got a different answer depending on which file
  they opened. This is the union, in 5.14's order with bills added at the
  end, and 5.14 points here rather than keeping a copy.

- **Keeping dependencies current.** `update-dependencies`, which is a skill
  rather than a note because it is a thing that repeats, and which
  `merge-prep` runs before every merge.
- **Refreshing screenshots and the feature list** when the application
  changes. `sync-from-app` pulls both; the application builds them. The same
  pull brings the docs, the privacy policy and the terms up to date, and
  names any learn guide the release touched rather than rewriting it.

## 5. How to pick something up

1. Read `AGENTS.md`. It holds the invariants — the things that make the site
   _wrong_ rather than untidy — and it wins over every guide.
2. Read the guide for the surface: `docs/standards/web.md`, `content.md`,
   `operations.md`, or `code/`.
3. For content, use **`write-content`**. For a picture, a diagram, a mark
   or anything that moves, use **`draw-and-animate`**. For an application
   release, use **`sync-from-app`**, and only that; for documenting the
   application without one, a whole feature or the whole app, use
   `sync-from-app` §5 on its own. A release ends by running `merge-prep`
   itself, so running it again afterward is a second push; §5 on its own
   stops at its checks without committing, and `merge-prep` ships it when the
   branch is ready. For anything else, once the change is made, use
   **`merge-prep`**, which runs the dependency,
   legal, design, search, answer-engine, optimization and guides passes in
   order, then verifies, commits and pushes once.
4. If the change makes a document false, change the document in the same
   commit — `writing.md` §Keeping a document true, and `guides-update` is that
   step done systematically.
