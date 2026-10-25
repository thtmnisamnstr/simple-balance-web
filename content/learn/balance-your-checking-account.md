---
title: How to balance your checking account
description: Why your own number and your bank's disagree, how to find the difference line by line, and why ten minutes a month is worth it.
date: 2026-10-24
authors: [gavin]
section: Keeping it accurate
order: 1
---

Balancing your checking account means comparing your own record of it with
your bank's statement, line by line, until the two agree. Accountants call it
reconciling. People used to do it with a checkbook register and a pencil, and
the reasons to do it haven't gone away just because the checkbook did.

## Why it matters

**You catch charges you didn't make.** A charge you don't recognize is easiest
to fight when you find it quickly. Federal rules for debit cards and other
electronic transfers ask you to report an unauthorized withdrawal within 60
days of the statement it first appears on. Wait longer, and you can be held
responsible for later charges from the same problem.
[The Consumer Financial Protection Bureau](https://www.consumerfinance.gov/ask-cfpb/how-do-i-get-my-money-back-after-i-discover-an-unauthorized-transaction-or-money-missing-from-my-bank-account-en-1017/)
explains the details.

**You catch the bank's mistakes, and your own.** A double charge, a refund
that never arrived, a fee you didn't expect, or an entry you typed as $54
instead of $45.

**You stop trusting the wrong number.** The balance your banking app shows
first may not include everything that's on its way out. Checks you've written
that haven't been cashed and payments still pending have already left, as far
as you're concerned. Spending against a number that doesn't know about them is
how overdraft fees happen.

**Your budget is only as good as your record.** Every total that comes after
depends on the transactions being right.

## How to do it

### 1. Get the statement

You need the statement's ending balance and the list of everything on it.
Most banks show both online, and many let you download the list as a file.

### 2. Check off what matches

Go down the statement and find each item in your own record. Mark both. A pen
works; so does a spreadsheet column.

### 3. Look at what doesn't match

What's left falls into two piles:

- **In the statement, not in your record.** Fees, interest, an automatic
  payment you forgot about, or a charge you don't recognize. Add the ones that
  are real. Investigate the ones that aren't.
- **In your record, not in the statement.** Usually things that haven't
  reached the bank yet: a check that hasn't been cashed, a deposit made after
  the statement closed, a purchase still pending.

### 4. Do the arithmetic

Start from the statement's ending balance. Subtract the withdrawals still on
their way out and add the deposits still on their way in. The result should be
your own balance on the same date.

### 5. If it doesn't, read the difference

The size of the gap is a clue:

- **It matches one transaction exactly.** That one is missing from one side.
- **It's twice one transaction.** That one was entered the wrong way around,
  as money in instead of money out.
- **It divides evenly by 9.** Two digits were probably swapped: $54 typed as
  $45 leaves a gap of $9, and $820 typed as $280 leaves $540.

### 6. Do it every month

Right after the statement arrives is best, while you still remember the
month. Once you're in the habit, it's ten minutes.

## How to do it in Simple Balance

**Bring in the statement.** Download the statement period as a CSV file from
your bank and open **Import CSV**. Rows that look like something you've
already entered are flagged as possible duplicates and shown side by side with
the entry they resemble, so importing what you already typed doesn't count it
twice. Review the rows on **Staged**, then **Commit selected**.

**Open the register.** On **Accounts**, open the account and press **Show
register**. It lists every movement in date order with the balance before and
after it, which is your own record in the same shape as the bank's.

**Compare the balance on the closing date.** Find the last row on or before
the statement's closing date. Its balance after should match the statement's
ending balance, once you've allowed for anything still on its way.

**Find where it went wrong.** If they don't match, read down the register
until its running balance stops matching the bank's. That's the row to fix.
The size of the gap tells you what to look for, as above.

**Fix it without losing the trail.** Press the pencil on the row and correct
it. Simple Balance adds a correction on top rather than typing over the
original, so the history of the mistake survives the fix, and **Activity**
lists the change.

<Callout kind="note" title="What Simple Balance can't see">
There's no automatic pull from your bank today, so Simple Balance only knows
what you've imported or entered. It doesn't know about holds or pending
charges, or what your bank calls your available balance. Money you date in the
future isn't counted in any balance until that date arrives.
</Callout>
