---
title: Connecting an AI assistant (MCP)
description: "Connect an AI assistant to your records in Simple Balance at app.smpl.money/mcp: what it can read and change, and how staging and scopes keep it in check."
section: Your account
order: 3
updated: 2026-10-25
---

You can connect an AI assistant to Simple Balance through MCP, the Model
Context Protocol, which is a standard way for an assistant to use another app.
Once it's connected, it can do what the web app does, such as importing a
statement, tidying categories, chasing duplicates and answering questions about
your money. Three account-management tasks are kept from it, and they're
listed below.

## What keeps it from doing damage

Two things, and neither is a promise. Both are enforced.

**Staging.** An agent can propose as much as it likes. A staged row has no
postings, appears in no balance and is in no report until somebody commits it.
An agent holding `ledger:stage` can propose and can't commit; committing takes
`ledger:write`.

**Scopes.** Every connection carries scopes, fixed when you approve it.
`ledger:read` can't write. `ledger:stage` can propose and can't decide:
creating a category, restoring an archived one or widening what kind of entry
it may carry all need `ledger:write`, wherever they're reached from, including
a CSV import.

<Callout kind="warning" title="Three things no agent can do">
Deleting your account, setting a sign-in password, and anything to do with
billing are reachable from a signed-in session and never from an MCP
connection. A connection is a credential handed to a program, which is a
different class of authority from writing a transaction.
</Callout>

## Connecting one

The server speaks MCP over HTTP at `/mcp`, and it's protected by OAuth. Give
your client the address and nothing else: no token, no header. On
[app.smpl.money](https://app.smpl.money/) the address is `https://app.smpl.money/mcp`. On a copy you run
yourself, it's your own address followed by `/mcp`.

```json
{
  "mcpServers": {
    "simple-balance": {
      "url": "https://app.smpl.money/mcp"
    }
  }
}
```

That's the shape for a client that takes a server's URL in an `mcpServers`
block in its settings file. A client that adds servers in its own settings
screen instead takes the same address there.

The client reads the rest from `/.well-known/oauth-authorization-server`,
registers itself, and opens a browser. You sign in there the way you sign in to
the web app, and an **Allow this MCP client?** screen names the client and lists
the scopes it asked for, each with a plain description:

| Scope            | What the screen says                                           |
| ---------------- | -------------------------------------------------------------- |
| `ledger:read`    | Read your accounts, transactions, and reports                  |
| `ledger:stage`   | Propose transactions for you to review, without recording them |
| `ledger:write`   | Create, edit, and delete transactions and accounts             |
| `offline_access` | Keep working without asking you again                          |
| `openid`         | Confirm who you are                                            |
| `profile`        | See your name                                                  |
| `email`          | See your email address                                         |

Choose **Allow access** or **Deny access**. The screen grants what was asked or
nothing; it doesn't narrow the request.

So the scopes are decided by the client. One that asks for every scope the
server advertises gets `ledger:write` along with the rest. If yours lets you
set what it requests, ask for `ledger:stage`, or `ledger:read` for an assistant
that only answers questions.

## See and revoke connected agents

Every client you've approved is listed under **Connected agents** in
**Settings**, with what it may do:

- **Read only** for `ledger:read`.
- **Read and queue for review** for `ledger:stage`.
- **Read, stage, and commit** for `ledger:write`.

Beside it, **Active** means it holds a token that still works, and
**No live token** means its tokens have run out but your approval still
stands. The line under its name also says when you approved it, when it last
took a token, when the approval runs out, and how many tokens it holds.

To cut one off:

1. Press **Revoke** beside it.
2. Press **Revoke access** to confirm.

It loses access at once, including any token it's already holding, and it
can't renew. Your ledger isn't changed, and anything it already recorded stays.
To let it back in, authorize it again from the agent itself. Changing your
password disconnects every client too.

## What it can do

It reaches the whole ledger, through the same services the web app uses. Apart from the
three things above, an agent can't reach a capability the browser doesn't
have, and the browser can't reach one an agent doesn't. That parity is checked
on every build of the application rather than maintained by hand. So you can
ask it to:

- Add, edit, archive and delete accounts, read their balances and register,
  and choose which accounts stay usable on the free plan.
- Add, edit, delete and restore transactions, split them across categories,
  and change or delete many at once.
- Add, rename, group, archive and merge categories, and merge payees.
- Stage transactions, bring a CSV file in to **Staged**, review possible
  duplicates, and commit what's ready.
- Set up and change recurring transactions and templates.
- Set budgets, and read the budget report, the six reports and the forecast.
- Read your activity history, change your preferences, and list or disconnect
  connected agents.

Each of those still needs the scope for it. An agent with `ledger:read` can
look at everything on that list and change none of it. One with
`ledger:stage` can also add, fix and delete rows on **Staged**, including a
CSV file's, and change nothing else. Everything else takes `ledger:write`.

The same limits apply as well. On [app.smpl.money](https://app.smpl.money/)'s free plan, an account that's
[frozen](/docs/your-account-and-plan/#canceling) refuses an agent's changes
just as it refuses yours.

## Checking what it did

Everything an agent changes is listed on **Activity**, marked with an
**Agent** badge, beside what you did on the web (**Web**) and what the
schedule did (**Scheduled**). [Activity history](/docs/activity-history/)
explains how to read it.

## A sensible way to use it

Connect the assistant with `ledger:stage`. Let it do the filing. Read what it
staged on [Staged](/docs/staged-transactions/), and commit the part you agree
with.
