# The source

TypeScript, React, and the tools that check both.

- **[`react.md`](react.md)** — components, server versus client, props.
- **[`testing.md`](testing.md)** — what is worth testing on a marketing site,
  and what is not.
- **[`comments.md`](comments.md)** — why the comments here are dense.

## 1. TypeScript

### 1.1 Strict, plus four

**Binding.** `strict`, and also `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitOverride` and
`noFallthroughCasesInSwitch`.

`noUncheckedIndexedAccess` is the one that earns its keep here: the content
pipeline indexes arrays constantly — neighbours, first author, heading levels —
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

_Checked by:_ `npm run lint` and `npm run format:check`, both in
`npm run verify`.

## 4. `npm run verify`

`typecheck → lint → format:check → build → test`.

**The build runs before the tests, deliberately.** `tests/sections.test.tsx`
reads the built output in `out/` — the `noindex` meta tag, the sitemap, the
robots file — because those are what a crawler actually sees, and asserting on
the source instead would prove the intent rather than the artefact.

The cost is that a failing test comes after a slower step. The benefit is that
the tests check the thing that ships.

## 5. Rules that are off, and why

`.oxlintrc.json` is JSON and cannot carry comments, so every rule this project
silences is explained here. A rule turned off with no entry on this page is a
rule somebody disabled to make a build pass.

| Rule                       | Why it is off                                                                                                                                                                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react/react-in-jsx-scope` | False under the automatic JSX runtime, which this project uses (`tsconfig.json` sets `jsx: "preserve"` and Next compiles with `react-jsx`). The rule is checking for a React import that has not been necessary since React 17, and it fired on every component in the repository. |

`react/jsx-uses-react` is the rule usually disabled alongside it, and oxlint
does not implement it — adding it to the config is a parse error rather than a
no-op, which is worth knowing before copying an ESLint config in.

Nothing else is off. `correctness`, `suspicious` and `perf` are errors, and
`--deny-warnings` means a warning fails the build too — there is no budget and
no ratchet, because this repository is small enough that the right number of
outstanding lint findings is zero.
