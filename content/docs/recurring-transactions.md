---
title: Recurring transactions
description: Set up rent, pay or a subscription once. On each due date a row waits on Staged for you to check and commit, with an email if you want one.
section: Using Simple Balance
order: 8
updated: 2026-10-25
---

A recurring transaction is a rule for money that moves on a schedule, like
rent, a paycheck or a subscription. On each due date it puts a row on
**Staged** for you to check and commit. It never adds anything to your books
on its own.

## What it does, and what it doesn't

The row it puts on **Staged** is an ordinary staged row. It doesn't count
toward any balance, budget or report until you commit it, and you can change
it or delete it first, like a row from an imported statement.

That's on purpose. A bill that changes every month can wait for you to type in
the real amount, instead of being recorded wrong. And if the schedule ever
stops running, the **Recurring** page says so, instead of months of rent
quietly going missing from your books.

<Shot
  name="recurrences"
  alt="The recurring page before anything is set up: a New recurring transaction button, and a note that each due date puts a row on Staged transactions for you to check."
  width="1600"
  height="1000"
/>

_The money in this picture is made up. It's the real product, filled with
example spending._

For something you enter by hand with no fixed date, a
[template](/docs/templates/) fits better.

## Set one up from a real transaction

Starting from a payment you've already recorded is the quickest way, and it
gets the day right.

1. Find the transaction on **Transactions**, on an account, category, payee or
   template page, or on **Staged**.
2. Open its **⋯** menu and choose **Save as recurring transaction**.
3. Give it a **Name**.
4. Check the schedule. The transaction's date becomes **Starting**, so a rent
   payment dated the 1st repeats on the 1st.
5. Check the **Next five** dates, then press
   **Create recurring transaction**.

It keeps the transaction's type, payee, account or accounts, amount, category
or split, description and notes. It leaves out the date, the bank's own
reference on an imported row, and the amount received on a transfer between
two currencies, since an exchange rate changes from one time to the next.

## Set one up from scratch

1. Open **Recurring** and press **New recurring transaction**.
2. Fill in the fields below.
3. Choose a schedule.
4. Press **Create recurring transaction**.

| Field                                               | What it does                                                                                                                                                                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**                                            | Required, up to 120 characters, and different from your other recurring transactions' names, ignoring capitals and spaces. A name you've already used gets "A recurrence with this name already exists".                                                             |
| Type                                                | **Withdrawal**, **Deposit** or **Transfer**. It starts on **Withdrawal**, and unlike a template it can't be left out.                                                                                                                                                |
| **Payee**                                           | Required.                                                                                                                                                                                                                                                            |
| **Account**, or **From account** and **To account** | Required. A transfer needs both.                                                                                                                                                                                                                                     |
| **Amount**                                          | Optional. Leave it blank when it's different every time, and each row waits on **Staged** for a number. On a transfer between two currencies it's called **Amount sent**.                                                                                            |
| **Amount received**                                 | Only on a transfer between accounts in different currencies, and optional. See [Between two currencies](#between-two-currencies).                                                                                                                                    |
| **Category**                                        | Optional. **Split across categories** divides it, and a split has to add up to the amount, with a category and an amount on every part. A name you don't have yet asks what kind of category it is, such as **Money you spent** or **Paying back money you earned**. |
| **Schedule**                                        | How often it comes around. See [Choose a schedule](#choose-a-schedule).                                                                                                                                                                                              |
| **Description**, **Notes**                          | Optional.                                                                                                                                                                                                                                                            |
| **Notifications**                                   | **Email me when this proposes a transaction**. See [Email reminders](#email-reminders).                                                                                                                                                                              |

**Create recurring transaction** stays off until the form is complete, and
says the first thing that's missing, such as "Enter a payee." or "The split
has to add up, and every leg needs a category."

## Choose a schedule

| Option                                      | What it does                                                                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Repeats**                                 | **Daily**, **Weekly**, **Monthly** or **Yearly**.                                                                                                                                                                   |
| **Every N months**, or days, weeks or years | How far apart, from 1 to 366. 1 means every one. **Weekly** every 2 is every other week, and **Monthly** every 3 is once a quarter.                                                                                 |
| **Starting**                                | The date the schedule starts from, and the one every later date is counted from. A weekly schedule repeats on this date's day of the week, and a yearly one on its month and day.                                   |
| Day of the month                            | Monthly and yearly only. **On day N of the month** uses the day of **Starting**. **On a relative day** asks for **Which one** (**First**, **Second**, **Third**, **Fourth** or **Last**) and a **Day** of the week. |
| **When the month is too short**             | With **On day N of the month**, for a day some months don't have, such as the 31st. **Use the last day of that month** or **Skip that month**.                                                                      |
| **When it lands on a weekend**              | **Propose it on the weekend**, **Skip it**, **Move it to the Friday before** or **Move it to the Monday after**.                                                                                                    |

Under the schedule, **Next five** lists the next five dates. A date a weekend
rule moved says "moved from" the date it would have been, and a date that's
skipped says "skipped". Check it before you save.

Some details that matter:

- **Dates are counted from Starting, never from the last date.** A schedule
  on the 31st set to **Use the last day of that month** lands on February 28
  (or 29) and is back on March 31, instead of drifting to the 28th for good.
- **There's no fifth Friday**, or fifth anything, because some months don't
  have one. Use **Last**.
- **A business day is Monday through Friday.** Holidays aren't counted, so a
  row can land on one.
- **Only the row's date moves.** A weekend rule changes the date on the row it
  proposes. The next date is still counted from **Starting**, so the schedule
  never drifts.
- **A daily schedule every 1 or 2 days** can't use the Friday or Monday
  options, because moving a date would put two rows on one day. Make it every
  3 days or more to use them.

### Examples

| What you want                                      | Repeats     | Every | Starting                   | Also set                                                                |
| -------------------------------------------------- | ----------- | ----- | -------------------------- | ----------------------------------------------------------------------- |
| Rent on the 1st                                    | **Monthly** | 1     | A 1st                      | **On day 1 of the month**                                               |
| Pay every other Friday                             | **Weekly**  | 2     | A payday Friday            | Nothing else                                                            |
| Pay on the 15th, or the Friday before on a weekend | **Monthly** | 1     | A 15th                     | **Move it to the Friday before**                                        |
| Pay on the last business day of the month          | **Monthly** | 1     | A 31st, such as January 31 | **Use the last day of that month** and **Move it to the Friday before** |
| A bill on the second Tuesday                       | **Monthly** | 1     | A day in the first month   | **On a relative day**, **Second**, **Tuesday**                          |
| A yearly renewal                                   | **Yearly**  | 1     | The renewal date           | **On day N of the month**                                               |

For the last business day, check **Next five**: each date should be the last
weekday of its month, with "moved from" beside the ones that fell on a weekend.

## Bills that change every month

Leave **Amount** blank. Each row then arrives on **Staged** marked
**Needs attention**, with the note "This recurring transaction does not set an
amount. Fill one in before committing." Type in the amount from your bill and
commit it.

A recurring transaction with no amount can't be counted in the forecast on
**Budgets**, which names it. See [Planning ahead](/docs/planning-ahead/).

## Between two currencies

For a transfer between accounts that hold different currencies, the form asks
for **Amount sent** and **Amount received**. Leave **Amount received** blank
and each row waits on **Staged** for it, which is what you want while the
exchange rate moves. Fill it in only when the rate is agreed in advance, since
every row will then use that same figure.
[More than one currency](/docs/multiple-currencies/) has the rest.

## What happens on the due date

- On the day it's due, in your own timezone from your
  [preferences](/docs/preferences/), a row appears on **Staged** dated that
  day. Under its payee it says which recurring transaction proposed it and for
  which date.
- A weekend rule changes the date on the row, not the day it arrives. A
  Saturday payment set to **Move it to the Monday after** arrives on Saturday,
  dated Monday.
- Nothing dated before the day you set it up is ever proposed, even if
  **Starting** is earlier. So setting up rent on the 10th with **Starting** on
  the 1st proposes next month's rent, not this month's.
- Like any staged row, it's checked against your books, and a row that looks
  like a payment you already have is flagged as a possible duplicate.
- A row naming an account or category you've archived or deleted since arrives
  marked **Needs attention**, with a note saying which.
- It shows in [Activity history](/docs/activity-history/) as **Scheduled**.

To find the rows, click the **Proposed** count on **Recurring**. It opens
**Staged** showing only that recurring transaction's rows, from any date.
**Showing one recurring transaction · show everything** goes back to the whole
queue. Commit, change or delete them there, the same as any staged row:
[Staged transactions](/docs/staged-transactions/) covers how.

## Email reminders

A recurring transaction can email you each time it puts rows on **Staged**,
so a queue you only check now and then doesn't fill up without you knowing.

1. Open **Recurring**, then the recurring transaction's **⋯** menu, and choose
   **Edit**. Or set this up while you make a new one.
2. Under **Notifications**, check **Email me when this proposes a transaction**.
3. Press **Save recurring transaction**.

What to expect:

- It's sent when rows are added to **Staged**, not when you commit them.
- It's one email each time, however many rows it adds.
- It goes to your account's email address.
- The subject reads "Staged: 1 row from Rent", with your recurring
  transaction's name. The email lists the dates, says nothing has been recorded
  yet, links to **Staged**, and says how to turn it off.
- If an email can't be delivered when it's due, it isn't sent again later. The
  rows are on **Staged** either way.

To stop the emails, edit the recurring transaction, uncheck the box, and save.
The **Notifies** column on **Recurring** shows **Email** for each one that
sends.

To be reminded to enter something yourself rather than told a row is waiting,
use a [template's reminder](/docs/templates/#email-reminders).

<Callout kind="note" title="On a copy you run yourself">
These emails need a mail server. Without one, the form says so, the setting is
saved, and the rows are still proposed, but nothing is sent until one is set
up. [Mail](/docs/configuration/#mail) covers the settings.
</Callout>

## The Recurring list

**Search recurring transactions** looks through names and payees, and the menu
beside it shows only deposits, withdrawals or transfers. Everything is on one
page, soonest first.

| Column       | What it shows                                                                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**     | The name, with the type and payee under it.                                                                                                                                 |
| **Schedule** | The schedule as a sentence, such as "Every month, on day 1", "Every 2 weeks, on Friday" or "Every month, on the last Friday".                                               |
| **Amount**   | The amount, or "each time" when it's left blank.                                                                                                                            |
| **Next**     | The next date. **Posts** and a date means a weekend rule will move it, **Skipped** means that one won't be proposed, and **Past due** means it should have been and wasn't. |
| **Proposed** | How many of its rows are waiting on **Staged**, as a link to them. Under it, how many were committed and how many were discarded.                                           |
| **Notifies** | **Email** when it emails you, or "No".                                                                                                                                      |

Click a column heading to sort by it, and click again to reverse.

## Change or stop one

Open its **⋯** menu on **Recurring**:

- **Edit** opens **Edit recurring transaction**. Changing the schedule changes
  what's proposed next, and rows already on **Staged** are left alone. Press
  **Save recurring transaction**.
- **Delete** asks **Delete this recurring transaction?**. Press
  **Delete recurring transaction** and it stops proposing. Rows it already put
  on **Staged**, and anything committed from them, stay exactly as they are,
  and still say which recurring transaction they came from.

There's no pause switch. To stop one, delete it.

## When it says past due

**Recurring** shows a banner like "1 recurring transaction is past due with
nothing proposed. Whatever runs the schedule has not run recently." It means a
due date went by and no row arrived.

On app.smpl.money that's ours to fix, and it shouldn't happen. When the
schedule runs again, it proposes the rows it missed, each dated its own day.
On a copy you run yourself, check that the schedule is turned on:
`RECURRENCE_SCHEDULER` in [Operational settings](/docs/configuration/#operational-settings).

## Recurring transactions and the forecast

The **What happens next** forecast on **Budgets** projects your balances from
your recurring transactions. Depending on the setting you choose there, it
adds what you usually spend or what your budgets intend.
[Planning ahead](/docs/planning-ahead/) explains it.

## Limits

- 200 recurring transactions. Making one more is refused with "You can keep
  200 recurrences. Delete one you no longer use to make room."
- A name is up to 120 characters, and no two can match.
- A schedule repeats every 1 to 366 days, weeks, months or years.
- A split names up to 50 categories.

[Limits](/docs/limits/) lists every limit in one place. An AI assistant you've
connected with **Read, stage, and commit** can set these up too: see
[Connecting an AI assistant](/docs/agents-and-mcp/). For finding the subscriptions worth
setting up, see [Find your subscriptions](/learn/find-your-subscriptions/).
