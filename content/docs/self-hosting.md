---
title: "Self-hosting: running your own copy"
description: Simple Balance is open source and free to run yourself, with no plan, no account limit and no ads. What it needs, how to try it, and how to run it for real.
section: Self-hosting
order: 1
updated: 2026-10-25
---

Simple Balance is open source: its code is public on
[GitHub](https://github.com/thtmnisamnstr/simple-balance) under the AGPL-3.0
license, and everything on app.smpl.money is also free to run yourself, with no
plan, no account limit and no ads. The product is the same. What changes is who
keeps it running: you install it, you put HTTPS in front of it, and you back it
up and upgrade it.

If that isn't what you want, [sign up at app.smpl.money](https://app.smpl.money/)
instead. [Getting started](/docs/getting-started/) walks through it, and you
can [move your transactions between the two](/docs/moving-between-cloud-and-self-hosted/)
later, in either direction.

## What it needs

- **A machine that can run Docker**, with a few hundred megabytes free. The
  image is `ghcr.io/thtmnisamnstr/simple-balance` and it's built for both
  amd64 and arm64.
- **PostgreSQL 15 or later**, and 18 recommended. It can be a managed
  database, a server you already run, or a machine set aside for it. Use a
  standard build rather than an Alpine one, which sorts names differently.
- **HTTPS, for anybody but you to reach it.** The server accepts plain
  `http://` only at `localhost`. Anywhere else, something in front of it has to
  handle the certificate, such as Caddy, nginx or a cloud load balancer.

Nothing else. There's no queue, no cache and no object store, and the server
keeps nothing on its own disk. The database is the only thing to back up.

## Try it on your own computer

This runs PostgreSQL and Simple Balance in two containers on a private Docker
network. It's for looking around: the database keeps its data in a Docker
volume that goes when you clean up, and the secret changes every time you
start the app.

```sh
docker network create simple-balance
docker run -d --name simple-balance-db --network simple-balance \
  -e POSTGRES_PASSWORD=trial -e POSTGRES_DB=simple_balance \
  postgres:18
```

The database takes a few seconds to start the first time. This says
`accepting connections` once it's ready:

```sh
docker exec simple-balance-db pg_isready -h 127.0.0.1
```

Then start Simple Balance:

```sh
docker run --rm --name simple-balance --network simple-balance \
  -p 127.0.0.1:3000:3000 \
  -e DATABASE_URL="postgresql://postgres:trial@simple-balance-db:5432/simple_balance" \
  -e AUTH_SECRET="$(openssl rand -hex 32)" \
  -e APP_BASE_URL="http://localhost:3000" \
  ghcr.io/thtmnisamnstr/simple-balance:latest
```

The first start takes a little while, because it sets up the database before
it answers. Then open `http://localhost:3000`.

To clean up afterward, stop the app with Ctrl+C and run:

```sh
docker rm -f -v simple-balance-db
docker network rm simple-balance
```

**If you already have PostgreSQL**, leave out the network and the database
container, and point `DATABASE_URL` at yours. Inside the container,
`localhost` is the container itself, so a PostgreSQL on the same computer is
usually `host.docker.internal` instead. If the database the string names
doesn't exist yet, it's created, as long as the role connecting has
`CREATEDB` and can connect to the server's `postgres` database.

The same three settings are the only ones a real deployment needs too:
`DATABASE_URL`, `AUTH_SECRET` and `APP_BASE_URL`. For a copy you keep,
generate `AUTH_SECRET` once and keep it, because changing it signs everybody
out. [Configuration](/docs/configuration/) lists everything else the server
reads.

## The first account

Open the address you set as `APP_BASE_URL`. On an empty copy you get the
create-account form rather than a sign-in form, because there's nobody to sign
in as yet.

That form asks for a one-time **setup code**. While there are no accounts, the
server prints it to its log at startup as `First-run setup code: …`. With the
command above it's in the terminal you started it from. From any other
terminal:

```sh
docker logs simple-balance | grep -i setup
```

The code stops working as soon as an account exists, and two people racing
for it can't both win. Set `SETUP_TOKEN` to a string of at least 16 characters
if you'd rather choose the code than read it from the log.

**Nobody else can sign up until you say so.** Leaving `ALLOWED_EMAILS` unset
admits nobody but the person holding the setup code, which keeps a copy you
haven't configured private. Set it to let other people in: an address, a whole
domain, or `*` for anyone.
[Sign-in and registration](/docs/configuration/#sign-in-and-registration) has
the forms it takes. When `ALLOWED_EMAILS` already admits the first person,
they don't need the code, and when it's `*` none is printed at all.

## Running it for real

There are two ways to run it that the project supports and documents step by
step. Both put the app on one machine and PostgreSQL somewhere private, with
Caddy in front getting and renewing the HTTPS certificate, and both back the
database up every night.

| Guide                                                                       | What you do                                                                                                     |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [Deploying with Docker Compose](/docs/deploying-with-docker-compose/)       | Set up machines you already have, by hand. You copy a few files, fill in one settings file and start it.        |
| [Deploying to Oracle Cloud or AWS](/docs/deploying-to-oracle-cloud-or-aws/) | Let a Pulumi program build the machines, the network and the secret store for you, then point a DNS name at it. |

**Start with one of those.** The project calls this shape `single`, and it's
the one its own docs assume.

There's also an `ha` shape, for people who already run Kubernetes and want
the web tier to scale or the ledger spread across several database nodes. It
uses a Helm chart and Citus, and it's much more to run. The project's advice
is to move to it when losing one machine for ten minutes is unacceptable, not
when the load gets interesting.
[Deployment profiles](https://github.com/thtmnisamnstr/simple-balance/blob/main/docs/deployment-profiles.md)
compares the two, and the
[Helm chart's README](https://github.com/thtmnisamnstr/simple-balance/blob/main/deploy/helm/simple-balance/README.md)
is where `ha` starts.

## Keeping it running

- **Back it up.** Both guides set up a nightly backup, but a backup on the
  same machine goes with the machine. [Backups](/docs/backups/) says what to
  copy off it, and how to check that a backup is one you could restore.
- **Set up mail.** Without it nobody can reset a forgotten password, and the
  fix is editing the database.
  [Mail](/docs/configuration/#mail) is two settings.
- **Upgrade on purpose.** Back up first, move to the new release's image, and
  never run two versions against one database. Each guide has the steps for
  its own machines.
