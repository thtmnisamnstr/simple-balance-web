---
title: Agents and MCP
description: Connect an AI assistant to your ledger, what it can do, and the two things that stop it doing damage.
section: Using it
order: 4
updated: 2026-09-17
---

Simple Balance ships an MCP server with the same capabilities as the web app.
An assistant can import a statement, tidy categories, chase duplicates and
answer questions about your money.

## What stops it doing damage

Two things, and neither is a promise — both are enforced.

**Staging.** An agent can propose as much as it likes. A staged row has no
postings, appears in no balance and is in no report until somebody commits it.
The tool that proposes cannot be the tool that commits.

**Scopes.** A token carries scopes. `ledger:read` cannot write. `ledger:stage`
can propose and cannot decide — creating a category, restoring an archived one
or widening what kind of entry it may carry all need `ledger:write`, wherever
they are reached from, including a CSV import.

<Callout kind="warning" title="Three things no token can do">
Deleting your account, setting a sign-in password, and anything to do with
billing are reachable from a signed-in session and never from an MCP token. A
token is a credential handed to a program, which is a different class of
authority from writing a transaction.
</Callout>

## Connecting one

The server speaks MCP over HTTP at `/mcp`. Point your client at it with a
token issued from the settings page, and scope the token to what the assistant
actually needs.

```jsonc
{
  "mcpServers": {
    "simple-balance": {
      "url": "https://your-deployment.example/mcp",
      "headers": { "Authorization": "Bearer sb_..." },
    },
  },
}
```

## What it can see

The whole ledger, through the same services the web app uses — so an agent
cannot reach a capability the browser does not have, and the browser cannot
reach one an agent does not. That parity is checked on every build of the
application rather than maintained by hand.

## A sensible way to use it

Give the assistant a read-and-stage token. Let it do the filing. Read what it
staged, and commit the part you agree with.
