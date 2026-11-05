---
title: Limits
description: Every limit you can reach in Simple Balance, from 3 accounts on the free plan to 10,000 rows in one import, and what to do when you reach one.
section: Your account
order: 5
updated: 2026-11-04
---

Simple Balance doesn't limit how many transactions you keep or how many
currencies you use. The free plan limits how many accounts you can use at once,
and a few actions stop at a set size. This page lists each limit, what you'll
see when you reach it, and what to do about it.

The quoted messages are what the app shows, word for word.

## Accounts and your plan

| Limit                                                    | Size     | When you reach it                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts in use on the free plan                         | 3        | **New account** is grayed out, with "A free plan keeps 3 accounts active, and this ledger has 3. Archive or delete one to free a place, or upgrade under Settings." Archived accounts don't count, but restoring one needs a free place too. Premium has no account limit.                                                                                                                        |
| A failed Premium renewal                                 | 15 days  | Premium keeps going for 15 days after the payment fails, and **Plan and billing** names the day it stops. After that you're on the free plan until what's owed is paid, and accounts past the 3 in use are frozen: readable and counted, but closed to changes.                                                                                                                                   |
| New accounts from a Simple Balance file on the free plan | 3 in use | Under **Accounts to arrive archived**, choose which of the file's new accounts arrive archived, since an archived one uses no place. None is chosen for you, and the list says how many to choose: "Your plan keeps 3 accounts in use, and 1 is in use here. This file brings 4 more, so choose at least 2 to arrive archived, or upgrade under Settings." The file can't come in until you have. |

[Your account and plan](/docs/your-account-and-plan/) covers upgrading,
renewals and choosing which accounts stay usable.

## Importing and exporting

| Limit                     | Size           | When you reach it                                                                                                                                                                                                                                 |
| ------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Size of one CSV file      | 10 MB          | The file is refused with "CSV exceeds the 10,485,760-byte limit. A larger export can be filtered by date and imported one range at a time." Download a shorter date range from your bank and import it in parts.                                  |
| Rows in one CSV file      | 10,000         | "CSV exceeds the 10000-row limit. A larger export can be filtered by date and imported one range at a time." Split it by date, as it says.                                                                                                        |
| Rows in one export        | 100,000        | **Export CSV** is refused with "Export exceeds 100,000 rows. Narrow it with a start and end date and export one range at a time." Set the dates to a shorter range, export, and repeat for the next range.                                        |
| Bank reference on one row | 200 characters | The row arrives on **Staged** with "An external reference must be 200 characters or fewer" and can't be committed. Delete the row and enter that transaction by hand, or set **Bank reference** to **Not mapped** when you import the file again. |

Rows are counted after the header row, and blank lines don't count.
[Importing a statement](/docs/importing-a-statement/) covers the importer.

## The Simple Balance file

A Simple Balance file is your whole ledger, or some of its accounts, in one
file, made under **Export a Simple Balance file** on **Import/Export**.

| Limit                                                         | Size    | When you reach it                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rows in one export                                            | 100,000 | Transactions, staged rows, budget amounts and activity history events count together. **Export file** is refused with a sentence like "This file would hold 120,000 entries, staged rows and budget amounts, and one export holds at most 100,000." and then the way out that fits what you ticked, such as "Narrow the entries with a start and end date, and export one range at a time, or export staged rows and budgets separately." |
| Text in one export                                            | 16 MB   | Payees, descriptions, notes, bank references, the lines of a split, staged rows and the activity history are counted in bytes, beside the rows. Past 16,777,216 bytes the export is refused with a sentence like "The entries and staged rows in this file would come to 17,000,000 bytes, and one export carries at most 16,777,216." and the same way out.                                                                              |
| Accounts in a **Some accounts** file                          | 100     | Pressing **Export file** with more ticked says "Choose at most 100 accounts, or choose Everything to export every account".                                                                                                                                                                                                                                                                                                               |
| Rows in one part of an import                                 | 10,000  | Nothing to do. The page cuts a larger file into parts and brings them in one after another, each all or nothing. If one stops, the page offers to try that part again, and choosing the file again picks up where it left off.                                                                                                                                                                                                            |
| Accounts, categories, templates and other records in one file | 10,000  | "This file holds 12,000 accounts, categories, groups, templates, recurring transactions and budgets, and one part of an import holds at most 10,000. Every part carries all of them, so it cannot be sent in parts." Export it again with some kinds left out, such as budgets or categories.                                                                                                                                             |
| Records you decide about in one file                          | 5,000   | More than that is refused. Export it again with some kinds left out, such as budgets or categories.                                                                                                                                                                                                                                                                                                                                       |
| New accounts chosen to arrive archived                        | 1,000   | More than that is refused. Export it again with **Some accounts**, or upgrade under Settings so none has to arrive archived.                                                                                                                                                                                                                                                                                                              |

Both copies need Simple Balance 0.2.2 or later.
[Moving between the cloud app and your own copy](/docs/moving-between-cloud-and-self-hosted/)
covers moving one.

## Changing many at once

| Limit                                                     | Size                       | When you reach it                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Transactions or staged rows in one commit, edit or delete | 10,000                     | On **Transactions**: "That covers more than 10,000 transactions, which is the most one request may change at a time. Narrow it and repeat." On **Staged**, a selection stops at 10,000 and the screen says "Bulk actions are limited to 10,000 rows at a time." Narrow the dates or filters, act on that part, and do the rest next. |
| Categories or payees in one merge                         | 100, plus the one you keep | Merge the first 100 into the one you keep, then merge the rest into it in a second pass.                                                                                                                                                                                                                                             |

A CSV import stages at most the same 10,000 rows one commit covers, so it
always fits in one commit. A Simple Balance file of more than 10,000 rows is
added in parts, each staged as its own batch, so on **Staged** pick one part's
batch in the menu that starts on **All batches**, and commit a batch at a time.
[Changing many transactions at once](/docs/changing-many-transactions/) has the
steps.

## Transactions, templates and recurring transactions

| Limit                       | Size     | When you reach it                                                                                                                |
| --------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Categories in one split     | 50       | **Add category** stops working and the form says "A split can name up to 50 categories." Enter the rest as a second transaction. |
| Templates                   | 200      | Saving another is refused with "You can keep 200 templates. Delete one you no longer use to make room."                          |
| Recurring transactions      | 200      | Saving another is refused with "You can keep 200 recurrences. Delete one you no longer use to make room."                        |
| How often something repeats | 1 to 366 | The **Every N** box on a recurring transaction or a template reminder takes 1 to 366 days, weeks, months or years.               |

## Budgets, the forecast and reports

| Limit                           | Size                                         | When you reach it                                                                                                                                                                                                                                                                                                         |
| ------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Periods a budget averages       | 1 to 24                                      | The box for how many months (or weeks, quarters or years) to average won't take a number outside that.                                                                                                                                                                                                                    |
| **Funded first**                | Up to 9,999                                  | Lower numbers are funded first. Leave it blank for unranked, which is funded last.                                                                                                                                                                                                                                        |
| How far back a carry-over looks | 120 periods before the first one on the page | Ten years of months, or about two and a third years of weeks. A note under the budgets says where the carry was worked out from, and adds "That is as far back as this page looks, so the carry starts from nothing there rather than from the beginning of the budget." when it reached the limit.                       |
| How far ahead the forecast goes | 24 periods                                   | **What happens next** offers 3, 6, 12 or 24 periods ahead. When it counts what you usually spend, it averages the last 3, 6 or 12.                                                                                                                                                                                        |
| Columns in one report           | 600                                          | "That range needs more than 600 week columns, which is the most a report will draw. Ask for a coarser bucket or a shorter range." 600 weeks is about eleven and a half years. Under **Options**, choose **Monthly** from the grouping menu instead, or pick shorter dates. **Budgets** stops at 600 periods the same way. |
| Rows in an account's register   | 10,000                                       | "That range holds 12500 postings, and 10000 is the most a register will list. Ask for a shorter range." The first number is however many the range holds. Pick shorter dates on the account's page.                                                                                                                       |

[Budgets](/docs/budgets/), [Planning ahead](/docs/planning-ahead/) and
[Reports](/docs/reports/) cover each of these screens.

## Names and text

A box that's too long is refused with a message like "A payee must be 160
characters or fewer".

| What you type                                                 | Most characters |
| ------------------------------------------------------------- | --------------- |
| Account name                                                  | 120             |
| Institution on an account                                     | 160             |
| Notes on an account                                           | 2,000           |
| Category name                                                 | 120             |
| Group name                                                    | 80              |
| Payee                                                         | 160             |
| Description                                                   | 240             |
| Notes on a transaction, a template or a recurring transaction | 4,000           |
| Note on one category of a split                               | 240             |
| Template name                                                 | 120             |
| Recurring transaction name                                    | 120             |
| A search on **Transactions** or **Staged**                    | 200             |

## Passwords and sign-in links

| Limit                                            | Size                             | When you reach it                                                                                                                                         |
| ------------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Password length                                  | 12 to 128 characters             | The form won't accept a password outside that.                                                                                                            |
| Sign-in attempts                                 | 3 in 10 seconds from one address | The sign-in is turned away for trying too often. Wait a few seconds and try again.                                                                        |
| The link in the email confirming your address    | 1 hour                           | Sign in anyway and a fresh link is sent.                                                                                                                  |
| The link in a password reset email               | 1 hour, and it works once        | Press **Forgot your password?** again for a new one.                                                                                                      |
| Adding a password to an account made with Google | 15 minutes after signing in      | "Sign in again before adding a password, so that a session on its own cannot add one." Sign out, sign in with Google, and set the password straight away. |

## One request from an AI assistant

An [AI assistant you've connected](/docs/agents-and-mcp/) reads each answer
whole, in one reply, so one request from it carries less than the web app
does. Past each limit the request is turned down, never cut short. The web
app's own register and downloads keep the limits above.

| Limit                           | Size   | When an assistant reaches it                                                                                                                                                                             |
| ------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Postings in one register        | 200    | "That range holds 340 postings, and 200 is the most a register will list. Ask for a shorter range." The first number is however many the range holds.                                                    |
| Transactions in one CSV export  | 100    | "Export exceeds 100 rows. Narrow it with a start and end date and export one range at a time."                                                                                                           |
| Characters in one CSV export    | 60,000 | "That export is 75,000 characters across 90 transactions, and 60,000 is the most one call carries. Narrow it with a start and end date and export one range at a time." Long notes reach this one first. |
| Rows in one Simple Balance file | 10,000 | The sentence the web app's export gives, with 10,000 as the most. Staged rows and budget amounts have no date to narrow them by, so past this they leave only through **Export file** in the web app.    |
| Text in one Simple Balance file | 4 MB   | The sentence the web app's export gives, with 4,194,304 bytes as the most.                                                                                                                               |
| Size of one Simple Balance file | 16 MB  | "This file would come to 17,000,000 bytes, and one import part carries at most 16,777,216." and then the way out, usually a shorter date range.                                                          |

## On a copy you run yourself

A copy you host yourself has no plan, so it has no account limit unless you
set it up to sell one, and it shows no ads unless you set those up too. Its
import limits can be changed:
[`CSV_MAX_BYTES`](/docs/configuration/#operational-settings) raises or lowers
the file size, up to 100 MB, and `CSV_MAX_ROWS` can lower the row limit but
not raise it past 10,000. Apart from the plan and those two import limits,
every other limit on this page is the same on every copy.
