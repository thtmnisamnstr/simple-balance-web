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

## 0. Is anything out of date at all?

**Start here, and most runs end here.** The application publishes its
user-facing contract at `docs/product-facts.json` — plans, labels, the free
account limit, which plan sees ads, prices, capabilities — generated from its
own constants and held to them by its own test. This repository keeps a
snapshot at `src/content/app-facts.json` with the commit it came from.

So "does the site need updating" is a diff, not a reading exercise:

```sh
REF=$(node -p "require('./src/content/app-facts.json').source.ref")
curl -fsSL "https://raw.githubusercontent.com/$APP/$REF/docs/product-facts.json" -o /tmp/facts.json
diff <(node -p "JSON.stringify(require('./src/content/app-facts.json').facts,null,2)") \
     <(node -p "JSON.stringify(require('/tmp/facts.json'),null,2)")
```

**No output means the contract has not moved**, and §1 and §3 are already
guaranteed by `tests/app-facts.test.ts`, which runs on every build. Skip to
§4.

Output means something a reader can see has changed. Read the diff before
changing anything — it names exactly what moved.

### Which ref, and why it is not always `main`

Unreleased work sits on a branch, and the snapshot records which one it was
taken from. The command above follows that. To move to a different ref —
because a release landed, or because the branch changed name — resolve it
first:

```sh
gh repo view "$APP" --json defaultBranchRef -q .defaultBranchRef.name
gh pr list --repo "$APP" --state open --json number,headRefName,title
```

At the time of writing, everything about plans, prices and advertising lives
on `deployment-and-monetization` and **not** on `main` — `MAX_FREE_ACCOUNTS`
does not exist there at all. A check against `main` would find nothing and
conclude the site was wrong about everything.

**A fetch that 404s is a failed check, not a passed one.** `curl -f` exits
non-zero; do not carry on past it.

## 1. Apply what the contract says

Change the site to match, then refresh the snapshot in the same commit:

```sh
SHA=$(gh api "repos/$APP/commits/$REF" -q .sha)
node -e '
const fs = require("node:fs");
const snap = require("./src/content/app-facts.json");
snap.facts = JSON.parse(fs.readFileSync("/tmp/facts.json","utf8"));
snap.source.commit = process.argv[1];
snap.source.fetched = new Date().toISOString().slice(0,10);
fs.writeFileSync("src/content/app-facts.json", JSON.stringify(snap,null,2)+"\n");
' "$SHA"
npx vitest run tests/app-facts.test.ts
```

That test is what tells you which claims on the site now disagree — the tier
name, the limit in three places, the advertising row. **Refreshing the
snapshot without fixing the site turns a failing test green while leaving the
page wrong**, so fix first and refresh last.

## 1a. What the contract does not carry

Three things are not in it, because they cannot be:

- **Prose.** The FAQ answers and the privacy policy describe behaviour in
  sentences. §6 and §7.
- **The look.** §4 and §5.
- **Anything the application has not thought to publish.** If you find
  yourself wanting a field, add it to the application's generator rather than
  grepping for it here — that is the whole point of the file existing.

## 2. The feature list

`comparison` in `src/content/pricing.ts` claims eighteen things; the
contract's `declared.capabilities` is the application's own list of what it
does. `tests/app-facts.test.ts` holds the count loosely — the table's wording
is marketing and the contract's is description, so they are not compared
sentence by sentence.

Walk it in both directions by eye: capabilities the table has missed, and
capabilities the table claims that the contract no longer lists. **The second
direction is the one nobody checks**, and it is where a page keeps advertising
something that was removed.

```sh
node -p "require('/tmp/facts.json').declared.capabilities.join('\n')"
```

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
