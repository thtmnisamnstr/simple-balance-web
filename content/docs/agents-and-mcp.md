---
title: Agents and MCP
description: Connect an AI assistant to your ledger, what it can do, and the two things that keep it from doing damage.
section: Using it
order: 4
updated: 2026-09-22
---

Simple Balance ships an MCP server with the same capabilities as the web app,
apart from three account-management tasks below. An assistant can import a
statement, tidy categories, chase duplicates and answer questions about your
money.

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
your client the address and nothing else: no token, no header.

```jsonc
{
  "mcpServers": {
    "simple-balance": {
      "url": "https://your-deployment.example/mcp",
    },
  },
}
```

The client reads the rest from `/.well-known/oauth-authorization-server`,
registers itself, and opens a browser. You sign in there the way you sign in to
the web app, and an **Allow this MCP client?** screen lists the scopes the
client asked for. Choose **Allow access** or **Deny**. The screen grants what
was asked or nothing; it doesn't narrow the request.

So the scopes are decided by the client. One that asks for every scope the
server advertises gets `ledger:write` along with the rest. If yours lets you
set what it requests, ask for `ledger:stage`, or `ledger:read` for an assistant
that only answers questions.

Every client you've approved is listed under **Connected agents** in
Settings, with what it may do. **Revoke** takes its access away at once,
including any token it's already holding. To let it back in, authorize it
again from the agent itself. Changing your password disconnects every client
too.

## What it can see

The whole ledger, through the same services the web app uses. Apart from the
three things above, an agent can't reach a capability the browser doesn't
have, and the browser can't reach one an agent doesn't. That parity is checked
on every build of the application rather than maintained by hand.

## A sensible way to use it

Connect the assistant with `ledger:stage`. Let it do the filing. Read what it
staged, and commit the part you agree with.
