---
name: update-dependencies
description: Update Next.js, React, Node and every other dependency to their newest supported versions, then find and fix whatever the update broke. Use when asked to update dependencies, upgrade the site, bump packages, or check whether anything is out of date.
---

# Update everything, then prove it still works

An update that leaves the build green is half the job. The half that matters is
the part where something changed behavior and nothing failed — a renamed
config key that is now ignored, a plugin whose default flipped, a
`prefers-color-scheme` block that stopped being emitted.

`merge-prep` runs this first on every branch (its §2), so the reviews after it
look at the site as it will build. Run on its own, it's an upgrade on a branch
of its own, and its §7 still hands over to `merge-prep`.

## 1. Find out what is behind

```sh
npm outdated
npm ls --depth=0
```

Then the two versions no `npm outdated` will tell you about:

- **Node.** `docs/standards/operations.md` 6.3 pins it to the LTS Netlify
  supports, in **both** `.nvmrc` and `netlify.toml`. Check what Netlify
  supports now, and what is LTS now, before changing either. They must agree
  with each other.
- **The Netlify build image**, if the site has pinned one.

## 2. Decide what to take, before taking it

Not every update is wanted on the day it lands.

- **A major on a framework** (Next, React) — read its upgrade guide first, take
  it deliberately, and expect this skill to take an hour rather than ten
  minutes.
- **A major on a build tool** (Vitest, TypeScript, oxlint) — usually safe, and
  the failure is loud.
- **A pre-1.0 dependency.** This repository has three, named in `operations.md`
  6.2 with their fallbacks. A `0.x` minor is a major in every sense but the
  number.
- **Node moving to a new LTS** — take it, and move both files together.

Anything you decide _not_ to take, say so in the report with the reason. An
update deliberately skipped is a decision; an update silently skipped is a
surprise for whoever runs this next.

## 3. Take them

```sh
npm update                      # everything inside the existing ranges
```

Then the ranges themselves, **leaving out any major §2 marked as a
decision**. `npx npm-check-updates -u` on its own rewrites every range to its
newest major at once, the held-back one included, so it would be in
`package.json` and the lockfile before anybody was asked. Leave it out by
name, and drop the flag when nothing is held back:

```sh
npx npm-check-updates -u --reject <pkg>   # every range but the held-back one
npx npm-check-updates -u --filter <pkg>   # or one package's range on its own
npm install
```

The held-back major goes in §7's report by name, with the version you're on
and the newest, for `merge-prep` §2 to put to the owner.

**Take majors one at a time where you can, running §4 between them**, so a
failure names its cause: a single step that moves Next, React and Vitest at
once turns a bisect into a guess. The steps are for finding a cause, not for
the history. Nothing here commits, whether `merge-prep` started this or not:
the commit is `merge-prep` §13's, one for the branch, and "the same commit"
further down means that one.

## 4. Run the gate

```sh
npm run verify
```

`typecheck → lint → format:check → build → test`. Fix what it reports.

New lint findings after an update are usually a rule that was added, not code
that changed. Read the rule before silencing it; most that fire are right
(`docs/standards/code/index.md` 3). A deliberate exception goes in
`.oxlintrc.json`, which is JSON and can't hold a comment, so the argument for
it goes in `docs/standards/code/index.md` 5 in the same commit. A rule
switched off with no entry there reads as a rule switched off to make the
build pass.

## 5. Check what the gate cannot see

This is the phase that makes the skill worth running, and it is where the
Next.js majors actually bite.

- **The static export still exports.** `out/` holds `index.html`,
  `blog/index.html`, `docs/index.html`, `learn/index.html`, `sitemap.xml`,
  `robots.txt` and `llms.txt`; a directory per post, per doc and per guide;
  each doc's and guide's Markdown copy at `docs/<slug>/index.md` and
  `learn/<slug>/index.md`; and the page cards under `og/`.
  `tests/export-shape.test.ts` covers the config; this is the artifact.
- **`noindex` is still on the unannounced sections, and only there.** A
  metadata change in Next would break this silently, and it is the difference
  between a staged section and a published one. Don't grep a page for it.
  This step used to grep `out/docs/index.html`, and once the docs were
  announced that found nothing, correctly, which looks exactly like the break
  it was looking for. These two derive the announced set from the flag and
  check the robots tag and the sitemap against it:

  ```sh
  npx vitest run tests/sections.test.tsx tests/sitemap.test.ts
  ```

- **Syntax highlighting still emits both themes.** Shiki and
  `rehype-pretty-code` move together and the dual-theme output is the fragile
  part.

  ```sh
  grep -c 'shiki-dark' out/docs/self-hosting/index.html
  ```

- **Heading anchors still match the contents list.** `content.md` 5.8 — if
  `rehype-slug` changes its algorithm, `slugify` has to change with it, and
  `tests/content.test.ts` is what tells you.
- **The page still looks right.** `npx serve out`, then narrow and wide, light
  and dark. A CSS-adjacent update can change nothing the suite can see.

**A Next major adds three**, because Next decides what the build writes, and
each of these can change with the build still green or fail for a reason
that isn't the site's:

- **Metadata still means what the helpers assume.** A key a route declares
  replaces the layout's whole value for that key, and every route takes its
  Open Graph block, its alternates and its robots tag from a helper because of
  it (`docs/standards/code/next.md` 1.1). A major that merges where it used to
  replace, or the reverse, makes those helpers wrong in a page's head, where
  nobody looks. It surfaces in `tests/copy.test.ts`, `tests/sitemap.test.ts`
  and `tests/feeds.test.ts`: read a failure there as a change in what
  metadata means before reading it as a broken page.
- **The route handlers still write their files.** The feeds, `/llms.txt`,
  the docs search index and the Markdown copies are GET route handlers run
  at export time (`docs/standards/operations.md` 1.1), and a major that
  changes how the export treats them can drop the files with the build still
  green:

  ```sh
  ls out/llms.txt out/docs/backups/index.md out/docs/search-index.json out/blog/feed.xml
  ```

- **A byte-for-byte match on Next's output is narrowed, not reverted.**
  `tests/sitemap.test.ts:155` matches the robots tag character for character
  as Next writes it, so a major that writes the same tag differently fails
  there while every page is right. Loosen the match to what the check is for
  (`docs/standards/code/testing.md` 2.5); don't hold Next back to keep a
  string.

**Node and Playwright have one each.**

- **Node: `npm run build:images` still runs.** It imports
  `src/content/sections.ts` through Node's own type stripping, and nothing in
  `npm run verify` runs it (`docs/standards/operations.md` 7.5), so a Node
  that strips differently breaks the image script and nothing else.
- **Playwright: install its browser, then look at the motion.** A bump needs
  `npx playwright install chromium`, or the browser tests fail on a missing
  executable rather than on anything about the site. Then go through
  `design-review` §4, the motion, with `npm run frames`: scroll-driven
  animation, style queries, `::details-content` and `:hover` under a parked
  pointer are all Chromium behaviors, they have moved between versions
  before, and the browser tests run in whichever Chromium Playwright ships.

## 6. Update the documents

Whatever changed that a document describes, changes that document in the same
commit — `writing.md` §Keeping a document true.

The four that go stale on an update:

- `operations.md` 6.2, if a pre-1.0 dependency stopped being pre-1.0, or a
  new one arrived. `tests/repo-references.test.ts` fails when one is unnamed.
- `operations.md` 6.3, if Node moved. Both files and the prose.
- `docs/standards/code/next.md`, if a Next major changed one of the
  surprises it records, or added one.
- `CHANGELOG.md`, under `## Unreleased`. A dependency bump earns an entry when
  it changes something a maintainer can rely on; a patch sweep does not.

## 7. Report

- What moved, by major and minor, and what you deliberately did not take.
- What broke and how you fixed it.
- What you checked in §5, naming the commands.
- Whether Node or the Netlify image moved, and whether the two files agree.
- Any upgrade that needs a decision rather than a fix, held back with
  `--reject` (§3) and named with the version you're on and the newest, what
  it changes and the choices. `merge-prep` §2 says what counts, and stops on
  it to ask the owner.

Then hand over to **`merge-prep`** rather than committing here — an update is a
change like any other and goes through the same gate.

**When `merge-prep` called this, return to it instead**, with the report. It's
already running, and its §12 verifies and its §13 pushes what this changed;
handing over would start it again from the top, which runs this skill again.
