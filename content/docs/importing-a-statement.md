---
title: Importing a statement
description: Download a CSV from your bank, match its columns on Import CSV, and check every row on Staged before any of it counts toward a balance.
section: Using Simple Balance
order: 4
updated: 2026-10-25
---

**Import CSV** brings in the transactions from a statement you've downloaded
from your bank as a CSV file. It reads the file, works out its shape, asks you
the two things a file can't say for itself, and puts every row on **Staged**.
Nothing it brings in affects a balance until you commit it.

Simple Balance doesn't connect to your bank. You download the file from your
bank's website and bring it in yourself.

## Import a CSV file

1. Download your transactions from your bank's website as a CSV file.
2. Open **Import CSV** and choose the file, or drop it on
   **Drop in a file or browse**.
3. Under **Map the columns**, choose the **Account** the rows belong to. If
   you have more than one account, nothing is chosen for you. Archived and
   frozen accounts aren't offered.
4. Check which column is the **Date**, the **Payee** and the amount, and set
   **Date format**.
5. Press **Dry run** to see how the first rows will be read. Nothing is saved.
6. Press **Stage all rows**.
7. Follow **Review these N rows** to the rows on **Staged**, fix anything that
   needs it, and commit them.

<Shot
  name="import"
  alt="The import screen before a file is picked: a step headed Choose a CSV file, an empty drop target reading Drop in a file or browse, and a preview panel saying no file has been chosen yet."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

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

## File size and row limits

A file can be up to 10 MB and 10,000 rows. A file over 10 MB is refused as
soon as you choose it, and one with more than 10,000 rows is refused when you
press **Dry run** or **Stage all rows**. Export a bigger history from your
bank one date range at a time and import each file.

On a copy you run yourself,
[`CSV_MAX_BYTES` and `CSV_MAX_ROWS`](/docs/configuration/#operational-settings)
change these. The size limit can go up to 100 MB, and the row limit can only
go down.

## What it works out for itself

- **The delimiter**: comma, semicolon or tab.
- **Which column is which.** It suggests the **Date**, **Payee**,
  **Signed amount**, **Debit**, **Credit**, **Category**, **Description** and
  **Notes** columns from the header row, and you can change any of them. The
  amount can be one signed column, or separate debit and credit columns. Only
  the date, the payee and an amount are required. Any column you don't want
  read can stay on **Not mapped**.
- **The bank's reference**, if the file has one: the column your bank uses to
  identify each transaction. It's suggested from the header like the others,
  and it's how a second import of the same statement is recognized, so if the
  column it picked repeats from row to row, set **Bank reference** to
  **Not mapped**.
- **Payees and categories you already have.** A name in the file matches yours
  whatever its capitalization or spacing. A category name that's new is created
  when you stage the file, and one you'd archived comes back.

A file exported from Simple Balance itself needs none of this: choose the
account and stage it. Every row goes into the one account you pick on the
import screen, so export each account from its own page and bring that file
back into the matching account. **Export CSV** exports what the page is
showing, and an account's page opens on the dates you were already viewing,
or on **This month**, so set its dates to **All time** first. Export an account with more than ten thousand transactions
a date range at a time. An account's opening balance is set on the account
rather than carried in the file.

A transfer between two of your accounts arrives marked **Needs attention**,
because an import picks one account and a transfer needs two: choose both on
Staged before you commit it. The same transfer is in both accounts' exports,
so once you've chosen its accounts on the second import, it's flagged as a
duplicate of the one you already committed.

Moving a whole ledger between the cloud app and a copy you host yourself, in
either direction, is this same mechanism applied account by account, plus
setting up by hand what no export carries.
[Moving between the cloud app and your own copy](/docs/moving-between-cloud-and-self-hosted/)
is the procedure.

## What it asks you

- **The date order**: YYYY-MM-DD, MM/DD/YYYY or DD/MM/YYYY. It starts on
  YYYY-MM-DD, and most US banks write MM/DD/YYYY, so check this one. It never
  guesses from the rows, because `03/04/2026` is March or April depending on
  the bank. A date it can't read stages without one, and a date it can read
  the wrong way around stages on the wrong day.
- **The decimal separator**: 1,234.56 or 1.234,56. Asked for the same reason,
  since `12,34` could be either.

## How each cell is read

- **A signed amount**: a minus sign or parentheses, like -12.50 or (12.50), is
  money out and stages as a withdrawal. Any other number is money in and
  stages as a deposit.
- **Debit and credit**: a debit is money out and a credit is money in. A row
  with a non-zero amount in both is marked "Only one of debit and credit may
  contain a non-zero amount". If you map only one of the two, a negative
  number in it is refused, because the file has no other way to say which
  direction it meant.
- **An amount** is digits, the decimal separator you chose, thousands grouped
  with the other mark or a space, and an optional minus sign in front or
  parentheses around it. A currency symbol or code, like $12.50 or 12.50 USD,
  a plus sign, or a minus sign anywhere but the front gets "Amount must be a
  number. Check the decimal and thousands separators."
- **A date** is written exactly in the order you chose. YYYY-MM-DD has to be
  just that; MM/DD/YYYY and DD/MM/YYYY can use /, . or - between the parts.
  The year needs four digits, and nothing can follow the date, so 03/04/26 or
  a date with a time after it gets "Date could not be parsed".

<Callout kind="warning" title="A card file that lists purchases as positive numbers">
Some credit card files write every purchase as a positive amount. Read as a
signed amount, every purchase is money in. A new category the file names is
then created as an income category, because a new category takes the
direction of the rows that name it, and fixing the rows later leaves those
purchases filed under income. So for a file like that, leave **Category** on
**Not mapped** and stage it. Then on Staged, select the purchases and use
[**Edit selected**](/docs/staged-transactions/#edit-selected) to change their
type to a withdrawal, which keeps their account, and set their category in
the same step.
</Callout>

## Check it with a dry run

**Dry run** shows how each row will be read without saving anything, and
creates no category, so you can check both answers and the column mapping
first. The preview panel switches to **As it will be read** and shows the
first 12 rows as they'll land, each marked **Ready** or **Needs attention**.

Under the buttons, the result says how the whole file went:

- "N ready and N needing attention out of N rows. Nothing was changed during
  this dry run."
- "Categories: N matched, N new, and N updated. Payees: N matched and N new."
  A new category is one the stage will create, and an updated one is an
  archived category the stage will bring back.

Change any setting after a dry run and its result goes away, because it no
longer describes what would happen. Run it again before you stage.

## Stage the rows

**Stage all rows** puts every row on Staged and reports the same two lines,
with a **Review these N rows** link in place of the dry-run note. The link
opens Staged on just this import, with its dates set to **All time** so rows
from earlier months aren't hidden. For 50 rows or more, a bar counts the rows
as they go. If the stage is refused partway, the message ends "Nothing was
staged."

If every account you have is frozen, because the free plan keeps 3 accounts in
use, the screen says **Every account is frozen** instead, since a frozen
account accepts no rows. [Your account and plan](/docs/your-account-and-plan/)
explains how one comes back into use.

## Staging, and why nothing counts yet

Every imported row is **staged**. A staged row has no postings, appears in no
balance, and is absent from every report. It exists to be looked at.

That's what makes a wrong mapping cheap: if the importer read the wrong column,
you delete the staged rows and no balance or report ever knew. Categories are
the exception. Any category the stage created or brought back from the archive
stays after the rows are gone, so a description column mapped as the category
can leave a category behind for every description in the file. Run a
**Dry run** first, which creates nothing.

To fix a whole import at once, such as setting the account or the category on
every row, select its rows on Staged and use **Edit selected**.
[Staged transactions](/docs/staged-transactions/#edit-selected) covers it, and
[Changing many transactions at once](/docs/changing-many-transactions/) covers
the same kind of edit on transactions you've already committed.

## Duplicates

A row that looks like a transaction you've already committed is flagged
**Already recorded**. It's flagged when the account, the direction and the
amount are the same and the dates are within 3 days of each other, whatever
the payee and the category say, because a bank names a shop its own way and
often posts a purchase a day or two late. A row that looks like another row
still waiting on Staged is flagged **Repeats another row**.

Importing the same statement twice is the common case. The second copy's rows
are flagged, and a flagged row isn't committed unless you say so, so you end
up with one set of transactions rather than two.
[Review possible duplicates](/docs/staged-transactions/#review-possible-duplicates)
shows each pair side by side so you can delete the spare.

## Committing

Committing turns staged rows into transactions, writes their postings, and is
atomic: either every row in the batch lands or none does. Select the rows on
Staged and press **Commit selected**.
[Staged transactions](/docs/staged-transactions/) covers committing, fixing
rows and the statuses.

One file stages at most ten thousand rows, the same number one commit, mass
edit or mass delete covers, so a whole import always fits in one commit.

[How to balance your checking account](/learn/balance-your-checking-account/)
starts from an imported statement and checks your records against your bank's,
line by line. [How to track your spending](/learn/track-your-spending/) walks
through a first statement from your bank's website to the rows you commit.
