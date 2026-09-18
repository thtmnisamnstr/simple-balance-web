---
name: sync-from-app
description: Pull the application's feature list, screenshots and product contract from its main branch, rewrite the features for a general reader, and update this site. Use when the app has shipped a change, before a launch, or when asked whether the site still matches the product.
---

# Bring the site up to date with the product

This site is subordinate to the application. It does not decide what the
product does, what it costs, or which screens exist — it says those things
**well**, to somebody who has never heard of double-entry bookkeeping.

The application publishes everything this needs at `docs/product/`, and this
skill is the whole path from that folder to a deployed page.

|                 |                                                   |
| --------------- | ------------------------------------------------- |
| The application | `https://github.com/thtmnisamnstr/simple-balance` |
| Read it from    | `main` — see §0                                   |

## 0. Which ref, and why usually `main`

The site tracks **released** behaviour, so `main` is right and a branch is
not: advertising something that has not merged is advertising something
nobody can use.

```sh
APP=thtmnisamnstr/simple-balance
REF=main
kit() { curl -fsSL "https://raw.githubusercontent.com/$APP/$REF/docs/product/$1"; }
```

**Check the kit is actually there before concluding anything.** Until 0.2.0
merges, `docs/product/` exists only on `deployment-and-monetization`, and a
`curl` against `main` will 404:

```sh
gh pr list --repo "$APP" --state open --json number,headRefName,title
```

A 404 is a failed check, not an empty result. If the kit is only on a branch,
either wait for the merge or read that branch **and say so in the report** —
a site describing unmerged work is a site that is wrong in the other
direction.

## 1. Has anything moved?

Most runs end here.

```sh
kit facts.json > /tmp/facts.json
diff <(node -p "JSON.stringify(require('./src/content/app-facts.json').facts,null,2)") \
     <(node -p "JSON.stringify(require('/tmp/facts.json'),null,2)")

kit features.json > /tmp/features.json
kit screenshots.json > /tmp/shots.json
diff <(node -p "JSON.stringify(require('./src/content/app-features.json').features,null,2)") \
     <(node -p "JSON.stringify(require('/tmp/features.json').features,null,2)")
```

No output from either means the product has not changed in any way a reader
could see, and `tests/app-facts.test.ts` already proves this site agrees with
its snapshot on every build. Stop.

## 2. The contract — prices, limits, plan names

If `facts.json` moved, fix the **site** first and refresh the snapshot last:

```sh
SHA=$(gh api "repos/$APP/commits/$REF" -q .sha)
node -e '
const fs=require("node:fs"); const snap=require("./src/content/app-facts.json");
snap.facts=JSON.parse(fs.readFileSync("/tmp/facts.json","utf8"));
snap.source.commit=process.argv[1]; snap.source.ref=process.argv[2];
snap.source.fetched=new Date().toISOString().slice(0,10);
fs.writeFileSync("src/content/app-facts.json", JSON.stringify(snap,null,2)+"\n");' "$SHA" "$REF"
npx vitest run tests/app-facts.test.ts
```

**Never refresh the snapshot to make a test go green.** It is the external
referent; moving it to match the site turns the check green and leaves the
page wrong. `docs/standards/content.md` 6.1.

## 3. The features — where the writing happens

`features.json` is the application's list, in the application's voice. It is
written for a general reader but it is written by somebody looking at the
code, and it shows. **Your job is the rewrite**, and it is the only genuinely
creative step in this skill.

Copy the new list into `src/content/app-features.json` verbatim — that is the
record of what was pulled — and then write the site's own words in
`src/content/home.ts`.

### What the rewrite is for

The reader has a current account, a credit card, maybe a savings account.
They have never heard of double-entry bookkeeping and do not want to. Roughly
a ninth-grade reading level, which is not the same as writing for a child:
short sentences about concrete things, not simplified ideas.

**Take the `why`, not just the `plain`.** The application's `why` field says
who has the problem and what goes wrong for them. That is the sentence a
marketing page is actually for, and the `plain` is the answer to it.

### How to make it sound like a person

- **Read it aloud.** If you run out of breath, it is too long. If it sounds
  like a brochure, it is a brochure.
- **Vary the sentence length.** Three medium sentences in a row is the single
  clearest tell of generated text. Let one be four words.
- **No throat-clearing.** "It's worth noting that", "In today's world",
  "Whether you're a X or a Y" — cut all of it.
- **No tricolons.** "Simple, powerful, and secure" is the rhythm of a machine
  trying to sound confident.
- **Second person, present tense.** "You upload the file your bank gives
  you", not "Users can upload bank-provided files".
- **One idea per sentence**, but not one sentence per idea — joining two
  related clauses is what stops prose being choppy.
- **Name the concrete thing.** "The annual subscription you forgot about",
  not "unexpected recurring charges".
- **Let it be plain.** A sentence with nothing clever in it is fine. Most of
  them should be.

`docs/standards/content.md` 1 is Binding over all of this — the banned
vocabulary, and never claiming the product is simple or easy — and
`tests/copy.test.ts` enforces it. **2.1 is the one that matters most:** every
claim has to be true of the shipped application, and the feature list is what
makes that checkable.

### What goes where

- **Tier A** → the hero and the problem sections. Four things, and they carry
  the page.
- **Tier B** → the feature grid.
- **Tier C** → mostly not on the homepage at all. It is documentation
  material, and putting it on a landing page is how a landing page becomes a
  changelog.

Dropping a feature from the site is a decision, not an oversight; the site is
allowed to say less than the product does. **Saying more is not allowed.**

## 4. The screenshots

```sh
kit screenshots.json | node -p "JSON.parse(require('fs').readFileSync(0)).screens.join(' ')"
```

Pull the ones the site uses into `public/screenshots/`:

```sh
for name in dashboard transactions budgets reports import; do
  for theme in light dark; do
    curl -fsSL "https://raw.githubusercontent.com/$APP/$REF/docs/product/screenshots/$name-$theme.webp" \
      -o "public/screenshots/$name-$theme.webp"
  done
done
```

The application captures **every** screen; this site ships the handful it
uses, because an unused screenshot is a file that goes stale unnoticed.
`docs/standards/web.md` 5 governs them once they are here — and **the alt
text describes what the picture shows**, so a changed screenshot means
re-reading the alt text in `src/content/home.ts`. It is the thing most likely
to be left behind.

## 5. Look at it

```sh
npm run verify && npx serve out
```

Both themes, both widths. `design-review` if anything visual moved.

Then read the new copy **cold**, as somebody who has never seen the product.
Does the first screen say what this is? Would you know whether it is for you?

## 6. Finish

Say in the report: the ref and commit you pulled from, whether the contract
moved, which features were added, dropped or reworded, which screenshots were
refreshed, and anything in the application's list you deliberately left off
the site.

Then **`merge-prep`**.
