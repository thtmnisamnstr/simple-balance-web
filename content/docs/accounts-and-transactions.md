---
title: Accounts and transactions
description: The four kinds of entry, what each one does to the books, and why a transfer is not two transactions.
section: Using it
order: 2
updated: 2026-09-17
---

Everything in the ledger is one of four kinds of entry. Which one you choose
decides what happens to the books, so it is worth two minutes.

## Accounts

An account is somewhere money sits: a checking account, a savings account, a
credit card, a loan, cash in a drawer, a wallet. Each has one currency, an opening
date and an opening balance.

**A card or a loan opens negative.** A credit card with 500 outstanding opens
at `-500`, because that is money you owe rather than money you hold.

The opening balance is not a number kept outside the ledger. It posts against
an equity account, so the books net to zero from the first day rather than
starting from a figure nothing explains.

## The four entries

| Entry          | What it does                                         |
| -------------- | ---------------------------------------------------- |
| **Deposit**    | Money arrives in one of your accounts, from outside. |
| **Withdrawal** | Money leaves one of your accounts, to outside.       |
| **Transfer**   | Money moves between two accounts you hold.           |
| **Conversion** | A transfer between accounts in different currencies. |

<Callout kind="tip" title="A transfer is one entry, not two">
Recording a transfer as a withdrawal plus a deposit inflates both your income
and your spending for the month by the same amount. They still net out, which
is exactly why nobody notices — and then "what do I spend?" is overstated for
the rest of the year.
</Callout>

## Categories, and refunds

A deposit normally credits income and a withdrawal normally debits expense.
The category overrides that when it contradicts it.

Money coming back into a spending category is a **refund**, not income: it
debits expense, so the spending it reverses goes down. The mirror holds for
money going back out of an income category.

This is why naming the category matters more than it looks. The direction of
the money says what happened at the bank; the category says what it meant.

## Splits

One receipt can cover several categories. A split cuts the counter-account
side of an entry into legs, each attributed on its own, and the legs add up to
the total because that is the same zero-sum check every entry gets.

A transfer has no counter-account side, so a transfer is never split.

## Corrections

**Postings are append-only.** Editing an entry works out the difference and
appends only that; nothing is overwritten and nothing is lost. An edit that
changes nothing about the movement writes nothing at all.

Deleting voids an entry by posting its reversal. Nothing filters deleted
entries out of a balance, because a voided entry already nets to zero — which
is why a deleted entry cannot quietly change a total.

## Dates in the future

Money dated in the future has not moved. It counts toward no balance and no
cash flow until its date arrives, and a summary stops at today in your own
timezone whatever end date you ask for.
