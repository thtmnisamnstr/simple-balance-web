# What is left to do

Everything known to be outstanding on this site, in one place, so that picking
it up does not require reconstructing it from commit messages.

Each item says **what**, **why it is not done**, and **what done looks like**.
An item with no "what done looks like" is not ready to be worked on; write that
first.

Nothing here is blocked on anything in this repository unless it says so.

---

## 1. Blocked on the application being deployed

| #   | Item                                               | What done looks like                                                                                                                                                                                                                       |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 | **The sign-in control is the word "Coming soon".** | It becomes a link to `https://app.smpl.money`. `web.md` 6.1 is the rule and `tests/home-page.test.tsx` asserts the current state — **that test fails on purpose** when you change it, and updating it in the same commit is the checklist. |
| 1.2 | **No screenshot of the plan and billing tab.**     | The app's pricing page exists; when it does, capture it (`capture-screenshots`) and use it wherever pricing is described.                                                                                                                  |

## 2. Blocked on a decision only you can make

| #   | Item                                                                                                                 | The decision                                                                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | **Pricing is not on this site.** The app sells a plan at $20/year or $2/month; the marketing site never mentions it. | Whether the marketing site sells, or whether pricing lives only in the app. A self-hosted product that also sells a hosted plan usually needs a pricing page; one that sells only a cap-raise on a self-hosted install often does not. Decide before writing it.            |
| 2.2 | **No analytics of any kind.**                                                                                        | Whether to have any. If yes, the constraint is `operations.md` 3.2: this origin currently talks to nothing, and `connect-src 'self'` is what makes the CSP's `'unsafe-inline'` tolerable. A self-hosted, cookieless counter keeps that property; Google Analytics does not. |
| 2.3 | **No newsletter capture.**                                                                                           | Whether the blog has a subscription at all, given three feeds already exist. If yes it needs a vendor, a form, a CSP exception and a privacy line.                                                                                                                          |
| 2.4 | **No comparison or FAQ page.**                                                                                       | Whether either earns a page. Both are SEO-motivated and both are work to keep honest.                                                                                                                                                                                       |

## 3. Legal and compliance — needed before ads, and arguably before launch

| #   | Item                             | What done looks like                                                                                                                                                                                       |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | **No privacy policy.**           | A page at `/privacy/`. **Required by Google's terms before AdSense may serve**, and independently right: the application handles financial data, and a reader will look for one. See `docs/adsense.md` §4. |
| 3.2 | **No terms of use.**             | A page at `/terms/`. Needed if this site ever sells anything; optional while it only links to source.                                                                                                      |
| 3.3 | **No cookie or consent notice.** | Only needed once something sets a cookie or serves personalised ads. Today nothing does. `docs/adsense.md` §5 covers the EEA/UK case.                                                                      |

## 4. AdSense

**`docs/adsense.md` is the full procedure.** The one-line summary: the app
serves the ads, and this site's `ads.txt` is what authorises them — so a
mistake here costs revenue on a domain this repository does not otherwise
touch.

| #   | Item                                                                 | What done looks like                                                                                                                                                                     |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | **`public/ads.txt` does not exist**, and a test asserts it does not. | It exists, contains the real publisher id, and `tests/export-shape.test.ts` has its expectation inverted — in the same commit. `AGENTS.md` says why a premature file is worse than none. |
| 4.2 | **No AdSense account, so nothing is approved.**                      | Approval takes days to weeks and needs a live site with real content. It is the longest lead time in this document; start it early.                                                      |
| 4.3 | **Thin content is the usual rejection.**                             | Ship the docs and a few posts, and announce them, before applying.                                                                                                                       |

## 5. The blog

| #   | Item                                                                              | What done looks like                                                                                                                                                                                    |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | **Two posts, both written as examples.**                                          | Enough posts that the index is worth reading. Keep or replace the two; they are real and correct, not lorem ipsum.                                                                                      |
| 5.2 | **The section is unannounced.**                                                   | `announced: true` in `src/content/sections.ts`. That one flag changes the header link, the `noindex` and the sitemap together, and `tests/sections.test.tsx` fails until its expectations move with it. |
| 5.3 | **No author photo.** `authors.gavin` has no `avatar`, so bylines render initials. | A square image in `public/authors/`, and `avatar` set. Initials are a deliberate fallback, not a placeholder to be embarrassed by.                                                                      |
| 5.4 | **No cover images**, so featured posts render without one.                        | `image` and `imageAlt` on the posts worth it. Both or neither — the parser refuses an image with no alt.                                                                                                |
| 5.5 | **Tags have no descriptions.**                                                    | Optional. A tag page currently shows the tag and a count.                                                                                                                                               |

## 6. The documentation

| #   | Item                                                                    | What done looks like                                                                                                                                                                                                                                                                     |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | **Four pages, covering install, import, configuration and backups.**    | Coverage that matches what the application actually does — the app's own `docs/` directory is the source, and much of it can be adapted rather than written.                                                                                                                             |
| 6.2 | **The section is unannounced.**                                         | As 5.2.                                                                                                                                                                                                                                                                                  |
| 6.3 | **The sidebar is two levels.** Sections hold pages; pages hold nothing. | Only needed if a section grows past roughly ten pages. `content.md` 5.5 owns the ordering.                                                                                                                                                                                               |
| 6.4 | **No versioning.**                                                      | Only needed when a released version's documentation must stay readable after the next one ships. That is a real day for a self-hosted product and it is not today. Deliberately not built: it is a large structural change and building it early means maintaining it before it is used. |
| 6.5 | **Search does not highlight the matched text.**                         | Results show title and section. Highlighting means returning a snippet with offsets; worth it once pages are long enough that a title is not enough to choose between results.                                                                                                           |

## 7. Launch

| #   | Item                               | What done looks like                                                                                                                                                                                            |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 | **No Netlify site exists.**        | Site created, linked to this repository, publishing `out/`. `netlify.toml` already carries the build, the headers and the `www` redirect.                                                                       |
| 7.2 | **DNS not pointed.**               | The apex at Netlify, `app.` at the application, and **no CAA record** — `operations.md` 6 explains why one would break the app's certificate renewal, and why DNSSEC must be disabled before a nameserver move. |
| 7.3 | **No deploy previews configured.** | Netlify does this by default for pull requests; confirm it is on, because the CI in this repository builds but does not deploy.                                                                                 |
| 7.4 | **No performance budget.**         | The site is small and static and currently fast. A Lighthouse budget in CI is worth adding the first time a page gets heavy — most likely when cover images arrive.                                             |

## 8. Known limitations, accepted

These are decisions, not omissions. They are here so nobody re-opens them
without reading the argument.

- **`script-src` carries `'unsafe-inline'`.** Next emits its hydration payload
  inline and a static export has no request in which to mint a nonce.
  `operations.md` 3.2 has the full argument and the two ways out.
- **Emptying `content/blog/` breaks the build.** A dynamic route with no params
  is a build error under `output: "export"`. `operations.md` 1.4.
- **One dependency is pre-1.0** (`rehype-pretty-code`). `operations.md` 5.2
  names the fallback.
- **The theme cannot be toggled**, and follows the operating system.
  `web.md` 1.2 — `localStorage` is per-origin, so a toggle here could not have
  shared a choice made in the application anyway.
- **No search service.** `content.md` 5.10 names the size at which that
  changes.

## 9. How to pick something up

1. Read `AGENTS.md`. It holds the invariants — the things that make the site
   _wrong_, not untidy — and it wins over every guide.
2. Read the guide for the surface: `docs/standards/web.md`,
   `content.md`, `operations.md`, or `code/`.
3. For content, use the **`write-content`** skill. For anything else, make the
   change and then use **`merge-prep`**, which verifies, commits and pushes.
4. If the change makes a document false, change the document in the same
   commit. `writing.md` §Keeping a document true — and `guides-update` is that
   step done systematically.
