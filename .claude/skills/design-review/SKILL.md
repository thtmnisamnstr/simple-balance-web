---
name: design-review
description: Review the rendered site against docs/standards/web.md — rhythm, alignment, states, images, responsive and dark mode. Use when asked to review the design, check the site against the design standards, fix layout problems, or when screenshots are provided.
---

# Review the design, on a rendered page

`docs/standards/web.md` is the rule source. This skill is how to apply it
without missing the findings that matter.

## The method: compare, do not read

The instinct is to open the page and check it against the rules top to bottom.
That finds typos and misses the real defects, which on this site are of two
kinds:

1. **The same element built twice.** A heading that uses the card's class, a
   caption that uses the footer's. Invisible while looking at one section and
   obvious the moment two are put side by side.
2. **The state nobody opens.** Dark mode, the narrow breakpoint, a section with
   no content in it.

So build a small matrix and walk down the columns: **section × (light, dark) ×
(wide, narrow)**.

## Get it rendered

jsdom has no layout engine, so no test in this repository can see any of this.

```sh
npm run build && npx serve out
```

Pages worth opening, and they are not only the homepage:

- `/` — the whole argument
- `/blog/` and `/docs/` — **their empty states**, which is what they currently
  show and what a first visitor would see
- `/docs/getting-started/` — the two-column layout, the sidebar, the pager
- `/blog/double-entry-for-one-person/` — the byline, prose, code blocks

Dark mode is an operating-system setting, not a toggle on the page. On macOS:
System Settings → Appearance. Check it; this site has no way to preview it
otherwise and it is where half of the defects live.

## What to look at in each column

Read the `web.md` section rather than working from memory. The ones that catch
the most here:

**§2.1 Spacing.** Every gap from the scale. Inconsistent vertical rhythm is the
most-reported defect in this project's history and it is always a section
inventing its own gap.

**§4.2 A class belongs to one thing.** Two components sharing a class can no
longer differ. Already paid for twice in this repository.

**§1.1 Colour from the contract.** In dark mode, anything that did not
re-theme is a literal that escaped the sweep — or a token used for the wrong
role.

**§5 Images.** Do the screenshots match the current application? Do they load
without shifting the page? Is the dark variant actually being served?

**§7 Structure.** Tab through the whole page. Does focus stay visible? Does the
skip link come first? Does the docs sidebar trap anything?

**Empty states.** `content.md` 6.1 — both sections ship empty on purpose. The
message has to read as "there is nothing to miss", not as a broken page.

## Fix at the right level

A fix that touches one section when the rule is site-wide will be reported
again on the next section. If three things do something differently and one is
right, change the other two; if none is right, change the shared component.

When a defect exists because the standard is silent, the standard changes too —
that is `guides-update`, and `web.md` gains a rule with its argument and its
`*Checked by:*`.

## Verify

```sh
npm run verify
```

Then look at the thing again. A CSS fix that passes the suite and looks worse
is a regression the suite cannot see.

## Report

The matrix: which sections at which widths and themes. Findings grouped by
cause rather than by page, each with `file:line`. What was fixed at the shared
level and what needed a local fix, with the reason. Anything that needs eyes
you do not have — say which page and what to look at. And any rule that
changed.
