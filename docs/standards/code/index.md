# The source

TypeScript, React, and the tools that check both.

- **[`react.md`](react.md)** — components, server versus client, props.
- **[`testing.md`](testing.md)** — what is worth testing on a marketing site,
  and what is not.
- **[`comments.md`](comments.md)** — why the comments here are dense.
- **[`next.md`](next.md)** — where Next.js does something other than what
  its options seem to say, and what a new route asks for.

## 1. TypeScript

### 1.1 Strict, plus four

**Binding.** `strict`, and also `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitOverride` and
`noFallthroughCasesInSwitch`.

`noUncheckedIndexedAccess` is the one that earns its keep here: the content
pipeline indexes arrays constantly — neighbors, first author, heading levels —
and every one of those is genuinely possibly-undefined.

`exactOptionalPropertyTypes` is why the code spreads conditionally
(`...(date ? { date } : {})`) rather than passing `date: undefined`. That is
not a style choice; the two mean different things and the stricter setting
makes you say which.

_Checked by:_ `npm run typecheck`.

### 1.2 No `any`, and `unknown` at the boundary

**Binding.** Frontmatter arrives as `unknown` from `gray-matter` and is
narrowed explicitly in the parser. That is the only untyped boundary this site
has, and it is where the validation lives.

### 1.3 A closed set is spelled once

**House.** `SectionKey`, `AuthorKey`, `CalloutKind` and `Collection` are each
derived from the thing that defines them, not re-typed beside it.

`AuthorKey = keyof typeof registry` is the pattern: adding an author extends the
type, and a post naming a key that does not exist is a build error rather than
an empty byline.

Note the subtlety already paid for once: `as const satisfies` fixes the _keys_
as literals, which is what makes the set closed, and narrows the _values_ so
tightly that optional fields no author uses stop existing. The registry is
re-exported as `Record<AuthorKey, Author>` to widen them back.

## 2. Modules

### 2.1 Imports use the `@/` alias

**House.** `@/components/shot`, never `../../components/shot`.

### 2.2 Nothing is exported that nothing imports

**House.** An export nothing uses is either dead or too wide. Narrow it and let
`npm run typecheck` prove it was internal.

The first draft of the content module imported `statSync`, never called it, and
silenced the warning with `void statSync`. That is the shape to watch for: a
suppression is evidence the code is wrong, not a fix.

## 3. The linter and the formatter

`oxlint`, configured in `.oxlintrc.json`, with the `correctness`, `suspicious`
and `perf` categories as errors plus the `jsx-a11y` rules that can see through
this site's markup.

`prettier` at 100 columns, double quotes, trailing commas.

**`no-console` is an error.** A static site has no log to write to; a `console`
call is debugging left behind.

**Each tool reads less than the repository.** `npm run lint` is
`oxlint --deny-warnings src tests`, so it reads `src/` and `tests/` and stops
there. `npm run typecheck` reads the `.ts` and `.tsx` files `tsconfig.json`
includes, with `allowJs` off, so it never opens an `.mjs`. That leaves
`scripts/` formatted and nothing else: no lint, no types, and no run inside
`npm run verify`. A script a test imports is exercised by that test
(`scripts/lib/app-sync.mjs`, through `tests/app-sync.test.ts`); the image
script is checked only by running it, which is `operations.md` 7.5.
Widening the lint to `scripts/` is the obvious fix and hasn't been done; until
it is, the gap is named here so nobody reads a green `verify` as having read
the script they changed.

**A rule that fires is usually right.** `react/no-array-index-key` refuses
an index as a key, and on the legal pages' bold-text splitter it was correct
to: a key is how React tells one child from the next, and an index says only
where a child happens to sit. Key by the value that was drawn, composed where
two parts would share it, the way the emergency fund's card keys a square by
which row and which month it is
(`src/components/learn-art/emergency-fund.tsx:86`). Where position really is
the only honest key, stop producing an array: `src/components/legal-page.tsx:53`
passes the parts as variadic children and needs no key at all. Silencing the
rule would have kept a key that means nothing, plus an entry in §5 arguing
for it.

_Checked by:_ `npm run lint` and `npm run format:check`, both in
`npm run verify`.

## 4. `npm run verify`

`typecheck → lint → format:check → build → test`.

**The build runs before the tests, deliberately.** `tests/sections.test.tsx`
reads the built output in `out/` — the `noindex` meta tag, the sitemap, the
robots file — because those are what a crawler actually sees, and asserting on
the source instead would prove the intent rather than the artifact.

The cost is that a failing test comes after a slower step. The benefit is that
the tests check the thing that ships.

## 5. Rules that are off, and why

`.oxlintrc.json` is JSON and cannot carry comments, so every rule this project
silences is explained here. A rule turned off with no entry on this page is a
rule somebody disabled to make a build pass.

| Rule                            | Why it is off                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react/react-in-jsx-scope`      | False under the automatic JSX runtime, which this project uses (`tsconfig.json` sets `jsx: "react-jsx"`). The rule is checking for a React import that has not been necessary since React 17, and it fired on every component in the repository.                                                                                                                                            |
| `jsx-a11y/prefer-tag-over-role` | Off for one line, inline, and on everywhere else: the diagram's `<svg role="img">` at `src/components/learn-art/frame.tsx:87`. The rule asks for an `<img>`, and an `<img>` of the same drawing can't take the page's colors, so it would be a light picture on a dark page (`web.md` 5.8). Inline SVG with `role="img"` and a `<title>` is the pattern for a drawing that has to re-theme. |

`react/jsx-uses-react` is the rule usually disabled alongside
`react/react-in-jsx-scope`, and oxlint does not implement it — adding it to the
config is a parse error rather than a no-op, which is worth knowing before
copying an ESLint config in.

**House.** A rule is silenced inline only with its reason on the line above
the disable and a row in this table. The reason beside the code is for
whoever edits that line, who would otherwise take the rule's advice; the row
here is for somebody reading the rules rather than the files, who would
otherwise never learn the exception exists, because `.oxlintrc.json` can't
say so. The alternative, a bare disable comment, is a rule turned off with no
entry on this page by another route.

Nothing else is off, in the config or inline. `correctness`, `suspicious` and
`perf` are errors, and `--deny-warnings` means a warning fails the build too —
there is no budget and no ratchet, because this repository is small enough
that the right number of outstanding lint findings is zero.
