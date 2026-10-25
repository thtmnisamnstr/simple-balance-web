---
title: How to track your spending
description: Before a budget, before a savings goal, there's one question to answer. Here's how to find out where your money actually goes, with any tool or in Simple Balance.
date: 2026-10-24
authors: [gavin]
section: Start here
order: 1
---

Ask most people what they spend in a month and they'll give you a number.
Ask them to check it against their bank statements and the number usually
goes up. Tracking your spending is how you swap the guess for the real figure,
and nearly everything else about managing money starts from it.

## Why it matters

**You can't change what you can't see.** "Spend less" isn't a plan. "Spend
$150 less on eating out" is, and you can only write that sentence once you
know eating out cost $450 last month.

**Small things add up where you aren't looking.** Rent and the car payment are
hard to forget. The coffee, the delivery fees and the subscription you signed
up for in a free trial are easy to forget, and they're often where the
surprise is.

**A budget built on a guess gets abandoned.** If you set $300 for groceries
because it sounded right, and you really spend $500, the budget is broken by
the second week and it's natural to give up on it. A budget built on a couple
of months of real numbers starts out believable.

**It tells you whether you're getting ahead.** Money in minus money out is the
one number that says whether your savings are growing or shrinking, and you
can't know it without both halves.

## How to do it

You don't need special software. A notebook or a spreadsheet works. What
matters is doing the same few steps every time.

### 1. Gather a month or two of statements

Start with your checking account and every credit card. Most banks let you
download a statement from their website, often as a spreadsheet file. One full
month is enough to start; two or three is better, because one month usually has
something unusual in it.

### 2. Pick a short list of categories

A category is a label for what the money was for. Start with eight or ten,
not forty:

- Housing (rent or mortgage)
- Utilities (power, water, phone, internet)
- Groceries
- Eating out
- Transportation (gas, transit, car payment)
- Health
- Shopping
- Subscriptions
- Everything else

You can split a category later if it turns out to be hiding something. Too
many categories at the start is the most common reason people stop.

### 3. Label every transaction

Go down each statement and give every purchase a category. Two kinds of
transaction need care, because they're the ones that make totals wrong:

- **Moving money between your own accounts isn't spending.** Paying your
  credit card from checking, or moving $200 into savings, doesn't change what
  you spent. The spending happened when you used the card. Count the payment
  as well and you've counted the same groceries twice.
- **A refund isn't income.** If you returned $40 of clothes, that's $40 less
  spent on clothes, not $40 earned. Take it off the category it came back to.

### 4. Add it up

Total each category for the month, and total your income. Now you can answer
three questions: where most of the money went, which numbers surprised you,
and whether more came in than went out.

### 5. Keep it going

Tracking once is a snapshot. Tracking every week, for ten or fifteen minutes,
is what turns it into a habit you can actually use. Weekly is easier than
monthly, because a week of transactions is short enough to remember.

## How to do it in Simple Balance

Simple Balance keeps your accounts, your transactions and your categories in
one place and adds them up for you. There's no automatic pull from your bank
today: you download the file your bank gives you and bring it in, or type the
transaction yourself.

**Set up your accounts.** Open **Accounts** and press **New account** for your
checking account and each credit card. Enter what each holds today as the
opening balance. For a credit card, enter what you owe as a plain number and
leave **Starting balance type** on **Amount owed**.

**Bring in a statement.** Download a CSV file from your bank's website. Open
**Import CSV**, choose the file and the account it belongs to, and check which
column is the date, the payee and the amount. Press **Dry run** to see how each
row will be read without saving anything, then **Stage all rows**. The rows
land in **Staged**, where nothing counts toward a balance yet, so a mistake
here costs nothing. [Importing a statement](/docs/importing-a-statement/) has
the details.

**Categorize as you review.** On **Staged**, click a row's category to set it.
Typing a name that doesn't exist yet creates it. Rows that look like something
you already have are flagged as possible duplicates, so importing the same
statement twice doesn't double your spending. When the batch looks right,
press **Commit selected**.

**Record card payments as transfers.** When you pay the card from checking,
choose **Transfer** rather than a withdrawal. A transfer is money moving
between two of your own accounts, so it never shows up as spending.

**Record refunds as deposits in the spending category.** Choose **Deposit** and
give it the category the purchase had. That category's spending goes down by
the refund, which is the point.

**Read it back.** **Overview** shows spending by category for whatever dates
you pick.

<Shot
  name="dashboard"
  alt="The Simple Balance overview for one month: a dollar total with balance, deposits, withdrawals and net cash flow across the top, then a checking account, a savings account and a credit card with their balances, beside spending by category as bars from rent down to subscriptions."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

**Reports** goes further: **Categories** breaks spending down by
category, and **Income and expenses** sets what came in against what went out.
If one big category such as rent flattens the chart, choose **Exclude from
this view** from its row's menu to read the rest at their own scale. Nothing
stored changes.

**Fix a month at once.** If you notice a payee filed under the wrong category
for months, check the rows on **Transactions** and recategorize them all in one
go.

<Callout kind="tip" title="Cash is the part nobody imports">
Cash never shows up in a bank file, so it's the spending most likely to go
missing. Save a **template** for the cash purchases you make often, like
coffee or a parking meter, and adding one takes a click.
[What is envelope budgeting?](/learn/envelope-budgeting/) shows how to keep a
cash account alongside the rest.
</Callout>

Once you have a month or two of real numbers, you're ready for
[your first budget](/learn/make-a-budget/).
