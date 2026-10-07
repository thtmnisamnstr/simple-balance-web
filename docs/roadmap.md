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

| #   | Item                                           | What done looks like                                                                                                                                                                                                                                          |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | **Four sign-up controls.**                     | **Done.** The application went live at `app.smpl.money` on 7 October 2026, and the header, the hero and both pricing cards became links to it reading "Sign up free", in one commit with the tests that had asserted the pending state. `web.md` 6.1 and 6.2. |
| 1.2 | **No screenshot of the plan and billing tab.** | The app is deployed; **the application** captures this tab into its own kit once its capture runs with Stripe configured, and `sync-from-app` §4 pulls it here. Nothing in this repository can take it.                                                       |
| 1.3 | **Screenshots show a seeded ledger.**          | They are real captures of the real application, taken by the application's own `product-kit` against a committed seed, and correctly disclosed. Run `sync-from-app` to pull fresh ones whenever the app's look changes.                                       |

## 2. Waiting on an account or an asset

| #   | Item                                                         | What is needed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1 | **`public/ads.txt` is in, naming the publisher id.**         | **Done.** It arrived with the id in one commit, and `tests/export-shape.test.ts` now holds it to exactly the DIRECT record and the `ownerdomain` line. What is left is on AdSense's side: once it is live on `smpl.money`, choose the ads.txt snippet method where the site is connected and verify, then wait for the crawl, which `docs/adsense.md` §3 says takes a few days to a month.                                                                                                                                                                                                                                                                                                 |
| 2.2 | **AdSense approval.**                                        | The account exists and its publisher id is in `ads.txt`. Review takes days to weeks, and is the longest lead time in the project; `docs/adsense.md` §3 has the order, which puts real, announced content and the current privacy policy before the review request.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2.3 | **No author photo.** Bylines render initials.                | A square image in `public/authors/`, and `avatar` set in `src/content/authors.ts`. Initials are a deliberate fallback rather than a placeholder — the page is not broken without one.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2.4 | **Netlify site and DNS.**                                    | Being handled by the owner. `netlify.toml` already carries the build, the gate, the headers and the `www` redirect; `operations.md` 9 has the DNS records and the two that cost a day if they are wrong.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2.6 | **Six settings that live in a dashboard**, not in this tree. | `operations.md` 8 lists all six with the reason for each. The "Powered by Netlify" badge — on by default for free projects created after 19 August 2026 — **has been turned off**; the rest are launch steps. `tests/branding.test.ts` holds only the half that is ours, because no test here can see a response this repository did not write.                                                                                                                                                                                                                                                                                                                                            |
| 2.5 | **Announcing the blog and the docs.**                        | **Docs done; the blog deliberately not.** `announced: true` in `src/content/sections.ts` moves the header link, the `noindex` and the sitemap together — which was aspirational when this row was written and is true now. The links were hand-written literals and `announcedSections()` had one caller, the sitemap, so announcing a section indexed it and linked it from nowhere; `src/content/home.ts` now derives both lists from the flag. `tests/sections.test.tsx` holds all three in both directions plus the derivation. The blog stays off until there is a post to read: an empty blog in the header is worse than none, and that remains the owner's call rather than a gap. |

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

  **The argument this used to make is gone.** It was "this origin talks to
  nothing, and `connect-src 'self'` is what makes the CSP's `'unsafe-inline'`
  tolerable". The origin loads Google's ad script now, so `connect-src` names
  two of Google's hosts and is not absolute; `operations.md` 3.2 carries the
  replacement, which is that the list is closed and was measured. The decision
  above survives it, which is why it is still here.

- **No newsletter.** Three feeds already exist (`content.md` 5.9). A
  subscription form means a vendor, a CSP exception, a consent question and a
  list to look after, in exchange for a channel the reader already has.
- **No separate comparison page.** The pricing table is the comparison, and a
  page comparing this to named competitors is work to keep honest and ages
  badly.
- **Google's consent messages are published, and not yet seen working
  here.** This site sets an advertising identifier on `.doubleclick.net`, and
  a visitor in the EEA, the UK or Switzerland has to be asked before that. On
  4 October 2026 the operator reported a European regulations message and a
  US state regulations message published from the AdSense account for both
  origins, and both surfaces now leave personalization to them
  (`docs/adsense.md` §5), so the privacy policy says who is asked, region by
  region. What is open is the observation: the same day, a build served as
  `smpl.money` and driven from California found `window.googlefc` undefined
  on every page and no request for a message at all. Re-run `docs/adsense.md`
  §8 from inside each region once the site serves ads, and if a message still
  does not load, the policy is promising something that is not happening.
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
- **Documentation coverage.** Seven pages across four sections. The
  application's own `docs/` directory is the source for more, and much of it
  adapts rather than needing writing.
- **Keeping dependencies current.** `update-dependencies`, which is a skill
  rather than a note because it is a thing that repeats.
- **Refreshing screenshots and the feature list** when the application
  changes. `sync-from-app` pulls both; the application builds them.

## 5. How to pick something up

1. Read `AGENTS.md`. It holds the invariants — the things that make the site
   _wrong_ rather than untidy — and it wins over every guide.
2. Read the guide for the surface: `docs/standards/web.md`, `content.md`,
   `operations.md`, or `code/`.
3. For content, use **`write-content`**. For anything else, make the change
   and then use **`merge-prep`**, which verifies, commits and pushes.
4. If the change makes a document false, change the document in the same
   commit — `writing.md` §Keeping a document true, and `guides-update` is that
   step done systematically.
