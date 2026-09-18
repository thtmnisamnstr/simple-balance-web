---
title: Budgets
description: How a budget is compared against what you actually spent, what carrying over does, and why deleting a budget changes nothing in the ledger.
section: Using it
order: 3
updated: 2026-09-17
---

A budget is a plan for a category or a group of categories, compared against
what the ledger says actually happened.

## Budgets sit over the ledger, never inside it

**Nothing in a budget writes a transaction.** An assignment is not a posting.
Every budget figure is computed from your plans and the entries you already
have, which has one consequence worth knowing:

Deleting a budget leaves your books exactly as they were.

## What you can budget

- **A category** — "groceries, £400 a month".
- **A group of categories** — "everything under Home, £1,200 a month".

A budget is about one or the other, never both, and a group budgeted as the sum
of its categories cannot also hold a budget of its own — the two would disagree
and there would be no way to say which was right.

## Periods and carrying over

A budget covers a period, usually a month. What a period did not spend can
**carry** into the next one if you want it to.

The carry is folded at read time and never stored. That is what lets a
back-dated correction change every period after it: enter a receipt you forgot
from March, and April onward re-fold to match.

<Callout kind="note">
The fold is bounded. A report that hit the bound says so rather than silently
truncating, so a budget running for years does not quietly stop being accurate.
</Callout>

## Refunds count

A refund into a budgeted category gives the budget back. That follows from
refunds lowering spending rather than raising income — the budget is comparing
against spending, and the spending went down.

## What "left to assign" means

Money in accounts the budget is about, minus what is already assigned. Credit
cards are included by default, because spending on a card empties an envelope;
leaving them out would say there is more to assign than there is.

An account the budget should not see — a mortgage, a pension — can be marked
out of budget. It changes no balance and no report, only that one figure.
