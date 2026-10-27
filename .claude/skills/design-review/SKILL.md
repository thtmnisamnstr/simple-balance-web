---
name: design-review
description: Review the rendered site against docs/standards/web.md — rhythm, alignment, states, images, responsive and dark mode. Use when asked to review the design, check the site against the design standards, fix layout problems, or when screenshots are provided.
---

# Review the design, on a rendered page

`docs/standards/web.md` is the rule source. This skill is how to apply it
without missing the findings that matter.

**Run on its own**, it reviews the whole site. **Run by `merge-prep` §7**, it
reviews what the branch changed: the pages its diff reaches, in both themes,
at both widths, with the motion of any drawing it touched. Run the scope
block in `merge-prep` §1 again for that list rather than reusing the one it
wrote, as `legal-review` and `guides-update` do. The fixes from `merge-prep`
§3 and §4 come after that list was written, and so does `legal-review`'s
rewrite of `/privacy/` and `/terms/`, and a page changed in between is in no
other look. After a sync the list is the whole branch, the sync's pages
included: `sync-from-app` §8 looked at its own pull, and this is the look the
branch relies on. A change to `src/styles/site.css`, a shared component or a layout
reaches every page that uses it, so treat it as the whole list in §2 rather
than the page you were thinking of. A branch that changed nothing a reader
sees, such as a guide, a skill or a test alone, has nothing to look at; say
so in the report and hand back.

## 1. The method: compare, do not read

The instinct is to open the page and check it against the rules top to bottom.
That finds typos and misses the real defects, which on this site are of two
kinds:

1. **The same element built twice.** A heading that uses the card's class, a
   caption that uses the footer's. Invisible while looking at one section and
   obvious the moment two are put side by side.
2. **The state nobody opens.** Dark mode, the narrow breakpoint, a section with
   no content in it, and a drawing caught part-way through its motion or
   stopped at its end.

So build a small matrix and walk down the columns: **section × (light, dark) ×
(wide, narrow) × (finished, moving)**. The finished picture is what a reader
who asked for less motion sees and what a stopped loop leaves; moving is every
frame on the way there, and section 4 below says which frames.

## 2. Get it rendered

jsdom has no layout engine, so no test in this repository can see any of this.

```sh
npm run build && npx serve out -l 4321
```

`.claude/launch.json` names the same server on the same port, for a browser
tool that starts its server from that file, and the pointer and contrast
checks in `draw-and-animate` §6 and §8 expect it there. Either way it's the
built `out/`, so rebuild after every change, or the page under review is the
one before it.

Pages worth opening, and they are not only the homepage:

- `/` — the whole argument, and the busiest drawing on the site: the hero and
  the closing plans panel are the application's art panel, dark in both
  themes on purpose (`web.md` 1.3), and the hero, the jobs, the correction,
  the chat and the closing picture all move (`web.md` 8.2). Three of them
  loop, which section 4 below gives a state of its own. Look at it narrow
  too, where the hero stacks and its glow has to follow the drawing down.
- `/learn/` — the index. Rest the pointer on a card a moment and its picture
  replays; pass over one quickly and it doesn't. Then park the pointer over
  the grid and scroll with the wheel: nothing may move (`web.md` 8.3). On a
  phone, which has no pointer, each card plays once its picture is in view
  instead, a second or two on the clock, and stands still while it arrives.
- `/learn/net-worth/` — one guide whole: the hero on the panel, two diagrams
  built as they're scrolled to, and the line under each screenshot saying
  the money in it is made up (`web.md` 5.5).
- `/docs/` — the index: the intro and its starting points on the panel, the
  feature card with its steps, each group's picture building as it enters,
  and a card's mark redrawing when the pointer rests on it, or on a phone
  once the card is in view (`web.md` 4.6, 8.3).
- Any docs page at 390 wide, where the sidebar folds shut behind its summary
  and the page's own first line is the first thing on screen (`web.md` 4.7).
- `/docs/configuration/` — the busiest page on the site: sidebar, search,
  breadcrumbs, contents, tables, callouts, code tabs, copy buttons, pager
- `/pricing/` — the tiers side by side, the comparison table, which at 390
  scrolls inside its own box rather than widening the page (`web.md` 4.3),
  and the questions
- `/privacy/` — the longest prose outside the docs, with its contents and
  its date
- `/blog/` — the front page: masthead, lead story, card grid and series
- `/blog/what-a-refund-actually-is/` — byline, series box, callout, tags,
  share links, pager, related
- `/blog/tags/bookkeeping/` and `/blog/authors/gavin/` — the archives
- `/blog/archive/` — the dense year listing
- `/404` — reachable by typing any wrong path
- The card in `public/og/` for any page that was added or retitled, opened
  as an image. It's what a link to the page shows in a chat or a feed, it's
  light-palette only, and nothing compares it with the page
  (`operations.md` 7.1).

**Code blocks are where the last real defect was.** `rehype-pretty-code` emits
both Shiki themes on one copy of the markup, so a block whose surface does not
follow the theme is legible in one mode and invisible in the other. Look at a
code block in **both** themes, every time.

Dark mode is an operating-system setting, not a toggle on the page. On macOS:
System Settings → Appearance. In a script, Playwright's `colorScheme: "dark"`
on the browser context does the same for one page, and `npm run frames` takes
both schemes by default. Check it; it is where half of the defects live.

## 3. What to look at in each column

Read the `web.md` section rather than working from memory. The ones that catch
the most here:

**§2.1 Spacing.** Every gap from the scale. Inconsistent vertical rhythm is the
most-reported defect in this project's history and it is always a section
inventing its own gap.

**§4.2 A class belongs to one thing.** Two components sharing a class can no
longer differ. Already paid for twice in this repository.

**§1.1 Color from the contract.** In dark mode, anything that did not
re-theme is a literal that escaped the sweep — or a token used for the wrong
role.

**§5 Images.** Do the screenshots match the current application? Do they load
without shifting the page? Is the dark variant actually being served?

**§5.9 Words on the panel.** The panel is dark in both themes, so everything
on it takes the panel's colors. A page token there is dark text on a dark
base in light mode, which is the mode that looks fine in the source. Look at
the eyebrow, the buttons, a field and the stop control on a panel in light
mode first.

**§5.10 Building a drawing.** Does the one object still read as a card
thumbnail and in a 390px hero? Does what matters sit inside the safe area the
section gives? Are the numbers in the picture the page's numbers?

**§8.3–8.6 Motion.** The clock, the effect, the loop's timing, and whether
anything around a moving thing moves with it. Section 4 below is how to look.

**§7 Structure.** Tab through the whole page. Does focus stay visible? Does the
skip link come first? Does the docs sidebar trap anything?

**Empty states.** Each collection carries one in `src/content/sections.ts`,
shown only when it has no pages, on `/learn/`, `/docs/`, `/blog/` and
`/blog/archive/`. The message has to read as "there is nothing to miss", not
as a broken page. **Run by `merge-prep`, look only when the branch changed
one**: `src/content/sections.ts`, where the messages are, or the markup or
style that shows one. Nothing else moves them, so a branch that touched
neither skips this and says so in the report.

None is empty today, and a build can't show one: under `output: "export"` an
empty collection leaves its `[slug]` route, and for the docs and learn their
Markdown copies, with nothing to generate, and the build fails (AGENTS.md,
on a dynamic route). The dev server renders a page only when it's asked for,
so look under `npm run dev` with the folder gone, **in a copy of the
repository, never in the working tree**:

```sh
COPY="${TMPDIR:-/tmp}/empty-state"
rm -rf "$COPY"
rsync -a --exclude node_modules --exclude .next --exclude out --exclude .git ./ "$COPY/"
cp -Rc node_modules "$COPY/node_modules"
rm -rf "$COPY/content/learn"    # or content/docs, or content/blog
npm --prefix "$COPY" run dev    # in the background for an agent; open /learn/ on the port it prints
```

The copy is the one `draw-and-animate` §7 makes, which says why it's cloned
rather than linked. Stop the dev server once you've looked, and delete the
copy. This used to move the folder aside in the working tree and back, and a
move back that was missed or interrupted leaves every guide deleted in a tree
whose next commit, `merge-prep` §13's, takes everything not yet committed. It
also took the pages out from under any other agent working in the tree.

**Some things look like defects and were decided.** Each has its argument in
`web.md`, and a review that "fixes" one undoes it:

- The art panel is dark in both themes (`web.md` 1.3).
- Cards on the docs and blog indexes have no scroll reveal, and learn cards
  rise into place without fading, because half-faded words measured under
  3:1 (`web.md` 8.3).
- Only the homepage loops (`web.md` 8.2).
- On a narrow screen the glow follows the drawing down when the panel
  stacks, rather than staying behind the words (`web.md` 5.9).
- The homepage's closing picture builds as it's scrolled to, finished once
  the drawing itself is on screen rather than the panel around it (its scroll
  rule is `.home-closing-art .mo`). Its panel clips with `overflow: clip`, not
  the art panel's `hidden`, which would freeze that timeline (`web.md` 8.3).
  Its rings turn while a pointer rests on it, and on a touch screen with the
  scroll (`web.md` 8.2).
- A hero is hidden from assistive technology, while a diagram is described in
  full (`web.md` 5.7, 5.8).

A disagreement with one of these is a change to the guide, through
`guides-update`, not a fix in the stylesheet.

## 4. Motion

A screenshot taken whenever the page happened to settle shows one frame of
something that has many, and on the homepage it never settles. Every moving
thing has up to five states worth a look, listed here with what each has to
show. `web.md` 8.7 is the method, and **`draw-and-animate` §6 holds the
commands** for every one of them, `npm run frames` and a short Playwright run
for the pointer, with the times worth capturing and the questions to ask of
each frame. They're kept there once, because two copies of a capture recipe
had already started to disagree about which element and which times.

1. **At rest, first.** The finished picture is the design, and the motion is
   only how a reader arrives at it. It's also what a reader who asked for less
   motion sees and what a checked stop box leaves. Take it for every page in
   the matrix, not only the ones with drawings, since a capture with no
   `--frames` or `--scroll` is simply the page under reduced motion.
2. **Part-way.** A play-once at a handful of times across its three and a
   half seconds, and each of the homepage's loops across one whole cycle,
   blank gap included: the hero and the correction on the shared ten-second
   cycle, the chat on its own sixteen-second one. Does anything float before
   what holds it up arrives? Is any text held faint? `--report` gives each
   play-once's end, and none should run past about 3.5s.
3. **A scroll-built drawing with its bottom edge just on screen**: a learn
   diagram, a docs group picture, the homepage's closing picture. It must be
   finished there, because a reader who stops scrolling at that point keeps
   whatever frame it's on. `--report` names any that isn't, and any already
   under way before it arrives, which is a timeline frozen inside something
   that hides its overflow; `--scroll` shows it building.
4. **A card.** A pass-over doesn't fire and a rest of a quarter second
   replays, on the learn index and the docs index both. A scroll that leaves
   a parked pointer resting on a card for a quarter second plays that card
   once: that's the owner's decision (`web.md` 8.3), not a finding. A finding
   is a card that plays while the pointer only crosses it, or plays more than
   once, or keeps moving. Then the same cards on a phone, scrolled in with
   `--touch` at 390: each builds as it comes in and is finished once its
   picture is on screen, not only once the whole card is, and the homepage's
   closing rings turn with the scroll. A narrow window without `--touch` is a
   desktop, and shows none of it.
5. **A loop.** The hold, about five seconds of the finished picture, counted
   from when its last part lands (the chat's is about six); the blank gap,
   short but there, so a loop doesn't rebuild its first parts while its last
   are still fading; the stop box, reached by Tab and leaving the finished
   picture when checked; and the page's height, which must not change across
   the cycle.

A drawing that fails one of these goes to `draw-and-animate`, which knows how
it was built and returns here when it's fixed.

**A contrast doubt on the homepage is settled with the loops stopped.** The
accessibility audit measures whichever frame the page is on when the network
goes quiet, which on a loop is any frame at all. So measure the finished
picture: check the stop box, or run the reduced-motion axe check in
`draw-and-animate` §8, which takes both themes at both widths for any page.

## 5. Fix at the right level

A fix that touches one section when the rule is site-wide will be reported
again on the next section. If three things do something differently and one is
right, change the other two; if none is right, change the shared component.

When a defect exists because the standard is silent, the standard changes too —
that is `guides-update`, and `web.md` gains a rule, or for a recipe a
**Guidance** section, with its argument and its `*Checked by:*`. When
`merge-prep` called this, its §11 runs `guides-update` last over everything, so
name the rule in the report (§7) and leave the writing to it.

A drawing, a diagram or a motion that's wrong is fixed through
`draw-and-animate`, which returns here when it's done rather than going on to
`merge-prep`.

## 6. Verify

```sh
npm run verify
```

Then look at the thing again. A CSS fix that passes the suite and looks worse
is a regression the suite cannot see.

**When `merge-prep` called this**, skip the full suite here: its §12 runs
`npm run verify` once, after every step has had its say, and running it per
step costs minutes for nothing. Rebuild and look again all the same, and run
the tests nearest what you changed, after `npm run build`, since many of them
read `out/` (`npx vitest run tests/home-page.test.tsx`, say, for the
homepage, or `tests/dead-css.test.ts` after removing a rule).

## 7. Report

The matrix: which sections at which widths and themes, and for motion, which
of section 4's states of which drawings, at which times. Findings grouped by
cause rather than by page, each with `file:line`. What was fixed at the shared
level and what needed a local fix, with the reason. Anything that needs eyes
you do not have — say which page and what to look at. And any rule that
changed, or should.

**When `merge-prep` called this, return to it** with the report, and the
run goes on to its §8. Nothing here commits or pushes, on its own or
under `merge-prep`.
