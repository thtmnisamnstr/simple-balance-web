---
name: app-alignment
description: Check this site against the Simple Balance application it advertises — prices, limits, feature claims, plan names, brand tokens and screenshots — and fix whatever has drifted. Use after the application changes, before a launch, or when asked whether the site still matches the product.
---

# Make the site agree with the product

This repository makes claims about a program that lives in a different
repository, and **nothing here can check a single one of them**. Every test
in this tree holds the site to itself. That gap is why this skill exists, and
it is the most expensive gap in the project: a pricing page that overstates
is discovered by a customer, personally.

Run it whenever the application changes in a way a reader could notice, and
before any launch.

## The two repositories

|                 |                                                       |
| --------------- | ----------------------------------------------------- |
| The application | `https://github.com/thtmnisamnstr/simple-balance`     |
| This site       | `https://github.com/thtmnisamnstr/simple-balance-web` |

Both are public. **Read the application over the network, not from a folder
on somebody's laptop** — a local checkout is whatever state it was left in,
and "I checked" against a three-week-old working tree is worse than not
checking, because it comes with confidence.

```sh
APP=thtmnisamnstr/simple-balance
app() { curl -fsSL "https://raw.githubusercontent.com/$APP/$REF/$1"; }
```

## 0. Resolve the ref first, and do not assume `main`

**This is the step that goes wrong.** Unreleased work sits on a branch behind
an open pull request, so the claims this site makes may describe code that is
not on the default branch yet.

```sh
gh repo view "$APP" --json defaultBranchRef -q .defaultBranchRef.name
gh pr list --repo "$APP" --state open --json number,headRefName,title
```

Pick the ref that actually holds the release this site is advertising, and
set it once:

```sh
REF=main          # or the branch an open PR is landing
```

At the time of writing, everything about plans, prices and advertising lives
on `deployment-and-monetization` and **not** on `main` — `MAX_FREE_ACCOUNTS`
does not exist there at all. A check run against `main` would find nothing
and conclude the site was wrong about everything.

**A lookup that finds nothing is a failed check, not a passed one.** If a
grep below returns empty, resolve why before moving on.

## 1. The numbers

These appear on the pricing page, in the FAQ and in the privacy policy, and
`tests/pricing.test.tsx` holds them only to _each other_. The application is
the source.

| Claim here                       | Where it is true or false                                   |
| -------------------------------- | ----------------------------------------------------------- |
| Free keeps 3 accounts            | `MAX_FREE_ACCOUNTS` in `src/shared/domain.ts`               |
| Premium is unlimited             | `accountAllowance` — the paid branch returns `{ ok: true }` |
| $20 a year, $2 a month           | `docs/monetization.md` §The prices                          |
| Archived accounts count          | `docs/monetization.md` §What the two plans are              |
| Accounts over the limit are kept | Same section                                                |
| Paid accounts see no ads         | `getAdPlacement` in `src/server/services/billing.ts`        |

```sh
app src/shared/domain.ts | grep -n "MAX_FREE_ACCOUNTS ="
app docs/monetization.md | grep -nE '\$20|\$2 a month|a year'
app src/server/services/billing.ts | grep -n "entitlement.plan !== \"free\""
```

**A number that has moved is a number in three places here**: the tier
summary, the comparison table and the FAQ. `content.md` 6.1.

## 2. The feature list

`comparison` in `src/content/pricing.ts` claims eighteen things. Each must be
something the application does, and **nothing may be listed as held back from
the free plan** — the product's position is that Premium raises a limit and
removes ads, nothing else.

```sh
app README.md | sed -n '1,80p'
```

Walk it in both directions: capabilities the table has missed, and
capabilities the table claims that the application has dropped. The second
direction is the one nobody checks.

## 3. The words

**The paid tier is "Premium" to a reader and `plus` on the wire**, in both
repositories (`content.md` 6.3). This has already gone wrong once: the
application displayed "Plus" in one string while this site said Premium.

```sh
app src/client/pages/PlanPage.tsx | grep -nE '"(Plus|Premium)'
grep -rn "Premium" src/content/
```

Check the shared vocabulary too — "staged", "counter-account", "register",
"refund". A word the product uses and the site renames is a word the reader
has to learn twice.

## 4. The brand contract

`src/styles/brand.css` is copied from the application's stylesheet. It is the
one thing that genuinely crosses the boundary, and drift is visible only to
somebody looking at both surfaces at once.

```sh
app src/client/styles.css > /tmp/app-styles.css
grep -oE '^\s+--[a-z0-9-]+: [^;]+;' /tmp/app-styles.css | sed 's/^ *//' | sort -u > /tmp/app.txt
grep -oE '^\s+--[a-z0-9-]+: [^;]+;' src/styles/brand.css | sed 's/^ *//' | sort -u > /tmp/site.txt
comm -13 /tmp/app.txt /tmp/site.txt   # declared here, not there, or a different value
```

Expect differences: this file carries a subset, and `web.md` 1.1 says which
groups are deliberately excluded.

**`--art-ink` is the one expected line in that output.** It is this site's
own — the application's art surface carries no solid text, so it never needed
one — and `brand.css` says so where it is declared. Anything _else_ there is
a token this site declares with a value the application does not have, and
that is the defect.

This check found `--art-ink` the first time it ran, against a file whose
header claimed every value was copied from the application. The header was
wrong, and correcting it is the shape of what this skill is for.

## 5. The screenshots

They are captures of the real application (`web.md` 5.1). If its look has
changed, they are lying in the most convincing possible way.

Compare `public/screenshots/` against the application as it is now. If
anything moved, run **`capture-screenshots`** — which is the one procedure
that does need the application cloned and running, and says so. Afterwards
re-read the alt text in `src/content/home.ts`: it describes what the picture
_shows_, and the picture has changed.

## 6. The privacy policy

It describes the application's data handling, and the application is where
that changes. Re-read it against:

- **New processors.** Anything the application started talking to.
- **New data.** A field, a log, a retention period.
- **The advertising path**, if anything about it moved.

```sh
app .env.example | grep -vE '^\s*$' | head -40
```

A new variable naming a third party is a new processor. If anything moved,
run **`legal-review`** rather than patching a sentence.

## 7. The other direction

The application's own documents make claims about this site, and one has
already been wrong: `docs/monetization.md` stated an `ads.txt`
`subdomain=` referral as mandatory when the publisher ids match, which is the
opposite of correct.

```sh
app docs/monetization.md | grep -nE "smpl\.money|ads\.txt|subdomain="
app docs/deployment.md   | grep -nE "smpl\.money|PRIVACY_POLICY_URL"
```

A correction there is a change to the **application** repository, with its own
`npm run verify` and its own commit — and its integration tier, which
`npm run verify` skips without a database. Clone it for that; do not push a
change to it on the strength of a green unit run.

## 8. Finish

Fix what drifted, in whichever repository is wrong — which is not always this
one. Then `npm run verify` here, and **`merge-prep`**.

**Report what you compared, not only what you changed**, and name the ref you
compared against. "Checked prices, limits, eighteen feature rows, the token
contract and five screenshots against `deployment-and-monetization`; nothing
had drifted" is the useful outcome. Reporting it as "no changes" throws away
the only evidence the check ran at all.
