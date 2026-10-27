---
title: More than one currency
description: Keep accounts in different currencies or crypto assets. Simple Balance records what moved in each one and never converts at an exchange rate.
section: Using Simple Balance
order: 10
updated: 2026-10-25
---

Simple Balance can keep accounts in any number of currencies and crypto assets
at the same time. Each account has one currency, every amount stays in the
currency it happened in, and nothing is ever converted at an exchange rate, so
you see a separate total for each currency instead of one combined figure.

That's on purpose. The only exchange rate Simple Balance knows is the one a real
transfer of yours got, so any combined total would rest on a rate it made up.

## Give an account its currency

You choose it when you add the account, in **Currency or crypto asset**.
[Accounts](/docs/accounts/#add-an-account) covers the rest of the form.

- **The choices** are every currency your browser knows, plus 14 crypto assets:
  Bitcoin (BTC), Ether (ETH), Solana (SOL), USD Coin (USDC), Tether (USDT),
  XRP, Cardano (ADA), Dogecoin (DOGE), Litecoin (LTC), Avalanche (AVAX),
  Polkadot (DOT), Chainlink (LINK), Stellar (XLM) and Bitcoin Cash (BCH).
- **It starts on your default currency.** You set that under **Settings**, in
  **Default account currency or crypto asset**.
  [Theme, timezone and currency](/docs/preferences/) covers it.
- **The type and the currency are separate choices.** A **Savings** account in
  euros is fine.
- **It's fixed once the account is in use**, meaning once it has an opening
  balance, a transaction or a staged row. Changing it after that is refused with
  "Currency cannot change after the account is in use."

So one bank account that holds two currencies is two accounts in Simple
Balance, for example "Travel money USD" and "Travel money EUR."

<Callout kind="note" title="Your default currency changes no figures">
The default is only where new accounts and new budgets start. Changing it
doesn't convert or move any amount you've already recorded. It does decide
which currency comes first on **Overview** and **Reports**.
</Callout>

## Crypto assets

A crypto account counts how much of the asset you hold, not what it's worth.
If a wallet holds 0.25 BTC, Simple Balance shows 0.25 BTC. Nothing looks up a
market price, so the wallet never shows up in your dollar total; it gets a BTC
total of its own.

Amounts can have up to 18 digits after the decimal point. Dollars and other
currencies are shown with their usual number of decimal places, like two for
dollars, but a crypto amount shows every digit you entered.

## Spend or earn in another currency

A deposit or a withdrawal is always in the currency of its account. The form
shows which one after the label, like **Amount (EUR)**, and each account in
its pickers shows its currency after its name.

If you pay in euros with a dollar card, the card's statement shows dollars.
Record the dollar amount on the card, because that's what left the account.

## Move money between currencies

A transfer between two accounts with different currencies records both sides:
what left one account and what arrived in the other. It works the same way for
changing dollars to euros, buying crypto with dollars, or selling it again.

1. Press **Add transaction** and choose **Transfer**.
2. Fill in the date and the payee as usual, then pick the **From account** and
   the **To account**.
3. When their currencies differ, the form asks for two amounts.
   **Amount sent** is in the From account's currency, and **Amount received**
   is in the To account's currency. Copy both from your bank's or exchange's
   confirmation.
4. Press **Commit transaction**.

You never type a rate. The rate those two amounts imply is saved with the
transfer, and exports include it. If a fee was taken out along the way, the
amount received is simply smaller.

On **Transactions**, the row shows the amount sent, then an arrow and the amount
received, like "$100.00 → €92.00." On each account's own page, it shows as
money out of one account and into the other, each in its own currency.

A transfer is never spending or income, so no category counts it. In the
**Cash flow** report, money that moved this way in or out of a checking,
savings or cash account is listed under **Currency exchange**.

## What you see on each screen

Nothing is ever added across currencies. Every screen that totals money shows
one set of figures per currency.

- **Overview** has a section for each currency, each with its own total,
  balance, deposits, withdrawals, net cash flow, accounts and spending by
  category. Your default currency comes first and the rest follow in
  alphabetical order. [The overview](/docs/the-overview/) covers the rest.
- **Reports** shows each report once per currency, in the same order.
  [Reports](/docs/reports/) has the details.
- **Budgets**: every budget has a **Currency**, and counts only spending in
  that currency. The form offers your default currency and every currency one
  of your accounts uses. A category can have one budget in dollars and another
  in euros, and each period's heading names the currency it's for.
  [Budgets](/docs/budgets/) covers setting one.
- **What happens next**, the forecast on **Budgets**, projects each currency
  in its own table. [Planning ahead](/docs/planning-ahead/) covers it.

## Templates and recurring transactions

A template for a transfer has an **Amount received** field. Leave it blank to
fill it in each time you use the template, or when both accounts share a
currency. [Templates](/docs/templates/) covers the rest.

A recurring transfer between currencies also has an optional
**Amount received**. Leave it blank while the rate moves, and each time the
transfer is due it waits on **Staged** for you to fill in what arrived. Fill it
in only when the rate is agreed in advance, because every occurrence then
proposes that same figure.
[Recurring transactions](/docs/recurring-transactions/) and
[Staged transactions](/docs/staged-transactions/) cover both halves.

## Change many transactions at once

When you change many transactions together, **Change account** can only move
them to an account in the same currency they're already in. The selection has
to be in one currency, and you'll see "Account cannot be edited across a
selection in more than one currency." if it isn't, or a prompt like "Choose an
account in USD." until you pick a matching one. Transfers can't be moved this
way at all.
[Changing many transactions at once](/docs/changing-many-transactions/) covers
the rest.

## Exports, imports and moving your books

- **Export CSV** writes both sides of every transfer: each account, its amount
  and its currency, plus the rate.
- **Import CSV** puts every row of a file into the one account you pick, in
  that account's currency. Bring a statement in euros into a euro account.
  [Importing a statement](/docs/importing-a-statement/) covers the rest.
- **A transfer in a file Simple Balance exported** comes back as a staged row
  that keeps both amounts and asks you to pick both accounts.

That's what lets a ledger in several currencies move between the cloud app and
a copy you run yourself without losing a side of any transfer.
[Moving between the cloud app and your own copy](/docs/moving-between-cloud-and-self-hosted/)
is the procedure.
