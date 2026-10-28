---
name: optimize
description: Audit and improve what the site ships — page weight, images, fonts and what the browser is asked to do. Use periodically, after adding images or a dependency, or when the site feels heavy.
---

# Make it lighter

`npm run verify` holds weight to a budget and accessibility to WCAG on every
build. This is the pass that goes further than a gate can: a gate says "not
worse", and this asks "could it be better".

`merge-prep` runs it on every branch (its §10), and on its own it's worth a run
after adding images or a dependency, and periodically. It isn't in
`npm run verify`: most of what it finds is a judgment, and a judgment in a
gate is a gate people route around.

**Run from `merge-prep`, it's about the branch.** Measure (§1) every time, so
the report has numbers. Spend the rest on what the branch added or changed:
an image or a screenshot (§2), a dependency or a drawing (§1 and §4). A
branch that touched none of those says so, and that's a result. A page's
title, description and dates are `seo-review`'s and `aeo-review`'s now (§5),
and both run before this.

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
  `fetchPriority="high"` on exactly one: the dashboard that rises out of the
  homepage's hero, the only screenshot a reader sees before scrolling. The
  hero itself is words and an inline drawing, so check which of them is the
  largest contentful paint at each width before moving the priority.
- **Two widths, not one.** Each screenshot also ships at 1200px and
  `<picture>` picks. A `sizes` that does not match the CSS is worse than none,
  because the browser trusts it and gets the wrong file silently —
  `src/components/shot.tsx` names the two layouts and `web.md` 5.2 has the
  measurements.
- **Re-run `build:images`** after changing the generator, after pulling new
  screenshots, after touching `brand.css`, and after adding, retitling or
  removing a page. It makes four things: the homepage's social card
  (`public/og.png`), a card per page in `public/og/`, a cover per post per
  theme, and the narrow screenshot copies. It reads its palette out of the
  contract, and it writes `scripts/build-images.sources.json`, the record
  `tests/export-shape.test.ts` holds each card's title to and
  `tests/home-page.test.tsx` holds each narrow copy to.

```sh
npm run build:images
```

**It never deletes**, and `operations.md` 7.1 says what that leaves shipping
with every test green. Delete a removed or renamed page's card by hand in the
same change, and a removed screenshot's `1200/` copy with it.

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

**Not a ref typed by hand.** The site is kept in step with whichever ref
that script chooses: `main` once a release has merged, and the release
branch while one is open. A stack checked against any other ref is checked
against a stylesheet the site is not following. A `null` ref or a 404 is a
failed check, not a match, and `sync-from-app` §0 says how to tell why.

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
- **No render-blocking anything, and nothing from anybody else.** There is
  no third-party script (`web.md` 6.5), and the content security policy
  admits no origin but this one, so there is no external request to audit.
  If one ever appears, `tests/budget.test.ts` won't see it: it measures what
  this site ships, so a script fetched from a vendor is weight no gate here
  would catch.
- **The homepage's motion costs no script.** The hero, the jobs, the chat and
  the closing picture are inline SVG and CSS, so they add markup and no
  JavaScript (`web.md` 8.2). Inline drawings are weight in the HTML, though,
  and the homepage carries six of the learn articles' pictures and the
  index's, so a page that got heavier after a drawing changed is worth
  measuring here.
- **Check the CSS is still all used.** `tests/dead-css.test.ts` holds the
  classes on every build; what it can't see is `merge-prep` §5.

## 5. Findability, which is two skills of its own now

Titles, descriptions, structured data, the sitemap's dates, the page cards'
words, the Markdown copies and `/llms.txt` were a section here, and moved to
**`seo-review`** and **`aeo-review`**, which `merge-prep` runs just before
this. Run on its own, this skill doesn't cover them: run those.

What stays here is what they weigh. A card is an image, so its size is §2's
and `tests/budget.test.ts`'s, and redrawing one is `npm run build:images`
like any other picture; its words are theirs.

## 6. What not to do

- **Do not add Lighthouse to CI.** It measures a network and a CPU that are
  not the same twice; a flaky performance gate is one people re-run rather
  than read. Run it by hand here if you want a second opinion.
- **Do not add analytics to find out if this worked.** `docs/roadmap.md` 3 has
  the decision: a third-party tag is a vendor, a host in a policy that names
  none, and a sentence the privacy policy would have to retract, since it
  says this site loads nothing from another origin. `web.md` 6.5 forbids it.
- **Do not raise a budget to make a change fit.** Raising one is fine;
  raising one without saying so in the commit is how the budget stops
  meaning anything.

## 7. Finish

`npm run verify`, then look at the site — a page that got lighter and worse
is a regression no test here can see. Then **`merge-prep`**.

**When `merge-prep` called this, return to it instead.** Run §1 again for the
after numbers, since the build is what they measure, and leave the verify and
the last look to its §12, which comes after the guides. The report tells that
look where to go.

Report the before and after as numbers, and say plainly where you found
nothing. "Images were already right" is a result. Then what changed, by kind:

- **Each picture this changed**, re-encoded, resized or redrawn, by file.
- **Any words this rewrote**, by page, with the old beside the new. A pass
  about weight rarely touches one, and under `merge-prep` one it did lands
  after `merge-prep` §3 read the claims and `merge-prep` §6 the policy, so
  this list is where anybody reads it as copy rather than as metadata.
