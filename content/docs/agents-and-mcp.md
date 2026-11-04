---
title: Connecting an AI assistant (MCP)
description: "Connect ChatGPT, Claude, Gemini, Codex or Claude Code to Simple Balance at app.smpl.money/mcp: setup for each, what it can change, and what to do when it fails."
section: Your account
order: 3
updated: 2026-11-03
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
Deleting your account, setting a sign-in password, and paying for or changing
your plan are reachable from a signed-in session and never from an MCP
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

Claude Code needs one more line in that entry, `"type": "http"`, and skips it
without. [Connect your assistant](#connect-your-assistant) has the steps for
each client.

The client learns the rest from what Simple Balance publishes about its
sign-in, registers itself, and opens a browser. You sign in there the way you
sign in to the web app, unless that browser is signed in already, and an **Allow this MCP client?** screen names the client and lists
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

## Connect your assistant

Each of these registers itself, so none needs a client ID or a secret. When it
connects, a browser opens at Simple Balance: sign in if you aren't already,
and approve the connection on **Allow this MCP client?**

### ChatGPT

1. Open **Plugins** in ChatGPT, at
   [chatgpt.com/plugins](https://chatgpt.com/plugins). Choose **+**, then
   **Add custom MCP server**.
2. Name it `Simple Balance`. Under **Connection**, enter
   `https://app.smpl.money/mcp`.
3. For authentication, choose **OAuth**, and leave any client ID and secret
   empty.
4. Read the warning, tick **I understand and want to continue**, and choose
   **Create as a plugin**.
5. Install it from your plugins, and sign in to Simple Balance when ChatGPT
   asks.
6. In a new chat, type `@` and pick Simple Balance.

OpenAI says custom MCP servers are for ChatGPT Business, Enterprise and Edu,
on the web. On Business only an admin or owner can add one, and on Enterprise
and Edu an admin decides who can. On Pro, ChatGPT can connect one for reading
only. By default ChatGPT asks you to confirm a change before it makes it, and
you can tell it to stop asking for one tool in a chat.

### Claude

On claude.ai and in Claude Desktop, Simple Balance is a custom connector.
Claude's free plan allows one custom connector.

1. In Claude, open **Customize**, then **Connectors**.
2. Choose **+ Add**, then **Add custom connector**.
3. Name it `Simple Balance` and enter `https://app.smpl.money/mcp`. If Claude
   then shows the sign-in settings it found, leave them as they are.
4. Choose **Add**.
5. When Claude opens Simple Balance, sign in, read what's listed on
   **Allow this MCP client?**, and choose **Allow access**.

To use it in a chat, press **+** at the bottom left of the message box, choose
**Connectors**, and switch Simple Balance on.

On a Team or Enterprise plan, an owner adds it under **Organization settings**
and then **Connectors**. Each person then connects their own Simple Balance
account from **Customize** and **Connectors**.

<Callout kind="note" title="Claude asks for every kind of access">
Claude asks for every scope Simple Balance offers, so the approval screen
lists `ledger:write`. Approving it lets Claude record and change things in
your books, not only propose them, and the approval screen can't narrow what's
asked for. Everything it changes is listed on [Activity](/docs/activity-history/), and
you can [revoke it](#see-and-revoke-connected-agents) at any time.
</Callout>

### Gemini

In the Gemini app, Simple Balance is a custom app. You add it on the web, at
gemini.google.com, and then it's in Gemini's phone app too. Google offers
custom apps to people in the US who are 18 or older, signed in with a personal
Google account, with Gemini in English and **Keep Activity** on.

1. Open **Settings**, then **Connected Apps**. If it isn't there, it's under
   **Personal Intelligence**.
2. Under **Custom apps**, choose **Add a custom app**.
3. Enter `https://app.smpl.money/mcp`, and choose **Next**.
4. Sign in to Simple Balance, and choose **Allow access**.

To use it in a chat, type `@` and pick Simple Balance. Gemini asks you to
confirm each change before it makes it.

**Gemini CLI** is for organizations with Gemini Code Assist Standard or
Enterprise. In it, run:

```bash
gemini mcp add --transport http --scope user simple-balance https://app.smpl.money/mcp
```

Start `gemini` in a folder you trust, because in one you haven't it connects
no servers. `/permissions trust` trusts the folder you're in. Then run
`/mcp auth simple-balance` to sign in. Gemini CLI doesn't start the sign-in by
itself.

### Codex

Codex, OpenAI's coding assistant, keeps one list of servers for its command
line, its editor extension and the ChatGPT desktop app. Add Simple Balance
from a terminal:

```bash
codex mcp add simple-balance --url https://app.smpl.money/mcp
```

Codex notices that Simple Balance needs a sign-in and opens it, asking for
every scope Simple Balance offers, `ledger:write` included. To choose instead,
don't run that command. Put the server in Codex's settings file,
`~/.codex/config.toml`, with the scopes written out:

```toml
[mcp_servers.simple-balance]
url = "https://app.smpl.money/mcp"
scopes = ["openid", "profile", "email", "offline_access", "ledger:read", "ledger:stage"]
```

Then sign in with `codex mcp login simple-balance`. That's the staging access
[this page suggests](#a-sensible-way-to-use-it). Add `"ledger:write"` to the
list to let it commit too.

In the ChatGPT desktop app or the editor extension, you can add it from
**Settings** instead, which is the gear menu in the extension. Choose
**MCP servers**, then **Add server**. Name it `simple-balance`, pick
**Streamable HTTP**, enter the address, save it, and choose **Restart**. Then
choose **Authenticate**.

### Claude Code

Run this in a terminal:

```bash
claude mcp add --transport http --scope user simple-balance https://app.smpl.money/mcp
```

Then type `/mcp` in Claude Code, choose `simple-balance`, and sign in. Here,
`--scope user` is Claude Code's own setting, for which of your projects can
use the server. It has nothing to do with what Simple Balance lets it do.

Unless you set them, Claude Code leaves the scopes to Simple Balance, and it
may ask for every one, `ledger:write` included. To choose, add it with the
scopes written out instead:

```bash
claude mcp add-json --scope user simple-balance '{"type":"http","url":"https://app.smpl.money/mcp","oauth":{"scopes":"openid profile email offline_access ledger:read ledger:stage"}}'
```

That's the staging access [this page suggests](#a-sensible-way-to-use-it).
Add `ledger:write` to the list to let it commit too.

To write the entry yourself, in a project's `.mcp.json` file, give it
`"type": "http"` beside the address:

```json
{
  "mcpServers": {
    "simple-balance": {
      "type": "http",
      "url": "https://app.smpl.money/mcp"
    }
  }
}
```

If you've added Simple Balance on claude.ai and you sign in to Claude Code
with the same Claude subscription, the connector is already in Claude Code,
and you don't need the command. If you add it with the command too, Claude
Code uses that one and hides the connector.

## Things to ask it

Once it's connected, try one of these:

- "Where did my money go last month?"
- "What day did I pay the electric bill last month?"
- "Add a $42.18 grocery purchase on checking for me to approve."

The first two only read. The third needs `ledger:stage`. It puts a row on
**Staged**, which changes no balance until you commit it.

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
by the application's own tests rather than maintained by hand. So you can
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

## When it doesn't work

- **No browser window opens.** In Gemini CLI, that's expected: run
  `/mcp auth simple-balance`. In Codex, run `codex mcp login simple-balance`,
  and on a computer with no browser add `--no-browser`, open the address it
  shows somewhere else, and paste the address you end on back into Codex.
  When Claude Code can't open your browser, it shows the sign-in address
  instead. Copy it into a browser and sign in there. If the browser then shows
  a connection error, copy the whole address from its address bar and paste it
  into Claude Code when it asks.
- **A tool it needs isn't there.** Simple Balance leaves a tool out of the
  assistant's list when its scopes don't reach it. So an assistant with only
  `ledger:read` sees no tool that stages, and may say it can't find one. Ask it to run `whoami`, which lists the scopes it holds, or
  look under **Connected agents** in **Settings**.
- **It needs a wider scope.** Connect it again, asking for more. In Codex,
  widen the `scopes` list in `~/.codex/config.toml` and run
  `codex mcp login simple-balance`.
  In Claude Code, run `claude mcp remove simple-balance`, add it again with
  the wider list of scopes, then type `/mcp` and sign in. If an assistant calls a tool
  by name that its scopes don't reach, Simple Balance refuses and names the
  scope it needs. Claude on claude.ai then asks you to sign in again and
  approve it. Each time, the approval screen lists what's asked for, and
  nothing widens until you choose **Allow access**.
- **You want to cut it off.** Revoke it under
  [Connected agents](#see-and-revoke-connected-agents). It loses access at
  once, whatever the assistant still holds.
- **It says an account is frozen.** On the free plan, an account over the
  limit is frozen. Simple Balance refuses an assistant's changes to what it
  holds, just as it refuses yours, and trying again won't get past it. Use an account that's
  still in use, or
  [choose which accounts stay usable](/docs/your-account-and-plan/#choose-which-accounts-stay-usable).
  Subscribing again unfreezes them all, and only you can do that, from the web
  app.

## A sensible way to use it

Connect the assistant with `ledger:stage`. Let it do the filing. Read what it
staged on [Staged](/docs/staged-transactions/), and commit the part you agree
with.
