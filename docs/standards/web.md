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

_Checked by:_ `human`, and it is the most mechanisable rule left here — a sweep
for length literals outside the scale, with an allow-list for `1px` borders,
`0`, and percentages. Worth building the first time a defect of this kind
reaches the live site.

## 3. Type

### 3.1 The scale is fluid, and there are six steps

**House.** `--step--1` to `--step-4`, each a `clamp()`. No font size is set in
`px` or `rem` directly.

`clamp()` rather than breakpoints because a marketing page is read at every
width between 320 and 2560, and a step function has visible jumps at the
boundaries.

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

## 4. Layout

### 4.1 One breakpoint, decided by content

**House.** `62rem`, where two columns stop fitting, plus a small-screen tidy at
`34rem`. Neither is a device width.

Naming breakpoints after devices dates a stylesheet within a year. Naming them
after the point the layout actually breaks does not.

### 4.2 A class belongs to one thing

**Binding.** A class used by two unrelated components is a class the two can no
longer differ on.

This is not hypothetical: the first draft of this site put `.problem-q` on both
a section heading and a card heading, and `.footer-note` inside a figure
caption. Both were fixed before the first commit, and the fix is always the
same — give the second use its own class, even when the declarations are
identical today.

_Checked by:_ `human`.

## 5. Images

### 5.1 Screenshots are of the running application

**Binding.** Every screenshot on this site is captured from a real instance by
`scripts/capture-screenshots.mjs`, against a seeded ledger.

A mockup drifts from the thing it depicts and nobody notices until a reader
does — which, on a page whose argument is "the figures tie out", is the worst
possible place to be caught approximating.

_Checked by:_ `human` for provenance. `tests/home-page.test.tsx` holds the
things a renderer can see: alt text, dimensions, and the disclosure.

### 5.2 Both themes, chosen by the browser

**House.** Each screenshot ships as two WebP files and is selected with
`<picture>` and a `prefers-color-scheme` media query.

No script decides it, so a reader in dark mode downloads the dark file and
never fetches the light one. The alternative — one image, usually the light
one — puts a white rectangle in the middle of a dark page.

_Checked by:_ `tests/home-page.test.tsx`.

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

## 6. Controls

### 6.1 A control that cannot act is not a control

**Binding.** The sign-in affordance reads "Coming soon" and is a `<span>`.

A `<button disabled>` implies something on this page could enable it. A link to
`app.smpl.money` would 404 for every reader. A word that states the situation is
the honest control, and when the app ships this becomes a link in the same
commit that makes it true.

_Checked by:_ `tests/home-page.test.tsx`, which asserts the label is neither a
link nor a button — so making it one is a deliberate change with a failing test
attached.

### 6.2 Link text makes a promise it keeps

**House.** No "click here", no "read more". The text says where it goes.

_Checked by:_ `tests/home-page.test.tsx`.

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
| 5.2–5.5 Images                      | `tests/home-page.test.tsx`                          |
| 6.1 The pending control             | `tests/home-page.test.tsx`                          |
| 6.2 Link text                       | `tests/home-page.test.tsx`                          |
| 7.1–7.3 Structure                   | `tests/home-page.test.tsx`                          |
| 2.1 Spacing scale                   | `human` — mechanisable, and the best candidate left |
| 3.1, 3.2 Type and font stack        | `human`                                             |
| 4.1, 4.2 Layout and class ownership | `human`                                             |
| 5.1 Screenshot provenance           | `human`                                             |
| 7.4 Skip link                       | `human`                                             |
| 8.1 Reduced motion                  | `human`                                             |

Nothing here can check rhythm, balance, or whether a section is in a sensible
place. jsdom has no layout engine, so every visual judgement is a person
looking at a rendered page at each breakpoint. `design-review` is that pass.
