---
name: optimize
description: Audit and improve what the site ships — page weight, images, fonts, metadata, structured data and search discoverability. Use periodically, after adding images or a dependency, or when the site feels heavy.
---

# Make it lighter and easier to find

`npm run verify` holds weight to a budget and accessibility to WCAG on every
build. This is the pass that goes further than a gate can: a gate says "not
worse", and this asks "could it be better".

Run it after adding images or a dependency, and periodically. Not on every
commit — most of what it finds is a judgment, and a judgment in a gate is a
gate people route around.

## 1. Measure before changing anything

```sh
npm run build
npx vitest run tests/budget.test.ts
```

Then the breakdown the budget does not print:

```sh
for f in $(find out -name "*.js"); do
  printf "%6s KB  %s\n" "$(( $(gzip -c "$f" | wc -c) / 1024 ))" "${f#out/}"
done | sort -rn | head
find out -type f \( -name "*.webp" -o -name "*.png" \) -exec ls -lS {} + | head
```

**Know the floor.** About 170 KB gzipped is Next and React, and the homepage
pays it with no client component on it (`operations.md` 1.1). Time spent
shaving the other 30 KB is time not spent on the images, which are usually
where the weight actually is.

## 2. Images

The biggest lever on this site, because it ships screenshots.

- **Every image WebP**, and sized for the widest place it renders — not the
  widest screen. The screenshots ship at 1600px because that is the widest
  column.
- **`width` and `height` on every one** (`web.md` 5.3). Without them the page
  reflows as each arrives.
- **`loading="lazy"` on everything below the fold**, and `eager` with
  `fetchPriority="high"` on exactly one: the hero shot, which is the largest
  contentful paint.
- **Two widths, not one.** Each screenshot also ships at 1200px and
  `<picture>` picks. A `sizes` that does not match the CSS is worse than none,
  because the browser trusts it and gets the wrong file silently —
  `src/components/shot.tsx` names the two layouts and `web.md` 5.2 has the
  measurements.
- **Re-run `build:images`** after changing the generator, after pulling new
  screenshots, or after touching `brand.css`. It makes three things — the
  social card, a cover per post per theme, and the narrow screenshot copies —
  and it reads its palette out of the contract.

```sh
npm run build:images
```

## 3. Fonts

There is no webfont, and the stack matches the application's exactly
(`web.md` 3.2).

**Check the match, not the absence.** Grepping this tree for `@font-face` and
finding nothing proves only that no webfont was added _here_; the rule is
about two surfaces agreeing, and the other one is in another repository. Read
it over the network, at the ref the sync check resolves:

```sh
REF=$(node scripts/check-app-sync.mjs --json | node -p 'JSON.parse(require("fs").readFileSync(0, "utf8")).ref')
curl -fsSL "https://raw.githubusercontent.com/thtmnisamnstr/simple-balance/$REF/src/client/styles.css" \
  | grep -A 6 "font-family"
```

**Not `main`.** The site is kept in step with whichever ref that script
chooses, which until a release merges is the release branch, and a stack
checked against `main` is checked against a stylesheet the site is not
following. A `null` ref or a 404 is a failed check, not a match, and
`sync-from-app` §0 says how to tell why.

The sans stacks are byte-identical. The **monospace** stacks are not, on
purpose, and `web.md` 3.2 carries the argument and the condition that would
end it — so a run that notices the difference should read that before
"fixing" it. **If you add one, it is a change to both surfaces**, it is
self-hosted on each origin because `default-src 'self'` permits same-origin
fonts and forbids `fonts.gstatic.com`, and it needs `font-display: swap` and
a subset.

Adding a webfont to one surface and not the other is the most visible
possible divergence.

## 4. What the browser is asked to do

- **Client components.** `ls src/components/client/` is the whole audit.
  Three, each argued in `code/react.md` 1.1. A fourth is a decision.
- **No render-blocking anything.** No synchronous third-party script, because
  there is no third-party script at all (`web.md` 6.5).
- **Check the CSS is still all used.** The dead-class sweep is in
  `merge-prep` §4.

## 5. Findability

This is where the unforced errors are, because none of it is visible on the
page.

- **Title and description on every page**, unique, and the title under 60
  characters so a result listing does not truncate the half that identifies
  it (`tests/copy.test.ts` holds the homepage's).
- **Canonical on every page.** Page one of the blog lives at two URLs by
  necessity (`operations.md` 1.4) and its canonical is what stops them
  competing.
- **The sitemap matches the build.** `tests/sitemap.test.ts`, both
  directions.
- **Structured data still describes visible content** (`content.md` 5.13).
  Validate it rather than reading it:

  ```sh
  node -e '
  const html = require("fs").readFileSync("out/pricing/index.html","utf8");
  for (const m of html.matchAll(/application\/ld\+json">(.*?)<\/script>/gs))
    console.log(JSON.parse(m[1].replaceAll("\\u003c","<"))["@type"]);'
  ```

- **`noindex` is still only on the unannounced sections**, and nowhere else.
  One stray one is a page silently removed from search.

## 6. What not to do

- **Do not add Lighthouse to CI.** It measures a network and a CPU that are
  not the same twice; a flaky performance gate is one people re-run rather
  than read. Run it by hand here if you want a second opinion.
- **Do not add analytics to find out if this worked.** `operations.md` 3.2
  and `docs/roadmap.md` 3 — this origin talks to nothing, and that property
  is load-bearing for the CSP argument.
- **Do not raise a budget to make a change fit.** Raising one is fine;
  raising one without saying so in the commit is how the budget stops
  meaning anything.

## 7. Finish

`npm run verify`, then look at the site — a page that got lighter and worse
is a regression no test here can see. Then **`merge-prep`**.

Report the before and after as numbers, and say plainly where you found
nothing. "Images were already right" is a result.
