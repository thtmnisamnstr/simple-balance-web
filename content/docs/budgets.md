---
title: Budgets
description: Set a budget for a category or a group, compare it with what you spent each month, change one month on its own, and carry what's left over.
section: Budgets and reports
order: 1
updated: 2026-10-25
---

A budget is the most you plan to spend on a category, or on a group of
categories, each week, month, quarter or year. You set it once on **Budgets**,
it repeats every period until you end it, and the page compares it with what
you actually spent. Nothing on the page ever changes a balance.

This page covers setting, reading and changing budgets.
[Saving goals, automatic amounts and the forecast](/docs/planning-ahead/)
covers the rest of the same screen: saving toward a date, letting a budget work
out its own amount, choosing what gets funded first, and **What happens next**.
New to budgeting? [How to make a budget](/learn/make-a-budget/) starts from the
beginning.

## Choose weekly, monthly, quarterly or yearly

**Budgeting by**, near the top of the page, sets how long a budget period is:
**Weekly**, **Monthly**, **Quarterly** or **Yearly**. The page opens on
**Monthly** each time. It decides two things at once:

- the period a new budget repeats over, and
- which budgets the page shows.

A budget belongs to one period length, so a weekly budget isn't in the monthly
figures. When you have budgets of another length, the page says so ("You also
budget by week. Those budgets are not in the figures below…") and you switch
**Budgeting by** to see them.

Weeks start on Monday. Quarters start in January, April, July and October.

## Set a budget

1. Open **Budgets** and check that **Budgeting by** shows the period you want.
2. Under **Set a budget**, choose the category in **Category or group**.
3. Type the most you plan to spend each period in **Amount**.
4. Leave **Amount decided by** on **The amount, every period**.
5. Set **Starting** to any day in the first period the budget should cover.
6. Press **Set budget**.

The page confirms it with a line like "Budgeting $200.00 for Groceries every
month, from Oct 1, 2026." and the budget appears under **Standing budgets**.
There's nothing to set again next month: one budget covers every period from
the day it starts.

<Shot
  name="budgets"
  alt="The budgets screen: a form for setting one, with fields for the category, the amount and how it's decided, the currency, a start date and an optional end date, an optional savings goal and which budget gets funded first, and a checkbox for carrying what's left into next month. Below it, the list of standing budgets begins with $200 a month for dining out."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

### Every field on the form

| Field                                           | What it does                                                                                                                                                                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category or group**                           | What the budget is for. It lists your **Expense** and **Income or expense** categories that aren't archived, then any group set to **Has a budget of its own**, shown as "Name (group)". Income categories can't be budgeted. |
| **Amount**                                      | The most to spend each period, in the currency shown beside the label. Zero is allowed and means anything spent is over. A negative amount isn't.                                                                             |
| **Amount decided by**                           | **The amount, every period** is a plain budget. The other three choices work the amount out for you: see [Let a budget work out its own amount](/docs/planning-ahead/#let-a-budget-work-out-its-own-amount).                  |
| **Currency**                                    | Starts on your default currency and offers the currencies your accounts use. A budget only counts spending in its own currency.                                                                                               |
| **Starting**                                    | Required. Any day works, and the budget starts at the beginning of that day's period, so a monthly budget started on the 14th covers that whole month.                                                                        |
| **Ends after**                                  | Optional: "Leave blank to keep running." A date ends the budget after the whole period that date falls in.                                                                                                                    |
| **Saving up for**                               | Optional. A number here turns the budget into a saving goal: see [Save up for something](/docs/planning-ahead/#save-up-for-something).                                                                                        |
| **Carry what is left over into the next month** | Optional. Unspent money moves to the next period: see [Carry what's left over](#carry-whats-left-over-into-the-next-month). The last word follows **Budgeting by**.                                                           |
| **Most to carry**                               | Shows up once carrying is on: "Leave blank for no limit."                                                                                                                                                                     |
| **Funded first**                                | Optional, and for categories only. Which budgets your income covers first: see [Choose what gets funded first](/docs/planning-ahead/#choose-what-gets-funded-first).                                                          |

### When a budget is refused

- **Two budgets can't cover the same period.** For one category, in one
  currency and one period length, only one budget can cover a given period. A
  second one is refused with "Another budget for this category already covers
  the period starting…". End the first one in the period before (see
  [Change a budget from next month on](#change-a-budget-from-next-month-on)),
  or set an amount for one month instead.
- **If the other budget starts in the same period or later**, the message is
  "That category's budget already starts on…". Change that budget's amount
  instead.
- **An end before the start** is refused with "A budget cannot end before it
  starts."

## Read the budget page

The **Viewing** bar at the top picks which periods to show, and it starts on
**This month**. Choose **Year to date** or a **Custom** range to see several
months, one panel after another. A budget period is always counted whole, even when your
dates start or end partway through it, and figures stop at today in your own
timezone. [Finding your way around](/docs/finding-your-way-around/) covers the
date bar.

Each period gets its own panel for each currency, headed like
"October 2026, USD". A period that's still running says **(so far)**.

### The line under each heading

It reads like this, and the middle parts only appear when they apply:

- "$1,450.00 budgeted across the categories." The category budgets added
  up. A group's own budget isn't in it, so no money is counted twice.
- "$80.00 carried in, $1,530.00 available." Only when a budget
  [carries](#carry-whats-left-over-into-the-next-month).
- "$1,312.40 spent in total, budgeted or not."
- "$3,000.00 came in, leaving $0.00 of the budget unfunded." Only when a
  budget has a [Funded first](/docs/planning-ahead/#choose-what-gets-funded-first)
  number.
- "**$420.00 left to assign**, out of…" Only when a budget carries. See
  [What "left to assign" means](#what-left-to-assign-means).

### The table

| Column                           | What it shows                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Category**                     | The category, linked to its own page for the same dates. Spending with no category is **Uncategorized**, at the bottom. |
| **Budget**                       | This period's amount. A dash means there's no budget.                                                                   |
| **Carried in** and **Available** | Only when something carries. What earlier periods left this one, and this period's budget plus that.                    |
| **Funded**                       | Only when something has a **Funded first** number. How much of the budget this period's income covers.                  |
| **Spent**                        | What the category spent this period. Refunds lower it.                                                                  |
| **Remaining**                    | What's left to spend. It's red when you've gone over.                                                                   |
| **Progress**                     | A badge and a bar.                                                                                                      |

The badge says where the category stands:

| Badge             | Means                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| **So far**        | The period is still running, and you haven't gone over or spent it all yet. |
| **Over**          | You spent more than there was.                                              |
| **All spent**     | You spent exactly what there was.                                           |
| **Nearly there**  | A finished period that used 80% or more.                                    |
| **Within budget** | A finished period that used less than 80%.                                  |
| **No budget**     | Spending in a category that has no budget.                                  |

A budgeted category you spent nothing on is always listed, at zero, because
that's often the row worth seeing.

### The two checkboxes

Both sit beside **Budgeting by** and both start on.

- **Show categories with no budget** lists every category you spent on in the
  period, budget or not, so you can see where the rest went. Turn it off to
  list only budgeted categories. The "spent in total" figure counts only the
  rows listed, so turning it off leaves unbudgeted spending out of that total
  too.
- **Count spending through archived accounts** keeps spending from accounts
  you've since archived. A budget was never about one account, so money spent
  on a card you've closed is still money the budget covered. Reports work the
  other way and leave archived accounts out until you ask.

## Change, end or delete a budget

**Standing budgets** lists every budget you've set, whatever its period
length:

- **Category**, with badges for anything special about it: **Carries over**
  (with ", up to $X" when there's a cap), **Saving $600.00 by June 2027**,
  **Average of 3 months**, **+10% each period**, **15% of income** or
  **Funded 1**.
- **Amount**, or **Calculated** for a saving goal, an average or a share of
  income. A budget that steps up by a percentage shows the amount it started
  from.
- **Every**: the period.
- **Runs**: for example "October 2026 onward", "October 2026 to March 2027"
  or "October 2026 only".

Each row ends with a pencil button to change the budget and a trash button to
delete it.

### Change a budget

1. Press the pencil on the budget's row.
2. In **Budget for Groceries**, change what you need: **Amount**,
   **Carry what is left over into the next month**, **Most to carry**,
   **Funded first** (categories only) or **Ends after**.
3. Press **Save budget**.

The category, currency, start and the way the amount is decided can't be
changed here. To change those, delete the budget and set a new one. A saving
goal or a share of income has no amount to type, so its box offers only
**Funded first** and **Ends after**.

<Callout kind="warning" title="A new amount rewrites past months">
Changing the amount changes every period the budget covers, past ones
included. To leave what earlier months intended alone, end this budget and
start a new one instead.
</Callout>

### Change a budget from next month on

1. Press the pencil, set **Ends after** to any day in the last month the old
   amount should cover, and press **Save budget**.
2. Under **Set a budget**, set the new amount with **Starting** in the month
   after.

If both budgets carry and there's no gap between them, what's left over moves
from the old one into the new one.

### Delete a budget

1. Press the trash button on the budget's row.
2. The box asks **Delete the Groceries budget?** and says "It wrote nothing to
   the books, so deleting it changes no balance and no report." Press
   **Delete budget**.

There's no undo, but nothing is lost from your books either: a budget never
writes a transaction. Set the same budget again with the same **Starting**
date and its figures come back, because they're worked out fresh each time.

Two more ways a budget goes away: deleting a category deletes its budgets, and
deleting a group deletes the group's own budget. Merging categories moves their
budgets to the one you keep, so it's refused when that would leave two budgets
over the same periods. End or delete one of them first, then merge.

## Set a different amount for one month

December's groceries aren't November's. You can give one period its own
amount and leave the standing budget alone.

1. In that month's panel, find the category's row.
2. Press the calendar button at the end of the row. A screen reader calls it
   "Set the amount for Groceries in December 2026".
3. In the box titled "Groceries, December 2026", type the **Amount** for that
   month alone.
4. Press **Save override**.

The row then says **This month only**, and every other month still follows the
standing budget. Every one-period amount is listed under **Single periods**,
with its **Category**, **Amount** and **Period**, and the trash button there
removes it. You can also press the calendar button again and choose
**Use the standing budget**.

A few things to know:

- **It doesn't need a standing budget.** Any category listed for that month
  has the button, so you can budget one month on its own.
- **Uncategorized has no button**, and neither does a group that adds up its
  categories' budgets: change its categories instead. A group with a budget of
  its own has the button on its row in the group table.
- **One month's amount beats any rule.** A budget that works out its own
  amount uses yours for that month.
- With **Budgeting by** on **Weekly**, the badge says **This week only**, and
  so on.

## Carry what's left over into the next month

Turn on **Carry what is left over into the next month** and the budget becomes
an envelope: what a month doesn't spend is added to the next month, and
overspending is taken off it. The $50 you didn't spend on groceries in March is
$50 more to spend in April. [What is envelope budgeting?](/learn/envelope-budgeting/)
explains the idea.

Once any budget in a period carries, two columns appear:

- **Carried in**: what earlier months left this one. A negative number is
  overspending carried forward.
- **Available**: this month's budget plus what was carried in. **Remaining**,
  the badge and the bar all measure against it.

**Most to carry** caps the carry in both directions. With a $100 cap, at most
$100 of unspent money moves forward, and at most $100 of overspending does.
Leave it blank for no limit.

You can switch carrying either way at any time with the pencil. Nothing is stored
month by month: the figures are worked out from your budgets and your spending
each time you look. So turning it off leaves nothing behind, and a receipt you
enter late for March changes April and every month after it.

The carry is worked out from the budget's own start, going back at most 120
periods: ten years of months, or a little over two years of weeks. A note under
the figures says where it started: "Carried-in figures were worked out from
… onward." If a budget is older than that, the note adds that the carry starts
from nothing there.

A gap breaks the chain. If one budget ends in March and another starts in
September, nothing carries across the months between them.

## What "left to assign" means

Once a budget in a period carries, the line under the heading adds
**left to assign**: "$420.00 left to assign, out of $6,200.00 in the accounts
this budget is about."

- **The second figure** is what the accounts your budget is about held at the
  end of that period, or today for the period you're in.
- **Left to assign** is that, minus the money still sitting in envelopes: the
  **Remaining** of every budget that carries, where it's above zero. An
  overspent envelope claims nothing, because that money has already left. A
  group with a budget of its own claims only what its categories' envelopes
  haven't already claimed, so nothing is counted twice.

Getting it to zero means every dollar has a job, which is the idea behind
[zero-based budgeting](/learn/zero-based-budgeting/). It sits below your bank
balance for two reasons, and the page says both: envelopes have already
claimed part of the money, and some accounts can be left out.

Every account is counted by default, credit cards included. Spending on a card
empties an envelope even before any cash leaves your bank, so leaving cards out
would say there's more to assign than there is. To leave an account out, such
as a retirement account or a mortgage, edit it and turn off
**The budget is about the money in this account**. That changes no balance and
no report, only this figure. [Accounts](/docs/accounts/) has the form.

## Refunds lower spending

A refund gives the budget back. Enter it as a deposit under the **Expense**
category the spending was in, and it lowers that category's **Spent**: $30 back
from the store makes groceries $30 lighter.

That only works for a category whose **Applies to** is **Expense**. A deposit
under an **Income or expense** category counts as income, not as a refund.
[How deposits, withdrawals and transfers work](/docs/accounts-and-transactions/#categories-and-refunds)
explains why. A split counts each part under its own category, and a transfer
between your own accounts is never spending.

## Budget a group of categories

A group lets one budget cover several categories, such as "Eating out" across
restaurants, takeout and coffee. You make groups on **Categories**: type a
**Group name**, choose a **Group budget**, and press **Add group**. Then put
categories in it with the group picker on each category's row.
[Categories and payees](/docs/categories-and-payees/) has the steps.

There are two kinds of group, and the choice decides how it's budgeted:

| Group budget                        | How it works                                                                                                                                                                         | Badge          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| **Has a budget of its own**         | One amount for the whole group. Pick it in **Category or group** as "Eating out (group)". It can carry and can have a one-month amount, but it can't have a **Funded first** number. | **Own budget** |
| **Adds up its categories' budgets** | No amount of its own. Its budget is whatever its categories' budgets add up to, so it isn't offered in **Category or group**. Budget the categories in it instead.                   | **Adds up**    |

When you have groups, a group table sits above the categories in each period,
with **Group**, **Budget**, **Spent** and **Remaining**. **Spent** is everything
the group's categories spent, budgeted or not, so a group with no budget still
shows what it cost.

Things to know:

- **Switching a group to Adds up its categories' budgets is refused while it
  has a budget of its own**: "Eating out has a budget of its own, and a group
  budgeted as its categories added up cannot hold one. Delete that budget
  first, or leave the group as it is."
- **Deleting a group deletes the group's own budget.** Its categories stay,
  with their own budgets, and just lose the group.
- **A group reads the categories in it now.** Moving a category into a group
  changes what that group spent in past months too. Nothing about the category
  itself changes.

## Budgets on the overview

The **Overview** has a **Budget** panel for each currency, with a
**See budgets** link back here. It uses your monthly budgets. Each month in the
date range that has a budget gets a line, and the month the range ends in is
broken down into every budgeted group and category, with what was spent
against the budget, a bar and the same badges. [The overview](/docs/the-overview/)
covers the rest of that page.
