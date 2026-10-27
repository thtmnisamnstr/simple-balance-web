---
title: Getting started
description: Sign up at app.smpl.money, add your first account, bring in a statement, and see where your money goes. There's nothing to install.
section: Get started
order: 1
updated: 2026-10-25
---

Simple Balance runs in your web browser at
[app.smpl.money](https://app.smpl.money/). There's nothing to install and no
card needed to start. This page takes you from signing up to seeing where your
money went, using one bank statement.

Once you're in, [Finding your way around](/docs/finding-your-way-around/) says
what each screen in the sidebar is for and how the dates at the top of a page
work.

## Sign up

1. Go to [app.smpl.money](https://app.smpl.money/) and choose
   **Create an account**.
2. Fill in **Your name**, **Email address** and a **Password** of at least 12
   characters, then type the password again under **Confirm password**.
3. Press **Create account**.
4. Open the email titled **Confirm your email address** and follow its link
   within an hour. The account can't be signed in to until you do. If the link
   runs out, sign in anyway and a fresh one is sent.
5. Sign in with your email address and password.

Or press **Continue with Google** instead, and there's no email to confirm.
If you already made an account with a password, sign in with it first and
choose **Connect Google** under **Settings**, with a Google account that uses
the same email address. Google won't sign you in to an existing account until
you've connected it there.

Creating an account means accepting the [terms of use](/terms/), and the
[privacy policy](/privacy/) says what's stored and who can see it.

## Add your first account

You start on **Overview**, which stays empty until you have an account. An
account is anywhere money sits: a checking account, a savings account, a
credit card, a loan or cash.

1. Open **Accounts** and press **New account**.
2. Give it a name, choose its **Account type**, and set the **Opening date**
   to the day you want to start tracking from.
3. Enter what it held on that day as the **Opening balance**.
4. Press **Create account**.

For a credit card or a loan, leave **Starting balance type** on
**Amount owed** and type what you owe in **Starting amount** as a plain
number, like `500`. The
account opens below zero, because that's money you owe rather than money you
have.

If you're about to bring in a statement, set the opening date on or before the
statement's first transaction, and enter the balance from before that
transaction. [Accounts](/docs/accounts/) covers every field on the form.

<Shot
  name="accounts"
  alt="The accounts page: a search box and sort controls, then accounts grouped by type. Under Checking, a euro account at €1,621.10 and Everyday Checking at $7,663.45. Under Savings, Savings at $20,200.00. Under Credit card, a card named Travel Card."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

## Bring in your spending

Simple Balance doesn't connect to your bank. You bring transactions in from
the file your bank lets you download, or you type them in.

**From a statement.** Most banks let you download your transactions from their
website as a CSV file, which is a simple spreadsheet file.

1. Open **Import CSV**, choose the file, and pick the account it belongs to.
2. Check which column is the date, the payee and the amount, and set
   **Date format**. It starts on `YYYY-MM-DD`, and many US banks write the
   month first, `MM/DD/YYYY`, so `03/04/2026` is March 4.
3. Press **Dry run** to see how the first rows will be read and how many of
   them are ready. Nothing is saved yet.
4. Press **Stage all rows**.

<Shot
  name="import"
  alt="The import screen before a file is picked: a step headed Choose a CSV file, an empty drop target reading Drop in a file or browse, and a preview panel saying no file has been chosen yet."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

The import screen then links you to the rows on **Staged**, where nothing
counts toward a balance yet. If you open **Staged** from the menu instead, set its
dates to **All time**, because it starts on **This month**. Click a row's
category to set it. Typing a name you haven't used before adds that category
when the row is committed. Anything that looks like a transaction you already
have is flagged, and isn't committed unless you say so, so bringing in the
same statement twice won't count your spending twice. When it all looks
right, select the rows and press **Commit selected**.

<Shot
  name="staged"
  alt="Staged transactions, the review queue: four rows that don't count yet, each with a date, payee, account, category, a Ready status and an amount, including a $19.99 refund from Streamly and a $23.50 transit pass on the travel card."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

**By hand.** Press **Add transaction** on **Overview** or **Transactions**.
Choose **Withdrawal** for money you spent, **Deposit** for money that came in,
or **Transfer** for money moved between two of your own accounts, such as
paying a credit card from checking. A transfer is one entry, not two, and it
never counts as spending. At the bottom of the form, **Commit now** counts it
straight away, and **Stage for review** puts it on **Staged** beside your
imported rows until you commit it.

[Importing a statement](/docs/importing-a-statement/) covers the importer in
detail, [Transactions](/docs/transactions/) covers every field of the form,
and [How deposits, withdrawals and transfers work](/docs/accounts-and-transactions/)
explains which of the three to use.

## See where it went

**Overview** shows each account's balance and your spending by category for
the dates you choose. **Reports** goes further, from income against spending
to your net worth. [The overview](/docs/the-overview/) and
[Reports](/docs/reports/) explain every number on them.

<Shot
  name="dashboard"
  alt="The Simple Balance overview for one month: a dollar total with balance, deposits, withdrawals and net cash flow across the top, then a checking account, a savings account and a credit card with their balances, beside spending by category as bars from rent down to subscriptions."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

## Free and Premium

The free plan does everything Simple Balance can do, with up to 3 accounts in
use at once and ads on the page. An archived account doesn't count toward
the 3. Premium is $3 a month or $30 a year, for as many accounts as you like
and no ads.

To upgrade, open **Settings**, choose **Plan and billing**, and pick the
annual or monthly plan. [Your account and plan](/docs/your-account-and-plan/)
covers changing plans, canceling, and taking your data with you.

## What to read next

- [Finding your way around](/docs/finding-your-way-around/), for what each
  screen is for and how the dates work.
- [Transactions](/docs/transactions/), to find, fix, split and restore
  entries.
- [Templates](/docs/templates/), for things you enter by hand again and again.
- [Recurring transactions](/docs/recurring-transactions/), so rent, pay and
  subscriptions wait on **Staged** on the day they're due.
- [Budgets](/docs/budgets/), once you have a month or two of spending in.
- [Reports](/docs/reports/), for net worth, cash flow and spending over time.
- [Connecting an AI assistant](/docs/agents-and-mcp/), to let an AI assistant file your
  transactions for you to approve.
- The [Learn](/learn/) guides, for the money side: how to
  [track your spending](/learn/track-your-spending/),
  [make a budget](/learn/make-a-budget/) and more.

Would you rather self-host it? [Self-hosting: running your own copy](/docs/self-hosting/)
covers that.
[Moving between the cloud app and your own copy](/docs/moving-between-cloud-and-self-hosted/)
brings your transactions with you and says what to set up again by hand.
