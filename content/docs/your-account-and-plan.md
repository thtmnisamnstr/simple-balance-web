---
title: Your account and plan
description: Sign in and reset your password, upgrade to Premium or cancel, take your data with you, and delete your account on app.smpl.money.
section: Your account
order: 4
updated: 2026-11-04
---

You manage your Simple Balance account and plan on our cloud app at
[app.smpl.money](https://app.smpl.money/), mostly under **Settings**, which has
two tabs: **Preferences** and **Plan and billing**. That's where you change
your password, upgrade to Premium or cancel it, and delete your account.
Resetting a forgotten password starts from the sign-in form, exporting your
transactions from **Transactions**, and exporting everything from
**Import/Export**. The theme, timezone and default currency on
**Preferences** have their own page,
[Theme, timezone and currency](/docs/preferences/).

## Signing in

**Forgot your password?** is under the sign-in form. Give it your email
address, press **Send reset link**, and you get a link to choose a new one.
The link works once and lasts an hour.

To change a password you know, open **Settings** and use the **Password**
card. A Google-only account sees **Set password** there instead, and can
add one within 15 minutes of signing in. A password is 12 to 128 characters.

Changing or resetting your password signs you out everywhere else and
disconnects every AI assistant you've connected. That's on purpose: it's what
you'd want if somebody else had the old one.

To sign in with Google as well as a password, sign in with the password and
press **Connect Google** under **Sign-in methods**. The Google account has to
use the same email address. Until you do, pressing
**Continue with Google** won't open an account that was made with a password.

## The free plan and Premium

| Plan        | Price                     | What you get                                                               |
| ----------- | ------------------------- | -------------------------------------------------------------------------- |
| **Free**    | $0                        | Every feature, with up to 3 accounts in use at once and an ad for Premium. |
| **Premium** | $3 a month, or $30 a year | Every feature, as many accounts as you like, and no ads.                   |

The two plans have the same features. Premium lifts the account limit and
removes the ad, and that's all it changes. An archived account doesn't count
toward the free plan's 3, so archiving one in use that you no longer need frees
a place. Archiving a [frozen](#canceling) one frees none.

### The ad on the free plan

On the free plan, a bar across the foot of the window advertises Premium. It's
Simple Balance's own ad, for its own plan, and no other company's. It says "As
many accounts as you need, and no ads", beside **Upgrade to Premium**, which
opens **Plan and billing**. On a screen wider than a phone's, it also shows the
word Premium and a small drawing.

- **It stays in view as you scroll.** At the end of a page it rests below the
  last of it. On a window that's both narrow and short, it sits below the page
  instead.
- **It can't be dismissed.** Upgrading to Premium is what takes it away.
- **It isn't shown everywhere.** It's not on **Plan and billing**, on the
  sign-in screen, or on a page you print.
- **Its drawing moves once.** It plays when a page loads, and not at all if
  your device is set to reduce motion.

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
  **Switch and pay difference**. While a payment is owed, the switch waits for
  your next renewal instead, and **Stay on monthly plan** cancels it.
- **Annual to monthly** waits for your next renewal, and nothing changes
  before then. Until it happens, **Stay on annual plan** cancels the switch.

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
a spreadsheet file, up to 100,000 rows at a time. Deleted transactions are
never in it, even with **Show deleted** on.

The page starts on **This month**, so set the dates to **All time** first if
you want everything. An export holds transactions. Budgets, templates and
recurring transactions aren't in it, and neither is each account's opening
balance.

To take the rest too, open **Import/Export** and use
**Export a Simple Balance file**. **Everything** saves your whole ledger as one
file: accounts with their opening balances, categories and groups,
transactions, templates, recurring transactions, budgets, staged rows, and your
regional defaults and theme, any of which you can leave out. **Some accounts**
saves only the accounts you pick. Press **Export file**. Another copy of Simple
Balance can add the file to its ledger, or move it into a new one.

[Moving between the cloud app and your own copy](/docs/moving-between-cloud-and-self-hosted/)
covers taking your ledger to a copy you run yourself.

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
