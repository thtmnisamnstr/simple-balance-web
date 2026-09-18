---
name: update-dependencies
description: Update Next.js, React, Node and every other dependency to their newest supported versions, then find and fix whatever the update broke. Use when asked to update dependencies, upgrade the site, bump packages, or check whether anything is out of date.
---

# Update everything, then prove it still works

An update that leaves the build green is half the job. The half that matters is
the part where something changed behaviour and nothing failed — a renamed
config key that is now ignored, a plugin whose default flipped, a
`prefers-color-scheme` block that stopped being emitted.

## 1. Find out what is behind

```sh
npm outdated
npm ls --depth=0
```

Then the two versions no `npm outdated` will tell you about:

- **Node.** `docs/standards/operations.md` 5.3 pins it to the LTS Netlify
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
- **A pre-1.0 dependency.** This repository has one, named in `operations.md`
  5.2 with its fallback. A `0.x` minor is a major in every sense but the
  number.
- **Node moving to a new LTS** — take it, and move both files together.

Anything you decide _not_ to take, say so in the report with the reason. An
update deliberately skipped is a decision; an update silently skipped is a
surprise for whoever runs this next.

## 3. Take them

```sh
npm update                      # everything inside the existing ranges
npx npm-check-updates -u        # and then the ranges themselves
npm install
```

Majors one at a time where you can. A single commit that moves Next, React and
Vitest at once turns a bisect into a guess.

## 4. Run the gate

```sh
npm run verify
```

`typecheck → lint → format:check → build → test`. Fix what it reports.

New lint findings after an update are usually a rule that was added, not code
that changed. Read the rule before silencing it: `.oxlintrc.json` is where a
deliberate exception goes, with a comment saying why.

## 5. Check what the gate cannot see

This is the phase that makes the skill worth running, and it is where the
Next.js majors actually bite.

- **The static export still exports.** `out/` holds `index.html`,
  `blog/index.html`, `docs/index.html`, `sitemap.xml`, `robots.txt`, and a
  directory per post and per doc. `tests/export-shape.test.ts` covers the
  config; this is the artefact.
- **`noindex` is still on the unannounced sections.** A metadata change in Next
  would break this silently, and it is the difference between a staged section
  and a published one.

  ```sh
  grep -o 'content="noindex[^"]*"' out/blog/index.html out/docs/index.html
  ```

- **Syntax highlighting still emits both themes.** Shiki and
  `rehype-pretty-code` move together and the dual-theme output is the fragile
  part.

  ```sh
  grep -c 'shiki-dark' out/docs/getting-started/index.html
  ```

- **Heading anchors still match the contents list.** `content.md` 5.8 — if
  `rehype-slug` changes its algorithm, `slugify` has to change with it, and
  `tests/content.test.ts` is what tells you.
- **The page still looks right.** `npx serve out`, then narrow and wide, light
  and dark. A CSS-adjacent update can change nothing the suite can see.

## 6. Update the documents

Whatever changed that a document describes, changes that document in the same
commit — `writing.md` §Keeping a document true.

The three that go stale on an update:

- `operations.md` 5.2, if the pre-1.0 dependency stopped being pre-1.0, or a
  new one arrived.
- `operations.md` 5.3, if Node moved. Both files and the prose.
- `CHANGELOG.md`, under `## Unreleased`. A dependency bump earns an entry when
  it changes something a maintainer can rely on; a patch sweep does not.

## 7. Report

- What moved, by major and minor, and what you deliberately did not take.
- What broke and how you fixed it.
- What you checked in phase 5, naming the commands.
- Whether Node or the Netlify image moved, and whether the two files agree.

Then hand over to **`merge-prep`** rather than committing here — an update is a
change like any other and goes through the same gate.
