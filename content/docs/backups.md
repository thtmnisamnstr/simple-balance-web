---
title: Backups
description: What to back up, how to restore it, and how to check that the backup you have is one you could actually use.
section: Operations
order: 1
updated: 2026-09-17
---

There is one thing to back up: the PostgreSQL database. No uploads directory,
no object store, no state on disk in the container.

## Taking one

```sh
pg_dump --format=custom --no-owner "$DATABASE_URL" > simple-balance-$(date +%F).dump
```

`--format=custom` rather than plain SQL because it restores selectively and
compresses, and `--no-owner` so the restore does not need the original role to
exist.

## Restoring one

```sh
createdb simple_balance_restored
pg_restore --no-owner --dbname=simple_balance_restored simple-balance-2026-09-17.dump
```

Point a deployment at the restored database and start it. Migrations run at
startup, so a dump from an older release upgrades on first boot.

<Callout kind="danger" title="Restore into a new database, not over the live one">
`pg_restore` into a database that already has these tables produces a mixture
of both, and a ledger that is a mixture of two ledgers balances to nothing
meaningful.
</Callout>

## Checking the backup is real

A backup nobody has restored is a hypothesis. The cheap test:

1. Restore into a scratch database.
2. Start a deployment against it.
3. Open the trial balance.

If it comes back and nets to zero, the dump holds a complete ledger. That is a
stronger check than the file's size, which is the thing people actually watch.
