---
name: draw-and-animate
description: Make or change a drawing on this site (a learn hero or diagram, a learn glyph or docs mark, a docs group picture, a homepage drawing or loop) and its motion, then look at it frame by frame in both themes and at both widths. Use when asked for a new picture, diagram, animation or loop, when a drawing looks wrong, or when write-content or sync-from-app needs pictures.
---

# Draw a picture, and make it move

Every picture on this site is drawn in code, in one of two visual languages,
and most of them move on one of four clocks. `docs/standards/web.md` 5.7 to
5.10 and 8 say what a drawing has to be. This is how one gets made, and how
to look at it, because nothing in `npm run verify` can see a label running
into a bar, a coin landing before its pan is there, or a loop that's blank on
the frame a reader stops at. jsdom has no layout engine and no clock, so
every one of those is a person, or an agent, reading a frame.

`write-content` sends a learn article's pictures and a docs page's mark here,
`sync-from-app` §5 sends a new docs group's picture and whatever else a new
screen needs, and `design-review` sends a drawing it found wrong. Use it on
its own for any picture, diagram, mark or motion that's new, changed, or
looks wrong. §6 is also where the commands for looking at motion live, once,
for `design-review` §4 to cite, and §10 says where to go when it's done,
which isn't always `merge-prep`.

## 1. Pick the language and the clock

Decide both before drawing anything, from where the picture sits and what
it's for:

| Drawing              | Where it lives                                       | Language                                         | Clock (`web.md` 8.3)                                                                     |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| A learn hero         | `Hero` in `src/components/learn-art/<slug>.tsx`      | The art panel, 1200 by 600                       | Once on load; on its card, after a rested pointer, or by scroll on a touch screen        |
| A learn diagram      | `diagrams` in the same module                        | The page's colors, at most 560 wide              | Scroll                                                                                   |
| A learn glyph        | `src/components/learn-art/glyphs.tsx`                | The logo's 24-unit grid, 2-unit round stroke     | The clock of the picture it sits in                                                      |
| A docs mark          | `src/components/docs-art/glyphs.tsx`                 | The same grid, as separate strokes               | With the intro once; on its card, after a rested pointer, or by scroll on a touch screen |
| A docs group picture | `groupArt` in `src/components/docs-art/pictures.tsx` | The art panel, built from its pages' marks       | Scroll                                                                                   |
| A blog drawing       | `src/components/blog-art.tsx`                        | The art panel                                    | Once on load                                                                             |
| A homepage drawing   | `src/components/home-art.tsx`, or `src/app/page.tsx` | The panel (hero, chat) or a diagram (correction) | A loop, with `LoopStop`                                                                  |

- **The panel** (`web.md` 5.7, 5.9) is dark in both themes, hidden from
  assistive technology, and holds one object. It's for a picture that says
  nothing its heading doesn't. Words on it take the panel's colors, never the
  page's, and the light sits behind the drawing rather than the words.
- **A diagram** (`web.md` 5.8) is for something the reader is meant to
  understand: page colors through tokens, a caption saying what to notice, and
  a description naming everything drawn, numbers included.
- **A mark** stands for one page. A learn glyph never stands in for a docs
  page or the reverse, because each set is held one for one to its pages
  (`docs/standards/code/react.md` 5).
- **The clock comes from where it sits.** At the top of a page it plays once
  on load. Inside a card it waits for a rested pointer, because twelve cards
  playing on their own are twelve moving pictures, and on a touch screen,
  which has no pointer, it's built by scroll as the card comes in (`web.md`
  8.3), so a card's drawing needs `--s` values that read well both ways.
  Below the fold it's built by scroll, because played on load it's over
  before anybody reaches it. A loop happens only where the owner asked for
  one, which is the homepage today, and AGENTS.md says what a loop owes the
  reader.

## 2. Read the one already drawn for its kind

Most of the traps in §9 are solved in one of these, so read the nearest
before drawing:

- **`src/components/learn-art/frame.tsx`**, for every drawing. `ArtFrame`
  (`src/components/learn-art/frame.tsx:24`) is the panel, the grid and the
  hiding; `Orbits` (`src/components/learn-art/frame.tsx:50`) the two rings;
  `DiagramFrame` (`src/components/learn-art/frame.tsx:69`) names the svg by
  its `<title>`; and `css()` (`src/components/learn-art/frame.tsx:104`) is the
  typed way to pass `--s`, `--c`, `--dur` and a pivot, so a misspelled
  property fails the typecheck instead of silently not moving. A drawing goes
  through these rather than writing its own `<svg>`.
- **`src/components/learn-art/net-worth.tsx`**, with its words in
  `src/content/learn-art/net-worth.ts`, for any learn picture. A hero and two
  diagrams: placement on an outer group and motion on an inner one
  (`src/components/learn-art/net-worth.tsx:23`), a beam swung about its pin,
  pans that hang plumb at rest, and every word imported.
- **`src/components/docs-art/pictures.tsx`**, for a docs picture. Each group's
  picture is composed from its pages' marks (`Chip`, `DocMark`), so the cards
  under it are already in it, and `groupArt`
  (`src/components/docs-art/pictures.tsx:308`) is the record. Its staggers
  stop at 8, because a group picture's scroll clock runs faster than a
  diagram's (§5).
- **`src/components/home-art.tsx`**, for anything that loops: layout as
  module constants, two-line rows because a label and its amount on one line
  ran into each other at every width, and a sum the test adds up.
- **`src/components/blog-art.tsx`**, for overlapping cards: `Card`
  (`src/components/blog-art.tsx:57`) lays a veil on a base so a stack hides
  what's under it.

## 3. Write the words first

Every word a drawing shows lives in a content module, because
`tests/copy.test.ts` reads modules and can't read an SVG:

- a learn picture's: `src/content/learn-art/<slug>.ts`, exported through
  `src/content/learn-art/index.ts`;
- a docs group's: `docsIndex.groups` in `src/content/sections.ts`;
- the homepage's: `heroArt`, `correctionArt`, `agents` and `motion` in
  `src/content/home.ts` (`docs/standards/content.md` 3.3).

The drawing takes them through `typesetAll` (`src/lib/typeset.ts:34`), so its
quotes and dashes match the prose beside it (`web.md` 3.3).

**A figure in a drawing is a figure on the page.** Draw the article's own
worked example, never a rounder number that looks nicer, and change both
together. The description names every number drawn, and a sum adds up:
`tests/home-page.test.tsx` adds the hero's. A real name in a drawing, such as
a tool the chat calls, has to be true at the snapshot's release
(`content.md` 3.3), and an invented one is plainly an example.

Write the caption and the description before the drawing. If the caption
can't say what to notice in one sentence, the diagram is showing two things,
and it's cheaper to find that out in a sentence than in an SVG.

## 4. Draw it

`web.md` 5.10 is the guidance. In short:

- **The grid.** A panel picture on 1200 by 600, with what matters inside
  roughly x 120 to 1080 and y 40 to 560, so it still reads as a card
  thumbnail and as a hero on a 390-pixel phone. A diagram at most 560 wide,
  with text of at least 22 units. A mark on 24.
- **The weights.** One bold object at the logo's weight (`.art-line`, a
  10-unit round stroke), muted lines (`.art-line-muted`) for what holds it
  up, frosted cards (`.art-veil`) with one tilted −3 to −5°, and mint
  (`.art-mint`, `.art-line-mint`) for the one thing that matters.
- **Overlap.** A veil card that overlaps another sits on an `.art-base` rect,
  or two translucent cards read as one smear.
- **Color.** Panel classes on the panel. In a diagram, the `.dg-fill`,
  `.dg-stroke` and `.dg-text` family and `css({ "--c": "var(--…)" })`, never
  a literal and never a `fill` attribute (`web.md` 5.8). Carry the meanings
  across diagrams: green for what you own, what comes in or what's good, red
  for what you owe or what goes out, amber for a warning or a card, blue for
  neutral.
- **Strokes that will draw.** Every path that draws carries
  `pathLength={1}`, and a circle that draws is written as two arcs, because a
  `<circle>` can't be dash-drawn in every browser
  (`src/components/docs-art/glyphs.tsx:11`). A docs mark is a list of
  separate stroke paths for the same reason.
- **Labels** go beside a fill, never on it, because the fill re-themes and
  the text on it wouldn't.

## 5. Plan the motion as a timeline, in seconds, before any keyframe

Write the sequence down first as times: what arrives, when, and what it lands
on. Only then turn it into `--s` values. A part gets `.mo`, one effect class
and its place in the order (`web.md` 8.4):

```tsx
<g transform="translate(96 92) rotate(-4)">
  <g className="mo mo-rise" style={css({ "--s": 2 })}>
    …
  </g>
</g>
```

The effects are `.mo-rise`, `.mo-drop`, `.mo-fade`, `.mo-pop`, `.mo-grow-y`,
`.mo-grow-x`, `.mo-draw`, `.mo-slide-l`, `.mo-slide-r`, `.mo-tilt`,
`.mo-spin`, `.mo-swing` and `.mo-float`, and `web.md` 8.4 says what each
suits. What one step of `--s` buys depends on the clock:

| Clock                                        | One step of `--s`           | What to keep                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Once, on load                                | 120ms                       | Each part ends at `--s` × 0.12s plus its duration (0.8s) times its plays, by about 3.5s. The net worth hero's swing, at `--s` 6 with two plays of 1.4s, ends at 3.52s.                                                                                                                                                                  |
| A card, after a rest                         | 90ms                        | The same picture, replayed a little faster.                                                                                                                                                                                                                                                                                             |
| Scroll: a learn diagram, the closing picture | 5% of the figure's entry    | A part runs from `--s` × 5% to 35% plus `--s` × 5%, so 13 is the last distinct step. Past it, steps bunch at the end rather than finish after the reader arrives. `.diagram .mo` (`src/styles/site.css:2096`) and `.home-closing-art .mo` (`src/styles/site.css:3817`) set it.                                                          |
| Scroll: a docs group picture                 | 7% of the figure's entry    | A part runs from `--s` × 7% to 40% plus `--s` × 7%, capped at 60% and 100%, so 8 is the last step that runs its whole span, and every step from 9 up shares one window. `.docs-group-art .mo` (`src/styles/site.css:4334`) sets it.                                                                                                     |
| Scroll: a card on a touch screen             | 3.5% of the picture's entry | A part runs from `--s` × 3.5% to 30% plus `--s` × 3.5%, the rested pointer's 90ms over 0.8s as a share, so a picture staggered for the pointer reads the same scrolled, and 20 is the last distinct step. The touch block's `.learn-card .mo` (`src/styles/site.css:4385`) sets it, and `tests/learn.test.ts` holds the pictures to it. |
| A loop                                       | 120ms, inside `--cycle`     | The hold and the gap, below.                                                                                                                                                                                                                                                                                                            |

**The scale belongs to the surface, not the drawing.** A picture moved from
one scroll surface to another keeps its `--s` values and changes speed, so
a diagram's 13 steps put into a group picture bunch everything from 9 up into
its last window. Restagger it for the surface it lands on. A card's picture
is staggered for the pointer's 90ms and then read on a touch screen's scroll,
which is why that scale is the same share and runs to 20. And a new scroll
surface names its view timeline on the drawing itself, never on a panel
around it, as a learn card names its on its picture rather than the card,
which §9 has the story of.

- **Nothing arrives before what holds it up.** The card before its bars, the
  stand before the beam, the pan before the coin in it.
- **One transform per element.** The placement, a `transform` attribute, goes
  on an outer `<g>` and `.mo` on an inner one, because an animated CSS
  transform replaces the attribute and the part loses its placement. A second
  motion on the same thing gets another wrapper or an individual property
  such as `rotate:`.
- **A pivot that isn't the part's own center** is
  `css({ transformBox: "view-box", transformOrigin: "600px 172px" })`, the
  origin in viewBox units, as the net worth beam turns about its pin.
- **Last beats that move in place** (`.mo-swing`, `.mo-float`) run twice and
  stop.
- **A card's words rise, and never fade in.** A card the reader stopped
  scrolling at held its words part-faded, and axe measured them as low as
  1.2:1 (`web.md` 8.3). A diagram's numbers may fade, because the diagram is
  finished by the time all of it is on screen.

**For a loop** (`web.md` 8.5):

- **Only five effects loop**: rise, fade, pop, slide-l and draw. Any other
  inside `.mo-loop` either sits finished or takes its parent's looping
  effect, because the effect isn't reset on `.mo`, and nothing checks this
  but the frames.
- **Keep two numbers.** With S the largest stagger (the largest `--s` times
  0.12s), the finished picture holds about 0.64 × cycle − S, and the blank
  gap before it builds again is 0.22 × cycle − S, which has to stay positive
  or the first parts rebuild while the last are still fading. At 10s with
  `--s` up to 10, that's a 5.2s hold and a 1s gap. A longer drawing sets its
  own `--cycle` on its wrapper rather than squeezing.
- **A scene that happens in an order**, like the chat, gets a keyframe per
  role on its own cycle, with its timeline in seconds in a comment above the
  keyframes (search `src/styles/site.css` for "sixteen-second cycle"), and
  uses `--s` only for parts that repeat a role. It owes the same hold as any
  loop, about five seconds of the finished picture counted from when its
  last part lands, not from when the scene starts, so a scene that takes
  longer to tell gets a longer cycle rather than a shorter hold. The chat's
  answer is whole at about 6.6s and holds to 12.6s, on sixteen seconds. Write
  the hold into the comment, and look at it in the frames (§6), because
  nothing else measures it.
- **A part that exists only while playing** (a spinner, "Thinking") is
  `opacity: 0` in its base rule (`src/styles/site.css:3470`), so a stopped
  loop and a reader who asked for less motion see the finished exchange.
- **The stop is `animation: none`**, never `paused`, which can freeze in the
  blank gap, and a part with its own shorthand stays less specific than the
  stop rule (`src/styles/site.css:2147`).
- **Grow by `clip-path: inset(…)`, never by height**, which pushes the page
  down twice a cycle (`web.md` 8.6).

**A new effect** gets a keyframe that ends at the element's own state, a
looping twin on the 8/72/78 timeline if it might ever loop, and its rule
inside `@media (prefers-reduced-motion: no-preference)`, which
`tests/learn.test.ts` holds every animation to (`web.md` 8.1). A new surface's
motion rules go above the loop block in `site.css`, because equal specificity
lets the later rule win, or no loop goes inside that surface: the touch block
sits below it because it has to follow the card rules it replaces, and no
card holds a loop (`web.md` 8.3).

## 6. Look at it

`web.md` 8.7 is the method. This section is the one copy of the commands
for looking at motion: `design-review` §4 lists the states worth a look
across the whole site and sends its reader here for how to capture each, so a
better command goes in here and nowhere else. Build first, because
`npm run frames` serves `out/`. The header of `scripts/frames.mjs` lists every
option; these are the ones that answer something.

**The finished picture**, under reduced motion, at 1280 and 390 in both
themes. With `--selector` it's one drawing; without, it's the viewport, or the
whole page with `--full`, for as many paths as you name:

```sh
npm run build
PAGE=/learn/net-worth/
npm run frames -- --path "$PAGE" --selector .learn-hero --sheet
npm run frames -- --path / --path "$PAGE" --full --sheet
```

A whole-page capture of the homepage at 390 sometimes shows the two
screenshots under the feature list still empty, under every Chromium tried:
the script's wait for images can come back before they're drawn. A blank screenshot in a
`--full` frame is that rather than the page, so capture it again before
reporting it.

**A play-once, part-way.** `--frames` pauses every animation on the
document's clock at each time given, in milliseconds. For a picture that
plays once, 0, 300, 700, 1200, 2000 and 3500 cover it:

```sh
npm run frames -- --path "$PAGE" --selector .learn-hero --frames 0,300,700,1200,2000,3500 --sheet
```

**A loop, across one whole cycle**, the blank gap included. The hero and the
correction share the ten-second cycle, and 400, 2000, 5000, 7500 and 9500
catch either one arriving, built, holding, leaving and blank. `.home-loop`
wraps all three of the homepage's loops and the script takes the first match,
which is the hero, so the correction is picked out as `.home-correction`. The
chat runs on its own sixteen-second cycle, and its times come from the
timeline comment above its keyframes (search `src/styles/site.css` for
"sixteen-second cycle"): 1700, 3000, 7000, 10000, 13000 and 15600 catch the
question asked and the assistant thinking, the tools running, the answer
whole, the hold, the leaving and the blank. A changed cycle changes those
numbers, so read the comment before trusting the list.

```sh
npm run frames -- --path / --selector .home-loop --frames 400,2000,5000,7500,9500 --sheet
npm run frames -- --path / --selector .home-correction --frames 400,2000,5000,7500,9500 --sheet
npm run frames -- --path / --selector .home-chat-loop --frames 1700,3000,7000,10000,13000,15600 --sheet
npm run frames -- --path / --full --frames 400,5000,9500 --widths 390 --out .frames/height
file .frames/height/*.png
```

The last two answer whether the page's height holds across the cycle:
whole-page captures at three points in it, kept in their own folder because
the captures above share their names, and `file` prints each one's size. The
heights match, or something in a loop is pushing the page (`web.md` 8.6).

**A drawing built by scroll.** `--scroll N` scrolls the `--selector` element
from just below the fold to near the top in N steps, gradually, as a reader
does, and captures the viewport at each. It refuses to run without a
selector. `DiagramFrame` gives each diagram's title the id `dg-<name>-title`,
which picks out one diagram of several:

```sh
npm run frames -- --path "$PAGE" --selector '.diagram:has(#dg-net-worth-trend-title)' --scroll 8 --sheet
npm run frames -- --path /docs/ --selector .docs-group-art --scroll 8 --sheet
npm run frames -- --path / --selector .home-closing-art --scroll 8 --sheet
```

**A card on a touch screen** is built by scroll too, which a capture shows
only under `--touch`, emulating a phone's touch screen and not only its width:
`(hover: none)` follows touch, not width, so a 390 capture without it is a
narrow desktop whose cards wait for a pointer. Take a card's list item in
finer steps than a diagram, because its picture builds over about 166px of
scroll on a phone, and the closing picture again, whose rings turn with the
scroll there:

```sh
npm run frames -- --path /learn/ --selector '.learn-grid > li:nth-child(4)' --touch --widths 390 --scroll 12 --sheet
npm run frames -- --path / --selector '.home-job-grid > li' --touch --widths 390 --scroll 12 --sheet
npm run frames -- --path / --selector .home-closing-art --touch --widths 390 --scroll 8 --sheet
```

**The report.** `--report` loads each page with motion on and prints, for
each width and theme, a heading with how many animations the page has and
when the longest play-once ends, then a row per animation: its clock (once,
loop or scroll), its keyframe, `delay 360ms, 800ms a play, ends 1160ms` for
one on the document's clock (a loop's row ends never), or "paced by scroll"
for one built by scroll, and the element it runs on. Then it takes each
element that names a view timeline, found by its computed style, so a
card's picture counts under `--touch`, and reads it twice. With its top edge
just below the screen it names any with a part already under way, "under way
before it arrives", which is a timeline the page's scroll isn't moving. That
edge is the layout box's, which is what a timeline measures, because a
card's rise carries its picture up to 32px lower. With its bottom edge just
on screen it names any with a part short of finished, "unfinished at entry",
or says every scroll-built drawing finishes at entry. Only a part whose range
ends in `entry` owes that; the closing rings turn across the whole passage
and are meant to be part-way. Add `--touch` for a phone's cards. On its own
it captures no pictures; add `--frames` or `--scroll` to the same run for
those.

```sh
npm run frames -- --path "$PAGE" --path / --path /docs/ --report
npm run frames -- --path /learn/ --path / --path /docs/ --report --touch
```

A play-once whose row ends past about 3500ms is too long (§5), an
"unfinished at entry" line is a drawing a reader can stop scrolling on
part-built, which §5's table and §9's trap about the panel explain, and an
"under way before it arrives" line is a timeline that the page's scroll
doesn't move, which is the same trap's second half.

**A card's clock.** The script drives no pointer, so on a screen that hovers
a card is checked with a short Playwright run against the built site on port
4321 (`npx serve out -l 4321`, which `.claude/launch.json` also starts). It
counts the card animations running after a pass-over, after a rest, and while
the page scrolls under a parked pointer. The first should be zero and the middle
shouldn't. The last counts the cards a scroll leaves under the pointer for its
quarter-second rest, which play once each, by the owner's decision
(`web.md` 8.3): a number that stays small is right, and one that climbs with
every card the scroll passes means a card is playing on a crossing, which is
the defect. A card's hover lift is a transition and shows up in
the same list, and a learn card's rise runs on a view timeline, which is why
it counts only entries with an animation name on the document's clock. For
the docs index, change the path to `/docs/` and the locator to `.docs-card`:

```sh
node --input-type=module -e '
import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:4321/learn/");
const playing = () => page.evaluate(() => document.getAnimations().filter((a) =>
  a.animationName && a.timeline === document.timeline && a.playState === "running").length);
const card = page.locator(".learn-card").first();
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(4000);
const box = await card.boundingBox();
const over = [box.x + box.width / 2, box.y + box.height / 3];
await page.mouse.move(...over);
await page.waitForTimeout(100);
console.log("passing over:", await playing());
await page.waitForTimeout(300);
console.log("resting:", await playing());
await page.mouse.move(2, 2);
await page.waitForTimeout(3000);
await page.mouse.move(...over);
let most = 0;
for (let tick = 0; tick < 20; tick += 1) {
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(80);
  most = Math.max(most, await playing());
}
console.log("parked under scroll:", most);
await browser.close();'
```

Read every image, not a sample, and ask of each:

- Does it read at a glance, at 390 as well as 1280?
- Does anything float before what holds it up arrives?
- Do the labels clear each other and the fills, in both themes, at 390?
- Are the numbers the page's numbers?
- Is a play-once done by about 3.5s, and is a scroll-built drawing finished
  at entry?
- Does a card wait for a rested pointer, and play only once, and only where
  the pointer came to rest (`web.md` 8.3)? On a touch screen, does it build
  as it comes in and finish once its picture is on screen?
- Does checking the stop box leave the finished picture, and does the page's
  height hold across the cycle?

## 7. Several at once

**Lay them side by side, then read for consistency rather than for each
one.** The indexes are already contact sheets: `npm run frames -- --path
/learn/ --full` shows every learn hero as a card, and `/docs/` every group
picture and every mark. Look for the one busier or emptier than the rest, a
label size that differs, and a color meaning one drawing uses differently.

**For parallel agents, one copy of the repository per drawing.** Two agents
in one tree overwrite each other's `out/` and each other's shared records.

```sh
for slug in net-worth emergency-fund; do
  COPY="${TMPDIR:-/tmp}/draw-$slug"
  rsync -a --exclude node_modules --exclude .next --exclude out --exclude .git ./ "$COPY/"
  cp -Rc node_modules "$COPY/node_modules"
done
```

`cp -c` is an APFS clone on macOS, so the copy costs almost nothing, and a
symlinked `node_modules` is not an option, because it breaks Turbopack. Give
each agent only the files it owns, its drawing and its words module, and copy
back only those. The shared records (the registry, the
glyph files, `groupArt`, the content index) stay with whoever coordinates,
and an agent hands back its entry as text.

## 8. Wire it in and verify

- **A learn picture**: its `art` in `learnArt`
  (`src/components/learn-art/registry.ts:23`), its glyph in `glyphs` in
  `src/components/learn-art/glyphs.tsx`, and its words exported from
  `src/content/learn-art/index.ts`.
- **A docs mark**: an entry in `docGlyphs` keyed by the page's slug. Without
  one `docGlyph` throws and the build names the page
  (`src/components/docs-art/glyphs.tsx:153`).
- **A docs group picture**: an entry in `groupArt`, the group's words in
  `docsIndex.groups`, and its name in `content/docs/_sections.json`
  (`content.md` 5.5). A group missing from any one of the three fails
  `tests/docs-features.test.ts`.
- **A homepage loop**: the drawing inside `.mo-loop` with `LoopStop` beside
  it, outside the hidden part, and the count of loops in
  `tests/home-page.test.tsx` raised in the same commit, because that count is
  how a loop without a stop gets caught.

Then:

```sh
npx vitest run tests/learn.test.ts tests/docs-features.test.ts tests/home-page.test.tsx \
  tests/copy.test.ts tests/dead-css.test.ts
npm run verify
```

When `merge-prep` will run after this, its §12 runs `npm run verify` once,
over everything, so the targeted tests are enough here and the full suite
can wait for it.

**Check the finished picture's contrast on purpose.** The accessibility audit
runs on the page moving, so on a loop it measures whichever frame it lands on.
Under reduced motion every loop rests on its finished picture, so this
measures that, in both themes and at both widths, against the built site on
port 4321 as §6's card check is. `design-review` §4 sends its reader here for
the same check across pages, so set `PAGE` to each one in turn:

```sh
PAGE=/ node --input-type=module -e '
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch();
for (const colorScheme of ["light", "dark"]) {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 }, colorScheme, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("http://localhost:4321" + process.env.PAGE);
    const { violations } = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    console.log(colorScheme, width, violations.flatMap((v) => v.nodes.map((n) => n.target.join(" "))));
    await context.close();
  }
}
await browser.close();'
```

Report which frames were looked at, at which widths and in which themes, and
what was changed because of them. "Looked fine" with no frames named is a
report nobody can check.

## 9. The traps that cost time

These are the ones that cost time here, or are one edit away from it, and
each has its home in a guide:

- **A `transform` attribute and an animated transform on one element.** The
  animation replaces the placement, so the part moves somewhere it was never
  drawn. Wrap it (`web.md` 8.4).
- **A `<circle>` that won't dash-draw.** Write it as two arcs (`web.md` 8.4).
- **A dot before a drawn stroke.** A round cap on a dash of no length is a
  dot, which is why the gap is twice the dash (`web.md` 8.4).
- **An effect with no looping version inside a loop.** It sits finished, or
  loops as its parent does (`web.md` 8.5).
- **A surface rule later in `site.css` overriding a loop.** Equal
  specificity, so the later rule wins, and a loop nested in that surface would
  stop looping (`web.md` 8.3).
- **Chrome not treating an SVG `<g>` as a style container.** A style query
  never matches inside one, so a mark inside a ring sat still while the ring
  turned. Let it follow its parent with `animation-play-state: inherit`
  (`src/styles/site.css:3795`).
- **A hover firing under a parked pointer.** Chrome moves `:hover` when the
  page scrolls under a pointer that hasn't moved. Wait on `--play`, which
  turns on 250ms after the hover does (`web.md` 8.3).
- **A card's text fading in, held at low contrast where the reader stopped.**
  Rise it instead (`web.md` 8.3).
- **A glow behind words.** The learn intro's lede measured 3.6:1. The light
  goes behind the drawing (`web.md` 5.9).
- **A view timeline on the box around a drawing.** The closing picture's sat
  on `.home-closing`, the whole panel, so its parts were paced by the panel's
  entry, and three were still popping when the drawing's own bottom edge was
  on screen, which is where a reader stops. `.home-closing-art` owns it now,
  and `.home-closing-art .mo` is the closing picture's scroll rule
  (`src/styles/site.css:3817`). A learn card's, on a touch screen, is on its
  picture rather than the card for the same reason: paced by the card's list
  item, every picture on /learn/ still had parts arriving with its bottom
  edge on a phone's screen. A timeline goes on the element whose bottom
  edge is the one that matters, which is also the element `--report`
  measures (`web.md` 8.3), and nothing between it and the page may hide its
  overflow: `hidden` makes a scroller, so the timeline measures a box that
  never moves and holds still, which is how the closing picture sat finished
  on every screen until its panel clipped with `overflow: clip`. `--report`
  names that as "under way before it arrives".
- **A stagger past its surface's last step.** A docs group picture runs at 7%
  a step, a diagram at 5% and a card on a touch screen at 3.5%, so steps past
  8 in a group picture, past 13 in a diagram, or past 20 in a card's picture,
  all land in one window (§5).
- **A narrow window taken for a phone.** `(hover: none)` follows touch
  emulation, not the width, so a 390 capture or browser context without
  touch is a narrow desktop, and its cards wait for a pointer. Pass
  `--touch` to the frames script, and `isMobile` with `hasTouch` to a
  Playwright context (`web.md` 8.3).
- **A bare backticked class in a guide.** `tests/skills.test.ts` reads a
  backticked hyphenated name as a skill, so a class is written with its dot
  and a property with its value (`docs/standards/writing.md` §What a guide's
  backticks survive).

## 10. The documents, and where to go next

A drawing that needed a new rule, a new effect or a new clock changed what
`web.md` describes, and so does a timing that moved, such as a loop's cycle
or a surface's scroll step. Fix any source comment that states the drawing's
timing now (`docs/standards/code/comments.md` 4), because nobody else will
look at it. The guide is **`guides-update`**'s, and who runs it depends on
how you got here:

- **On your own**, go on to **`merge-prep`**, whose §11 runs `guides-update`
  last over the whole branch. If you're stopping short of a merge, run
  `guides-update` now instead, so the rule lands in the same commit as the
  drawing.
- **Sent by another skill** (`write-content`, `sync-from-app` §5, or
  `design-review` fixing a drawing it found), return to it instead, with
  which frames you looked at and any rule that changed. It decides what
  comes next, and when that's `merge-prep`, its §11 runs `guides-update` once,
  last, over everything. Running `merge-prep` from here would mean a second
  commit and a second push, and every push is a Netlify build.
