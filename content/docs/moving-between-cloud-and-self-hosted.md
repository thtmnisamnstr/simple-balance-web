---
title: Moving between the cloud app and your own copy
description: Move your transactions between the cloud app and a copy you host, in either direction, one account at a time, and set up by hand what no export carries.
section: Self-hosting
order: 6
updated: 2026-10-25
---

You can move from the cloud app at [app.smpl.money](https://app.smpl.money/)
to a copy you host yourself, or from your own copy to the cloud app. It works
the same way in both directions, because both run the same software: you
export each account's transactions as a spreadsheet from one, and bring them
into the other.

It isn't one button, and it's worth knowing why before you start. The export
carries transactions, and your records hold more than that. So read the two
lists below first. They're short, and they're the difference
between an account that balances on the other side and one that's off by
whatever it started with.

## What moves, and what you set up again

**Moves.** Every transaction in every account, as a spreadsheet, including the
category, the payee, the date and the amount. The currency comes from the
account you bring the file into, not from the file, which is why each account
is created in the same currency first. Categories come back by name as the
rows use them.

**Doesn't move.** Budgets, category groups, transaction templates, recurring
transactions, and each account's opening balance. The first four you set up
again on the other side, which takes a few minutes. The last is the one that
trips people up, because nothing on screen says it's missing.

The opening balance isn't in the file, and that's how the books work rather
than a gap in the export. Simple Balance posts an opening balance straight
against an equity account without writing a transaction, which is what keeps
your records netting to zero from the first day instead of starting from a
number kept outside them. Nothing writes a transaction, so nothing exports
one.

## Before you export anything

Get the side you're moving to ready first.

- **To your own copy.** Set it up and sign in to it.
  [Self-hosting: running your own copy](/docs/self-hosting/) covers the install.
- **To the cloud app.** [Sign up at app.smpl.money](https://app.smpl.money/).
  The free plan lets you use 3 accounts at once, so if you're bringing more
  than 3 that you still use, you'll need Premium.
  [Your account and plan](/docs/your-account-and-plan/) has the details.

Then create each account you're moving, by hand, on the new side. Give each
one the same currency, the same opening balance and the same opening date it
has where it is now. That's the step that carries the opening balance across,
and doing it first means the first import lands on a correct starting figure
instead of on zero.

**Closed accounts on the free plan.** An archived account doesn't count toward
the 3, so an account you've closed can come over too, one at a time. Create
the accounts you still use first. Then, for each closed account, create it,
bring its file in, commit its rows, and archive it before you create the next.
Commit or delete everything waiting for it on **Staged** first, its transfers
to your other accounts included: an archived account takes no new entries, and
one with rows still waiting can't be archived.

## Moving one account

Repeat this for each account. An import file goes into exactly one account, so
there's no way to do several at once.

1. On the side you're leaving, open the account.
2. Set the date range at the top to **All time** before you export, because it
   opens on **This month** and an export takes whatever the page is showing.
   Skipping this is how people move one month of each account and think
   they're finished.
3. Press **Export CSV** to save its transactions as a spreadsheet.
4. On the side you're moving to, open **Import CSV**, choose that file, and
   pick the matching account. Nothing counts until you commit the rows, so
   look them over on **Staged** first.
5. Check the closing balance against the one on the side you're leaving before
   you move on. If it's off, it's almost always the opening balance from the
   section above or the date range from step 2. An account that's archived on
   the side you're leaving shows a balance of zero there, so compare it with
   the new one after you've archived that too.

## Transfers appear in both files

A transfer between two of your own accounts is one movement with two sides, so
it turns up in both files.

Pick both accounts for it the first time it comes up, which records the whole
movement. When you import the other account's file, leave it out. You already
have it.

If you do select it a second time, Simple Balance flags it as a transaction you
already have and shows you both before anything counts. Commit it anyway and
the transfer is recorded twice, which is the one mistake this page can't undo
for you.

## Large accounts

An import takes 10,000 rows at a time, and the importer says so when you hand
it a bigger file. If an account has more than 10,000 transactions, use the same
date range control from step 2 to export a shorter date range, bring that file
in, and then move to the next range. A copy you host yourself can be set to
take fewer rows than that, with
[`CSV_MAX_ROWS`](/docs/configuration/#operational-settings).

## When you're done

Set up the budgets, category groups, templates and recurring transactions you
had. Nothing carries them. Nothing on the side you left is deleted by any of
this, so you can keep both open while you check that the figures agree.

Each has a page to follow while you set it up again:
[Budgets](/docs/budgets/),
[grouping categories](/docs/categories-and-payees/#group-categories),
[Templates](/docs/templates/) and
[Recurring transactions](/docs/recurring-transactions/).

Once you're sure, the side you left is yours to clean up. If you left the cloud
app, [delete your account](/docs/your-account-and-plan/#deleting-your-account)
there, which also cancels a Premium subscription. If you left your own copy,
keep its database as a backup or delete it.
