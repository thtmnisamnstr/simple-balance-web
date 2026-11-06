---
title: Activity history
description: Every change made to your books, by you, a connected AI assistant or a schedule, listed newest first, kept in order and never rewritten.
section: Your account
order: 2
updated: 2026-11-04
---

**Activity history** is a list of every change made to your books in Simple
Balance: what changed, when, and whether you, a connected AI assistant or the
app's own schedule made the change. Open it from **Activity** in the sidebar.
The newest change is at the top, and a line is never changed once it's
written.

<Shot
  name="activity"
  alt="The activity history, newest first: a budget plan, categories, transactions, a staged row and a recurring transaction, each brought in from a Simple Balance file, with the date and time it happened."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

## Read a line

Each line names the kind of thing that changed, its name, and what happened to
it:

- **Transaction "Corner Market" edited**
- **Category "Dining" merged into another**
- **Staged row "Rent" proposed by a recurring transaction**
- **Transaction "Greenline Market" brought in from a Simple Balance file**
- **Account "Travel Card" frozen by the choice of accounts in use**
- **Agent connection "Claude" disconnected**

Something without a name of its own, like a budget, reads as just
**Budget plan created**. Under each line is the date and time it happened, in
[your timezone](/docs/preferences/#set-your-timezone) rather than the
device's.

The line says what changed, not what it was before or after. Simple Balance
keeps a copy of that behind each line, though, even for something you've
deleted, and an AI assistant you've connected reads it along with the list.
The [privacy policy](/privacy/) says how long it's kept. To see a transaction
as it is now, find it on [Transactions](/docs/transactions/).

## Who made the change

The badge at the end of each line says where the change came from.

| Badge         | Who made it                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| **Web**       | You, signed in to Simple Balance in a browser.                                                               |
| **Agent**     | An AI assistant you've connected. [Connecting an AI assistant](/docs/agents-and-mcp/) covers connecting one. |
| **Scheduled** | The app itself, when a recurring transaction comes due and puts a row on Staged.                             |

## What's recorded

Every change to your:

- accounts and transactions
- staged transactions, including each row an import brings in
- categories and category groups
- payees, when you merge them
- templates and recurring transactions
- budgets
- preferences, down to a change of theme
- which accounts stay in use on the free plan, when you choose them

Disconnecting an AI assistant is recorded too.

Signing in, changing your password, changing your plan and exporting don't
appear here. Nor does anything that only reads, like opening a report or an
assistant looking at your transactions. Changing or resetting your password
does disconnect every AI assistant you've connected, though, and that adds
**Agent connection disconnected**, under the **Web** badge.

**One action can add many lines.** An import adds a line for every row it
staged, and a merge adds a line for everything it moved to the category or
payee you kept. A single import or merge can fill a page.

A Simple Balance file adds a line for every account, category, transaction,
budget and other record it brings in, each ending "brought in from a Simple
Balance file", whether you added it or moved it in. A transaction that was
deleted where the file came from gets a second line, ending "brought in
deleted from a Simple Balance file", so the list doesn't say you deleted it on
the day you moved.

## See older activity

The screen shows the newest 100 lines. Press **Show older activity** at the
bottom to load the next 100, as many times as you need. The list can't be
searched, filtered or sorted.

If nothing has changed yet, the screen says **No activity yet**.

## What it's useful for

- **Checking what an AI assistant did.** Every change it made carries the
  **Agent** badge, so you can see what it touched and when.
- **Seeing when a recurring transaction proposed a row**, under the
  **Scheduled** badge.
- **Finding out when something was edited, deleted or merged**, when a balance
  isn't what you remember.

An AI assistant you've connected can read this list too, with any kind of
access, so you can also ask it what changed.

## Activity history can't undo anything

The list is a record, not an undo button. To put something back, go to where
it lives:

- **A deleted transaction.** On **Transactions**, check **Show deleted**, find
  the row and press its restore button. It counts again from then on.
- **An archived account or category.** Check **Show archived accounts** on
  Accounts, or **Show archived** on Categories, and restore it from its
  **⋯** menu.
- **An edit.** Edit it back. The line tells you when the change was made, so
  you know which transaction to look at.

Some changes can't be reversed. A category merge can't be undone, and neither
can deleting a category. A payee merge can't be undone in one step.
[Categories and payees](/docs/categories-and-payees/) has the details.

Deleting your account deletes its activity history along with everything else.
[Your account and plan](/docs/your-account-and-plan/)
covers what that removes.
