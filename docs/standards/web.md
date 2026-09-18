# The design

What this site looks like, and why. Read the section for the thing you are
changing rather than the whole page.

## 1. Tokens

### 1.1 Colour comes from the contract and nowhere else

**Binding.** Every colour is a `var(--token)` declared in
`src/styles/brand.css`. A hex, an `rgb()` or a named colour anywhere else is a
defect.

The contract is copied from the application's own stylesheet. A marketing page
that is a slightly different green from the product reads as a different
company, and the reader cannot say why they distrust it.

The obvious alternative — "just use the hex, it is the same value" — is exactly
the failure. A literal cannot re-theme, so a page built from literals looks
correct in light mode and broken in dark, which is the mode nobody checks.

_Checked by:_ `tests/brand-tokens.test.ts`, which sweeps every stylesheet but
the contract for a hex or an `rgb()` outside a comment.

### 1.2 Two theme blocks, not three

**House.** `brand.css` declares `:root` and one
`@media (prefers-color-scheme: dark)` block, sharing one key set.

The application has a third, `:root[data-theme="dark"]`, because it ships a
theme toggle. This site has none, so a third block would be unreachable CSS.
`localStorage` is per-origin, so a toggle here could not carry a choice made at
`app.smpl.money` anyway — it would be a second, contradictory preference rather
than a shared one. Respecting the operating system and nothing else is the
honest behaviour for a page somebody reads once.

If a toggle ever lands, the third block arrives with it and the test below
changes in the same commit.

_Checked by:_ `tests/brand-tokens.test.ts` — both blocks declare the same keys,
and `[data-theme` appears nowhere in the file.

### 1.3 A token that is identical in both themes is named

**House.** Almost every token differs between light and dark. The exceptions
are listed with a reason in `tests/brand-tokens.test.ts`, and today they are
`--on-accent` and the five `--art-*` tokens.

The `--art-*` set paints the terminal sample, which is a picture of a dark
thing rather than a panel that follows the page: re-picking it for dark mode
would make it stop being the thing it depicts. The application's own `--art-*`
tokens work the same way and for the same reason.

_Checked by:_ `tests/brand-tokens.test.ts`.

### 1.4 The scales live in the site, not the contract

**House.** Spacing, radius, type scale and weight are declared in
`src/styles/site.css`, not in `brand.css`.

Colour is a brand fact and has to match the app exactly. Rhythm is a layout
decision, and a marketing page's rhythm is not an app's: this page is read once,
in one pass, as often on a phone as not, so it is built on larger type and more
air than a dense ledger table could afford.

_Checked by:_ `tests/brand-tokens.test.ts` — every `var()` the site reads is
declared by one file or the other.

## 2. Spacing

### 2.1 Every gap comes from the scale

**Binding.** Margins, padding and gaps use `--s-1` through `--s-10`. A literal
`14px` is a defect.

Inconsistent vertical rhythm is the single most-reported design defect in this
project's history, and it is always a section inventing its own gap.

**`em` is the exception, and it is not a gap.** A handful of paddings are
`em`-relative — the inset on an inline code chip, a tag, a badge, and the
optical nudge that lines a tick up with the text beside it. Each scales with
the type it wraps, which is the thing the px scale cannot do, and each is a
fraction of a character rather than a gap between two things. The scale owns
the space _between_ elements; `em` owns the space _inside_ one.

_Checked by:_ `human`, and it is the most mechanisable rule left here — a sweep
of `margin`, `padding`, `gap` and `inset` for length literals, with an
allow-list for `0`, percentages, and the `em` insets above. Run against this
tree it reports eleven: seven `em`, the `-1px` of the `.visually-hidden`
recipe, and **three ordinary `px` literals** — a `2px` grid gap, a `2px`
nudge and a `0 1px` inset, each below the smallest step on the scale and none
of them argued for anywhere. They are the reason to build the sweep rather
than the evidence that it is unnecessary.

## 3. Type

### 3.1 The scale is fluid, and every size is on it

**House.** `--step--2` to `--step-4`, plus `--step-mono`, each a `clamp()`. No
font size is set in `px` or `rem` directly.

`clamp()` rather than breakpoints because a marketing page is read at every
width between 320 and 2560, and a step function has visible jumps at the
boundaries.

**The scale used to stop at `--step--1` and the rule was false in thirteen
places.** Everything smaller than that step invented its own size — 0.72,
0.75, 0.78, 0.8 and 0.85rem, five values for three roles — because the scale
had no step where the site actually needed one. A rule nothing can reach is
not a rule. So `--step--2` is the micro-label (a table's column head, a code
block's language, a tier's flag), and `--step-mono` is the code surface,
because monospace reads larger than the UI face at the same nominal size and
two places were shrinking it by hand.

**Three deliberate exceptions, each commented where it sits.** Inline code is
`0.9em`, because it has to track the size of the sentence around it and a step
would make it identical inside a heading and a footnote. The two avatar glyph
sizes scale with their circle rather than with the page. None of the three is
body text.

_Checked by:_ `human`, by sweeping `site.css` for `font-size:` followed by a
digit. Three hits is correct; a fourth is a role that wants a step.

### 3.2 The font stack matches the application's exactly

**Binding.** `Inter, ui-sans-serif, system-ui, …`, byte for byte what
`src/client/styles.css` declares in the app.

Neither surface loads a webfont, so both actually render in the system UI face
and are identical. That is worth knowing before somebody "fixes" it: adding
Inter here and not there would make the two surfaces differ in the most visible
way possible, and the change is one line.

If a webfont is ever added, it is added to both, self-hosted on each origin.
`default-src 'self'` permits a same-origin font and forbids `fonts.gstatic.com`,
so a cross-origin font is a CSP change as well as a design one.

**How to check it, because "there is no webfont here" is not the check.** The
rule is about a _match_, and the other half of the match is in another
repository, so it is read over the network like everything else
(`AGENTS.md`):

```sh
curl -fsSL "https://raw.githubusercontent.com/thtmnisamnstr/simple-balance/main/src/client/styles.css" \
  | grep -A 6 "font-family"
```

Verified byte for byte on 18 September 2026:
`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
in both.

**The monospace stack deliberately does not match, and this is the record of
why.** The application has exactly one mono rule — an 11px internal label —
and its stack ends `Menlo, monospace`. This site renders code blocks, inline
code and the terminal sample, and `ui-monospace` has no implementation on
Windows in several browsers, so without `Consolas` a code block there falls
through to generic `monospace`, which is usually Courier New. The two surfaces
are not showing comparable content in mono, so the divergence costs nothing a
reader could see.

**What would end it:** the application rendering code to a user. At that point
the two stacks are showing the same kind of thing and should be reconciled —
by moving the app to this one, since it is the superset.

It is **one declaration**, `--mono` in `site.css`, not three. It was written
out three times, and three copies of a value are three chances for it to
disagree with itself — the same argument as the pending label in 6.2 and the
header height in 4.3.

## 4. Layout

### 4.1 One breakpoint, decided by content

**House.** `62rem`, where two columns stop fitting, plus a small-screen tidy at
`34rem`. Neither is a device width.

Naming breakpoints after devices dates a stylesheet within a year. Naming them
after the point the layout actually breaks does not.

### 4.2 A class belongs to one thing, and styles something

**Binding.** A class used by two unrelated components is a class the two can no
longer differ on.

This is not hypothetical: the first draft of this site put `.problem-q` on both
a section heading and a card heading, and `.footer-note` inside a figure
caption. Both were fixed before the first commit, and the fix is always the
same — give the second use its own class, even when the declarations are
identical today.

**And it has to style something.** A rule nothing can produce is dead CSS; a
class the markup writes with no rule behind it is the mirror image, and worse
in one way — it reads as styling, so it survives every refactor because
removing it looks risky. Four had accumulated, each on an element that earns
its place through `aria-label` or `aria-labelledby` rather than through
anything visual, and each was removed rather than given a rule.

_Checked by:_ `tests/dead-css.test.ts`, in both directions. The second is
deliberately conservative — it reads only plain string literals, so a composed
name is skipped rather than guessed at.

### 4.3 No page ever scrolls sideways

**Binding.** At 320 CSS pixels — the narrowest width 3.1 says this page is
read at — `document.scrollWidth` equals the viewport. This is WCAG 2.1 AA
reflow (1.4.10), and it is the accessibility failure a clean axe report is
most likely to be hiding, because axe has no rule for it and because it is
invisible on the machine the page was built on.

Three separate causes were live when this was written, and **not one of them
looked like an overflow in the source**:

- **A flex row that cannot wrap does not clip — it pushes.** The header's
  brand, two links and pending label came to 453px against a 390px viewport.
  It wraps below `34rem` now. The alternatives all cost a control: hiding the
  brand word leaves a link with no accessible name, and dropping "Source"
  removes the only way a reader on a phone reaches the code.
- **`.visually-hidden` is `position: absolute`, so it escapes an unpositioned
  scroll container.** Every tick in the pricing table carries a hidden word
  beside it; those words were laid out against the page rather than against
  `.table-wrap`, and sat at x=452 inside a table that was itself correctly
  clipped. **The table was never the thing overflowing.** `.table-wrap` is
  `position: relative` for this reason and for no other.
- **A grid track will not shrink below its content's intrinsic width.**
  `.code-tabs` held a code sample whose longest line has no space to break at,
  so the track grew to 482px instead of letting the block scroll inside
  itself. `minmax(0, 1fr)`, not `1fr`.

A fourth, in prose rather than layout: a URL the privacy policy has to print
in full is forty-six characters with no space in them, which is wider than a
320px screen. `.prose` and `.prose-body` carry `overflow-wrap: break-word`,
which breaks only where a word would not otherwise fit.

_Checked by:_ `tests/a11y.test.ts`, over every emitted page at 320px and
390px — the floor and an ordinary phone, because a page can pass at the floor
and fail just above it. The failure names the element or text run that
actually extends the document, which is deliberately **not** the widest thing
past the edge: the widest thing is usually something a scroller is holding
correctly.

## 5. Images

### 5.1 Screenshots are of the running application

**Binding.** Every screenshot on this site is captured from a real instance
against a seeded ledger, **by the application**, and pulled from the kit it
publishes at `docs/product/`.

This repository used to run the capture itself. The script that did it was
deleted, and no path here replaces it: this is the only repository that cannot
run the application, so a picture taken here of a version checked out here was
a picture nobody could reproduce. `sync-from-app` §4 is the procedure.

A mockup drifts from the thing it depicts and nobody notices until a reader
does — which, on a page whose argument is "the figures tie out", is the worst
possible place to be caught approximating.

_Checked by:_ `human` for provenance. `tests/home-page.test.tsx` holds the
things a renderer can see: alt text, dimensions, and the disclosure.

### 5.2 Both themes, chosen by the browser

**House.** Every image the page shows — screenshot or generated cover — ships
as two WebP files and is selected with `<picture>` and a
`prefers-color-scheme` media query.

No script decides it, so a reader in dark mode downloads the dark file and
never fetches the light one. The alternative — one image, usually the light
one — puts a white rectangle in the middle of a dark page.

**It said "screenshot" for a while, and the covers were not screenshots.** So
a post opened, in dark mode, with exactly the white rectangle this rule exists
to prevent — on the one picture the site draws for itself rather than
photographs. `scripts/build-images.mjs` writes the pair now, reading both
palettes out of `brand.css` rather than carrying its own copy of them, and
`src/components/cover.tsx` picks between them. The dark file's name is derived
from the light one, because a second frontmatter key naming its twin is a
second thing to get wrong in every post.

The social card is the deliberate exception: it is rendered by platforms that
have no theme to respect, so it is the light palette and only that.

**Two widths as well as two themes.** Each screenshot also ships at 1200px,
and `<picture>` carries both candidates with a `sizes` that matches the CSS.
1600px is right for the widest place these render — a full-span shot is 1024
CSS pixels on a 1280px screen, which wants 2048 at 2x, so 1600 is already a
compromise _downwards_ on a desktop. A phone renders the same picture at about
356, and a 3x screen was being handed four and a half times what it could show
on the connection least able to afford it. Measured: 300 KB of screenshots
across the homepage before, 187 KB after.

**A `sizes` that does not match the CSS is worse than none**, because the
browser trusts it, picks from it, and gets the wrong file with nothing to
notice. So there are two values, for the two layouts, and
`src/components/shot.tsx` names them. Two candidates, not a ladder: a third
rung is twelve more files for a saving nothing on this page is waiting for.

_Checked by:_ `tests/home-page.test.tsx` for the screenshots — both themes,
both widths, and that the narrow candidate reaches the built page;
`tests/blog-features.test.ts` for the covers.

### 5.3 Every image carries its real dimensions

**Binding.** `width` and `height` are the file's actual pixels.

Without them the page reflows as each image arrives, and on a page that is
mostly screenshots that is the difference between a calm load and a jumping
one.

_Checked by:_ `tests/home-page.test.tsx`.

### 5.4 Alt text describes what the picture shows

**Binding.** WCAG 1.1.1. "Screenshot of the reports page" tells a reader who
cannot see it nothing the heading above it did not.

The alt text on this site's screenshots names what is _in_ the figure — which
currencies, which columns, what the numbers do — because that is the content
the picture is carrying.

_Checked by:_ `tests/home-page.test.tsx`, which refuses alt text under forty
characters or starting with "screenshot of".

### 5.5 Invented figures say they are invented

**Binding.** The screenshots show a seeded demo ledger, and the page says so
once, plainly, beside them.

A finance page showing invented balances without disclosing it is the same
defect as a testimonial from nobody.

_Checked by:_ `tests/home-page.test.tsx`.

### 5.6 A code block follows the page theme

**Binding.** `.code-block` paints its surface from `--fill-subtle` and its
border from `--line`, both of which change with the theme.

`rehype-pretty-code` emits _both_ Shiki themes as custom properties on one copy
of the markup, and the rules at the end of `site.css` pick between them. So the
surface underneath has to switch with them. The first version painted the block
on `--art-base`, the always-dark illustration surface, which left github-light's
dark text on a dark green card: legible in dark mode and nearly invisible in
light.

The homepage terminal sample is the deliberate exception — it is a picture of a
dark thing rather than a panel that follows the page, and it is hand-coloured
rather than highlighted.

_Checked by:_ `tests/docs-features.test.ts` for both themes being emitted;
whether the contrast is right is `human`, and it was found by looking.

## 6. Controls

### 6.1 A control that cannot act is not a control

**Binding.** The sign-in affordance is a `<span>`, not a control. What it says
is 6.2's problem; that it is not a button is this one's.

A `<button disabled>` implies something on this page could enable it. A link to
`app.smpl.money` would 404 for every reader. A phrase that states the situation
is the honest control, and when the app ships this becomes a link in the same
commit that makes it true.

_Checked by:_ `tests/home-page.test.tsx`, which asserts the label is neither a
link nor a button — so making it one is a deliberate change with a failing test
attached.

### 6.2 A control that is waiting says what it is waiting for

**House.** The pending control reads **"Sign-ups open soon"**, not "Coming
soon".

Two words that name nothing answer neither question a reader has — what is
coming, and why would they wait for it. This names the thing.

It used to read "Hosted version soon", which named the thing accurately and
named it in the product's vocabulary rather than the reader's: hosting is a
word for somebody who knows the alternative, and what the reader is actually
waiting for is the ability to sign up. `content.md` 1.4 is the rule that moved
it.

**It is one string, not two.** `src/content/pricing.ts` imports
`hero.primaryLabel` rather than repeating it, because a header saying one
thing and a pricing button saying another describes two different states — and
two literals that happen to match today are two literals.

_Checked by:_ `tests/home-page.test.tsx` and `tests/pricing.test.tsx` for the
control being text rather than a control; the wording is `human`.

### 6.3 A breadcrumb's current page is not a link

**House.** The last crumb is a `<span>` with `aria-current="page"`. A link to
the page you are on is a control that does nothing.

The separator is a CSS pseudo-element rather than a character in the markup, so
a screen reader reads "Docs, Reference, Configuration" and not "Docs slash
Reference slash Configuration".

### 6.4 Link text makes a promise it keeps

**House.** No "click here", no "read more". The text says where it goes.

_Checked by:_ `tests/home-page.test.tsx`.

### 6.5 No third-party branding, anywhere this repository controls

**Binding.** No vendor logo, badge, "powered by" mark, or script and image
loaded from a vendor's domain.

A marketing site is an argument about one product. A second brand in the
corner is advertising the reader did not ask for, and on a page about
somebody's money it is a second party to wonder about. It is also somebody
else's decision about what this page says.

**One exception, and it is the opposite of branding.** The privacy policy
names the hosting provider and the payment processor, because a policy that
hides who processes the data is not a policy. `tests/branding.test.ts` names
those two pages and requires them to exist.

**A host can inject its own badge into the response**, which no test here can
see. Netlify does exactly that on free projects created on or after 19 August
2026, and it is turned off in **Project configuration → General → Powered by
Netlify badge** — a dashboard setting, not a repository one.
`operations.md` 8 carries it as a launch step, because a rule whose violation
arrives from outside the repository needs somewhere to live that is not a
test.

_Checked by:_ `tests/branding.test.ts`, for the half that is ours: no vendor
word in any page's visible markup, and no subresource from a vendor's domain.

## 7. Structure

### 7.1 One h1, and levels never skip

**Binding.** WCAG 1.3.1. The document outline is the only navigation this page
has for a screen-reader user.

_Checked by:_ `tests/home-page.test.tsx`.

### 7.2 Every section is a named landmark

**House.** `aria-labelledby` pointing at the section's own heading.

_Checked by:_ `tests/home-page.test.tsx`.

### 7.3 Decorative icons are hidden

**Binding.** Every icon here sits beside text that already says what it means,
so an unhidden one is announced as a second, meaningless label.

_Checked by:_ `tests/home-page.test.tsx`.

### 7.4 A skip link, first

**Binding.** WCAG 2.4.1. First focusable element, lands in `<main>`.

_Checked by:_ `human`. The markup is one element in `layout.tsx` and nothing
asserts it; worth adding the day a second layout appears.

## 8. Motion and preference

### 8.1 Reduced motion is honoured globally

**Binding.** WCAG 2.3.3. One block at the end of `site.css` reduces every
animation and transition.

A global block rather than per-component opt-in, because the failure mode of
per-component is a new animation that forgot, and nobody tests with the setting
on.

## 9. What is checked, and what is not

| Rule                                | Held by                                             |
| ----------------------------------- | --------------------------------------------------- |
| 1.1 Colour from the contract        | `tests/brand-tokens.test.ts`                        |
| 1.2 Two theme blocks                | `tests/brand-tokens.test.ts`                        |
| 1.3 Named same-in-both tokens       | `tests/brand-tokens.test.ts`                        |
| 1.4 Tokens all declared             | `tests/brand-tokens.test.ts`                        |
| 4.3 No sideways scroll              | `tests/a11y.test.ts`, at 320px and 390px            |
| 5.2 Both themes, both widths        | `tests/home-page.test.tsx`                          |
| 5.2 Covers in both themes           | `tests/blog-features.test.ts`                       |
| 5.3–5.5 Images                      | `tests/home-page.test.tsx`                          |
| 6.1 The pending control             | `tests/home-page.test.tsx`                          |
| 6.4 Link text                       | `tests/home-page.test.tsx`                          |
| 6.5 No third-party branding         | `tests/branding.test.ts`                            |
| 7.1–7.3 Structure                   | `tests/home-page.test.tsx`                          |
| 2.1 Spacing scale                   | `human` — mechanisable, and the best candidate left |
| 3.1 Type scale                      | `human` — sweep `font-size:` for a digit            |
| 3.2 Font stack                      | `human` — against the app's stylesheet, over HTTP   |
| 4.2 Every class styles something    | `tests/dead-css.test.ts`, both directions           |
| 4.1, 4.2 Layout and class ownership | `human`                                             |
| 5.1 Screenshot provenance           | `human`                                             |
| 6.2, 6.3 Control and crumb wording  | `human`                                             |
| 7.4 Skip link                       | `human`                                             |
| 8.1 Reduced motion                  | `human`                                             |

Nothing here can check rhythm, balance, or whether a section is in a sensible
place. jsdom has no layout engine, so every visual judgement is a person
looking at a rendered page at each breakpoint. `design-review` is that pass.
