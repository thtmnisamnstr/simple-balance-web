---
title: Your account and plan
description: Sign in and reset your password, upgrade to Premium or cancel, take your data with you, and delete your account on app.smpl.money.
section: Your account
order: 4
updated: 2026-10-25
---

You manage your Simple Balance account and plan on our cloud app at
[app.smpl.money](https://app.smpl.money/), mostly under **Settings**, which has
two tabs: **Preferences** and **Plan and billing**. That's where you change
your password, upgrade to Premium or cancel it, and delete your account.
Resetting a forgotten password starts from the sign-in form, and exporting
your transactions from **Transactions**. The theme, timezone and default
currency on **Preferences** have their own page,
[Theme, timezone and currency](/docs/preferences/).

## Signing in

**Forgot your password?** is under the sign-in form. Give it your email
address and you get a link to choose a new one. The link works once and lasts
an hour.

To change a password you know, open **Settings** and use the **Password**
card. A Google-only account sees **Set a password** there instead, and can
add one within 15 minutes of signing in. A password is 12 to 128 characters.

Changing or resetting your password signs you out everywhere else and
disconnects every AI assistant you've connected. That's on purpose: it's what
you'd want if somebody else had the old one.

To sign in with Google as well as a password, sign in with the password and
press **Connect Google** under **Sign-in methods**. The Google account has to
use the same email address. Until you do, pressing
**Continue with Google** won't open an account that was made with a password.

## The free plan and Premium

| Plan        | Price                     | What you get                                                             |
| ----------- | ------------------------- | ------------------------------------------------------------------------ |
| **Free**    | $0                        | Every feature, with up to 3 accounts in use at once and ads on the page. |
| **Premium** | $3 a month, or $30 a year | Every feature, as many accounts as you like, and no ads.                 |

The two plans have the same features. Premium lifts the account limit and
removes the ads, and that's all it changes. An archived account doesn't count
toward the free plan's 3, so archiving one you no longer use frees a place.

## Upgrading

1. Open **Settings** and choose **Plan and billing**.
2. Under **Upgrade to Premium**, press **Annual** or **Monthly**. Each button
   shows its price.
3. Enter your payment details in the form that appears and press
   **Pay and upgrade**.

Payments are handled by Stripe, and receipts come from Stripe by email.
Premium renews on its own until you cancel.

If you leave before the first payment goes through, **Finish your payment**
brings the form back. An unfinished first payment lapses after about a day,
and nothing is charged.

## Switching between monthly and annual

Once you're on Premium, the same tab shows **Change your plan**.

- **Monthly to annual** happens now. Press **Annual**, and
  **Switch to the annual plan now?** explains that what's left of the month is
  credited against the annual price and the difference is charged now. Press
  **Switch and pay the difference**.
- **Annual to monthly** waits for your next renewal, and nothing changes
  before then. Until it happens, **Stay on the annual plan** cancels the
  switch.

**Change payment method** is on the same tab.

## If a renewal fails

The tab marks the plan **Payment failed** and says when it failed. Premium
keeps going for 15 days from then, and the tab names the day it stops. Unless
your bank has to confirm the payment, Stripe tries it again on its own, and the
tab says when.

To fix it sooner, press **Pay now**, or use **Change payment method**. If your
bank wants you to confirm the payment, Stripe won't try again until you press
**Pay now** and confirm it.

If the 15 days run out first, you're on the free plan until what's owed is
paid. Once Stripe stops retrying, the plan shows **Unpaid** and the button
reads **Pay what is owed**.

## Canceling

Press **Cancel at period end** on **Plan and billing**. Premium keeps going
until the end of the time you've paid for, and **Keep my plan** undoes it
until then. If you have more than 3 accounts in use, the tab says beforehand
how many would be frozen.

**Nothing is deleted when Premium ends.** You go back to the free plan with
every account you had. The ones over the limit are frozen: you can still see
everything in them and they still count in your totals, but you can't add to
them or change them. You can still archive a frozen account, or delete one
that has nothing in it. Subscribing again unfreezes them all.

### Choose which accounts stay usable

If more than 3 accounts are in use when Premium ends, you choose which 3 to
keep using. Until you do, the 3 oldest accounts in use stay usable: the first
time, that's the 3 you added to Simple Balance first. A choice you made still
stands when a later spell on Premium ends, unless you added or restored
accounts during it; then you choose again.

1. Open **Accounts**. A panel headed **Choose which accounts stay usable**
   lists every account that isn't archived.
2. Select the 3 you want to keep using.
3. Press **Save which accounts are usable**.

After that the panel reads **Accounts you are using**, and those 3 stay in use
until you archive or delete one. When that frees a place, select a frozen
account there and press **Bring these back**.
[Accounts](/docs/accounts/) covers archiving and deleting.

Refunds, and the exact rules for which accounts stay usable, are in
[the terms](/terms/).

## Taking your data with you

**Export CSV** is on the **Transactions** page and on each account's own
page. It saves every transaction that matches the page's dates and filters as
a spreadsheet file, up to 100,000 rows at a time.

The page starts on **This month**, so set the dates to **All time** first if
you want everything. An export holds transactions. Budgets, templates and
recurring transactions aren't in it, and neither is each account's opening
balance.

[Moving between the cloud app and your own copy](/docs/moving-between-cloud-and-self-hosted/)
uses the same export to bring your transactions into a copy you run yourself.

## Deleting your account

At the bottom of **Settings**, **Delete this account** removes everything in
it: your accounts, transactions, categories, payees, budgets, templates,
staged rows, recurring transactions, import history and every connected AI
assistant.

1. Press **Delete this account**. The screen counts what will go, such as how
   many transactions across how many accounts.
2. Type your email address under **Type your email address to confirm**.
3. Press **Delete my account and all my data**, and then
   **Delete your account**.

It happens at once, and it can't be undone. A Premium subscription is
canceled at the same moment. Deleting doesn't refund the time left on it, and
[the terms](/terms/) cover when a refund is due. Export anything you want to
keep first. The nightly backups taken before then still hold your data until
newer ones replace them, within about two weeks, and the
[privacy policy](/privacy/) has the details.
