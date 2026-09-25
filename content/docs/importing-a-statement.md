---
title: Importing a statement
description: Point the importer at a CSV your bank exported, tell it how the dates and amounts are written, and review what it proposes before anything counts.
section: Using it
order: 1
updated: 2026-09-22
---

The importer reads a CSV, works out its shape, asks you the two things a file
can't say for itself, and proposes rows. Nothing it proposes affects a balance
until you commit it.

## Export from your bank

Any CSV will do. There's no required column order and no template to match: the
importer reads the header row and suggests a column for each field.

The file is read as UTF-8. A byte-order mark, which Excel adds, is ignored. A
file saved in another encoding comes through with its accented characters
wrong, so if your bank offers a choice, take UTF-8.

<Callout kind="note">
If your bank offers OFX or QIF as well, take the CSV. Neither of the other two
is read here.
</Callout>

## What it works out for itself

- **The delimiter**: comma, semicolon or tab.
- **Which column is which.** It suggests the date, payee, amount, category,
  description and notes columns from the header row, and you can change any of
  them. The amount can be one signed column, or separate debit and credit
  columns.
- **Payees and categories you already have.** A name in the file matches yours
  whatever its capitalization or spacing. A category name that's new is created
  when you stage the file, and one you'd archived comes back.

A file exported from Simple Balance itself needs none of this: choose the
account and stage it. Every row goes into the one account you pick on the
import screen, so export each account from its own page and bring that file
back into the matching account. **Export CSV** exports what the page is
showing, and an account's page starts on **This month**, so set its dates to
**All time** first. Export an account with more than ten thousand transactions
a date range at a time. An account's opening balance is set on the account
rather than carried in the file, and a transfer between two of your accounts is
in both accounts' exports, so the second import flags it as a duplicate.

## What it asks you

- **The date order**: YYYY-MM-DD, MM/DD/YYYY or DD/MM/YYYY. It starts on
  YYYY-MM-DD, and most US banks write MM/DD/YYYY, so check this one. It never
  guesses from the rows, because `03/04/2026` is March or April depending on
  the bank. A date it can't read stages without one, and a date it can read
  the wrong way around stages on the wrong day.
- **The decimal separator**: 1,234.56 or 1.234,56. Asked for the same reason,
  since `12,34` could be either.

**Dry run** shows how each row will be read without saving anything, and
creates no category, so you can check both answers and the column mapping
first.

## Staging, and why nothing counts yet

Every imported row is **staged**. A staged row has no postings, appears in no
balance, and is absent from every report. It exists to be looked at.

That's what makes a wrong mapping cheap: if the importer read the wrong column,
you delete the staged rows and no balance or report ever knew. Categories are
the exception. Any category the stage created or brought back from the archive
stays after the rows are gone, so a description column mapped as the category
can leave a category behind for every description in the file. Run a
**Dry run** first, which creates nothing.

## Duplicates

A row that resembles one already in the ledger is flagged and shown beside the
entry it resembles, so you can compare them and drop whichever is the spare.

Importing the same statement twice is the common case, and it produces one
ledger rather than two.

## Committing

Committing turns staged rows into transactions, writes their postings, and is
atomic: either every row in the batch lands or none does.

One file stages at most ten thousand rows, the same number one commit, mass
edit or mass delete covers, so a whole import always fits in one commit.
Whoever runs the server can lower the file's cap with
[`CSV_MAX_ROWS`](/docs/configuration/#operational-settings).
