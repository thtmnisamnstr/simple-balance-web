---
name: merge-prep
description: Prepare and verify everything in this repository, then commit and push the active branch in a ready-to-merge state. Use when asked to prep for merge, verify the branch, get it ready to merge, or "commit and push".
---

# Prepare the branch for merge, and prove it

Seven phases, in order. The order is load-bearing: each can invalidate the ones
before it, so running them out of sequence means running them twice.

**This skill does not merge.** It leaves the branch pushed, green, and ready
for somebody to press the button. Nor does it tag or version: this site has no
releases — every visitor gets whatever is deployed.

## 1. Scope

```sh
git status --short && git log --oneline main..HEAD | cat
git diff main...HEAD --stat | tail -30
```

Write the list of what changed — pages, components, content, styles, config,
standards — and keep it. Phases 2, 3 and 5 each walk it.

## 2. Correctness, on the things that are expensive and silent

Work from the diff, and for each area ask what would have to be true for it to
be wrong, then go and check that rather than reading for reassurance.

The four that matter on this site, because each is invisible when broken:

- **`ads.txt` and the redirects.** `docs/standards/operations.md` 2. A
  catch-all rewrite in `netlify.toml` demonetises the apex silently. If the
  diff touches `netlify.toml`, read that section again before approving it.
- **Announced versus built.** `content.md` 6. Did anything link to `/blog` or
  `/docs`, or add them to the sitemap, while `announced` is still false? One
  flag decides three things and the test holds all three.
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

Argue every finding against itself before acting on it. **Record the rejected
ones with their reasons in the commit body** — a rejected finding that is not
written down gets re-found.

## 3. Fix, with a check each

Every fix that changes behaviour gets a test, and every new check is
**mutation-proved**: break the guarded thing, watch it fail by name, restore,
watch it pass. `code/testing.md` 2.3.

## 4. Dead code

```sh
npx knip --no-config-hints
```

knip is not a dependency and has no config here, so vet every hit. It reports
"unused export" for anything nothing _imports_, which conflates two things:
used only inside its own module (narrow the export), and referenced nowhere
(delete it).

Then the stylesheet, which is where dead code actually accumulates on a site
like this:

```sh
node -e '
const {readFileSync}=require("node:fs");const {globSync}=require("node:fs");
const css=readFileSync("src/styles/site.css","utf8")+readFileSync("src/styles/brand.css","utf8");
const defined=new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m=>m[1]));
const src=globSync("src/**/*.{ts,tsx}").map(f=>readFileSync(f,"utf8")).join("\n")
  +globSync("content/**/*.md*").map(f=>readFileSync(f,"utf8")).join("\n");
console.log([...defined].filter(c=>!src.includes(c)).join("\n"));'
```

Expect false positives from classes built by interpolation
(`callout-${kind}`) and from `.class` written inside a comment. Confirm each by
finding how it is composed before deleting anything.

Report "nothing was dead" when nothing was.

## 5. Bring the documents back to true

Run the **`guides-update`** skill, which owns this. It covers
`docs/standards/`, `AGENTS.md` and `CHANGELOG.md`, and it ends where phase 6
begins.

## 6. Verify

```sh
npm run verify
```

`typecheck → lint → format:check → build → test`. The build is before the tests
on purpose — `code/index.md` 4 says why.

Then look at it. jsdom has no layout engine, so nothing in the suite can see
the thing a reader sees:

```sh
npx serve out
```

Check the page at a narrow width and a wide one, in light and dark, and tab
through it. If the diff touched anything visual, run **`design-review`**
instead of doing this from memory.

If anything changed after this phase, repeat it.

## 7. Commit, push, report

`docs/standards/writing.md` §Commit messages owns the shape — read it rather
than guessing. An imperative subject naming what is now true from the reader's
side, no prefix, no full stop, 70 characters as a ceiling. A body of
hard-wrapped prose owing four things: why the defect survived review, what was
checked and how, findings rejected and why, and corrections to the previous
message.

Trailer, in this casing:

```text
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
```

Then:

```sh
git push -u origin "$(git branch --show-current)"
```

If the branch has a pull request, watch its checks to completion rather than
reporting off the first workflow to finish:

```sh
gh pr checks "$(git branch --show-current)" --watch
```

**Report, plainly:**

- What changed, in behaviour rather than in files.
- What phase 2 found, what was fixed, and what was rejected with the reason.
- Whether anything was dead, including "nothing was".
- That `npm run verify` is green, and that the page was looked at.
- Anything deliberately left, and why.
- That the branch is pushed and ready to merge — and that you did not merge it.

Then stop.
