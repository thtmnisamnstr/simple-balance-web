---
name: sync-from-app
description: Pull the application's feature list, screenshots and product contract from the ref scripts/check-app-sync.mjs resolves (main once it carries the kit, the open release pull request's branch until then), check the brand tokens against its stylesheet, rewrite the features for a general reader, and update this site. Use when the app has shipped a change, before a launch, or when asked whether the site still matches the product.
---

# Bring the site up to date with the product

This site is subordinate to the application. It does not decide what the
product does, what it costs, or which screens exist — it says those things
**well**, to somebody who has never heard of double-entry bookkeeping.

The application publishes everything this needs at `docs/product/`, and this
skill is the whole path from that folder to a deployed page.

|                 |                                                              |
| --------------- | ------------------------------------------------------------ |
| The application | `https://github.com/thtmnisamnstr/simple-balance`            |
| Read it from    | the ref `scripts/check-app-sync.mjs` resolves, at one commit |

## 0. Which ref, and why usually `main`

The site tracks **released** behavior, so `main` is right whenever `main`
carries the kit: advertising something that has not merged is advertising
something nobody can use.

**The ref is resolved by `scripts/check-app-sync.mjs`, not typed here.** It
reads `main` when `main` carries `docs/product/`, and otherwise the head of
the open pull request into `main` whose branch carries it, and it prints the
ref it chose. Every command below reads that choice rather than making its
own, because a skill and a script that each decide are two answers that can
drift. Both used to be hard-coded to `main`, which 404s until the release
that introduces the kit merges, and the skill then left the switch to
whoever ran it.

```sh
APP=thtmnisamnstr/simple-balance
node scripts/check-app-sync.mjs --json > /tmp/app-sync.json
checked() { node -p "require('/tmp/app-sync.json').$1 ?? ''"; }
for field in status ref why pullRequest commit note; do echo "$field: $(checked $field)"; done
```

`APP_REF=<branch>` in front of the `node` overrides the choice, for the script
and so for everything here.

**Read every field before concluding anything, because an empty `ref` means
two different things.**

- **`ref` is set, and `status` is `in-sync` or `drifted`.** Resolved; carry
  on. `why` gives the reason for that ref. When the ref came from a pull
  request, `pullRequest` is its number, `commit` is the head the script read,
  and `why` says whether more than one carried the kit (the lowest number
  wins). `main` and an `APP_REF` override leave `pullRequest` and `commit`
  both empty, and `why` then says `main carries the kit` or `APP_REF is set`.
  An override is taken as given, even when the branch it names is some pull
  request's head.
- **`ref` is empty and `why` says no open pull request carries the kit.**
  `main` does not carry `docs/product/` and no open pull request into `main`
  does either, so the kit is not published anywhere yet. This is the only
  case where "nothing to compare" is the finding rather than a failure: say
  so in the report and stop.
- **`ref` is empty and so is `why`.** The script never finished choosing:
  GitHub could not be reached, or refused an unauthenticated run over its
  rate limit. `status` is `unknown` and `note` gives the reason, starting
  `Could not read`. **That is a failed check, not an empty result**, and
  reading it as "nothing to compare" is the confusion §1's exit code 2 exists
  to prevent. Report the `note`, conclude nothing, and run it again;
  `GH_TOKEN=$(gh auth token)` in front of the `node` lifts the anonymous
  limit.
- **`ref` is set and `status` is `unknown`.** It chose a ref and then could
  not read something, and `note` says which side: the application's kit or
  this site's own files. A failed check too. With `APP_REF` set, the
  note can instead say the override names a ref that does not carry the kit,
  and the fix is to drop the override.

Once it has resolved, pin the ref to one commit:

```sh
REF=$(checked ref)
SHA=$(checked commit)
[ -n "$SHA" ] || SHA=$(gh api "repos/$APP/commits/$REF" -q .sha)
echo "reading $APP@$REF at $SHA"
kit() { curl -fsSL "https://raw.githubusercontent.com/$APP/$SHA/docs/product/$1"; }
```

**Everything below reads that one commit.** `commit` is the head the script
read when the ref is a pull request's; for `main` or an override it is empty,
and `gh api` pins the ref to the commit it is at now. Reading by commit
rather than by branch name means a push between two commands cannot mix two
versions of the kit, and it is the commit §5 records in both snapshots. Look
at the pull request itself:

```sh
gh pr list --repo "$APP" --state open --base main --json number,headRefName,title
```

A 404 from `kit` is a failed check, not an empty result. And a ref that is not
`main` goes in the report **by name**: the site is then describing work that
has not been released, which is right only while that release is what the
site is launching with, and wrong in the other direction the day it is not.

## 1. Has anything moved?

Most runs end here. A weekly workflow (`.github/workflows/app-sync.yml`)
runs the script below and opens an issue when it reports a change, so an open
issue is a reason to be here. No issue is not proof there is nothing to do:
the workflow knows only what the script compares, and the script does not
compare the brand tokens.

```sh
node scripts/check-app-sync.mjs; echo "exit $?"
```

That exits 0 in sync, 1 when something moved, and **2 when it could not
tell** — the third is distinct on purpose, because "the application has not
changed" and "I could not reach it" must never look alike. A 2 is either the
kit not being published anywhere yet or a failure to look, and §0 says how to
tell them apart.

**Six things are checked, and the script's verdict covers five of them**:
the contract, the features, the screenshots, where the snapshots say they
came from, and which ref the site's links into the application name. The
brand tokens are checked only here. Run every check below whatever the
script said: a check that is skipped reports nothing, and nothing is what
"in sync" looks like. The script names what moved; these show what it moved
to.

### The contract and the features

```sh
kit facts.json > /tmp/facts.json
diff <(node -p "JSON.stringify(require('./src/content/app-facts.json').facts,null,2)") \
     <(node -p "JSON.stringify(require('/tmp/facts.json'),null,2)")

kit features.json > /tmp/features.json
diff <(node -p "JSON.stringify(require('./src/content/app-features.json').features,null,2)") \
     <(node -p "JSON.stringify(require('/tmp/features.json').features,null,2)")
```

### The screenshots

```sh
kit screenshots.json > /tmp/shots.json
node -p "'kit captured ' + require('/tmp/shots.json').capturedAt + ', site ships ' + require('./public/screenshots/CAPTURE.json').capturedAt"
mkdir -p /tmp/kit-shots
for f in public/screenshots/*.webp; do
  n=${f##*/}
  kit "screenshots/$n" > "/tmp/kit-shots/$n" || { echo "missing from the kit: $n"; continue; }
  cmp -s "/tmp/kit-shots/$n" "$f" || echo "differs from the kit: $n"
done
```

The glob takes the originals only; `public/screenshots/1200/` is derived from
them by §4 and has no counterpart in the kit. A different `capturedAt` with no
file reported is a re-capture that changed nothing this site ships: run only
§4's `CAPTURE.json` step, so the record names the capture the files match and
the next run does not report it again.

**This is the check that was missing.** §1 once compared the contract and the
features and then said to stop, so when the application re-captured every
screen in dollars, the site went on shipping pictures of a euro ledger and
every check called it in sync.

### The brand tokens

`src/styles/brand.css` is copied from the application's stylesheet
(`docs/standards/web.md` 1.1), so every declaration in it, name and value
together, must still be one the application declares:

```sh
tokens() {
  tr '\n' ' ' | grep -oE -- '--[a-z0-9-]+:[^;{}]+;' \
    | sed -E 's/:[[:space:]]*/: /; s/[[:space:]]+/ /g' | sort -u
}
curl -fsSL "https://raw.githubusercontent.com/$APP/$SHA/src/client/styles.css" -o /tmp/app-styles.css &&
  comm -23 <(tokens < src/styles/brand.css) <(tokens < /tmp/app-styles.css)
```

That prints the declarations `brand.css` has and the application does not,
and the **expected output is exactly one line**, `--art-ink: #e7ede9;` — this
site's own token, which `brand.css` explains where it declares it. Anything
else it prints is a value the application has changed; copy the new one into
`brand.css`, in the theme block it belongs to, and let
`tests/brand-tokens.test.ts` hold the structure. A failed `curl` says so and
compares nothing.

**The newlines are flattened before anything is matched**, because Prettier
wraps a declaration too long for one line, and the dark `--shadow` in
`brand.css` is on two. A line-by-line match never saw it: the check compared
79 of the 80 declarations and was silent about the 80th, which is the
failure that looks exactly like agreement.

**What it does not compare.** It is one-way on purpose, because the
application declares many tokens this site never uses and those are not
drift. And it compares declarations rather than theme blocks: each is looked
for anywhere in the application's stylesheet, so a value the application
moved from one theme to the other would still be found. §6's look at both
themes is what would see that.

### Where the snapshots say they came from

```sh
node -p "['app-facts', 'app-features'].map((name) => { const { ref, commit } = require('./src/content/' + name + '.json').source; return name + ': ' + ref + ' at ' + commit; }).join('\n')"
```

Both lines name one ref and one commit, and that ref is `main` once `$REF` is.
The script reports either failure, as "snapshots that disagree" or "a
snapshot taken from an unmerged branch", and §5 is the fix for both. The
second is what moves the site back to `main` the week the release merges:
the merge does not change the kit, so every other check passes, and only this
record still names the branch.

### The links into the application

```sh
npx vitest run tests/app-links.test.ts
```

Every link a reader can follow into the application's repository names the
ref the snapshots record (`docs/standards/content.md` 2.5). The test names
every link that does not, the footer's included, which are built from
`site.sourceUrl` and which a search for the URL would miss. The script holds
the same links to the ref it resolved, so once §5 has written that ref into
both snapshots the two ask the same question.

**A link can name another ref when nothing else has moved.** A page written
against `main` while the snapshots name the release branch is exactly that,
and the ref resolving the same way as last week does not fix it. So this runs
every time, and a link it names is §5's to fix whether or not the ref
changed.

### When to stop

Only when all of these hold:

- `node scripts/check-app-sync.mjs` exits 0. Nothing below overrides it: a 1
  is work to do, and a 2 is a check that failed, however quiet the rest is.
- The two diffs print nothing, and the screenshot loop names no file.
- The token check prints `--art-ink` and nothing else.
- Both snapshots name the same ref and commit, and `main` once `$REF` is.
- `tests/app-links.test.ts` passes, so every link names that ref too.

Then the product has not changed in any way a reader could see, and
`tests/app-facts.test.ts` already proves this site agrees with its snapshot
on every build. The one other way a run ends is §0's, when no ref carries the
kit, and the report says that rather than calling the site in sync.

Otherwise the contract is §2, the features §3 and the screenshots §4, and §5
records where they came from: after any of those, and on its own when
provenance was all the script reported. A link naming another ref is §5 too,
on its own if need be: point it at the ref §0 resolved, which is the one §5
records in both snapshots (`docs/standards/content.md` 2.5). A moved token is
the `brand.css` edit above, followed by §6 to look at it in both themes.

## 2. The contract — prices, limits, plan names

If `facts.json` moved, fix the **site** first and refresh the snapshot last:

```sh
node -e '
const fs = require("node:fs");
const file = "src/content/app-facts.json";
const snap = JSON.parse(fs.readFileSync(file, "utf8"));
snap.facts = JSON.parse(fs.readFileSync("/tmp/facts.json", "utf8"));
fs.writeFileSync(file, JSON.stringify(snap, null, 2) + "\n");'
npx vitest run tests/app-facts.test.ts
```

Its `source` block is §5's, which writes it for both snapshots at once.

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
`src/content/home.ts`:

```sh
node -e '
const fs = require("node:fs");
const file = "src/content/app-features.json";
const snap = JSON.parse(fs.readFileSync(file, "utf8"));
const pulled = JSON.parse(fs.readFileSync("/tmp/features.json", "utf8"));
delete pulled.$comment;
const copy = { $comment: snap.$comment, appVersion: pulled.appVersion, source: snap.source, ...pulled };
fs.writeFileSync(file, JSON.stringify(copy, null, 2) + "\n");'
```

Verbatim apart from the wrapper. The application's `features.json` has no
`source`, and its `$comment` describes its own file, so the copy keeps this
file's `$comment` and `source` and takes everything else from the pull; §5
then writes the `source` for this pull. A literal copy of the application's
file drops the record of where it came from, and
`tests/app-features.test.ts` fails on it.

### Rewrite only what moved

**This is the part that keeps the site's voice steady across releases.**

```sh
npx vitest run tests/copy-provenance.test.ts
```

`src/content/copy-source.json` holds the application's description of each
feature **as it was when the copy here was written**. That test compares it
against the new pull and fails for each feature whose description moved,
showing the old sentence and the new one.

So a release that changes three features prompts three rewrites. The other
fourteen keep wording somebody already agreed was good, and the homepage does
not quietly become a different homepage every quarter for no reason a reader
could name.

When the copy is updated:

```sh
npm run copy:accept              # everything
npm run copy:accept -- budgets   # one feature
```

**After changing the copy, never instead of.** Accepting without rewriting
turns the test green and leaves the page describing the old product — the
same trap as refreshing the facts snapshot, and both files say so at the top.

A feature the application **added** also fails that test, because taking it
or declining it must be a decision rather than an oversight. Declining is
fine: accept it to note it as seen, and leave the page alone.

A feature **re-tiered** fails too. Tier decides where a feature belongs on
the page, so a promotion from C to A that the site ignores is the
application saying "this matters most" while the page buries it.

### What the rewrite is for

The reader has a checking account, a credit card, maybe a savings account.
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

Pull the ones the site uses into `public/screenshots/`. **The list comes from
`src/content/home.ts`**, the `name` of every shot it renders, rather than
being written out here:

```sh
shots() { grep -oE 'name: "[a-z-]+"' src/content/home.ts | cut -d'"' -f2 | sort -u; }
shots   # six today: budgets dashboard import payees reports transactions
for name in $(shots); do
  for theme in light dark; do
    curl -fsSL "https://raw.githubusercontent.com/$APP/$SHA/docs/product/screenshots/$name-$theme.webp" \
      -o "public/screenshots/$name-$theme.webp"
  done
done
```

A hand-written list is how `payees` was left out of this loop while the page
showed it, so a refresh would have updated five screens and left the sixth to
go stale with nothing to notice. The pattern is lowercase on purpose, which
is what keeps the product's own `name: "Simple Balance"` out of it; a name
that is not a screen in the kit fails `curl -f` loudly rather than being
skipped. A file in `public/screenshots/` whose name `home.ts` no longer uses
is deleted, with its `1200/` copy, because an unused screenshot is one that
goes stale unnoticed and `build:images` only ever adds.

Then regenerate the narrow copies, or the new picture ships at one size and
every phone gets the 1600px file, and rewrite `public/screenshots/CAPTURE.json`
so it names the capture the files came from and what each one weighs:

```sh
npm run build:images
node --input-type=module -e '
import fs from "node:fs";
import sharp from "sharp";
const kit = JSON.parse(fs.readFileSync("/tmp/shots.json", "utf8"));
const capture = JSON.parse(fs.readFileSync("public/screenshots/CAPTURE.json", "utf8"));
capture.capturedAt = kit.capturedAt;
capture.images = [];
for (const name of fs.readdirSync("public/screenshots").filter((f) => f.endsWith(".webp")).sort()) {
  const file = `public/screenshots/${name}`;
  const { width, height } = await sharp(file).metadata();
  capture.images.push({ file, kb: Math.round(fs.statSync(file).size / 1024), w: width, h: height });
}
fs.writeFileSync("public/screenshots/CAPTURE.json", JSON.stringify(capture, null, 2) + "\n");'
```

`/tmp/shots.json` is the kit's `screenshots.json`, fetched in §1. Nothing
writes `CAPTURE.json` but this step, and it is published beside the pictures,
so a pull that skips it leaves a record saying the old capture is what ships.

**Then open each new image and re-read its alt text against it.** This is the
step that gets skipped, and it has already cost three wrong descriptions: an
import shot described as a populated import when the capture is the empty drop
target, a hero described as showing two currencies when it shows one, and a
budgets shot described as a comparison when it is the form. Alt text is what a
reader who cannot see the picture gets instead of it, so a screenshot that
changes under its sentence is a silent lie. `web.md` 5.4.

The application captures **every** screen; this site ships the handful it
uses, because an unused screenshot is a file that goes stale unnoticed.
`docs/standards/web.md` 5 governs them once they are here — and **the alt
text describes what the picture shows**, so a changed screenshot means
re-reading the alt text in `src/content/home.ts`. It is the thing most likely
to be left behind.

## 5. Record where it came from

After any of §2 to §4, and on its own when provenance or a link was all §1
reported, write one source into both snapshots, from the commit §0 pinned:

```sh
node -e '
const fs = require("node:fs");
const [commit, ref] = process.argv.slice(1);
const fetched = new Date().toISOString().slice(0, 10);
for (const file of ["src/content/app-facts.json", "src/content/app-features.json"]) {
  const snap = JSON.parse(fs.readFileSync(file, "utf8"));
  snap.source = { ...snap.source, ref, commit, fetched };
  fs.writeFileSync(file, JSON.stringify(snap, null, 2) + "\n");
}' "$SHA" "$REF"
npx prettier --write src/content/app-facts.json src/content/app-features.json public/screenshots/CAPTURE.json
```

**One pull records one source, and this is the only step that writes it.**
The two snapshots once named two refs and two commits, one of them a branch
that had since been deleted, so "which version of the application does this
site describe" had no single answer. §2 used to write the facts snapshot's
source and nothing wrote the features snapshot's, which is how they came
apart; the script now reports that as "snapshots that disagree".
`prettier` runs because `JSON.stringify` puts every array element on its own
line, and `npm run format:check` refuses that layout for the short arrays
these files carry.

**Then accept the copy again**, even when §3 already did:

```sh
npm run copy:accept
```

It records the snapshot's commit as the pull the copy was checked against,
and §3 ran it before this step moved that commit, so without a second run
`src/content/copy-source.json` names the previous pull.
`tests/copy-provenance.test.ts` fails until the two agree.

**Then the links name that ref, every time, not only when it changed.**
Every link a reader can follow into the application's repository names the
snapshot's ref (`docs/standards/content.md` 2.5), so the pull that moves the
snapshots to `main` moves those links in the same commit, and a link that
named another ref before this pull is fixed in it too. Point each one the
test names at `$REF`, the footer's included, which are built from
`site.sourceUrl` and which a search for the URL would miss, and run it until
it names none:

```sh
npx vitest run tests/app-links.test.ts
```

Then run §1's script again. It should exit 0; if it does not, this pull is
not finished.

## 6. Look at it

```sh
npm run verify && npx serve out
```

Both themes, both widths. `design-review` if anything visual moved.

Then read the new copy **cold**, as somebody who has never seen the product.
Does the first screen say what this is? Would you know whether it is for you?

## 7. Finish

Say in the report: the ref and commit you pulled from, and when the ref came
from a pull request, which one (an `APP_REF` override says so instead);
whether the contract moved; which features were added, dropped or reworded;
which screenshots were refreshed; whether a brand token moved; the source
both snapshots now record, and which links were moved to it; and anything in
the application's list you deliberately left off the site.

Then **`merge-prep`**.
