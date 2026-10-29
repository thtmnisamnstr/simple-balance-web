---
title: Backing up and restoring a self-hosted copy
description: Back up the PostgreSQL database with pg_dump, restore it with pg_restore, and check that a backup is one you could actually use.
section: Self-hosting
order: 5
updated: 2026-10-26
---

This page is for a copy you run yourself. On [app.smpl.money](https://app.smpl.money/), the copy of your
records you can take with you is an export:
[Taking your data with you](/docs/your-account-and-plan/#taking-your-data-with-you)
says how.

A self-hosted copy of Simple Balance has one thing to back up: its PostgreSQL
database. No uploads directory, no object store, no state on disk in the
container. Both deployment guides,
[Docker Compose](/docs/deploying-with-docker-compose/#backups) and
[Oracle Cloud or AWS](/docs/deploying-to-oracle-cloud-or-aws/#backups), set up
a backup every night and say how to restore one. This page is the same thing
by hand, for anywhere else.

## Taking one

```sh
pg_dump --format=custom "$DATABASE_URL" > simple-balance-$(date +%F).dump
```

`--format=custom` rather than plain SQL because it restores selectively and
compresses.

`$DATABASE_URL` is the connection string written for the app, and
PostgreSQL's own tools read a few parts of it differently. They refuse
`sslmode=no-verify`. They need the `sslrootcert` file where they run, and
without one, `verify-full` looks for `~/.postgresql/root.crt`. And `pg_dump`
has to be the same major version as the server, or newer.

## Restoring one

```sh
createdb simple_balance_restored
pg_restore --no-owner --dbname=simple_balance_restored simple-balance-2026-09-17.dump
```

`--no-owner` so the restore doesn't need the original role to exist. Point a
deployment at the restored database and start it. Migrations run at startup,
so a dump from an older release upgrades on first boot.

<Callout kind="danger" title="Restore into a new database, not over the live one">
`pg_restore` into a database that already has these tables produces a mixture
of both, and a ledger that's a mixture of two ledgers balances to nothing
meaningful.
</Callout>

## Checking the backup is real

A backup nobody has restored is a hypothesis. The cheap test:

1. Restore into a scratch database.
2. Start a deployment against it with `SMTP_HOST` and `MAIL_FROM` unset, so
   the copy mails nobody.
3. Open the trial balance in Reports.

If it comes back and totals zero in every currency, your books in the restore
are consistent rather than broken. That's a stronger check than the file's
size, which is the thing people actually watch, but it has two limits. Each
person's trial balance covers only their own books, so on a deployment other
people use, it checks yours and not theirs. And it can't show that nothing's
missing: every transaction nets to zero by itself, so a ledger short a few of
them still passes. For that, compare a few account balances with the live
deployment, allowing for anything entered since the dump.
