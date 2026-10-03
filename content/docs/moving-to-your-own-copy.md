---
title: Moving to your own copy
description: Take the transactions out of the version we run and bring them into a copy you run yourself, one account at a time, including the two things no export carries.
section: Install
order: 2
updated: 2026-10-02
---

Everything you record in the version we run for you can be taken out and
brought into a copy you run yourself. It is not one button, and it is worth
knowing why before you start: the export carries transactions, and a ledger is
more than its transactions.

So read the two lists below first. They are short, and they are the difference
between an account that balances on the other side and one that is off by
whatever it started with.

## What moves, and what you set up again

**Moves.** Every transaction in every account, as a spreadsheet, including the
category, the payee, the date, the amount and the currency.

**Does not move.** Budgets, transaction templates, recurring transactions, and
each account's opening balance. The first three you create again in your own
copy, which takes a few minutes. The fourth is the one that catches people out,
because nothing on screen says it is missing.

The opening balance is not in the file, and that is a consequence of how the
books work rather than a gap in the export. Simple Balance posts an opening
balance straight against the equity account without writing a transaction,
which is what keeps the ledger netting to zero from the first day instead of
starting from a number kept outside it. Nothing writes a transaction, so
nothing exports one.

## Before you export anything

Stand up your own copy first. [Getting started](/docs/getting-started/) is the
install; come back here once you can sign in to it.

Then create each account you are moving, by hand, in the new copy. Give each one
the same currency, the same opening balance and the same start date it has in
the version we run. That is the step that carries the opening balance across,
and doing it now means the first import lands on a correct starting figure
instead of on zero.

## Moving one account

Repeat this for each account. An import file goes into exactly one account, so
there is no way to do several at once.

1. Open the account in the version we run for you.
2. Set the date range at the top to **All time** before you export, because it
   opens on This month and an export takes whatever the bar is showing.
   Skipping this is how people move one month of each account and think they
   are finished.
3. Export its transactions as a spreadsheet.
4. In your own copy, open the matching account and bring that file in.
5. Check the closing balance against the one in the version we run before you
   move on. If it is off, it is almost always the opening balance from the
   previous section or the date range from step 2.

## Transfers appear in both files

A transfer between two of your own accounts is one movement with two sides, so
it turns up in both files.

Pick both accounts for it the first time it comes up, which records the whole
movement. When you import the other account's file, leave it out. You already
have it.

If you do select it a second time, Simple Balance flags it as a transaction you
already have and shows you both before anything counts. Commit it anyway and
the transfer is recorded twice, which is the one mistake this page cannot undo
for you.

## Large accounts

An import takes 10,000 rows at a time, and the importer says so when you hand
it a bigger file. If an account has more than 10,000 transactions, use the same
date range control from step 2 to export a shorter date range, bring that file
in, and then move to the next range.

## When you are done

Set up the budgets, templates and recurring transactions you had. Nothing
carries them. Nothing in the version we run is deleted by any of this either,
so you can keep both open while you check that the figures agree.
