---
title: Double-entry bookkeeping, for one person
description: Why a personal finance app that nobody audits still benefits from books that have to balance.
date: 2026-09-10
authors: [gavin]
tags: [bookkeeping, design]
featured: true
series: Keeping your own books
seriesOrder: 1
---

Double-entry bookkeeping is six hundred years old and was invented for
merchants who had to answer to somebody. If you are tracking your own current
account, nobody is going to audit you. So why carry the machinery?

Because the machinery is not about the audit. It is about the arithmetic being
checkable.

## What single-entry actually costs

Most personal finance tools keep a list of transactions and a balance per
account. The balance is a number, and the number is right because the code that
maintained it was right. When it is wrong, there is nothing to compare it
against — the list and the balance are the same claim made twice.

The failures that follow are all the same shape. A transfer counted as income
in one view and a transfer in another. A refund that lowered nothing. A total
that includes an account you archived, or excludes one you did not.

## What the second entry buys

In double-entry every transaction touches at least two accounts and the amounts
sum to zero. A deposit credits the destination and debits income. A withdrawal
debits the source and credits expense. A transfer moves between two accounts you
hold and touches no income or expense at all, which is why it cannot inflate
either.

The zero-sum property is checked before anything is written. That means a
transaction that would leave the books unbalanced is refused rather than stored,
and every balance is derived by summing postings rather than maintained
alongside them.

## The part you actually feel

Traceability. When a figure looks wrong you can open the register for that
account and see every posting with the balance before and after it, and the one
that went wrong is visibly the one that went wrong.

That is worth the extra entry even when the only person you answer to is
yourself in March, looking at February and wondering where nine hundred pounds
went.
