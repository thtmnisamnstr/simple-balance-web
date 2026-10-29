---
title: Frequently asked questions
description: Short answers about the free budget app, Simple Balance. Which banks and files work, phones, sharing, currencies, AI assistants and your data.
section: Get started
order: 3
updated: 2026-10-29
faq: true
---

Simple Balance is a free budget app and spending tracker. You use it in a web
browser at [app.smpl.money](https://app.smpl.money/), or run your own copy from
its public source code. Each answer below is the short version, with a link to
the page that has the rest.

Plans, prices and ads have their own questions, answered on
[Pricing](/pricing/#faq-title).

## What is Simple Balance?

Simple Balance is a budget app and spending tracker for your own money. It
keeps every account on one page, gives each category a budget that can carry
over, proposes the payments that repeat, and lets you open any total to see
the transactions behind it. The free plan has every feature, for three
accounts in use at once, with ads.

## How is Simple Balance different from YNAB or Monarch?

Simple Balance has a free plan at [app.smpl.money](https://app.smpl.money/), which YNAB, Monarch and
Quicken Simplifi don't, and it's open source, so you can run your own copy.
Those three can connect to your bank. Simple Balance has no bank connection
today, so you download a file from your bank and import it.
[How Simple Balance compares](/compare/) puts them side by side, with a source
for every fact about the other apps.

## Which banks does Simple Balance work with?

Any bank that lets you download your transactions as a CSV file. Simple
Balance doesn't connect to your bank. You download the file from your bank's
website and bring it in on **Import CSV**, and nothing in it counts until
you've checked it on **Staged**. [Importing a statement](/docs/importing-a-statement/)
has the steps.

## Can I import an OFX, QFX or QIF file?

No. Simple Balance reads CSV files only, so if your bank offers a choice, take
the CSV. Any CSV with a header row and a date, a payee and an amount works, in
any column order, as long as its amounts are plain numbers. A figure with a
currency sign in it, such as $12.50, isn't read.

## Is there a phone app?

There's no app to install from an app store. Simple Balance runs in your
phone's web browser the same as on a computer, with the sidebar tucked behind
the menu button at the top of the screen.
[Finding your way around](/docs/finding-your-way-around/) says what each screen
is for.

## Can two people share one set of books?

No. Everyone who signs up has their own separate books, and there's no way to
share one set between two sign-ins.

## Can I track investments and crypto?

Yes, as accounts. An **Investment** account is for a brokerage or retirement
account, and a **Crypto wallet** is for a wallet or an exchange. Simple Balance
records what moves in and out of them, and a crypto account counts how much of
the asset you hold. It doesn't look up what an investment or a coin is worth
today, so a balance is what you've recorded. [Accounts](/docs/accounts/) lists
every kind.

## Does it work with more than one currency?

Yes. Each account has its own currency or crypto asset, chosen when you add it.
Simple Balance never converts between them at an exchange rate, so you see a
separate total for each currency instead of one combined figure.
[More than one currency](/docs/multiple-currencies/) explains why.

## Can an AI assistant use Simple Balance?

Yes, through MCP, the Model Context Protocol. Simple Balance has an MCP server
at `https://app.smpl.money/mcp` that an assistant signs in to with OAuth, and
you choose what each connection may do: read your records, propose entries for
you to approve on **Staged**, or make changes itself. No assistant can delete
your account, set a password or touch billing.
[Connecting an AI assistant (MCP)](/docs/agents-and-mcp/) has the details.

## How do I get my data out?

Press **Export CSV** on the **Transactions** page or on an account's own page.
It works on every plan, and saves the transactions that match the page's dates
and filters as a spreadsheet file, so set the dates to **All time** first to
get everything. Budgets, templates and recurring transactions aren't in an
export. [Your account and plan](/docs/your-account-and-plan/#taking-your-data-with-you)
has the rest.

## How do I delete my account?

At the bottom of **Settings**, **Delete this account** removes everything in
it, from your accounts and transactions to every connected AI assistant. It
happens at once and can't be undone, so export anything you want to keep
first. [Your account and plan](/docs/your-account-and-plan/#deleting-your-account)
has the steps.

## Is Simple Balance open source?

Yes. Its code is public on
[GitHub](https://github.com/thtmnisamnstr/simple-balance) under the AGPL-3.0
license, and the copy at [app.smpl.money](https://app.smpl.money/) is the same product.

## Can I run Simple Balance on my own computer or server?

Yes, for free, with no plan, no account limit and no ads. You install it, put
HTTPS in front of it, and back it up and upgrade it yourself.
[Self-hosting](/docs/self-hosting/) starts there, and you can
[move your transactions](/docs/moving-between-cloud-and-self-hosted/) between
your copy and [app.smpl.money](https://app.smpl.money/) later, in either direction.

## How do I get help?

Email [info@smpl.money](mailto:info@smpl.money). If you're new, start with
[Getting started](/docs/getting-started/), which goes from signing up to seeing
where your money went in four steps.
