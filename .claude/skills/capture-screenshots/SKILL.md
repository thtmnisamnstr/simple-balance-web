---
name: capture-screenshots
description: Re-capture the application screenshots this site ships, from a real running instance. Use when the app's look has changed, when the screenshots are stale, or when adding a screenshot of a page the site does not yet show.
---

# Re-capture the screenshots

`docs/standards/operations.md` 4 holds the runbook and
`scripts/capture-screenshots.mjs` is the script. This is the order and the
traps.

## Why this is not in `npm run verify`

It needs a checkout of the application, a throwaway PostgreSQL, two dev servers
and about a minute. Run it when the application's look changes, not on every
commit.

## The order

1. **A throwaway database.** Not the development one, and not on 5432 — that
   port usually already has something on it.
2. **The application**, from its own checkout, against that database.
3. **`node scripts/capture-screenshots.mjs`** from this repository.

The exact commands are in `operations.md` 4. Copy them from there rather than
from memory; the environment has six variables and the failure mode of getting
one wrong is a container that starts and an app that refuses.

## Four traps, all paid for already

- **Do not pipe the script's output through `head`.** SIGPIPE kills it
  mid-capture and leaves a partial set that looks complete. Redirect to a file.
- **Seed into the current month.** Every page in the application defaults to a
  this-month range, so a ledger spread evenly over ninety days renders a
  dashboard reporting almost nothing. The first capture did exactly this.
- **Both currencies need a budget.** The overview renders a block per currency.
  Seeding budgets for one leaves the other reporting "no budget set" beside a
  populated one, which reads as a broken feature rather than an unused one.
- **The identity is visible.** The sidebar shows the account's name and email
  in every shot. It is fixed (`alex@example.com`) rather than generated for
  that reason, and the script signs in rather than failing when the account
  already exists.

## After capturing

- **Look at every file**, not just the count. A shot of an empty page is the
  failure this produces and the file size will not tell you.
- **Check the total.** Ten WebP files at 1600px should be around 500 KB. If it
  is megabytes, the resize step did not run.
- **Update the alt text** in `src/content/home.ts` if what the picture shows
  changed. `web.md` 5.4 — the alt describes the content, not the page, and
  `tests/home-page.test.tsx` refuses anything under forty characters.
- **Tear the database down.**

```sh
docker rm -f sb-shots-pg
```

## Adding a shot of a new page

`WANTED` in the script is the list of pages captured, and it is deliberately a
list rather than everything: capturing all thirteen produced eleven megabytes
for the five that get used, and an unused screenshot is a file that goes stale
without anyone noticing. Add the route, add the content entry with its alt text
and caption, and run it.
