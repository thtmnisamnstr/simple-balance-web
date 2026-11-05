---
title: Moving between the cloud app and your own copy
description: "Move between the cloud app and your own copy in one Simple Balance file: accounts, budgets, templates and recurring transactions, with the balances checked."
section: Self-hosting
order: 6
updated: 2026-11-04
---

You can move from the cloud app at [app.smpl.money](https://app.smpl.money/)
to a copy you host yourself, or from your own copy to the cloud app, with one
file. On the side you're leaving, you export a Simple Balance file, which
holds your whole ledger. On the side you're moving to, you move it into a new,
empty ledger. Every transaction goes straight into your books, with nothing to
review, and the balances are checked against the file's before the move
finishes.

It works the same way in both directions, because both run the same software.
It's a one-time trip, though, not a way to keep two copies in step: once
you've moved, the two are separate ledgers.

## What moves, and what doesn't

**Moves.**

- Every account, with its type, currency, opening date and opening balance.
  An account you archived arrives archived on the day you archived it,
  holding its transactions.
- Your categories and category groups.
- Every transaction, with its splits and both sides of every transfer.
  Deleted transactions come too, and arrive deleted.
- Your templates with their email reminders, your recurring transactions and
  your budgets.
- Rows still waiting on **Staged**, which wait there again.
- Your timezone, default currency and theme, if you choose the file's.

Nothing comes due again on the new side for a day the old side already
handled. A reminder that already went out isn't sent again, and a recurring
transaction doesn't propose a day the other side already proposed.

**Doesn't move.** Your sign-in and password, a connected Google account, your
connected AI assistants and your plan stay with the side that has them. The
activity history can go in the file, but nothing ever reads it back, so it's
left out to start with.

## Before you start

- **Both sides need Simple Balance 0.2.2 or later.** [app.smpl.money](https://app.smpl.money/) already
  runs it. A copy you run yourself has to be on 0.2.2 or later whether you're
  leaving it or moving to it, and a copy older than the side that made the
  file can be told "Upgrade this copy to import it." The two deployment
  guides say how to upgrade:
  [Docker Compose](/docs/deploying-with-docker-compose/#upgrading) and
  [Oracle Cloud or AWS](/docs/deploying-to-oracle-cloud-or-aws/#upgrading).
- **The side you're moving to should be new and empty.** To move to the cloud
  app, [sign up at app.smpl.money](https://app.smpl.money/). To move to your
  own copy, set it up and sign in.
  [Self-hosting: running your own copy](/docs/self-hosting/) covers the
  install. Then leave it empty, because the file brings everything. A move is
  offered only while every transaction in the ledger came from a Simple
  Balance file, so one transaction typed in, or committed from a CSV, rules
  it out. A row waiting on **Staged** that didn't come from a file holds it
  up until you discard it. Accounts, categories, templates and budgets you
  made yourself don't.
- **On the cloud app's free plan, 3 accounts can be in use at once.** If
  you're bringing more than 3 that you still use, either upgrade to Premium
  under **Settings** before you move, or choose which ones arrive archived
  while you move. Accounts you'd already archived don't count.
  [Your account and plan](/docs/your-account-and-plan/) has the details.

## Move your ledger

1. On the side you're leaving, open **Import/Export**. Under
   **Export a Simple Balance file**, leave **What to export** on
   **Everything**.
2. Leave the boxes under **What the file holds** as they start: every one but
   **Activity history (kept in the file, cannot be imported)**, with
   **Include deleted transactions** checked. Leave **Transactions from** on
   **All time**.
3. Press **Export file**. Your browser saves it as `simple-balance-` and
   today's date, ending in `.json`.
4. On the side you're moving to, open **Import/Export**. Under
   **Import a Simple Balance file**, choose the file, or drop it on
   **Choose a Simple Balance file**. The page checks it against this ledger.
   Nothing is written yet.
5. Under **How should this file come in?**, choose
   **Move it into this ledger**.
6. Read what it says it will do, and answer anything under **Still to decide**.
   The next section covers each question.
7. Press **Move into this ledger**.

When it's done, the page says how many transactions went straight into the
books, and "Every balance came out as the file says", with how many accounts
it checked. Any it didn't compare are counted too, such as one archived where
the file came from, which holds nothing there to compare with. A file exported
without its transactions carries no balances, and the page says "This file
carried no balances to check." **Open Accounts** shows what arrived.

<Callout kind="warning" title="A move can't be undone in one step">
What a move writes comes out again only one transaction and one record at a
time. Read what the page says it will do before you press
**Move into this ledger**.
</Callout>

## What the move may ask you

Nothing is chosen for you. The button stays grayed out until everything is
answered, and the line under it says what's still open.

- **Accounts to arrive archived** lists every account the file creates that
  wasn't archived where it came from, on any plan, so you can put some away
  as they arrive. On the free plan, when the file brings more accounts in use
  than you have room for, it also says how many to choose. Check at least
  that many. Each one still takes in its transactions, uses no place, and
  holds nothing from the day of the move. Restoring it later, into a free
  place, puts its balance back.
- **Regional defaults and appearance** appears when this side has a
  timezone, default currency and theme of its own and the file's differ. A
  new sign-up takes your browser's timezone and currency the first time it's
  opened, so you're usually asked whether to **Use the file's** settings or
  **Keep this copy's**.
- **A record may need a choice, which is rare in a new ledger.** It's one with
  the same name as a record already there, or one the file only names. An
  account or a category the file's transactions are filed under has to come
  in, so **Leave it out** isn't offered for one. An account in another
  currency is never taken for the file's.

## When moving isn't offered

**Move it into this ledger** is grayed out, with the reason under it, when the
ledger already holds a transaction or a staged row that didn't come from a
Simple Balance file:

- **It has a transaction of its own.** One typed in or committed from a CSV
  counts, even if it's been deleted since. The reason reads "This ledger
  already has transactions that did not come from a Simple Balance file, so a
  file can only be added to it, with its transactions going to Staged for
  review."
- **It has rows waiting on Staged that didn't come from a file.** That's a CSV
  you staged and didn't commit, a recurring transaction's row, a row you
  staged or cloned yourself, or one an AI assistant staged. Discard them
  on **Staged**, then press **Check file again**, and moving is offered again.
  Committing them would rule it out for good.

Adding is the way in then. Choose **Add it to this ledger**: new accounts,
categories, templates, recurring transactions and budgets come in at once, and
the transactions go to **Staged** for you to commit, with both sides of every
transfer filled in. Deleted transactions aren't added, and an account archived
on the other side arrives archived on the day you add it, not the day it was
archived. [Staged transactions](/docs/staged-transactions/) covers committing
them.

## Only some accounts

Under **What to export**, **Some accounts** makes a file of up to 100 accounts
you pick, archived ones included. Under **With their transactions**, choose
**No, account details only**, **All of them** or **In a date range**. A
transfer between two accounts you picked is in the file once, and an account
on the far side of a transfer that you didn't pick travels by its name only.
Templates, recurring transactions, budgets, staged rows and settings come only
with **Everything**.

## A large file goes in parts

A file of more than 10,000 rows, counting transactions, staged rows and budget
amounts together, or more than 16 MiB, goes in parts. The page cuts it for
you and says which part it's on, such as "Part 2 of 3". Each part is written
completely or not at all, and the recurring transactions arrive with the last
one.

If a part stops, the parts before it are in. The button becomes **Try again**,
which names the part for a file in parts, such as "Try part 2 of 3 again". It
sends that part again, and a part that did finish isn't moved twice. Choosing
the file again, or **Check file again**, also picks up where it stopped and
keeps what you decided.

**Trying again won't help when a balance doesn't come out.** The page names
each account and both figures, and the button is grayed out, because the same
part would meet the same figures. Rename the account on this side under
**Accounts** and press **Check file again**, and the file's comes in as a new
account. Or check the file again and add it instead.

## A ledger too big for one file

One export holds up to 100,000 rows and 16 MiB of notes and other text. A
bigger ledger is refused, with a sentence saying what to narrow. Move it a
date range at a time instead, oldest first:

1. Under **Transactions from**, choose **Date range**, and fill in
   **Start date** and **End date**. Start the first range before your first
   transaction.
2. Uncheck **Recurring transactions** in every file but the last.
3. Export and move the first range.
4. Export the next range, starting the day after the last one ended, and move
   it into the same ledger. The page asks about each account that was already
   open before this range starts: choose **Use the one here**, which continues
   from the history already in it. One that opens later is used without
   asking, as long as nothing about it changed between the two exports.
5. Repeat until the last range, which has **Recurring transactions** checked.
   Its balance check says whether every earlier range is in.

Oldest first, because each range is checked against the balances on its own
last day, so a range moved before the ones ahead of it is refused. The
recurring transactions wait for the last range because one that arrived
earlier could put a row on **Staged** before the next range does, and that row
stops the move until you discard it.

## On a copy you run yourself

- **There's no account limit unless you sell a plan.** Nothing has to arrive
  archived, though **Accounts to arrive archived** is still there if you want
  to put some away as they arrive.
- **A proxy of your own has to let a part through.** One in front of Simple
  Balance needs to allow requests of at least 52 MiB on the file's routes,
  `52m` in nginx or `52MiB` in Caddy, or a large part is refused before it
  reaches the app. The proxies the deployment guides set up already allow
  that.

## When you're done

Nothing on the side you left is changed or deleted, so you can keep both open
while you check that the figures agree. Its recurring transactions and
reminders keep running there until you delete it, though.

On the new side, connect your AI assistants again, as
[Connecting an AI assistant](/docs/agents-and-mcp/) describes. To sign in with
Google there, choose **Connect Google** under **Settings**.

Once you're sure, the side you left is yours to clean up. If you left the cloud
app, [delete your account](/docs/your-account-and-plan/#deleting-your-account)
there, which also cancels a Premium subscription. If you left your own copy,
keep its database as a backup or delete it.

Once you type a transaction into the new side, it takes no more moves. To
bring across transactions you recorded on the old side afterward, export them
with a date range and add that file, and they wait on **Staged** for you.

## A copy older than 0.2.2

A copy older than 0.2.2 can't make or read a Simple Balance file, so upgrade it
first and move as above. Before 0.2.2, the only way across was each account's
**Export CSV**, which carries transactions and nothing else: no opening
balances, budgets, templates or recurring transactions, and every transfer's
other account picked again by hand.

## Limits

| Limit                                  | Size                  | When you reach it                                                                                                                                     |
| -------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rows in one Simple Balance file        | 100,000               | **Export file** is refused. The message says "one export holds at most 100,000" and what to narrow, usually the dates. Export a date range at a time. |
| Notes and other text in one file       | 16 MiB                | Refused the same way, with "one export carries at most 16,777,216". Export a date range at a time.                                                    |
| Accounts in one **Some accounts** file | 100                   | "Choose at most 100 accounts, or choose Everything to export every account"                                                                           |
| One part of a file                     | 10,000 rows or 16 MiB | The page cuts a bigger file into parts for you.                                                                                                       |

[Limits](/docs/limits/) lists every limit in one place.
[Connecting an AI assistant](/docs/agents-and-mcp/) covers an assistant with
**Read, stage, and commit** access, which can export and move a file too.
