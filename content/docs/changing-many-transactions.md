---
title: Changing many transactions at once
description: Select transactions, then change their category, date, payee, account or type, or delete them, up to 10,000 in one step, all or nothing.
section: Using Simple Balance
order: 9
updated: 2026-10-25
---

You can change or delete many transactions in one step on **Transactions**.
Check the ones you want, or select everything the list matches, then press
**Edit selected** or **Delete selected**. Either every selected transaction
changes or none does, and one step covers up to 10,000.

The same tools are on each account, category, payee and template page, which
show the same list narrowed to that one thing.

## Select the transactions

1. Narrow the list until it shows what you want to change: the dates under
   **Viewing**, **Search transactions**, the type menu and the account menu.
   [Adding and editing transactions](/docs/transactions/#find-a-transaction)
   covers each one.
2. Check the box at the start of each row you want. The box in the heading
   checks every row on the page, up to 50.
3. A bar appears above the list saying how many are selected, such as
   "3 transactions selected".

When the list has more than one page, the bar also offers a button such as
**Select all 312 matching**. It selects every transaction that matches the
dates, search and filters, not only the 50 on screen, and the bar then reads
"312 transactions matching this view selected".

- Uncheck a row to leave it out. The bar counts those, such as "2 excluded".
- **Select only this page** goes back to the rows on screen.
- After **Select all … matching** with **Show deleted** on, the bar says how
  many of the selection are deleted, such as "300 active · 12 deleted".
- **Clear selection** unchecks everything.

Changing the dates, the search, a filter or **Show deleted** clears the
selection, because it no longer describes the same list. Turning pages and
sorting keep it.

<Callout kind="tip" title="Use Select all matching rather than checking rows across pages">
You can check rows on one page, turn the page and check more. That selection
can be deleted or have its date, payee, description and notes changed, but
**Change category**, **Change account** and **Change type** stay off until
every selected row is back on screen. Narrowing the list and using
**Select all … matching** has no such limit.
</Callout>

## Change the selected transactions

1. Press **Edit selected**.
2. **Edit selected transactions** opens and says how many it will edit, such
   as "312 transactions matching this view will be edited."
3. Check the box beside each field you want to change, and fill it in. A
   field you leave unchecked keeps whatever each transaction already has.
4. Press **Apply changes**.

| Checkbox               | What it does                                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Change date**        | Gives every selected transaction the same date.                                                                                                                                                                                                       |
| **Change payee**       | Gives them all one payee. It suggests payees you've used, and a name matching one of them, whatever its capitalization, takes the spelling you already have.                                                                                          |
| **Change category**    | Files them all under one of your categories, or under none with **Uncategorized (clear)**. Only categories you already have are listed. To use a new one, add it on **Categories** first.                                                             |
| **Change account**     | Moves them to another account in the same currency. Amounts aren't converted, so only accounts in that currency can be chosen, and the field says which, such as "Only accounts using USD are available." Archived and frozen accounts aren't listed. |
| **Change description** | Replaces the description on all of them. Leave it blank to clear it.                                                                                                                                                                                  |
| **Change notes**       | Replaces the notes on all of them. Leave it blank to clear them.                                                                                                                                                                                      |
| **Change type**        | Makes them all a **Deposit** or a **Withdrawal**. Each keeps its account and amount, and the money runs the other way.                                                                                                                                |

When it's done, a line such as "60 transactions updated." says how many
changed. A transaction that already had the new value is left alone and isn't
counted, so the number can be lower than the selection.

Each changed transaction is listed under **Activity**.
[Activity history](/docs/activity-history/) covers that screen.

## What can't be changed together

A field that can't apply to the whole selection has its checkbox grayed out,
with the reason under it. When the app refuses a change after you press **Apply changes**,
nothing in the selection changes.

- **Transfers.** A selection with a transfer in it can't use
  **Change account** or **Change type**, because a transfer has two accounts
  and isn't a deposit or a withdrawal. The dialog says "You can change common
  details, but Account and Type are unavailable for transfers."
- **Splits.** A selection with a split in it can't use **Change category**,
  because a split already files its money under several categories, or
  **Change type**, because each of its categories was chosen for the
  direction the money runs. Edit splits one at a time.
- **More than one currency.** **Change account** needs every selected
  transaction to be in one currency. Use the account menu to narrow the list
  to accounts in one currency first.
- **Changes that would make refunds.** Giving deposits a spending category,
  or withdrawals an income category, turns each one into a refund. That's
  refused across a selection, with a message such as "That category runs
  against the direction of 4 of these transactions, which would make each one
  a refund. Change those individually." **Change type** is refused the same
  way when the new direction runs against the categories the transactions
  already have. Use the type menu to select only deposits or only
  withdrawals, or change those few by hand.
- **Duplicates.** If the change would make two selected transactions match
  each other exactly, or make one match another transaction you have, it's
  refused with "Two selected transactions appear to be duplicates" or "A
  selected transaction matches another transaction". Press **Apply anyway** if
  they really are separate payments.
- **Frozen accounts.** If a selected transaction touches an account the free
  plan has frozen, **Edit selected** and **Delete selected** are off, with the
  reason, or the change is refused with it.
  [Your account and plan](/docs/your-account-and-plan/#canceling) explains
  freezing.
- **Something changed in the meantime.** If a selected transaction changes
  before you apply, from another tab or an AI assistant, nothing is changed.
  Rows you checked by hand are let go, and you're asked to look at the
  refreshed list and select again. After **Select all … matching**, the
  selection stays and you're asked to check the refreshed count and apply
  again.
- **More than 10,000.** One step covers at most 10,000 transactions. Selecting
  more says "That covers more than 10,000 transactions, which is the most one
  request may change at a time. Narrow it and repeat." Narrow the dates and do
  it a range at a time.

**Deleted transactions in the selection** are changed and stay deleted. The
dialog says so when the selection might include any.

**A category can disappear.** If the change moves every transaction off a
category, and no budget, template, recurring transaction or staged row uses
it, that category is removed along with the edit.

## Delete the selected transactions

1. Press **Delete selected**.
2. **Delete these transactions?** says how many will stop counting toward
   balances and reports, and that nothing is erased.
3. Press **Delete transactions**.

Deleted transactions stop counting straight away. Any already deleted in the
selection are left as they are.

<Callout kind="warning" title="Restoring is one at a time">
Nothing is erased, but there's no button to restore a whole selection.
Bringing deleted transactions back means turning on **Show deleted** and
pressing the restore button on each row.
[Delete and restore a transaction](/docs/transactions/#delete-and-restore-a-transaction)
has the steps. Check the count in the dialog before you confirm.
</Callout>

## Example: recategorize everything from one store

Say every purchase at Corner Market went under Dining out and belongs under
Groceries.

1. Open **Transactions** and set **Viewing** to **All time**.
2. Type Corner Market in **Search transactions**.
3. Check one row. If there's more than one page, press
   **Select all … matching**.
4. Look down the list, page by page. The search also matches descriptions and
   notes, so uncheck anything that isn't a Corner Market purchase.
5. Press **Edit selected**, turn on **Change category**, and choose
   **Groceries**.
6. Press **Apply changes**.

Clicking Corner Market's name in any row opens its payee page instead, which
lists only that payee's transactions and has the same tools.

If Dining out is left with nothing in it, and no budget, template, recurring
transaction or staged row uses it, it's removed.

## Fixing rows before they count

**Staged**, where imported rows wait, has the same tools, plus
**Commit selected**. Editing there changes nothing in your books, so it's the
cheapest place to fix a mistake an import made across many rows. Say an import
filed every row under the wrong category:

1. Open **Staged** and set **Viewing** to **All time**.
2. In the menu that starts on **All batches**, choose the import. Each one is
   listed by file name, when it arrived and how many of its rows are still
   waiting.
3. Check one row, and press **Select all … matching** if there's more than one
   page.
4. Press **Edit selected**, turn on **Change category**, choose the right
   category, and press **Apply changes**. Nothing is committed yet: the rows
   are changed in the queue and checked again.
5. Look over the rows, then press **Commit selected**.

A category the import created is removed by the same edit once nothing uses
it anymore, so a wrong column doesn't leave a pile of stray categories
behind.

[Staged transactions](/docs/staged-transactions/) covers the queue, and
[Templates](/docs/templates/) covers editing many templates at once, which
works the same way.
