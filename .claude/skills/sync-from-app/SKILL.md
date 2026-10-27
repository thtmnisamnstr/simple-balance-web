---
name: sync-from-app
description: Bring this site up to date with an application release. Pull the contract, feature list and screenshots from the ref scripts/check-app-sync.mjs resolves (main once it carries the kit, the open release pull request's branch until then), check the brand tokens against its stylesheet, read the release's changelog and source for behavior the kit does not carry, rewrite the features for a general reader, write and correct the docs from the release's code and then try to refute every claim, and bring the privacy policy and terms back to true. Lists, without rewriting, any learn guide whose steps name a label or message the release removed, or that shows a screenshot it refreshed. Ends by running merge-prep, so a release needs this skill and nothing after it; its docs section run alone stops before committing. Use when the app has shipped a change, before a launch, when asked whether the site or the docs still match the product, or when asked to document a feature or the whole app from its source.
---

# Bring the site up to date with the product

This site is subordinate to the application. It does not decide what the
product does, what it costs, or which screens exist — it says those things
**well**, to somebody who has never heard of double-entry bookkeeping.

The application publishes its contract, its feature list and its screenshots
at `docs/product/`, and its source says the rest:

|                 |                                                              |
| --------------- | ------------------------------------------------------------ |
| The application | `https://github.com/thtmnisamnstr/simple-balance`            |
| Read it from    | the ref `scripts/check-app-sync.mjs` resolves, at one commit |

This skill is the whole path from those to a deployed page, for every
surface here that describes the product:

| Surface                      | Where it lives               | Section                        |
| ---------------------------- | ---------------------------- | ------------------------------ |
| Prices, limits, plan names   | `src/content/app-facts.json` | §2                             |
| The homepage                 | `src/content/home.ts`        | §3, and §1's changelog read    |
| Pricing                      | `src/content/pricing.ts`     | §2, and §1's changelog read    |
| The screenshots              | `public/screenshots/`        | §4                             |
| The docs                     | `content/docs/`              | §5                             |
| The privacy policy and terms | `src/content/legal.ts`       | §6, through **`legal-review`** |
| Where all of it came from    | both snapshots               | §7                             |

**Not the blog, and not the learn guides.** A post is dated, and says what
was true the day it went out. A learn guide teaches a money job with any tool
before it reaches the product, so a release touches a step or two of it at
most, and rewriting those steps is a writing job, `write-content`'s, rather
than a sync's. They still have to be true (`docs/standards/content.md` 5.14),
so §1 lists each learn guide whose steps name a label or quote a message that
the application's code had at the last sync and has nowhere now, §4 adds each
one that shows a screenshot it refreshed, and the report carries that list
unedited. The one edit a sync makes under `content/learn/` is the alt text
under a screenshot §4 replaced, because the picture is the sync's.

**§5 is also the docs procedure on its own**, with no release to pull:
documenting a feature properly, covering the whole app, or answering whether
the docs are still right. Its first step says which commit to read then. Run
that way, it ends at its own checks (§5.9) and a report, and doesn't go on to
§9's hand-off: the pages are work in progress on somebody's branch, and
committing and pushing them is the owner's call, through `merge-prep`, when
the branch is ready.

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
cat > /tmp/app-sync.env <<'EOF'
APP=thtmnisamnstr/simple-balance
checked() { for field; do node -p "require('/tmp/app-sync.json').$field ?? ''"; done; }
kit() { for file; do curl -fsSL "https://raw.githubusercontent.com/$APP/$SHA/docs/product/$file"; done; }
tag() { for version; do git ls-remote "https://github.com/$APP" "refs/tags/v$version" "refs/tags/v$version^{}" | tail -n 1 | cut -f1; done; }
EOF
```

`APP_REF` overrides the choice of ref, and `GH_TOKEN` lifts GitHub's limit on
anonymous runs. Most runs need neither. **When one is needed, it goes in that
file, never in front of one command**, and again whenever the block above
rewrites the file. §1 and §7 run the script again, and a run without the
override resolves another ref than the one the snapshots are written from,
so §7's "it should exit 0" could never pass:

```sh
echo 'export APP_REF=<branch>' >> /tmp/app-sync.env
echo 'export GH_TOKEN=$(gh auth token)' >> /tmp/app-sync.env
```

The token's line is written unexpanded, in single quotes, so `gh` is asked
for it each time the file is sourced and the token itself never sits in
`/tmp`. Then resolve:

```sh
. /tmp/app-sync.env
node scripts/check-app-sync.mjs --json > /tmp/app-sync.json
for field in status ref why pullRequest commit note; do echo "$field: $(checked $field)"; done
```

**Nothing one Bash call defines reaches the next, which is why the names are
in a file.** The Bash tool starts every call in a fresh shell, so a variable
or a function set in one block is empty in the next, and empty is quiet. A
`kit` with no `$SHA` at least 404s, but §7's writer, handed an empty `$REF`
and `$SHA`, would have recorded both in the two snapshots without a word, and
its refusal now is a backstop rather than the defense. So every block below
that uses one of §0's names starts by sourcing `/tmp/app-sync.env`, a block
that needs a name of its own (`tokens`, `since`, `surface`, `moved`) defines
it in the call that uses it, and running a whole section as one script is
fine too.

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
  to prevent. Report the `note`, conclude nothing, and run it again; the
  `GH_TOKEN` line above lifts the anonymous limit.
- **`ref` is set and `status` is `unknown`.** It chose a ref and then could
  not read something, and `note` says which side: the application's kit or
  this site's own files. A failed check too. With `APP_REF` set, the
  note can instead say the override names a ref that does not carry the kit,
  and the fix is to delete the override's line from `/tmp/app-sync.env`.

Once it has resolved, pin the ref to one commit, and take what the site
describes now from the last commit:

```sh
. /tmp/app-sync.env
REF=$(checked ref)
SHA=$(checked commit)
[ -n "$SHA" ] || SHA=$(gh api "repos/$APP/commits/$REF" -q .sha)
snapshot() { for field; do git show HEAD:src/content/app-facts.json | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).$field"; done; }
FROM=$(snapshot facts.derived.appVersion)
OLD=$(snapshot source.commit)
TO=$(kit facts.json | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).derived.appVersion")
REL=$(tag "$TO"); [ -n "$REL" ] || { echo "no tag v$TO yet: Self-hosting reads $SHA too"; REL=$SHA; }
OLDREL=$(tag "$FROM"); [ -n "$OLDREL" ] || OLDREL=$OLD
printf '%s\n' "REF=$REF" "SHA=$SHA" "FROM=$FROM" "OLD=$OLD" "TO=$TO" "REL=$REL" "OLDREL=$OLDREL" >> /tmp/app-sync.env
echo "reading $APP@$REF at $SHA, version $TO, tagged at $REL; the site describes $FROM, read at $OLD, tagged at $OLDREL"
[ ${#SHA} -eq 40 ] && [ ${#OLD} -eq 40 ] && [ -n "$TO" ] || echo "a commit or the kit's version is missing: a failed check"
```

`$FROM` is the release the site describes and `$OLD` the commit it was read
at, and **both are read from the last commit, never from the working tree**,
because this pull overwrites both files: §2 writes the kit's version over the
first, and §7 writes `$SHA` over the second. This block used to read the
files, and said in prose that `git show HEAD:` had the old values, so a
second run late in a pull would set `$FROM` to the new version and `$OLD` to
`$SHA` without a word, and every changelog read, screen diff and learn sweep
after it would compare the release with itself and print its all-clear,
which is the quiet failure this section is about. It's also why nothing in a
sync commits: the one commit is `merge-prep` §13's, after the sync is done.

`$TO` is the version the kit gives `$SHA`. `$REL` is the commit the tag `v$TO`
names, the one the Self-hosting pages tell a reader to clone (§5.1), and
`$SHA` until that tag exists, while the release is still on its pull request;
`$OLDREL` is the same for `$FROM`, and `$OLD` when that had no tag. On the day
`main` is tagged, all of it is one commit.

Then fetch the application's source at each of those commits, by URL and
never from a checkout beside this one (`AGENTS.md`):

```sh
. /tmp/app-sync.env
for at in "$SHA" "$OLD" "$REL" "$OLDREL"; do
  [ -f "/tmp/app-$at/.fetched" ] && continue
  rm -rf "/tmp/app-$at" && mkdir -p "/tmp/app-$at" &&
    curl -fsSL "https://codeload.github.com/$APP/tar.gz/$at" | tar xz -C "/tmp/app-$at" --strip-components=1 &&
    touch "/tmp/app-$at/.fetched" || echo "could not fetch $APP at $at: a failed check"
done
```

`/tmp/app-$SHA` is the code being read, and `/tmp/app-$OLD` the code the site
was last brought up to date with; `/tmp/app-$REL` and `/tmp/app-$OLDREL` are
the same pair for the Self-hosting pages. Every sweep in §1, the screen diff,
the docs in §5 and the release diff in §6 read these trees and no others, so
nothing in one pull is checked against a different version of the code from
the rest. One directory per commit, because a commit's tree never changes: a
second run reuses it, and nothing from an older pull is left inside. The
`.fetched` mark is written only once an extraction finishes, so one cut off
half way is fetched again rather than read. When the snapshots already
record the commit being read, the two are one, fetched once, and so is a tag
that names one of them.

**Every helper takes its arguments with `for` or `"$@"`, never with a
positional parameter, and that is not style.** Claude Code replaces `$N`, a
dollar sign and a digit, anywhere in a skill's text with the words the skill
was invoked with, counting from zero, before anybody reads it, and that
includes the one inside an `awk` program. Invoked with a request whose second
word was "application", this skill arrived with
`kit() { … /docs/product/application; }` and `.application ?? ''` in
`checked()`, so every `kit` call fetched one path
that 404s and every field read as empty, which §0 itself says is the failed
check that looks like an empty result. `tests/skills.test.ts` refuses a
positional parameter in any skill now.

**Everything below reads that one commit**, apart from the Self-hosting
pages, which read its release's tag (§5.1). `commit` is the head the script
read when the ref is a pull request's; for `main` or an override it is empty,
and `gh api` pins the ref to the commit it is at now. Reading by commit
rather than by branch name means a push between two commands cannot mix two
versions of the kit, and it is the commit §7 records in both snapshots. Look
at the pull request itself:

```sh
. /tmp/app-sync.env
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
. /tmp/app-sync.env
node scripts/check-app-sync.mjs; echo "exit $?"
```

Sourced first, so an `APP_REF` override or a token from §0 reaches it.

That exits 0 in sync, 1 when something moved, and **2 when it could not
tell** — the third is distinct on purpose, because "the application has not
changed" and "I could not reach it" must never look alike. A 2 is either the
kit not being published anywhere yet or a failure to look, and §0 says how to
tell them apart.

**Eight things are checked, and the script's verdict covers five of them**:
the contract, the features, the screenshots, where the snapshots say they
came from, and which ref the site's links into the application name. The
brand tokens, what the release changed (its changelog, its labels, and any
screen it added), and which learn guides it touched are checked only here.
Run every check below whatever the script said: a check that is skipped
reports nothing, and nothing is what "in sync" looks like. The script names
what moved; these show what it moved to.

### The contract and the features

```sh
. /tmp/app-sync.env
kit facts.json > /tmp/facts.json
diff <(node -p "JSON.stringify(require('./src/content/app-facts.json').facts,null,2)") \
     <(node -p "JSON.stringify(require('/tmp/facts.json'),null,2)")

kit features.json > /tmp/features.json
diff <(node -p "JSON.stringify(require('./src/content/app-features.json').features,null,2)") \
     <(node -p "JSON.stringify(require('/tmp/features.json').features,null,2)")
```

### The screenshots

```sh
. /tmp/app-sync.env
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
. /tmp/app-sync.env
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
moved from one theme to the other would still be found. §8's look at both
themes is what would see that.

### Where the snapshots say they came from

```sh
node -p "['app-facts', 'app-features'].map((name) => { const { ref, commit } = require('./src/content/' + name + '.json').source; return name + ': ' + ref + ' at ' + commit; }).join('\n')"
```

Both lines name one ref and one commit, and that ref is `main` once `$REF` is.
The script reports either failure, as "snapshots that disagree" or "a
snapshot taken from an unmerged branch", and §7 is the fix for both. The
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
the same links to the ref it resolved, so once §7 has written that ref into
both snapshots the two ask the same question.

**A link can name another ref when nothing else has moved.** A page written
against `main` while the snapshots name the release branch is exactly that,
and the ref resolving the same way as last week does not fix it. So this runs
every time, and a link it names is §7's to fix whether or not the ref
changed.

### What the release changed that the kit does not carry

**The kit carries prices, plans, the feature list and pictures. It does not
carry behavior.** 0.2.1 moved the contract by its version number alone and
the feature list not at all, and still left this site out of step in four
ways: the pricing FAQ and both of the terms' downgrade paragraphs said a
frozen account accepts no changes, when it can now be archived or deleted;
Getting started and `docs/adsense.md` named 0.2.0 as the release the deploy
programs pin; the import page said "drop" where the app now says "delete";
and it listed the columns the importer suggests without the bank's
reference, which a person can now pick. Every check above passed on all of
it. The application's changelog said every one of them in a sentence.

**Whenever `$SHA` isn't `$OLD`, read what changed, whether or not the version
moved.** The reading starts at `$FROM`, which §0 read from the last commit, so
§2 writing the new version over it changes nothing here:

```sh
. /tmp/app-sync.env
echo "reading the application's changelog from $FROM to $TO, $OLD to $SHA"
since() {
  node -e '
const [from, heading = ""] = process.argv.slice(1);
const text = require("node:fs").readFileSync(0, "utf8");
const start = text.indexOf("\n## " + heading);
if (start < 0) throw new Error("no section headed ## " + heading);
const end = text.indexOf("\n## " + heading + from + (heading ? "\n" : " "));
console.log(text.slice(start, end < 0 ? undefined : end));' "$FROM" "$@"
}
since < "/tmp/app-$SHA/CHANGELOG.md"
since "Before you upgrade to " < "/tmp/app-$SHA/docs/upgrades.md"
if [ "$TO" = "$FROM" ] && [ "$SHA" != "$OLD" ]; then
  echo "the commit moved and the version didn't; new since $OLD:"
  diff <(since < "/tmp/app-$OLD/CHANGELOG.md") <(since < "/tmp/app-$SHA/CHANGELOG.md")
  diff -rq "/tmp/app-$OLD" "/tmp/app-$SHA" | sed -E 's|/tmp/app-[0-9a-f]+/||g' |
    grep -E '(^| )(src|deploy)(/|:)'
fi
```

That prints every section after the one the site describes, an `Unreleased`
one included when the ref is ahead of a release, and the upgrade note for each
release since.

**The commit can move without a release**, and once `main` carries the kit
that's most weeks: whatever merged since the tag sits under `Unreleased`, and
that section is all the first `since` prints. The `if` prints it again as
what's new since `$OLD`, beside every file under `src/` and `deploy/` that
changed, because a sync that pinned a commit past the tag has read the top of
that section already, and an entry is a lead to the code rather than all of
it. This used to be read only when the version moved, so code that merged
without one was never read and never recorded. **Each entry is applied or
deferred, and the report says which, with the reason.** Applied is the
default for anything app.smpl.money now does, on every page that follows
`$SHA` (§5.1). Deferred is for what only a copy somebody runs would show,
which waits for the tag the Self-hosting pages name, and for anything the
owner says app.smpl.money doesn't run yet. An entry that's neither is one
nobody decided. As this is written, `main` is three `Unreleased` fixes past
0.2.1, every one of them to the deploy programs under `deploy/pulumi/`, so
all three are deferred: the Self-hosting pages follow v0.2.1, and nothing a
reader of app.smpl.money sees has changed.

Take each entry under **Changed**, and each **Fixed** entry a person would
notice, and ask where this site states the old behavior:

- **`src/content/pricing.ts`**, for plans, downgrades, billing and canceling.
  The FAQ answers are where a plan's behavior is explained at length. Fixed
  here, in this pull, and `pricingUpdated` moves to the day, because it's the
  pricing page's date in the sitemap (`docs/standards/operations.md` 7.3).
- **`src/content/home.ts`, every section and every drawing's words**: the
  hero, the jobs, the proofs, the features, `agents` with its `sample`,
  `privacy.points` and `plans`, and the words in `heroArt` and
  `correctionArt`, for anything the entry changes about plans, data, import
  or the assistant. Fixed here, in this pull, and `homeUpdated` moves to the
  day for the same reason.
- **`src/content/legal.ts`**, for the same, and for anything about sign-in,
  cookies, mail, what is stored or who receives it. That's §6, through
  `legal-review`.
- **`content/docs/`**, for every procedure, limit, label and setting. §5 is
  how a page is corrected: from the release's code, then read by somebody
  trying to prove it wrong. A page changed there moves its `updated` date
  (`write-content` §2).
- **`content/learn/`**, whose last part in every guide, the one ending "in
  Simple Balance", walks a newcomer through the product by its buttons
  (`docs/standards/content.md` 5.14). A button renamed there is a step the
  reader least able to work around it can't follow. **Reported, not
  rewritten**: the learn sweep below lists each one.
- **`src/content/learn-art/*.ts`**, the words in the learn guides' pictures,
  because a diagram's label can name a screen or a button. Reported the same
  way.
- **`agents.tools` in `src/content/home.ts`**, the tool names the homepage's
  chat shows an assistant calling. They are real names on the application's
  MCP server, and the chat presents each as one that only reads, so a tool
  renamed or moved behind a wider scope turns the picture into something the
  product doesn't do (`docs/standards/content.md` 3.3).
- **The alt text**, which §4 already re-reads against the pictures.

Four sweeps do the part a search can, and a fifth, below, does the learn
guides. Each takes its names with `read`, `for` or `process.argv`, never a
positional parameter, for the reason §0 gives.

The first finds every sentence that names the release the site used to
describe. Each is either history ("from 0.2.0 on" is still true) or a claim
about the current release (now false), and `tests/app-facts.test.ts` holds
only the sentences that name the release the deploy programs pin, so the
rest is read here. A hit in a post is history by definition, and a hit in a
learn guide goes in the report with the learn sweep's:

```sh
. /tmp/app-sync.env
grep -rnF -- "$FROM" content src/content | grep -vE 'app-fea|app-fac|copy-source'
```

The second finds every bold phrase in the docs that the application's code
doesn't contain. Most are emphasis rather than a label, and dismissing them
takes a minute; a label the application renamed is the one that matters. All
of `src/client/`, `src/shared/` and `src/server/` is read: the account types
the docs name, **Credit card** and **Loan** among them, are spelled in the
shared code, and the reports' groups, **Between your own accounts** and
**Opening balances** among them, are named on the server, as is every
refusal a reader sees. The learn guides are left to the fifth sweep, which
reports what this release changed rather than every bold word:

```sh
. /tmp/app-sync.env
node -e '
const fs = require("node:fs");
const flat = (text) => text.replace(/\s+/g, " ");
const app = flat(fs.globSync(process.argv[1] + "/src/{client,shared,server}/**/*.{ts,tsx}")
  .map((file) => fs.readFileSync(file, "utf8")).join(" "));
const bold = new Set(fs.globSync("content/docs/*.md").flatMap((file) =>
  [...flat(fs.readFileSync(file, "utf8")).matchAll(/\*\*([^*]+)\*\*/g)].map(([, phrase]) => phrase.trim())));
const missing = [...bold].filter((phrase) =>
  /^[A-Z]/.test(phrase) && phrase.length <= 80 && !/[.:]$/.test(phrase) && !app.includes(phrase));
console.log(missing.sort().map((phrase) => "not in the app: " + phrase).join("\n") ||
  "every bold phrase is in the app");' "/tmp/app-$SHA"
```

**Whitespace is collapsed on both sides before anything is matched, and the
asterisks are paired before the length is checked.** This was a `grep`, line
by line, of phrases up to 40 characters, and it missed three kinds of label:
one Prettier had wrapped across two lines of Markdown, one the application's
JSX breaks across lines of its own with indentation in front, and one longer
than 40. **Carry what is left over into the next month**, on /docs/budgets/
three times, is the third kind, and no sync ever read it. A cap inside the
pattern does worse than miss a long phrase: the phrase fails to match, and
its closing asterisks pair with the next phrase's opening ones, so the label
after it isn't read either. The cap is now 80 characters, applied after
pairing, and past it a bold phrase is a sentence of emphasis. Proved on a
fixture with that label wrapped in both the page and the JSX: the sweep
names it when the JSX says something else, and prints its all-clear when the
JSX has it. At 0.2.1 it names that label for real, because the app builds
the last word from a constant, `next {unitNoun[periodUnit]}`, and §5.5 says
how to check one of those.

The third reads the names a reader types rather than clicks, which are in
code spans rather than bold, so the second can't see them: the environment
variables on /docs/configuration/ and the scopes on /docs/agents-and-mcp/. A
renamed variable is a copy that won't start, and a renamed scope is an
assistant that can't connect. Configuration is a Self-hosting page, so its
names are held to the release's tag, and the scopes to `$SHA` (§5.1):

```sh
. /tmp/app-sync.env
grep -ohE '`[A-Z][A-Z0-9_]{2,}`' content/docs/configuration.md | tr -d '`' | sort -u |
  while IFS= read -r name; do
    grep -rqF -- "$name" "/tmp/app-$REL/src" "/tmp/app-$REL/deploy" || echo "not in the release: $name"
  done
grep -ohE '`[a-z]+:[a-z]+`' content/docs/agents-and-mcp.md | tr -d '`' | sort -u |
  while IFS= read -r name; do
    grep -rqF -- "$name" "/tmp/app-$SHA/src" || echo "not in the app: $name"
  done
```

At 0.2.1 it prints three names, all of them right: `SMTP_PASSWORD_FILE`,
`STRIPE_SECRET_KEY_FILE` and `STRIPE_WEBHOOK_SECRET_FILE`. The application
builds a `_FILE` name at runtime from the list in its
`src/server/config-files.ts`, so one of those is right when the name without
`_FILE` is on that list.

The fourth holds the homepage chat's tool names to the release's MCP server,
whose `TOOL_SCOPES` map names each tool beside the scope it needs. The map is
the application's second copy of its registration blocks, and its own tests
hold the two together, so it's the line to read:

```sh
. /tmp/app-sync.env
grep -oE '^ *tools: \[[^]]*\]' src/content/home.ts | grep -oE '"[a-z_]+"' | tr -d '"' |
  while IFS= read -r tool; do
    grep -qF -- "[\"$tool\", \"ledger:read\"]" "/tmp/app-$SHA/src/server/mcp.ts" &&
      echo "read-only: $tool" || echo "renamed, gone or not read-only: $tool"
  done
```

Every line should say read-only.

**Check a changelog sentence against the code before rewriting from it.** The
changelog is written by the same hands as the code and is usually right, but
the site's sentence has to be true of what shipped, so read the function the
entry names in `/tmp/app-$SHA`. 0.2.1's "a frozen account can be deleted" is
true only of a frozen account with nothing on it, as it is of any account,
and that is why the terms say "like any other".

### When a release adds a screen

**The changelog read finds sentences this site made false. It can't find
what this site never said.** A release that adds a page, a settings tab, an
email, an assistant tool or a setting leaves every sentence here true and
the docs one screen short, and nothing above reports it. Every screen the
application had at 0.2.1 has a docs page (`docs/roadmap.md` 4), and this is
what keeps that true.

List what a person can reach in each of §0's trees, and diff them, once for
what app.smpl.money runs and once for what a copy somebody runs has. They
are commits rather than release tags, so a release still on its pull
request, which has no tag yet, diffs the same way as one that's merged:

```sh
. /tmp/app-sync.env
surface() {
  for root; do
    ls "$root/src/client/pages"
    grep -rhoE 'path="/[^"]*"|href: "/settings[^"]*"' "$root/src/client"
    grep -oE '^export function [A-Za-z]+Message' "$root/src/server/mail.ts"
    grep -oE '^  \["[a-z_]+", "ledger:[a-z]+"\]' "$root/src/server/mcp.ts"
    grep -oE 'env\.[A-Z][A-Z0-9_]+|readSecret\("[A-Z][A-Z0-9_]+"\)' "$root/src/server/config.ts" |
      sed -E 's/readSecret\("([A-Z0-9_]+)"\)/env.\1/' | sort -u
  done | sort
}
echo "app.smpl.money, $OLD to $SHA:"; diff <(surface "/tmp/app-$OLD") <(surface "/tmp/app-$SHA")
echo "a copy you run yourself, $OLDREL to $REL:"; diff <(surface "/tmp/app-$OLDREL") <(surface "/tmp/app-$REL")
```

That is the page components, the routes wherever the client declares them
(`src/client/App.tsx` at 0.2.1; `src/client/router.tsx` is the router that
reads them, not the list), the settings tabs (the `href:` list in
`src/client/components.tsx`), each email `mail.ts` builds, each assistant
tool with the scope it needs, and each setting `src/server/config.ts` reads,
as `env.` and its name whether it's read from the environment or as a secret
through `readSecret`. **The routes are matched by `path="/`, not by
`<Route path=`**, because a route whose element is long is written over
several lines: at 0.2.1 `/settings/plan` is one, with its `<Route` and its
`path=` on different lines, and the shorter pattern never saw it. Read the
changelog's **Added** beside the diff, because a screen can also arrive
inside a page that already existed, as a new dialog, section or bulk action,
and no list of names shows that.

**Every line the diff adds gets a docs page or a section of one, or a reason
in the report.** A new route or page component is usually a page of its own;
a settings tab, an email or a tool is usually a section of the page that
covers its neighbors; and **a setting is a row on /docs/configuration/**.
Until the settings were in this list nothing reported one, and a new
variable would have reached every copy somebody runs with no row saying what
it does. Configuration is a Self-hosting page, so the second diff's settings
are the ones it takes; one only the first diff prints is merged and not yet
tagged, and waits, deferred in the report. The writing is §5, in this pull:
from the release's code, then refuted against it. The pictures, a docs mark
or a group picture, are `draw-and-animate`'s. A line the diff removes is a
page or a section here describing something that's gone, which is the
changelog read's kind of finding and is fixed the same way.

### The learn guides it touched, reported rather than rewritten

A sync doesn't rewrite a learn guide, and it doesn't leave one wrong without
saying so. List every guide whose product part names a label or quotes a
message that the application's code had at `$OLD` and has nowhere at `$SHA`,
and every word in the guides' pictures that went the same way:

```sh
. /tmp/app-sync.env
node -e '
const fs = require("node:fs");
const flat = (text) => text.replace(/\s+/g, " ");
const [before, after] = process.argv.slice(1).map((root) =>
  flat(fs.globSync(root + "/src/{client,shared,server}/**/*.{ts,tsx}").map((file) => fs.readFileSync(file, "utf8")).join(" ")));
const product = (text) => {
  const from = text.search(/^## .*in Simple Balance *$/m);
  if (from < 0) return "";
  const rest = text.slice(from + 3);
  const to = rest.search(/^## /m);
  return to < 0 ? rest : rest.slice(0, to);
};
const named = [
  ...fs.globSync("content/learn/*.md").flatMap((file) =>
    [...flat(product(fs.readFileSync(file, "utf8"))).matchAll(/\*\*([^*]+)\*\*|(=?)"([^"]+)"/g)]
      .flatMap(([, bold, attribute, quoted]) =>
        bold ? [[file, bold.trim(), 2]] : attribute ? [] : [[file, quoted.trim(), 3]])),
  ...fs.globSync("src/content/learn-art/*.ts").flatMap((file) =>
    [...flat(fs.readFileSync(file, "utf8")).matchAll(/"([^"]+)"/g)].map(([, quoted]) => [file, quoted, 3])),
];
const changed = named.filter(([, name, least]) =>
  name.length >= least && name.length <= 80 && before.includes(name) && !after.includes(name));
console.log(changed.length ? changed.map(([file, name]) => file + ": " + name).join("\n")
  : "no learn guide names anything this release removed");' "/tmp/app-$OLD" "/tmp/app-$SHA"
```

**Both conditions, because each alone is noise.** A phrase the code never
had is emphasis, or a mistake older than this release, and a string still
somewhere in the code wasn't removed by it. A step names a label in bold and
quotes a message, so those are what's read, from the heading ending "in
Simple Balance" to the next one, which is `## Sources`; a quoted value after
an `=` is a component's attribute and is skipped. The server is read as well
as the client and the shared code, because a refusal a step quotes is the
server's. Whitespace is collapsed and the pairs found before the length is
checked, for the reasons the label sweep above gives: the version this
replaced matched line by line with a cap inside the pattern, so a label
Prettier had wrapped was never read, and the asterisks after it paired with
the wrong ones. Proved between 0.2.0 and 0.2.1: with **New recurrence**,
which 0.2.1 no longer has, put into a guide's steps wrapped across two
lines, the sweep named that guide, and without it, it printed its all-clear.

**What it proves is narrower than "every guide the release touched".** It
names a guide that quotes words the code had at `$OLD` and has nowhere at
`$SHA`. A label renamed on one screen and still spelled the old way anywhere
else in the code, a comment included, isn't named, and neither is a step
that still reads right and now leads somewhere else; the changelog read
above is what catches those, and a guide it implicates goes in the same
list. Nor does it look at the pictures: §4 adds every guide that shows a
screenshot it refreshed, because the steps around it now sit under a new
picture.

**Report each line, and edit none of them.** The report names the guide, the
words, and what the application says now where its changelog or code makes
that plain. The fix is `write-content`'s, in its own pull or this one, and
the owner decides which. Most releases print the all-clear.

### When to stop

Only when all of these hold:

- `node scripts/check-app-sync.mjs` exits 0. Nothing below overrides it: a 1
  is work to do, and a 2 is a check that failed, however quiet the rest is.
- The two diffs print nothing, and the screenshot loop names no file.
- The token check prints `--art-ink` and nothing else.
- Both snapshots name the same ref and commit, and `main` once `$REF` is.
- `tests/app-links.test.ts` passes, so every link names that ref too.
- The snapshot's commit is `$SHA`, so there is nothing new to read; or every
  entry since `$FROM` has been read against the places listed above, and the
  version grep names nothing that claims the old release is current.
- When the commit moved without a release, its `Unreleased` entries were
  read, and each was either applied or deferred, with the reason.
- The tool sweep prints read-only for every tool, and the name sweep prints
  nothing but `_FILE` names whose name without `_FILE` is on the list in the
  release's `src/server/config-files.ts`, which at 0.2.1 is the three above.
  These used to count only through the changelog bullet, so a tool renamed
  or moved behind a wider scope in a commit that didn't move the version
  stopped nothing.
- Every phrase the label sweep prints is emphasis rather than a label, or a
  label the app builds from a constant whose fixed parts are in its code
  (§5.5).
- Every route, page, settings tab, email, tool and setting the screen diffs
  added is covered by a docs page or a section of one, or is named in the
  report with the reason it isn't.
- The learn sweep prints its all-clear, or every guide it names is in the
  report.

Then the product has not changed in any way a reader could see, and
`tests/app-facts.test.ts` already proves this site agrees with its snapshot
on every build. The one other way a run ends is §0's, when no ref carries the
kit, and the report says that rather than calling the site in sync.

Otherwise the contract is §2, the features §3, the screenshots §4, the docs
§5 and the privacy policy and terms §6, and §7 records where they came from.
A sentence the changelog made false is fixed where it lives, in the same
pull: in pricing or on the homepage directly, on a docs page through §5, and
in the terms or the policy through §6. A link naming another ref is §7, on
its own if need be: point it at the ref §0 resolved, which is the one §7
records in both snapshots (`docs/standards/content.md` 2.5). A moved token is
the `brand.css` edit above, followed by §8 to look at it in both themes. A
new screen or setting is §5's, in the same pull. A learn guide the sweep
names is the report's.

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

That writes the kit's version over `facts.derived.appVersion`, which is where
§1's changelog read starts, and is why §0 reads `$FROM` from the last commit
rather than from this file. The snapshot's `source` block is §7's, which
writes it for both snapshots at once.

**Three places read the prices from the snapshot, not one**, so they move
with it and need no edit: the pages, the structured data's `offers`
(`tests/structured-data.test.ts`), and `/llms.txt`'s summary. The social card
draws its price line from it too, but it's a committed picture, so **run
`npm run build:images`** after the snapshot moves. Their dates don't move
with it, though: a price or a limit that changed changes what the pricing
page and the homepage's plans say, so `pricingUpdated` and `homeUpdated`
move to the day, though no word in their files did
(`docs/standards/operations.md` 7.3).

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
file's `$comment` and `source` and takes everything else from the pull; §7
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

**A rewrite moves `homeUpdated` to the day.** It's the homepage's date in the
sitemap (`docs/standards/operations.md` 7.3), and words that changed under
an old date are the inconsistency that makes Google ignore every date there.
An acceptance that left the page alone moves nothing.

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

**Three passes, in this order, and do not merge them.** Each one is looking
for something the previous pass cannot see, and running them together is how
a sentence gets fixed for one fault and left broken for another.

#### Pass 1: the tells

The obvious ones are a word list and `tests/copy.test.ts` has them. These are
the ones a word list cannot catch, and every one of them shipped on this site
at some point:

- **Meta-headings.** "Four money problems, and what this does about them" and
  "The two pages you will use most" describe the section's own structure
  instead of saying anything in it. An outline generator narrating itself.
- **Coy feature names.** "One trip, counted as two things", "The things you
  type over and over", "What you don't spend stays there". Each is a riddle
  whose answer is a word the reader already knows: split, template, budget.
  Making the copywriter visible is the cost, and the reader doing the
  decoding is the price.
- **Performative authenticity.** "Questions people actually ask" insists the
  copy is human rather than being it. "Questions about pricing" is more human
  precisely because it does not advertise that it is.
- **Forced colloquialism.** "If you outgrow Free or hate ads", "it's your
  computer", "sometimes you can just ask". A formal writer inserting
  casualness reads as a formal writer inserting casualness.
- **Over-symmetry.** Six cards whose bodies are all two sentences of the same
  shape. Let each one take the length it needs.
- **Pronoun chains.** "That one", "the one", "this one" three sentences
  running. Repeat the noun.
- **Defensive explanation before anybody objected.** Answering an edge case
  in the top-level copy gives the page an anxious, lawyerly feel even when
  every sentence is plain. The rule goes on the page; the state machine goes
  in the FAQ or the docs.
- **No throat-clearing.** "It's worth noting that", "In today's world",
  "Whether you're a X or a Y".
- **No tricolons.** "Simple, powerful, and secure" is the rhythm of a machine
  trying to sound confident.

#### Pass 2: the rhythm

- **Read it aloud.** If you run out of breath, it is too long. If it sounds
  like a brochure, it is a brochure.
- **Vary the sentence length.** Three medium sentences in a row is the
  clearest tell there is. Let one be four words.
- **Count the fragments.** "Checking, savings, credit cards, cash. They all
  sit on one page. Wonder where a number came from? Open it up." is four
  beats in a row — a fragment, a short sentence, a rhetorical question and an
  imperative — and it was the homepage's lede for a release. Plain language
  is not the same as deliberately short language, and this is the difference.
- **One idea per sentence**, but not one sentence per idea. Joining two
  related clauses is what stops prose being choppy, and a colon will carry
  three parallel options that would otherwise be three stub sentences.

#### Pass 3: would somebody say this

- **Second person, present tense.** "You upload the file your bank gives
  you", not "Users can upload bank-provided files".
- **Name the concrete thing.** "The annual subscription you forgot about",
  not "unexpected recurring charges".
- **Don't hide a familiar noun to avoid sounding like other software.**
  Budget, transaction, split, template, import and report are useful words. A
  reader should not have to solve anything to find out the product splits a
  transaction.
- **Let it be plain.** A sentence with nothing clever in it is fine. Most of
  them should be.

`docs/standards/content.md` 1 is Binding over all of this — the banned
vocabulary, the vocabulary a reader has not met, and the sentence that implies
a bank connection — and `tests/copy.test.ts` enforces what a test can.
**2.1 is the one that matters most:** every claim has to be true of the
shipped application, and the feature list is what makes that checkable.

Everything in the three passes above is `human`. A sentence can satisfy every
test in the repository and still be the thing this section is about: the AI
section's body read "One that's only allowed to suggest lines entries up for
you to approve" for a release, which is a mangled sentence with no banned
word, no British spelling and no em dash in it.

### What goes where

- **Tier A** → the hero and the proof section. Four things, and they carry
  the page.
- **The jobs are not a tier.** They are what a reader came to do, from the
  search read behind the learn articles, each linking its guide
  (`docs/standards/content.md` 3.2), and each one's `covers` names the
  features it rests on. A release that renames or drops one of those
  features is a release that may change a job's sentence, and a job whose
  feature is gone is a card to take down, not reword.
- **Tier B** → the feature grid, and whichever tier B entries are the
  _evidence_ for a tier A claim belong in the proof section beside it. The
  running balance and the correction history are the proof that a figure can
  be followed back, so they sit in the proof cards rather than in the grid,
  even though the application ranks them B.
- **Tier C** → mostly not on the homepage at all. It is documentation
  material, and putting it on a landing page is how a landing page becomes a
  changelog. The exceptions are the ones that answer a question a reader
  arrives with: splits, bulk edits and templates are each one card.

Dropping a feature from the site is a decision, not an oversight; the site is
allowed to say less than the product does. **Saying more is not allowed.**

## 4. The screenshots

```sh
. /tmp/app-sync.env
kit screenshots.json | node -p "JSON.parse(require('fs').readFileSync(0)).screens.join(' ')"
```

Pull the ones the site uses into `public/screenshots/`. **The list comes from
`src/content/home.ts`, the docs and the learn guides**, the `name` of every
shot any of them renders, rather than being written out here:

```sh
. /tmp/app-sync.env
shots() {
  { grep -oE 'name: "[a-z-]+"' src/content/home.ts
    grep -rhoE '^ *name="[a-z-]+"' content/docs content/learn; } | cut -d'"' -f2 | sort -u
}
shots   # every screen the homepage, the docs and the learn guides show
for name in $(shots); do
  for theme in light dark; do
    curl -fsSL "https://raw.githubusercontent.com/$APP/$SHA/docs/product/screenshots/$name-$theme.webp" \
      -o "public/screenshots/$name-$theme.webp"
  done
done
```

A hand-written list is how `payees` was left out of this loop while the page
showed it, so a refresh would have updated five screens and left the sixth to
go stale with nothing to notice. The docs and the learn guides show most of
the application's screens through `<Shot name="…">`, and a list read from the
homepage alone would delete a picture a page still shows the day the homepage
stopped using it; `tests/learn.test.ts` fails on that, but only after the
deletion, and it also fails on a screenshot nothing names. The pattern is
lowercase on purpose, which is what keeps the product's own
`name: "Simple Balance"` out of it; a name that is not a screen in the kit
fails `curl -f` loudly rather than being skipped. A file in
`public/screenshots/` whose name neither `home.ts` nor a Markdown page uses
any more is deleted, with its `1200/` copy, because an unused screenshot is
one that goes stale unnoticed and `build:images` never deletes
(`docs/standards/operations.md` 7.1).

**Not the blog.** A post's picture is part of what was true the day it went
out, like its words, and a sync leaves posts alone. This list read all of
`content/` once, so a screenshot in a dated post would have been swapped for
this release's. A screenshot only a post shows is left as it is and isn't
deleted, since a post is a Markdown page that uses it; one a post shares with
a page is one file and moves with the page.

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

**One picture has many sentences.** A screenshot can be on the homepage,
several docs pages and several guides, each with its own alt text, and
reading only `src/content/home.ts` leaves the rest describing the old
picture. List every use of each name this pull refreshed and read each alt
against the new image:

```sh
for shot in $(git status --porcelain -- public/screenshots | grep -oE '[a-z-]+-(light|dark)\.webp$' |
  sed -E 's/-(light|dark)\.webp$//' | sort -u); do
  grep -rnE -A3 "name(=|: )\"$shot\"" content/docs content/learn src/content/home.ts
done
```

The names are the pictures this pull changed, read from `git status` rather
than typed, for the reason the list above is read rather than typed. The
pattern takes both spellings, `name="…"` in Markdown and `name: "…"` in
`home.ts`, because a search for one spelling misses every use written the
other way. A learn guide's alt text is the one thing in `content/learn/` a
sync does fix, because the picture under it is the sync's. **The steps
around it aren't**, and they now sit under a new picture, so every learn
guide this prints goes in the report beside the learn sweep's, for
`write-content` to read against the new screen.

The application captures **every** screen; this site ships the handful it
uses, because an unused screenshot is a file that goes stale unnoticed.
`docs/standards/web.md` 5 governs them once they are here.

## 5. The docs

The docs describe a product this repository can't run, at a release it didn't
write. Every page under `content/docs/` was checked against the application's
source at 0.2.1, and the checking kept finding what the writing had missed.
`CHANGELOG.md` records the configuration page giving a failed payment a
seven-day grace period against the app's 15, and five pages that disagreed
with the app or with each other, one of them about whether a free account's
three usable accounts can be chosen more than once. That's what a page
written from anything but the code collects: a neighboring page's figure, an
older release's behavior, or the app's own guide where it has drifted from
the code.

`docs/standards/content.md` 2.7 is the rule, and this is the procedure. It
runs:

- in a sync, for every changelog entry §1 traced to a docs page, and every
  line the screen diff added or removed;
- on its own, when asked to document a feature properly, cover the whole app,
  or say whether the docs are still right;
- for a learn guide's "in Simple Balance" part when `write-content` writes or
  fixes one. That part is held to the same standard and checked by §5.5 to
  §5.7; a sync only reports those guides (§1).

One page's frontmatter and wiring are `write-content` §3, "A docs page". That
section is how a page is built; this one is how its claims are made true.

### 5.1 Pin the source

**Which commit a page is written from depends on who runs the program it
describes.** Until this was written down, every page followed `$SHA`, while
the Self-hosting pages tell a reader to clone a release tag. `main` is ahead
of v0.2.1 as this is written, with changes to the deploy programs in it, so
a sync would have had those pages describe programs nobody on the release
runs.

- **Every page outside Self-hosting follows the commit app.smpl.money
  runs**, which is `$SHA`, the commit §0 pinned, unless the owner says
  otherwise. If you aren't sure the cloud runs it, as when `$REF` is a pull
  request's branch, ask before writing. It's the tree every sweep in §1
  checked, and §7 records it in both snapshots, so these pages are written
  from the code the site will say it describes. Not from the release tag:
  `main` sits ahead of its tag whenever something merged since, and a
  release still on its pull request has no tag yet.
- **The Self-hosting pages follow the tag they tell a reader to clone**, `v`
  and `facts.derived.appVersion`, which is the program a reader running
  their own copy has, whose image the deploy programs pin, and which
  `tests/app-facts.test.ts` holds the `--branch v` in their clone command
  to. That's `$REL`, read at `/tmp/app-$REL`, with `/tmp/app-$OLDREL` as
  what they described before. A note "On a copy you run yourself" on any
  other page is for the same reader and follows the same tag. Until the tag
  exists, while the release is still on its pull request, `$REL` is `$SHA`,
  the commit it'll be cut from, and the report says so.

When the two are one commit, as on the day `main` is tagged, none of this
matters. When they aren't, a change merged since the tag goes on the cloud
pages now and waits for the release on the Self-hosting ones, and §1's
changelog read records it as deferred there.

**On its own**, with no sync, read the commit the snapshots already record,
which is the code the site describes now, and its tag. Write it as both
ends, so every block here reads the same names it reads in a sync:

```sh
OLD=$(node -p "require('./src/content/app-facts.json').source.commit")
FROM=$(node -p "require('./src/content/app-facts.json').facts.derived.appVersion")
REL=$(git ls-remote "https://github.com/thtmnisamnstr/simple-balance" "refs/tags/v$FROM" "refs/tags/v$FROM^{}" | tail -n 1 | cut -f1)
[ -n "$REL" ] || REL=$OLD
printf '%s\n' "APP=thtmnisamnstr/simple-balance" "SHA=$OLD" "OLD=$OLD" "FROM=$FROM" "TO=$FROM" \
  "REL=$REL" "OLDREL=$REL" > /tmp/app-sync.env
```

**Never in the middle of a sync**: that line replaces `/tmp/app-sync.env`, and
every name the sync pinned with it. Then run §0's block that fetches the
source, which finds one or two commits here, the snapshot's and its tag's,
and fetches each once. Codeload serves a commit by its hash whichever ref it
was read from, a merged pull request's head included. A failed `curl` is a
failed check, not a reason to fall back to another ref, and the report names
the commit read and the release it belongs to.

**The code wins.** The application's own `docs/how-to.md`, `docs/guide.md` and
`docs/mcp.md` are a map of where to look, not the truth. Where one disagrees
with the code, the page here says what the code does, and §5.8 tells the
owner.

### 5.2 Inventory what a person can see or do

For the whole app, list it from the source rather than from the docs that
exist:

- **Screens.** The routes in `src/client/App.tsx` (the router itself is
  `src/client/router.tsx`, and holds no routes), and every file in
  `src/client/pages/`: each page's tabs, fields, options, menus, bulk actions,
  empty states, and every message a refusal shows. Labels also live in the
  pieces the pages share (`src/client/TransactionBrowser.tsx`,
  `src/client/forms.tsx`, `src/client/bulk-edit.tsx`,
  `src/client/components.tsx`): **Save as template** is in two of them as
  well as on two pages, and the settings tabs are in the last.
- **Email.** `src/server/mail.ts`, one function per message, each with its
  subject.
- **The assistant connection.** Every tool `src/server/mcp.ts` registers, and
  the scope it needs, which is the `if` block it's registered inside
  (`ledger:read`, then `ledger:stage` or `ledger:write`).
- **Limits.** The `MAX_` constants in `src/shared/domain.ts` and
  `src/server/config-limits.ts`, and the server code that refuses past each
  one, which is where the message a reader sees comes from.
- **Plans, billing, import, export and deletion.** `src/server/services/`
  (`billing.ts`, `import-export.ts`, `staging.ts`, `account-deletion.ts`),
  `src/server/stripe.ts` and `src/client/pages/PlanPage.tsx`.

```sh
. /tmp/app-sync.env
SRC=/tmp/app-$SHA
grep -nE 'path="/' "$SRC/src/client/App.tsx"
ls "$SRC/src/client/pages"
grep -n 'subject:' "$SRC/src/server/mail.ts"
grep -A1 'registerTool($' "$SRC/src/server/mcp.ts" | grep -oE '^ *"[a-z_]+"' | tr -d ' "'
grep -n 'export const MAX_' "$SRC/src/shared/domain.ts" "$SRC/src/server/config-limits.ts"
```

The routes by `path="/` for the reason §1's screen diff gives: a route
written over several lines has its `path=` on a line of its own. The
Self-hosting pages' inventory is `deploy/` and the settings
`src/server/config.ts` reads, at `/tmp/app-$REL` (§5.1).

**For a release**, the inventory is what moved: the lines §1's screen diffs
printed, and every file under `src/` and `deploy/` that changed between §0's
trees, once for each kind of page:

```sh
. /tmp/app-sync.env
moved() {
  diff -rq "$@" | sed -E 's|/tmp/app-[0-9a-f]+/||g' |
    grep -E '(^| )(src|deploy)(/|:)' | grep -vE '\.test\.|/tests?/'
}
echo "every page outside Self-hosting, $OLD to $SHA:"; moved "/tmp/app-$OLD" "/tmp/app-$SHA"
echo "Self-hosting, $OLDREL to $REL:"; moved "/tmp/app-$OLDREL" "/tmp/app-$REL"
```

**All of `src/` and `deploy/`, not a list of files in them.** The filter this
replaced named the client, the shared code and a handful of server files, so
a refusal message, a setting or a route added anywhere else on the server
passed it, and its bare `deploy` matched any path with the word in it. The
pieces the pages share hold labels, the settings tabs among them; the server
holds every limit, refusal and setting; and the Self-hosting pages are
written from `deploy/`, the deploy programs and everything under it. The
application's tests are left out: they live in its `tests/`, outside both,
and the last `grep` drops any that turn up inside. A `deploy/` line in the
first list is the Self-hosting pages' business, and waits for the second.
Then read the changelog's **Added** and **Changed** between the two, which
§1 printed, and treat each entry as a lead to the code rather than as the
fact.

### 5.3 Map it

Make a table before writing a word: each capability, the page that covers
it, and its status.

| Capability                               | Page              | Status                                       |
| ---------------------------------------- | ----------------- | -------------------------------------------- |
| Save a transaction as a template         | /docs/templates/  | covered                                      |
| Each tab, field, menu item and message … | the page, or none | covered, named but not explained, or missing |

Search the docs for each screen's labels to fill the middle column:
`grep -rlF -- "<label>" content/docs`. A capability left undocumented on
purpose gets its reason in the report, never silence.

Then plan the pages. Cloud first, because the docs are written for somebody
using app.smpl.money, with a self-hosted difference in a note titled "On a
copy you run yourself" only where the behavior differs (`content.md` 5.18).
A new page goes in a group in `content/docs/_sections.json`'s order, and a
new group is three changes (`content.md` 5.5).

### 5.4 Write

With the source file open, not this site's other pages: a neighbor's
sentence is how a wrong figure spreads (`content.md` 2.7). The shape is
`content.md` 5.17, which `write-content` §3 builds a page to, with
`content/docs/recurring-transactions.md` as the worked example; the words are
`content.md` 1.6's, and the reader is 1.3's outside Self-hosting. What
writing from the source adds to those:

- **A label is copied from the source file**, case and punctuation included,
  not from a screenshot or the app's own docs, and set in bold. §1's label
  sweep holds each bold phrase in the docs that starts with a capital and is
  short enough to be a label, wrapped or not, to the application's code, so
  a label that isn't bold is a label nothing checks.
- **A quoted message is copied from the source string**, character for
  character, contracted or not. It's the app's sentence, and no spelling or
  contraction pass here touches it.
- **A limit is the server's**: the constant, the refusal past it and the
  message the refusal shows, stated on /docs/limits/ as well as on the
  feature's page.
- **A screenshot comes from the published set** in `public/screenshots/`,
  with alt text written while looking at the picture (`web.md` 5.4).

A docs page lives under the existing `[slug]` route, so its metadata, its card
entry and its sitemap line come from the route, and `write-content` §3 lists
what a new page needs beside its Markdown (a mark, group words, a card).
Anything that needs a route of its own is `code/next.md` 1.2's checklist, with
every metadata block taken from its helper (`code/next.md` 1.1).

### 5.5 List the claims

For every page written or changed, make a table of what it claims, with the
line each claim is on: every bold label, quoted message and number, every
order of steps, and every "can", "can't", "only", "every" and "never". Beside
each, write the application's file and line that makes it true.

| Page and line | Claim                                                                             | Source at the commit                                                    |
| ------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| limits, 54    | At most 200 templates                                                             | `MAX_TRANSACTION_TEMPLATES`, src/shared/domain.ts line 783              |
| limits, 54    | Past it: "You can keep 200 templates. Delete one you no longer use to make room." | the refusal, src/server/services/transaction-templates.ts lines 763–765 |

Those two are real, from /docs/limits/ against 0.2.1, and both line numbers
will move. This finds most of the candidates on a page, noisily:

```sh
. /tmp/app-sync.env
grep -nE "\*\*|[0-9]|\"|\bcan('t)?\b|\bcannot\b|\bwon't\b|\bnever\b|\bonly\b|\bevery\b" content/docs/<page>.md
grep -rnF -- "<label or message>" "/tmp/app-$SHA/src"
```

On a Self-hosting page, search `/tmp/app-$REL` instead (§5.1).

**A message the app builds from a constant isn't in its source as one
string**, and the example above is one: the 200 is
`MAX_TRANSACTION_TEMPLATES`, put into the sentence where the refusal is
built, so a search for the whole sentence finds nothing and a true claim
looks unsupported. Search a fixed fragment on either side of every number or
noun the app fills in, `You can keep ` and
` templates. Delete one you no longer use to make room.`, and record the
constant as the source of the number. A label works the same way: **Carry
what is left over into the next month** is `Carry what is left over into the
next ` and a budget period's name from `unitNoun`.

**A claim with no line is wrong until shown otherwise.** Either find the line,
or cut the claim, or rewrite it to what the line you did find says.

### 5.6 Refute

Hand the pages and the source to a second reader in a fresh context: a
subagent given the pages, the source directory `/tmp/app-$SHA` and its
commit (`/tmp/app-$REL` and its commit, for a Self-hosting page), and **not**
the brief, the plan or the claims table, because a reader who knows what the
page meant to say reads that into it. Tell it to find what's false:

> These are pages of documentation for the application whose source is in
> <directory>, at commit <commit>. Find every sentence that is false of this
> code, or true only in a case the page doesn't name. For each, quote the
> sentence with its file and line, and the code that contradicts it with its
> file and line. Ignore style.

**Settle every finding against the code before acting on it.** A reviewer is
wrong often enough that its fix can make a true page false, and a finding
with no line on the code's side is a question, not a correction. Keep the
rejected findings with the line that rejects each: `merge-prep` §13's commit
body owes them (`docs/standards/writing.md` §Commit messages).

### 5.7 Reconcile

Pages that are each true can still disagree, because two of them describe the
same thing from different screens.

- **The same limit, default or label agrees everywhere it's stated.** The
  pairs to read side by side: /docs/limits/ against each feature page,
  templates against recurring, importing against staged, accounts against
  your account and plan, and configuration against every page that describes
  an email.
- **Search by the subject, not the figure.** The page that disagrees states a
  different figure, so a search for the right one finds only the pages that
  are right. `grep -rniE 'payment.{0,20}fail' content src/content` finds
  every page that says what happens when a renewal fails, whatever number
  each one gives, and that's the search that sets a seven beside a 15.
- **The docs agree with the rest of the site**: `src/content/pricing.ts`
  (plans, the free account limit, a downgrade), `src/content/legal.ts`
  (retention, deletion, email, what an assistant can reach, and §6 reads
  those two side by side) and `src/content/home.ts`.
- **Every link names its target's current title, and every link with an
  `#anchor` reaches both its page and its heading.** `scripts/check-links.mjs`
  reads both. Until October 2026 it skipped every link with a `#` or a `?`
  in it, page and all, because its pattern stopped at either, so a link to
  `/docs/renamed-page/#section` passed it, and that's the link a renamed slug
  leaves behind; this step carried a check of its own for it. Run it against
  a fresh build, which the first half of the line makes: `out/` is whatever
  the last build left, and in a sync that's from before these pages changed,
  so a check read from it passes or fails on the old pages:

```sh
npm run build && node scripts/check-links.mjs
```

Every page in the build is read, not only the docs and the guides, because
the pricing FAQ and the homepage link into the docs too. Proved by a page
linking `/docs/missing/#sec`, `/docs/budgets/#nope` and `#nowhere`: it names
all three, the second and third as no such heading, where the checker's
earlier pattern passed the first.

### 5.8 Report what's wrong upstream

Where the application's own docs contradict its code, tell the owner, with the
file and line on each side, and change nothing in that repository. This site
can't fix the application, and a page here that quietly follows the code
while the app's own guide says otherwise leaves somebody reading both to
decide which to believe.

### 5.9 Before moving on

- Move `updated` on every page whose facts changed, and on no other.
  `write-content` §2 says what the date is held to.
- Draw a new page's mark, and a new group's picture, with
  **`draw-and-animate`**. Then `npm run build:images` for the cards, and
  keep what it draws in `public/og/`: it goes into `merge-prep` §13's one
  commit with the page, and nothing in a sync commits before that (§0).
- Build, then run the checks that read these pages. All five read `out/`
  for part of what they check, so without the build they test the pages
  from before this pull:

  ```sh
  npm run build && npx vitest run tests/copy.test.ts tests/learn.test.ts \
    tests/docs-features.test.ts tests/markdown.test.ts tests/sitemap.test.ts
  ```

  `tests/learn.test.ts` holds every screenshot on a docs page as well as a
  learn one, and `tests/docs-features.test.ts` holds the groups, the marks and
  the steps.

On its own, without a release, this goes on to §6 when a page now states how
data is handled, kept or deleted, and then to §8 and §9. There's nothing for
§7 to record.

## 6. The privacy policy and terms

The policy and the terms describe the application as much as this site: what
is collected, who receives it, and what a plan, a downgrade and a deletion
do. A release changes them without a line moving here, so run
**`legal-review`** for every pull that moved more than provenance. Every
release, not only one whose changelog mentions data: 0.2.1 changed no
processor, cookie or email and still made both of the terms' downgrade
paragraphs false.

- **Its §1 diffs this repository**, which in a sync is the smaller half, and
  mostly the sentences this pull has just written.
- **Its §6 diffs the release**, in the files that decide what's collected,
  who receives it and what a plan does, and that's the half that matters.
  Give its diff the two commits, `$OLD` and `$SHA`, in place of the tags it
  shows: a release still on its pull request has no tag yet, and the two
  trees are on disk already at `/tmp/app-$OLD` and `/tmp/app-$SHA`.

**Then read the docs that state data handling beside the policy**, because
nothing else holds them together: what deleting an account removes, what an
export holds, which emails go out, what a downgrade or a failed renewal does,
and what a connected assistant can read and change.
`content/docs/your-account-and-plan.md`, `content/docs/agents-and-mcp.md`,
`content/docs/activity-history.md`, `content/docs/limits.md` and
`content/docs/configuration.md` say most of it. `tests/legal.test.tsx` reads
the policy, the terms and the marketing pages, and none of the docs. For
every page §5 changed that states one of those things, read the policy's
sentence on the same thing beside it, and fix whichever of the two is wrong
of the code at `$SHA`.

**`legal-review` returns here when it's done**, as its last step says to
when a sync called it. This pull isn't finished: it goes on to §7, and
`merge-prep` runs once, from §9.

## 7. Record where it came from

After any of §2 to §6, and on its own when provenance or a link was all §1
reported, write one source into both snapshots, from the commit §0 pinned:

```sh
. /tmp/app-sync.env
node -e '
const fs = require("node:fs");
const [commit = "", ref = ""] = process.argv.slice(1);
if (!/^[0-9a-f]{40}$/.test(commit) || !ref) {
  throw new Error(`refusing to record ref "${ref}" at commit "${commit}": source /tmp/app-sync.env, or run §0 again`);
}
const fetched = new Date().toISOString().slice(0, 10);
for (const file of ["src/content/app-facts.json", "src/content/app-features.json"]) {
  const snap = JSON.parse(fs.readFileSync(file, "utf8"));
  snap.source = { ...snap.source, ref, commit, fetched };
  fs.writeFileSync(file, JSON.stringify(snap, null, 2) + "\n");
}' "$SHA" "$REF"
npx prettier --write src/content/app-facts.json src/content/app-features.json public/screenshots/CAPTURE.json
```

**It refuses an empty ref and anything but a whole commit hash**, because
those are what a block run without sourcing `/tmp/app-sync.env` hands it, and
written into both snapshots they'd name nothing as the source of everything
the site says, with every later check reading that as a fact.

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

Then run §1's script again, as §1's block does, with `/tmp/app-sync.env`
sourced first: an `APP_REF` override lives there, and without it the script
resolves another ref than the one just recorded. It should exit 0; if it
does not, this pull is not finished.

## 8. Look at it

```sh
npm run verify && npx serve out
```

Both themes, both widths, every page this pull changed, and each new docs
page with the sidebar folded on the narrow one (`docs/standards/web.md` 4.7)
and its card on the index (`docs/standards/web.md` 4.6). `merge-prep` runs
`design-review` over the whole branch before it ships; this look is for what
the pull changed, while it's still in front of you.

Then read the new copy **cold**, as somebody who has never seen the product.
Does the first screen say what this is? Would you know whether it is for you?

Last, stage everything the sync did:

```sh
git add -A
git diff --cached --stat | tail -n 5
```

**Staged, the sync's work is marked off from whatever comes after it.**
Nothing is committed until `merge-prep` §13, so without a mark `merge-prep`
can't tell this pull's changes from its own phases': its §1 scope lists the
whole branch against `origin/main`, the sync included, which is right for the
design review and the guides, and wrong for the legal check once §6 here
has run it over the release. With the sync staged, what `merge-prep`'s
phases change after it is whatever isn't staged:

```sh
git diff --name-only
git ls-files --others --exclude-standard
```

The unstaged diff, and a file created since, which isn't in the index for
the first to compare. When §6 here ran `legal-review`, those two lists are
what `merge-prep` §6 hands its §1 as what changed since the sync. Its §13
commits the staged and the unstaged together, in its one commit. `-A` takes
new and deleted files as well, so a new docs page, its card and a screenshot
§4 removed are all inside the mark.

## 9. Finish

The report is the one `merge-prep` ends with, so keep these for the top of
it, and its pull request's body:

- the ref and commit you pulled from, and when the ref came from a pull
  request, which one (an `APP_REF` override says so instead), and the release
  and commit the site described before;
- whether the contract moved; which features were added, dropped or
  reworded; which screenshots were refreshed; whether a brand token moved;
- the source both snapshots now record, and which links were moved to it;
- which changelog entries changed a sentence here, and where, and when the
  commit moved without a release, each `Unreleased` entry applied or
  deferred, with the reason;
- the commit the Self-hosting pages now follow, `$REL`, and whether it's the
  tag `v$TO` or `$SHA` because the release has no tag yet;
- which screens the release added, and the page or section that now covers
  each, or why none does;
- the docs pages written or changed, every claim corrected with its file and
  line, the refuter's findings rejected and why, anything left undocumented
  on purpose, and any disagreement between the application's docs and its
  code, reported upstream;
- what `legal-review` changed in the policy or the terms, and anything it
  says the owner has to send;
- **every learn guide §1's sweep named**, with the words the release
  changed, and every one §4 found under a screenshot it refreshed, for
  `write-content`;
- anything in the application's list you deliberately left off the site.

Then, after a sync of a release or a moved commit (not §5 run on its own,
which ends at §5.9), run **`merge-prep`**, from its §1, and nothing after it.
It runs `update-dependencies`, `legal-review`, `design-review`, `seo-review`,
`aeo-review`, `optimize` and `guides-update` itself, then verifies, commits
once and pushes once, so a second run afterwards is a second push on the
owner's credits (the README, "Which skill to run"). When §6 here ran
`legal-review` over the release, `merge-prep` §6 hands it only what changed
since the sync: whatever isn't staged, the two lists §8 gives, which §8's
staging made the boundary.
