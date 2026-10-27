---
title: How deposits, withdrawals and transfers work
description: The three kinds of entry, why a transfer isn't two, how refunds and splits work, and why a deleted transaction is never erased.
section: Using Simple Balance
order: 11
updated: 2026-10-26
---

Everything in Simple Balance is one of three kinds of entry, moving money into,
out of or between your accounts. Which one you choose decides what happens to
your balances and reports, so it's worth two minutes. This page explains the
ideas; [Accounts](/docs/accounts/) and [Transactions](/docs/transactions/) walk
through the screens.

## Accounts

An account is somewhere money sits: a checking account, a savings account, a
credit card, a loan, cash in a drawer, a wallet. Each has one currency, an opening
date and an opening balance.

**A card or a loan opens negative.** For a credit card with $500 outstanding,
choose **Amount owed** and enter 500 as the starting amount. The account opens
at -$500, because that's money you owe rather than money you hold.

The opening balance isn't a number kept outside the ledger. It posts against
an equity account called Opening Balances, so the books net to zero from the
first day rather than starting from a figure nothing explains.

**Archiving keeps the books balanced too.** When you archive an account that
still holds money, that balance is posted out of it to Opening Balances. The
account ends at zero, the amount stops counting toward your totals, and its
history stays readable. Restoring the account posts the balance back.

## The three entries

| Entry          | What it does                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Deposit**    | Money arrives in one of your accounts, from outside.                                                               |
| **Withdrawal** | Money leaves one of your accounts, to outside.                                                                     |
| **Transfer**   | Money moves between two accounts you hold. Between currencies, it records the amount sent and the amount received. |

<Callout kind="tip" title="A transfer is one entry, not two">
Recording a transfer as a withdrawal plus a deposit inflates both your income
and your spending for the month by the same amount. They still net out, which
is exactly why nobody notices, and then "what do I spend?" is overstated for
the rest of the year.
</Callout>

Paying a credit card bill from checking is a transfer too.
[How to budget with a credit card](/learn/budget-with-a-credit-card/) explains
why the purchases count as spending and the payment doesn't.

A transfer between currencies saves the rate those two amounts imply, and
nothing looks up a market rate. [More than one currency](/docs/multiple-currencies/)
covers the rest.

## Categories, and refunds

A deposit normally counts as income and a withdrawal as spending. The category
overrides that when it contradicts it.

Money coming back into a spending category is a **refund**, not income. You
enter it as a deposit under that spending category, and it lowers that
spending instead of counting as income. The mirror holds for money going back
out of an income category: it lowers that income instead of counting as
spending.

When you name a category that doesn't exist yet, the form asks what kind it is,
because the direction alone gets a refund wrong. On a deposit the choice is
**Money you earned** or **A refund of money you spent**. On a withdrawal it's
**Money you spent** or **Paying back money you earned**.

One entry can't be both. A split deposit that names an income category and a
spending category is refused with "A deposit is either income or a refund, not
both. Enter it as two transactions." A split withdrawal that does the same is
refused the same way.

A category whose **Applies to** is **Income or expense** goes along with
whichever direction it's given, so it never turns an entry into a refund. If
you want refunds to lower your spending, keep your spending categories on
**Expense**. [Categories and payees](/docs/categories-and-payees/) shows where
to set it.

This is why naming the category matters more than it looks. The direction of
the money says what happened at the bank; the category says what it meant.

## Splits

One receipt can cover several categories. A split cuts the counter-account
side of an entry into legs, each attributed on its own, and the legs add up to
the total because that's the same zero-sum check every entry gets. Each leg
counts under its own category everywhere: on the overview, on the category's
page and in the reports.

A split can name up to 50 categories. A transfer has no counter-account side,
so a transfer is never split. [Transactions](/docs/transactions/) has the
steps for splitting one.

## Corrections

**Postings are append-only.** Editing an entry works out the difference and
appends only that; nothing is overwritten and nothing is lost. An edit that
changes nothing about the movement writes nothing at all.

Deleting voids an entry by posting its reversal. Nothing filters deleted
entries out of a balance, because a voided entry already nets to zero, which
is why a deleted entry can't quietly change a total.

So a deleted entry can come back. On **Transactions**, turn on
**Show deleted**, find the row marked **Deleted**, and press the restore
button on it. It counts toward your balances and reports again, on its own
date.

## Dates in the future

Money dated in the future hasn't moved. It counts toward no report, budget or
cash flow until its date arrives, and a summary stops at today in your own
timezone whatever end date you ask for. On an account's page,
**Future balance** includes every future transaction, and **Ending balance**
includes the ones your dates reach.
