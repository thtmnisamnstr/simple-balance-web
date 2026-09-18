---
name: app-alignment
description: Check this site against the Simple Balance application it advertises — prices, limits, feature claims, plan names, brand tokens and screenshots — and fix whatever has drifted. Use after the application changes, before a launch, or when asked whether the site still matches the product.
---

# Make the site agree with the product

This repository makes claims about a program that lives in another
repository, and **nothing here can check a single one of them**. Every test
in this tree holds the site to itself. That gap is the entire reason this
skill exists, and it is the most expensive gap in the project: a pricing page
that overstates is discovered by a customer, personally.

Run it whenever the application changes in a way a reader could notice, and
before any launch.

## 0. Find the application

```sh
ls ../simple-balance/AGENTS.md || echo "clone it beside this repository"
```

Everything below reads that checkout. If the application is not beside this
one, get it — reasoning about it from memory is what this skill exists to
stop.

## 1. The numbers

These appear on the pricing page, in the FAQ and in the privacy policy, and
`tests/pricing.test.tsx` only holds them to _each other_. The source is the
application.

| Claim here                       | Where it is true or false                                   |
| -------------------------------- | ----------------------------------------------------------- |
| Free keeps 3 accounts            | `MAX_FREE_ACCOUNTS` in `src/shared/domain.ts`               |
| Premium is unlimited             | `accountAllowance` — the paid branch returns `{ ok: true }` |
| $20 a year, $2 a month           | `docs/monetization.md` §The prices                          |
| Archived accounts count          | `docs/monetization.md` §What the two plans are              |
| Accounts over the limit are kept | Same section                                                |
| Paid accounts see no ads         | `getAdPlacement` in `src/server/services/billing.ts`        |

```sh
grep -n "MAX_FREE_ACCOUNTS =" ../simple-balance/src/shared/domain.ts
grep -n "a year or\|\$20\|\$2 a month" ../simple-balance/docs/monetization.md
```

**A number that has moved is a number in three places here**: the tier
summary, the comparison table and the FAQ. `content.md` 6.1.

## 2. The feature list

`comparison` in `src/content/pricing.ts` claims eighteen things. Each must be
something the application does, and **nothing may be listed as held back from
the free plan** — the product's actual position is that Premium raises a
limit and removes ads, nothing else.

Walk the application's own README and `docs/` for capabilities the table has
missed, and the table for capabilities the application has dropped. The
second direction is the one nobody checks.

## 3. The words

**The paid tier is "Premium" to a reader and `plus` on the wire**, in both
repositories (`content.md` 6.3). This has already gone wrong once: the
application displayed "Plus" in exactly one string while this site said
Premium.

```sh
grep -rn '"Plus\b' ../simple-balance/src/client/ | grep -v "\.test\."
grep -rn "Premium" src/content/
```

Check the other shared vocabulary too — "staged", "counter-account",
"register", "refund". A word the product uses and the site renames is a word
the reader has to learn twice.

## 4. The brand contract

`src/styles/brand.css` is copied from the application's stylesheet. It is the
one thing that genuinely crosses the boundary, and drift is visible only to
somebody looking at both surfaces at once.

```sh
sed -n '93,294p' ../simple-balance/src/client/styles.css > /tmp/app-tokens.css
grep -oE '^\s+--[a-z0-9-]+: [^;]+;' /tmp/app-tokens.css | sort > /tmp/app.txt
grep -oE '^\s+--[a-z0-9-]+: [^;]+;' src/styles/brand.css | sort > /tmp/site.txt
diff /tmp/app.txt /tmp/site.txt
```

Expect differences: this file carries a subset, and `web.md` 1.1 says which
groups are deliberately excluded. What must **not** differ is a token present
in both with a different value. That is the defect.

## 5. The screenshots

They are captures of the real application (`web.md` 5.1). If its look has
changed, they are lying in the most convincing possible way.

Open `public/screenshots/` beside the running application. If anything moved,
run **`capture-screenshots`** — and afterwards re-read the alt text in
`src/content/home.ts`, because it describes what the picture _shows_ and the
picture has changed.

## 6. The privacy policy

It describes the application's data handling, and the application is where
that changes. Re-read it against:

- **New processors.** Anything the application started talking to.
- **New data.** A field, a log, a retention period.
- **The advertising section**, if anything about the ad path moved.

If any of those moved, run **`legal-review`** rather than patching a sentence.

## 7. The other direction

The application's own documents make claims about this site. The one that has
already been wrong is `docs/monetization.md` on `ads.txt` — it stated a
`subdomain=` referral as mandatory when the publisher ids match, which is the
opposite of correct.

```sh
grep -n "smpl.money\|ads.txt\|subdomain=" ../simple-balance/docs/*.md
```

A correction there is a change to the application repository, with its own
`npm run verify` and its own commit.

## 8. Finish

Fix what drifted, in whichever repository is wrong — which is not always this
one. Then `npm run verify` here, and **`merge-prep`**.

**Report what you compared, not just what you changed.** "Checked prices,
limits, eighteen feature rows, the token contract and five screenshots;
nothing had drifted" is the useful outcome, and reporting it as "no changes"
throws away the only evidence that the check ran.
