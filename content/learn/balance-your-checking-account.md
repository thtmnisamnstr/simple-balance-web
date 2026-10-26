---
title: How to balance your checking account
description: Match your record to your bank's statement line by line, allow for what's still on its way, and track down any difference. It takes about ten minutes a month.
date: 2026-10-24
updated: 2026-10-26
section: Keeping it accurate
order: 1
---

Balancing your checking account means comparing your own record with your
bank's statement, line by line, until the two agree. Accountants call it
reconciling. People used to do it with a checkbook and a pencil. You may not
write checks anymore, but the reasons to do it haven't gone away.

## Why it matters

You catch charges you didn't make. A charge you don't recognize is easiest to
fight when you find it early. If an unauthorized withdrawal shows up on your
statement, the Consumer Financial Protection Bureau says you should
[tell your bank within 60 days](https://www.consumerfinance.gov/ask-cfpb/how-do-i-get-my-money-back-after-i-discover-an-unauthorized-transaction-or-money-missing-from-my-bank-account-en-1017/). If you wait longer, you could end up
paying for charges that happen after that.

You catch mistakes, the bank's and your own. A double charge, a refund that
never came, a fee you didn't expect, or a $54 purchase you wrote down as $45.

You stop trusting the wrong number. The balance your banking app shows may not
include everything that's on its way out. The federal agency that oversees
national banks [points out](https://www.helpwithmybank.gov/help-topics/bank-accounts/nsf-fees-overdraft-protection/nsf-fees/nsf-deposit-pending.html) that many transactions are processed
overnight, so they may not show up in your available balance yet. Checks that
haven't been cashed and payments still pending are already spent, as far as
you're concerned. If you spend against a number that doesn't know about them,
that's how overdraft fees happen.

And your budget is only as good as your record. Every total you look at later
depends on the transactions being right.

## How to do it

These steps follow the FDIC's Money Smart lesson,
[Balance your checkbook](https://www.fdic.gov/consumers/consumer/moneysmart/podcast/documents/mspn-2-3-checking-bal.pdf).

### 1. Get the statement

You need the ending balance and the list of everything on the statement. Most
banks show both online, and many let you download the list as a file.

### 2. Check off what matches

Go down the statement and find each item in your own record. Mark it in both
places. A pen works, and so does a column in a spreadsheet.

### 3. Look at what doesn't match

Whatever is left falls into two piles.

The first pile is things on the statement but not in your record. These might
be fees, interest, an automatic payment you forgot, or a charge you don't
recognize. Add the real ones to your record, and look into any you don't
recognize.

The second pile is things in your record but not on the statement. Usually
these haven't reached the bank yet. Think of a check that hasn't been cashed, a
deposit you made after the statement closed, or a purchase that's still
pending.

### 4. Do the math

Start with the statement's ending balance. Subtract the withdrawals that are
still on their way out, and add the deposits that are still on their way in.
The answer should match the balance in your own record.

<Diagram name="balance-your-checking-account-math" />

### 5. If it doesn't match, look at the difference

How big the gap is gives you a clue:

- If it matches one transaction exactly, that one is missing from one side.
- If it's twice one transaction, that one was probably entered backward, as
  money in instead of money out.
- If it divides evenly by 9, two digits were probably swapped. A $54 purchase
  written as $45 leaves a gap of $9, and $820 written as $280 leaves $540.
  Accountants look for this [when they reconcile](https://www.accountingtools.com/articles/transposition-error).

<Diagram name="balance-your-checking-account-gap" />

### 6. Do it every month

The best time is right after your statement comes, while you still remember
the month. Once it's a habit, it takes about ten minutes.

## How to do it in Simple Balance

### Bring in the statement

Download the statement period from your bank as a CSV file, then open
[**Import CSV**](/docs/importing-a-statement/). Rows that look like something
you've already entered get flagged as possible duplicates. Each one is shown
side by side with the entry it looks like, so bringing in purchases you already
typed won't count them twice. Check the rows on
[**Staged**](/docs/staged-transactions/), then press **Commit selected**.

<Shot
  name="staged"
  alt="Staged transactions, the review queue: four rows that don't count yet, each with a date, payee, account, category, a Ready status and an amount, including a $19.99 refund from Streamly and a $23.50 transit pass on the travel card."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

### Open the register

On [**Accounts**](/docs/accounts/#check-a-balance-against-your-statement), open
the account and press **Show register**. It lists every deposit and withdrawal
in date order, with the balance before and after each one. It's your own record,
laid out the same way as the bank's.

<Shot
  name="accounts"
  alt="The accounts page: a search box and sort controls, then accounts grouped by type. Under Checking, a euro account at €1,621.10 and Everyday Checking at $7,663.45. Under Savings, Savings at $20,200.00. Under Credit card, a card named Travel Card."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

### Compare the closing balance

Find the last row on or before the statement's closing date. The balance after
that row should match the statement's ending balance, once you've allowed for
anything still on its way.

### Find where it went wrong

If they don't match, read down the register until its running balance stops
matching the bank's. That's the row to fix. The size of the gap tells you what
to look for, just like in step 5.

### Fix it and keep the history

On the same page, find that transaction in the list and press its pencil
button to correct it.

<Shot
  name="transactions"
  alt="A list of transactions, newest first, each with who it was with, which account it was in, its category and its amount, all in dollars. Most are spending on groceries, a lunch, cinema tickets and a transit pass. One is a $750 freelance payment coming in, and one is $600 moved from checking to savings, which shows both accounts and no category."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

Simple Balance records a fix as a change on top of the original instead of
erasing it. The history of the mistake stays, and
[**Activity**](/docs/activity-history/) lists the change.

<Shot
  name="activity"
  alt="The activity history, newest first: staged rows created and budget plans created, each with the date and time it happened."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

<Callout kind="note" title="What Simple Balance can't see">
Simple Balance doesn't pull anything from your bank today, so it only knows
what you've brought in or typed. It doesn't know about holds, pending charges,
or what your bank calls your available balance. And money you date in the
future doesn't count toward any balance until that date comes.
</Callout>

## Sources

- Consumer Financial Protection Bureau. [How do I get my money back after I discover an unauthorized transaction or money missing from my bank account?](https://www.consumerfinance.gov/ask-cfpb/how-do-i-get-my-money-back-after-i-discover-an-unauthorized-transaction-or-money-missing-from-my-bank-account-en-1017/). Reviewed August 28, 2026.
- Office of the Comptroller of the Currency, HelpWithMyBank.gov. [Can the bank charge an overdraft fee while there is a deposit pending?](https://www.helpwithmybank.gov/help-topics/bank-accounts/nsf-fees-overdraft-protection/nsf-fees/nsf-deposit-pending.html).
- Federal Deposit Insurance Corporation. [Money Smart podcast: Balance your checkbook](https://www.fdic.gov/consumers/consumer/moneysmart/podcast/documents/mspn-2-3-checking-bal.pdf).
- Steven Bragg, AccountingTools. [Transposition error definition](https://www.accountingtools.com/articles/transposition-error). February 13, 2026.
