---
name: merge-prep
description: Prepare and verify everything in this repository, then commit and push the active branch in a ready-to-merge state. Runs the dependency, legal, design, search, answer-engine, optimization and guides skills itself, in order. Use when asked to prep for merge, verify the branch, get it ready to merge, or "commit and push".
---

# Prepare the branch for merge, and prove it

Thirteen phases, in order. The order is load-bearing: each can invalidate the
ones before it, so running them out of sequence means running them twice.

Seven of the phases are other skills, in the order the README gives under
"Which skill to run": `update-dependencies` first, because an upgrade can change
how every page renders and what the build writes, and `guides-update` last,
because every phase before it can change what the documents have to say.
Between them, this skill's own checks, then `legal-review`, `design-review`,
`seo-review`, `aeo-review` and `optimize`. The two search reviews follow the
design review, so they read the pages a reader will see, and `aeo-review`
follows `seo-review` because an answer engine cites from a search index: a
page the first finds unindexable has nothing for the second to improve. Both
come before `optimize`, so a card a retitle redrew is weighed with the rest.

**A skill run from here skips its own closing step**: the last
`npm run verify`, and the hand-over to this skill or the push that would
follow it. §12 is the verify and §13 is the only push. Without that,
`update-dependencies` would end by starting this skill again from §1, which
would run `update-dependencies`, and nothing would finish. Each of those
skills says so in its finish: when `merge-prep` called it, it returns here.
Nor does one start `sync-from-app`: a release one of them finds waits on the
owner (§6). What a skill runs on the way stays, though.
`update-dependencies` §4 is how that skill finds out what an upgrade broke,
and a design fix is still rebuilt and looked at before the review moves on,
for which `npm run build` is enough.

**§13 is the only commit, too.** Where a skill run from here says to commit
something, it means keep it for §13's commit, one for the branch, whose
message owes the reasons for all of it, the findings §3 rejected included.

**A phase that can't be done here is reported, not skipped.** No browser for
the design review, no network for the upgrade: say which phase, and why, so
the owner knows what the branch hasn't had.

**This skill does not merge.** It leaves the branch pushed, green, and ready
for somebody to press the button. Nor does it tag or version: this site has no
releases — every visitor gets whatever is deployed.

## 1. Scope

**On `main`, or on no branch, branch before anything else.**

```sh
git branch --show-current
```

If that prints `main`, or prints nothing, which is a detached HEAD such as a
worktree's or a CI checkout's, make a branch named for the change, and carry
on there. Uncommitted work comes with it:

```sh
git switch -c <a-name-for-the-change>
```

Netlify deploys `main` to the live site (`docs/standards/operations.md` 5), so
a push from it skips review and publishes, and `gh pr create --base main` then
fails because the head is the base. A detached HEAD has nothing to push at
all, and finding that out at §13 means finding it out after every phase has
run. Nothing in this skill pushes `main`, and §13 checks both again before it
pushes anything.

Then what changed:

```sh
git fetch origin main --quiet
git status --short --untracked-files=all
git log --oneline origin/main..HEAD | cat
git diff --merge-base origin/main --name-status
git diff --merge-base origin/main --shortstat
```

The working tree against where the branch left `main`, not the commits: on
most runs nothing is committed yet, and `origin/main...HEAD` compares commits
only, so it lists none of the change this skill is about to commit.
`--merge-base` keeps work merged into `main` since from reading as this branch
undoing it, and a new file shows only in the status line until it's added.

**Every file, by its whole path.** This was `--stat` cut by `tail` to its last
thirty lines, which on a long branch dropped every file before them, and a
file changed only in the branch's earlier commits is on no other line of the
block to catch it. `--stat` shortens a long path to `...` besides.
`--name-status` prints each one whole, and `--shortstat` is the one line of
size that `--stat` was kept for.

**Against `origin/main`, fetched, never the local `main`.** A local `main` is
wherever it was last pulled, and `--merge-base` keeps merged work out of the
diff only when `main` knows about that work. Against a stale one, whatever
the branch took from a newer `main`, by branching from it or merging it in,
reads as this branch's change, so `guides-update` rewrites documents for it,
`legal-review` chases it, and §3 reviews somebody else's merged work. It's
`AGENTS.md`'s point about a stale checkout of the application, at the scale of
one branch.

**This is the one copy of this block.** `guides-update` §1, `legal-review` §1,
`design-review`, `seo-review` and `aeo-review` cite it instead of carrying
their own, because three copies once needed the same fix, the missing fetch,
and would again. Each runs it afresh at its own phase rather than reusing
this list, since every phase before it may have added to the change: by §7, a
fix from §3 or §4 and a policy §6 rewrote may be on the branch, by §8 a
design fix as well, and the list written here has none of them.

Write the list of what changed — pages, components, content, styles, config,
standards, skills — and keep it. §3 and §5 walk it. §6, §7, §8, §9 and §11
run the block again through the skills they call, though after a sync §6
judges only what isn't staged, and §10 walks the list as §9's run left it,
with whatever §7 to §9 fixed added.

## 2. Dependencies

Run **`update-dependencies`**. First, because an upgrade can change how a page
renders, what the build writes and what the browser tests see, and every phase
after this one should look at the site as it will build, not as it was. "Nothing
was behind" is a result, and goes in the report.

**If an upgrade needs a decision rather than a fix, stop and ask.** A fix is
what that skill's §4 and §5 are for: a renamed option, a rule a linter added, a
test narrowed to what it's for. A decision is a major version that changes
behavior the site depends on. Some shapes it takes:

- A Next major that changes what a route's metadata replaces
  (`docs/standards/code/next.md` 1.1), or how the export treats the route
  handlers that write the feeds and the Markdown copies.
- A pre-1.0 dependency whose new minor means taking the fallback
  `docs/standards/operations.md` 6.2 names for it.
- A Node LTS that Netlify doesn't support yet (`operations.md` 6.3).

Hold that one back, say what it changes and what the choices are, and ask
before going on: the answer changes what every later phase looks at. Take
everything else; the rest of this skill runs over it.

## 3. Correctness, on the things that are expensive and silent

Work from §1's list and whatever §2 moved, and for each area ask what would
have to be true for it to be wrong, then go and check that rather than reading
for reassurance.

The ones that matter on this site, because each is invisible when broken:

- **`ads.txt` and the redirects.** `docs/standards/operations.md` 2. This
  site shows no ads, and its `ads.txt` is still what authorizes the
  application's, so a catch-all rewrite in `netlify.toml`, or the file
  deleted as a leftover, costs the application's revenue silently. If the
  diff touches `netlify.toml` or `public/ads.txt`, read that section again
  before approving it.
- **Announced versus built.** `content.md` 7. Did anything link to `/blog`, or
  add it to the sitemap, while its `announced` is still false? One flag
  decides three things and the test holds all three.
- **Claims.** `content.md` 2.1. Every statement about the product has to be
  true of the shipped application. Nothing in this repository can check that —
  it is a different repository — so this is the phase where a person reads the
  copy against reality.
- **The brand contract.** `web.md` 1.1. If `brand.css` changed, it changed
  because the application's palette changed. If it changed for any other
  reason, that is the defect.
- **The feeds, if content changed.** `content.md` 5.9. They are consumed by
  software and fail silently in somebody else's reader. `tests/feeds.test.ts`
  parses them, but check a post's title and description read well as a feed
  summary, because that is all a subscriber sees.
- **A new client component.** `code/react.md` 1.1 lists three and the four
  conditions a fourth has to meet. `ls src/components/client/` is the whole
  audit.
- **Structured data, if a template changed.** `content.md` 5.13 — every field
  must be true of something visible. An invented field is a policy violation
  as well as a lie.
- **A new route.** Does it take its openGraph, its alternates and its robots
  from the helpers rather than writing them out? A key a route declares
  replaces the layout's whole value for that key, so a hand-written block
  quietly drops whatever it didn't repeat (`code/next.md` 1.1). And unless
  it's a page in a collection, which the sitemap finds by itself, does it
  have an entry with a `lastModified` in `src/app/sitemap.ts`?
- **A page added, retitled, renamed or removed.** Run `npm run build:images`
  and keep what it writes under `public/og/` for §13's commit. It never
  deletes, so a removed or renamed page's old card ships with every test
  green until somebody deletes it by hand (`operations.md` 7.1). A renamed
  slug also gets a 301 from its old directory, a fixed path with a splat like
  the moved-page block in `netlify.toml`, and every link to the old slug in
  `content/` and `src/content/` is fixed in the same change, because the
  redirect is for links from outside the repository (`operations.md` 2.1).
- **A new file that isn't a page**, such as a feed, a Markdown copy or a JSON
  index. It needs a `[[headers]]` block in `netlify.toml` naming its content
  type, with `X-Robots-Tag = "noindex"` if it repeats a page's words; an
  allowance in `tests/budget.test.ts` if its extension is one the stray-file
  check refuses; and a test that it's in `out/` (`operations.md` 1.2).
- **`public/og.png`, if what it draws moved.** It draws the hero's title, its
  tagline, one price line, "Free, or" the yearly price "a year", with the
  price read from the snapshot in `src/content/app-facts.json`, and the colors
  in `brand.css`. The script records the words with a hash of the file, and
  `tests/export-shape.test.ts` fails when the record no longer matches
  `home.ts`, the snapshot or the committed card (`operations.md` 7.1). The
  colors aren't recorded: if `brand.css` or the script changed on this
  branch, run `npm run build:images` and look at the card.
- **A `.mo-loop` outside the homepage.** `tests/learn.test.ts` lets a rule
  repeat forever only under `.mo-loop` or held paused until a pointer runs
  it, but whether the markup puts a stop control inside each one is checked
  only by `tests/home-page.test.tsx`, which renders the homepage and counts
  its three. A loop anywhere else needs `LoopStop` and a test of its own like
  that one.
- **Product claims in the docs and the learn guides.** A bold label, a quoted
  message or a limit on a docs page is a claim about the shipped application,
  and so is every step in a learn guide's last part (`content.md` 2.7 and
  5.14). Nothing in this phase can check one: the claims-and-refute steps in
  `sync-from-app` §5 do, against the application's source at the commit
  `content.md` 2.7 says each page follows. If the branch wrote or changed
  such claims and those steps didn't run on them, say so in the report.

Argue every finding against itself before acting on it. **Record the rejected
ones with their reasons in §13's commit body** — a rejected finding that is
not written down gets re-found.

## 4. Fix, with a check each

Every fix that changes behavior gets a test, and every new check is
**mutation-proved**: break the guarded thing, watch it fail by name, restore,
watch it pass. `code/testing.md` 2.3.

## 5. Dead code

```sh
npx knip --no-config-hints
```

knip is not a dependency and has no config here, so vet every hit. It reports
"unused export" for anything nothing _imports_, which conflates two things:
used only inside its own module (narrow the export), and referenced nowhere
(delete it).

Then the stylesheet, which is where dead code actually accumulates on a site
like this. Its classes are a test now: `tests/dead-css.test.ts` fails on a
class the CSS defines and the source never writes, and on one the markup
writes and no rule styles, so `npm run verify` sweeps them both ways.

What it can't see is a keyframe nothing plays. A drawing's effects are named
through `--mo` and `--mo-loop` on their classes, as in `--mo: mo-rise;`, and
the rest inside an `animation:` shorthand. Nothing here writes an
`animation-name:` declaration, so a search for that property finds none of
them. Count each keyframe's mentions instead, outside comments and outside a
class selector of the same name; one mention is its own definition and nothing
else:

```sh
node -e '
const css = require("node:fs").readFileSync("src/styles/site.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
for (const [, name] of css.matchAll(/@keyframes ([\w-]+)/g)) {
  const uses = css.match(new RegExp("(?<![\\w.-])" + name + "(?![\\w-])", "g")).length;
  if (uses === 1) console.log(name);
}'
```

It prints nothing when every keyframe is named. Before deleting one it prints,
check the components don't name it in a style, the way a class can be built
by interpolation (`callout-${kind}`).

**It runs again at §12** when a phase after this one changed
`src/styles/site.css` or a drawing. A motion fix in §7 can leave behind a
keyframe nothing plays, after this sweep has looked, and
`tests/dead-css.test.ts` counts classes, not keyframes.

Report "nothing was dead" when nothing was.

## 6. Legal

Run **`legal-review`**. Its §1 asks whether anything now leaves the browser
that didn't, and whether the branch touches what the privacy policy and the
terms describe. **A branch that changed nothing about data stops after its
§1**, which is most branches, and the report says so in a line. One that did
goes through the rest, and the policy and the terms change on this branch, not
a later one, because they describe what ships.

**After a sync in the same session whose §6 ran this**, the release diff in
`legal-review` §6 included, nothing here runs that half twice. A release
always goes through `sync-from-app` §6; its §5 run on its own goes there
only when a page now states how data is handled. What's left to judge is
what changed since the sync, and the sync marked where it ended: its §8
staged everything it wrote, so whatever isn't staged came after it, from §2
to §5 here:

```sh
git diff --name-only
git ls-files --others --exclude-standard
```

The second line is a file created since, which isn't in the index for the
first to compare. **Those two lists, not §1's block, are what `legal-review`
§1 judges after a sync.** The block still lists the whole branch, and on a
sync branch that's the policy, the terms and the snapshot the sync just
rewrote, so judged by it every sync would go through the whole review a
second time. Usually the lists name nothing about data, and that's the line
in the report. In a later session than the sync's, nothing records that its
review ran, and anything may have been staged since, so the whole list
applies. So it does after a sync whose §6 didn't run `legal-review`, since
there's no review to avoid repeating.

**`legal-review` doesn't start a sync from here.** Its §6 may run
`sync-from-app` §1's check to learn whether the application has moved; a
release nobody has synced goes at the top of the report as waiting on the
owner, because a sync is its own run, ending in its own run of this skill.

A material change carries a promise the policy makes: notice by email before
it takes effect. Sending it is the owner's, so it goes at the top of the
report.

## 7. Design

Run **`design-review`** over what changed, which it finds by running §1's
block again rather than reading the list §1 wrote: the pages that block names
now, which includes whatever §3 and §4 fixed and the policy and terms §6
rewrote, and every page that uses a component, a style or a drawing it names,
in both themes, at both widths, and through its §4 when anything that moves
changed.

**§2 can widen this to the whole site.** An upgrade to anything that renders,
such as Next, React, the Markdown and highlighting plugins, or the Chromium
Playwright ships for the motion, is a change to every page, which is why
dependencies go first.

A branch that changed nothing a page renders, only guides, skills, tests or
workflows, says so in the report and moves on. A Markdown file under
`content/` is something a page renders.

This is the look the branch relies on. §12's is a last one, for whatever
changed after it.

## 8. SEO

Run **`seo-review`** over what changed, which it finds by running §1's block
again, as §7 did: the pages that block names now, with whatever §3 to §7
fixed, and every page whose title, description, structured data, sitemap
entry or card comes from a template, a layout or a helper it names. It names
the test for whatever a test already holds and spends its time on what none
can decide, such as whether a title is what somebody would search and a
description answers it (`content.md` 5.16).

**§2 can widen this to the whole site**, as it can §7's: a Next upgrade can
change what every route's metadata replaces at once (`code/next.md` 1.1). A
branch that changed nothing a search engine reads, only guides, skills, tests
or workflows, says so in the report and moves on.

**A title, a description or an opening sentence it rewrote is copy**, and so
a claim, made after §3 read the claims and §6 the policy. Read each against
the shipped application (`content.md` 2.1), against the privacy policy, which
no marketing sentence may outpromise (`content.md` 2.4), and on the homepage
and the pricing page against the reader they're written for and the
bank-connection rule (`content.md` 1.3 and 1.4), before §11, and name it in
the report with the old words beside the new. §12's look is at how the page
looks, and would pass a false sentence.

It returns here rather than finishing on its own, and the run goes on to §9.

## 9. AEO

Run **`aeo-review`**, over the same scope found the same way. It reads what an
answer engine takes from a page: whether the opening paragraph answers the
title on its own, what the Markdown copies and `/llms.txt` say
(`content.md` 5.15), and whether the site says in one plain sentence what
Simple Balance is. A test that already holds a thing is named, not redone.

What it rewrote is copy, read as §8 says before §11. What it finds that
can't be done from this tree, a search console or a listing that isn't set
up (`operations.md` 8), goes at the top of the report as the owner's. It
returns here, and the run goes on to §10.

## 10. Optimize

Run **`optimize`**, which says at its top how much of it a branch needs: its
measurement every time, and the rest for what the branch added. After the
design and search reviews, so it measures the pages as they'll ship, the
card redrawn for a page §8 retitled included, and before the guides, because
a budget raised or an image re-encoded may be something they have to say. A
picture it changed gets §12's look. Its findability half is §8's and §9's
now, and any words it does rewrite are copy, read as §8 says before §11.

## 11. Documents

Run **`guides-update`**, which owns this. It covers `docs/standards/`,
`AGENTS.md`, the README and `CHANGELOG.md`. It's the last of the skills because
each phase before it can make a document false: a dependency moved
(`operations.md` 6.2), a sentence in the policy, a design fix that turns out to
be a rule, a search finding that should be one, a budget. It ends where §12
begins.

## 12. Verify

**First, §5's keyframe count again, if a phase after §5 changed
`src/styles/site.css` or a drawing**, which is usually a design fix in §7,
and `npx knip --no-config-hints` again if one touched a component. Both ran
before the design fixes, the search reviews and the optimization pass, and
`verify` sweeps the stylesheet's classes but not its keyframes, so a keyframe
a later phase orphaned ships with every test green. Then:

```sh
npm run verify
```

`typecheck → lint → format:check → build → test`. The build is before the tests
on purpose — `code/index.md` 4 says why.

`verify` includes an accessibility audit that drives a real browser over every
page the build emits, in both themes (`tests/a11y.test.ts`), so contrast and
computed styles are covered, along with the handful of layout defects
`web.md` 9 attributes to it. What it still cannot see is everything nobody has
measured yet: rhythm in general, balance, and whether a section is in a
sensible place, which is what §7 was for.

Then look at it once more:

```sh
npx serve out
```

Narrow and wide, light and dark, and tab through it: the pages §7 reviewed, as
they are now, and anything that changed after it, like a heading §8 or §9
rewrote, a picture §10 re-encoded or a fix a later phase made. This local look
is the last one this skill takes: the deploy preview sits behind Netlify's
login (§13).

If anything changed after this phase, repeat it.

## 13. Commit, push once, open the pull request, report

Everything not yet committed goes into one commit: this skill's work and the
work of every skill it ran, staged and unstaged alike, so after a sync the
work its §8 staged goes in with everything since. Stage all of it, then read
what's about to go in:

```sh
git add -A
git status --short
```

Anything in that list that shouldn't ship, such as a scratch file, comes out
before the commit rather than in a second one.

`docs/standards/writing.md` §Commit messages owns the shape — read it rather
than guessing. An imperative subject naming what is now true from the reader's
side, no prefix, no period, 70 characters as a ceiling. A body of
hard-wrapped prose owing four things: why the defect survived review, what was
checked and how, findings rejected and why, and corrections to the previous
message.

Trailer, in this casing, naming the model that actually did the work:

```text
Co-Authored-By: Claude <model> <noreply@anthropic.com>
```

The casing is the rule; the model is a fact about the commit. This block named
one model while the commits it was copied into were signed by another, so a
literal here is a false attribution waiting for the next model.

**Push once.** Every push to a pull request runs a Netlify preview build of
`npm run verify` on the owner's credits (`operations.md` 5), so every phase
above, the guides and the local look included, is finished before the first
push, and the branch goes up once. Two checks come first, rather than
trusting §1 to have made them unnecessary:

```sh
branch=$(git branch --show-current)
if [ -z "$branch" ] || [ "$branch" = main ]; then echo "on main or no branch: refusing to push, go back to §1"; else gh pr list --head "$branch" --json url --jq '.[].url'; fi
```

**Never from `main` or a detached HEAD.** The first publishes with no review,
and the second is a push of no branch, which fails only now, after every phase
has run.

**Never to an open pull request without asking.** If the check prints a
link, the branch already has one, and this push is that pull request's next
preview build, carrying everything batched since its last.
That's a build on the owner's credits, so stop and ask before pushing, unless
the request that started this run was for exactly that push. If `gh` fails
rather than printing nothing, it hasn't answered, and the push waits until it
does. Otherwise, push:

```sh
git push -u origin "$(git branch --show-current)"
```

And open the pull request, unless the check above found one open, with the
commit's subject as its title and a body that says what changed for a reader,
what was checked and how, and what is left for the owner, the look at the
preview first among it:

```sh
gh pr create --base main --title "<the commit subject>" --body "<the body>"
```

Watch its checks to completion rather than reporting off the first workflow to
finish:

```sh
gh pr checks "$(git branch --show-current)" --watch
```

**No second push without asking.** A failed check, a review comment or a
finding after the push goes in the report and waits for the owner. A fix pushed
on its own is another build on their credits, and review changes are batched
into one later push.

**Netlify is the gate** and runs `npm run verify` as its build command, so a
failing test fails the deploy rather than producing a preview somebody
approves. The preview it posts sits behind Netlify's login, which an agent
doesn't have, so report the preview's link and leave the look at it to the
owner. It's the one step in this skill no machine performs.

GitHub Actions runs the two things Netlify's build image cannot be relied on
for: the accessibility suite, which needs Chromium, and the internal link
check. Both must be green as well; `operations.md` 5 says why the work is
split this way.

**Report, plainly:**

- After a sync, everything `sync-from-app` §9 lists, first. This report is
  the one the sync ends with, and the pull request's body carries the same.
- What changed, in behavior rather than in files.
- Anything waiting on the owner: an upgrade held back for a decision (§2), a
  material legal change whose email notice is theirs to send (§6), an
  application release nothing has synced yet (§6), a search console, a
  listing or a dashboard setting the search reviews found undone (§8 and §9),
  a push to an open pull request they haven't agreed to (§13), a phase that
  couldn't be done here.
- What §2 moved and what it didn't take, with the reason.
- What §3 found, what was fixed, and what was rejected with the reason.
- Whether anything was dead, including "nothing was".
- What the legal review concluded, "nothing about data changed" included.
- What the design review looked at, by page, theme, width and state, and what
  it fixed.
- What the SEO and AEO reviews found and fixed, and every title,
  description or opening sentence they rewrote, with the old words beside the
  new.
- The optimization pass's before and after, as numbers, and anything it
  rewrote in words.
- The documents the guides update changed.
- That `npm run verify` is green, and that the page was looked at locally.
- Anything deliberately left, and why.
- The pull request's link and the preview's, with what the owner should look
  at in the preview.
- That the branch is pushed once and ready to merge — and that you did not
  merge it.

Then stop.
