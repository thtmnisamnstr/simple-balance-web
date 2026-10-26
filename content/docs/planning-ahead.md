---
title: Saving goals, automatic amounts and the forecast
description: Save toward a date, let a budget set its own amount from past spending or income, choose what gets funded first, and see where your balances are heading.
section: Budgets and reports
order: 2
updated: 2026-10-25
---

A saving goal on **Budgets** puts a little aside each period for a bill you
know is coming. An automatic amount lets a budget work out its own figure,
**Funded first** says which budgets your income covers first, and
**What happens next** shows where your balances are heading. They're the parts
of **Budgets** that look ahead, and each one starts from a budget set the usual
way, which [Budgets](/docs/budgets/) explains.

## Save up for something

A saving goal is a budget that sets aside part of a known future cost every
period, so the money is there when the bill arrives. Car insurance due in June,
a vacation in August and holiday gifts in December are the usual examples.
[What are sinking funds?](/learn/sinking-funds/) explains the idea.

1. Open **Budgets**. Under **Set a budget**, choose the category the money will
   be spent from, such as Car insurance, in **Category or group**.
2. Type the total you need in **Saving up for**.
3. Set **Needed by** to the date you need it.
4. Set **Starting**, and press **Set budget**.

As soon as **Saving up for** has a number in it, the form changes:

- **Amount** and **Amount decided by** disappear. There's no amount to type.
- **Carry what is left over into the next month** turns on and can't be turned
  off, because a fund saves by carrying.
- **Most to carry** stays. Leave it blank, or set it at least as high as the
  goal.

The note under the form explains what happens next: "Each month puts aside
what is still needed, divided by the months left before the date."

### How much each month asks for

Each period asks for what's still needed, divided by the periods left,
counting the current one and the one the money is needed in. Saving $600 by
June, starting in January, asks for $100 a month.

- **As the fund fills, the figure adjusts.** If you spend from the category
  before the date, that money comes out of the fund, and the months after ask
  for more to make it up.
- **The month it's needed in asks for whatever is still short**, rather than a
  share of it.
- **Once the fund is full, it asks for nothing.**
- **After the month it's needed in, it asks for nothing.** Set a new saving
  goal for the next time.

**Standing budgets** shows it with **Calculated** as the amount and a badge
like **Saving $600.00 by June 2027**.

### When a saving goal is refused

- A **Needed by** date before **Starting**: "A sinking fund cannot be needed
  before it starts saving."
- A **Most to carry** below the goal: "This cap is below what the fund is
  saving for, so it would throw away each period's contribution and leave the
  whole amount due at the end. Raise the cap to at least the target, or remove
  it."
- A goal of zero: "A sinking fund's target has to be more than nothing."

### Change a saving goal

The pencil on a saving goal only changes **Funded first** and **Ends after**,
and its box says "Delete it and set a plain budget if that is not what you
want." To change the goal or the date, delete the budget and set it again with
the same **Starting** date. Nothing is stored month by month, so the fund is
worked out again from that date.

## Let a budget work out its own amount

**Amount decided by** has three choices besides
**The amount, every period**. Each needs one number, in a field that shows up
when you pick it. The average's field follows **Budgeting by**, so on a weekly
budget **Months to average** reads **Weeks to average**.

| Choice                                 | Number it asks for                                 | What each period budgets                                                                          |
| -------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **What the last few periods spent**    | **Months to average**, a whole number from 1 to 24 | The average of what the category spent in that many finished months of this budget.               |
| **The last period, plus a percentage** | **Increase each period by (%)**, from -100 to 1000 | The **Amount** you type for the first month, then the month before's amount plus that percentage. |
| **A share of the income before it**    | **Share of income (%)**, from 0 to 1000            | That share of the income that came in the month before, in the budget's currency.                 |

Type a percentage as a plain number, like `3` or `12.5`. With a percent sign
it's refused: "A percentage is a plain number, such as 3 or 12.5. Leave the
percent sign out."

### What the last few periods spent

Good for a category that's hard to guess, like groceries or gas. The month
being budgeted is never part of its own average. Early on, it averages the
months that exist rather than counting months before the budget started as
zero, and until there's a finished month to average it uses the **Amount** you
typed ("Used until there are finished periods to average."). It never goes
below zero. The badge reads **Average of 3 months**.

### The last period, plus a percentage

For planned growth, or for cutting back a little at a time. The **Amount** you
type is the first month's budget ("The first period's amount. The increase
starts from the one after."), and each month after is the month before plus the
percentage, so 10% on $200 makes $220, then $242. A negative number tapers it
down, and `-100` tapers to zero. The badge reads **+10% each period**.

### A share of the income before it

For income that changes from month to month, such as "groceries get 15% of what
came in last month". It uses last month rather than this one, because a share
of a month still running would change every time you looked. Income here is
money that came in as income, so refunds and transfers don't count. If nothing
came in last month, the budget is zero that month. There's no **Amount** to type, and the badge reads
**15% of income**. [How to budget with irregular income](/learn/budget-with-irregular-income/)
puts it to use.

### Things to know about automatic amounts

- **A one-month amount beats any rule.** Set an amount for a single month (see
  [Set a different amount for one month](/docs/budgets/#set-a-different-amount-for-one-month))
  and that month uses it. A budget that steps up by a percentage steps from
  your amount the month after.
- **The rule can't be changed afterward.** On an average or a step, the pencil
  changes the starting **Amount**, carrying, **Funded first** and
  **Ends after**, but not the number of months or the percentage. On a share of
  income it changes only **Funded first** and **Ends after**. To use a
  different rule, delete the budget and set a new one.
- **Standing budgets** shows **Calculated** as the amount for an average or a
  share of income, and the typed first amount for a step.
- **A saving goal can't also use a rule.** Filling in **Saving up for** puts
  **Amount decided by** back to **The amount, every period**.

## Choose what gets funded first

When a month's income won't cover every budget, **Funded first** says which
ones come first. It changes no budget and no balance. It works out how much of
each budget the income actually covers.

1. On **Set a budget**, or with the pencil on a budget you have, type a number
   in **Funded first**. Lower goes first, so 1 comes before 2.
2. Leave it blank for budgets that don't need a place in line. Unranked budgets
   are funded last, after every ranked one.
3. Press **Set budget** or **Save budget**.

Once any budget in a month has a number, two things appear in that month's
panel:

- a **Funded** column, filled in your order from that month's income until it
  runs out, and
- "$3,000.00 came in, leaving $250.00 of the budget unfunded." in the line
  under the heading.

Under **Standing budgets**, the budget also gets a badge like **Funded 1**.

Budgets with the same number are filled in alphabetical order. Income is what
came in during that month in the budget's currency, so a month still running
counts what's arrived so far. **Funded first** is for categories only. A group
budget can't have one, because ranking a group and the categories in it would
spend the same income twice.

Give a saving goal **Funded first** 1 and your income covers it before anything
else, which is the idea behind paying yourself first.

## See where your balances are heading

**What happens next**, at the bottom of **Budgets**, projects your balances
forward a period at a time. Nothing in it has happened yet, and none of it is a
balance: it's what your accounts would do if nothing changed.

### The options

- **Months ahead**: 3, 6, 12 or 24, starting with the month you're in. It
  starts on 6. The label and the length of each row follow **Budgeting by**, so
  a weekly view reads **Weeks ahead**.
- **Counting**: what the projection is built from.
  - **Recurring plus what you usually spend** is where it starts. Your
    [recurring transactions](/docs/recurring-transactions/), plus the average
    of what each category spent and what came in over recent finished months,
    wherever no recurring transaction already covers it. It works from your
    real spending, so it says something even before you've set up a recurring
    transaction or a budget.
  - **Recurring transactions only** counts the dated recurring transactions
    and nothing else.
  - **Recurring plus what budgets intend** adds the part of each budget no
    recurring transaction already covers. It's the cautious reading: it
    assumes you'll spend every budget in full.
- **Averaged over**: 3, 6 or 12 months, starting on 3. It only appears for
  **Recurring plus what you usually spend**, and the month you're in is never
  part of the average.

### The table

There's one table for each currency, titled like "Projected balances in USD,
from Oct 6, 2026". Each row is a month.

| Column                   | What it shows                                                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Expected in**          | Money expected to come in that month.                                                                                                                                                                                             |
| **Expected out**         | Money expected to go out that month.                                                                                                                                                                                              |
| **Budgets intend**       | What your budgets plan to spend that month. It's shown whatever you're counting. Only under **Recurring plus what budgets intend** does any of it reach **Expected out**, and then only the part no recurring transaction covers. |
| **Of that, unscheduled** | Only under **Recurring plus what budgets intend**: the part of **Budgets intend** no recurring transaction covers. This is what's added to **Expected out**.                                                                      |
| **Of that, typical**     | Only under **Recurring plus what you usually spend**: what an average month spent and received, written like "$1,900.00 out, $3,100.00 in". The part no recurring transaction covers is added.                                    |
| **Scheduled**            | How many times a recurring transaction falls in that month, so a weekly one counts four or five times. It's a count, not money.                                                                                                   |
| **Projected balance**    | What all your accounts in that currency would hold at the end of the month.                                                                                                                                                       |

### What it starts from, and what it leaves out

- **It starts from what every account in that currency holds today**, cards
  and loans included, and whether or not the account is part of your budget.
  Recurring transactions count from today on.
- **The month you're in counts only what's left.** Today's balance already
  reflects what you've spent this month, so budgets and usual spending count
  only the part you haven't spent yet.
- **A transfer between two of your accounts in one currency** changes no total,
  so it isn't counted. A recurring transfer between currencies is counted on
  both sides.
- **Budgets intend** counts category budgets with an amount you typed,
  including steps, which grow the same way the budget does. It leaves out
  group budgets, which would count the same spending twice, and one-month
  amounts.
- **Anything that can't be projected is named under the table**: "Rent could
  not be projected, so the figures above are short by whatever they are worth."
  That's a recurring transaction with no amount, a recurring transfer between
  currencies that doesn't say what arrives, and any budget that works out its
  own amount: saving goals, averages and shares of income.
- **Only budgets of the Budgeting by length are read.** If you have others, a
  note says so: "You also budget by week, and this projection reads only
  monthly budgets."

When there's nothing to work from, the panel says **Nothing to project yet**,
with a line saying what the chosen **Counting** needs.

## A first month, start to finish

1. Bring in last month's spending, by
   [importing a statement](/docs/importing-a-statement/) or entering it by
   hand.
2. On **Budgets**, set plain budgets on your five biggest spending categories,
   at about what they cost now.
3. On the two you most want to control, turn on
   **Carry what is left over into the next month**.
4. Add a saving goal for the next big bill you know is coming.
5. Come back once a week and read **left to assign** and the **So far** rows.
   Change the budgets as you learn, and keep the transactions true: the page is
   only as right as the entries behind it.

[How to make a budget](/learn/make-a-budget/),
[What is envelope budgeting?](/learn/envelope-budgeting/) and
[What is zero-based budgeting?](/learn/zero-based-budgeting/) cover the ideas
behind each step.
