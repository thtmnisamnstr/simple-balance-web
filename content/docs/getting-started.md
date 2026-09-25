---
title: Getting started
description: Try Simple Balance on your own machine with Docker and PostgreSQL, create the first account with its setup code, and see what running it for real takes.
section: Install
order: 1
updated: 2026-09-22
---

Simple Balance runs as a container against a PostgreSQL database. The version
we run for you isn't open yet, so for now "installing it" and "getting an
account" are the same step. This page is for running your own copy.

## What you need

- A machine that can run Docker, with a few hundred megabytes free.
- PostgreSQL 15 or later, and 18 recommended. It can be managed, a server you
  already run, or a container beside the app.
- For anybody but you to reach it, a domain and HTTPS. Any address other than
  `localhost` has to be `https`, with something in front of the app handling
  the certificate, such as Caddy, nginx or a cloud load balancer. Then set
  `TRUST_PROXY=true` so each visitor gets their own sign-in allowance, but only
  once that proxy replaces `X-Forwarded-For` rather than appending to it. Caddy
  does without being told, nginx does once it's told to, and a cloud load
  balancer usually appends, so check yours.
  [Behind a proxy](/docs/configuration/#behind-a-proxy) says why it matters.

Nothing else. There's no queue, no cache and no object store, and the project
treats adding one as a change that has to be argued rather than a convenience.

## Try it on your own machine

```sh
docker run --rm --name simple-balance -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/simple_balance" \
  -e AUTH_SECRET="$(openssl rand -hex 32)" \
  -e APP_BASE_URL="http://localhost:3000" \
  ghcr.io/thtmnisamnstr/simple-balance:latest
```

This is for trying it out on the machine in front of you: `http://localhost`
is the one address the server accepts without HTTPS. The command also makes a
new `AUTH_SECRET` every time it runs, which signs you out on every restart, so
for a copy you keep, generate one once and keep it.

If the database `DATABASE_URL` names doesn't exist yet, it's created, as long
as the role connecting has `CREATEDB`. Migrations run at startup under an
advisory lock, so starting two copies at once is safe and the second waits.
Nothing answers until they've finished, and a migration that fails stops the
process rather than leaving it serving a database it couldn't finish upgrading.

## The first account

Open the address you set as `APP_BASE_URL`. On an empty deployment you get the
create-account form rather than a sign-in form, because there's nobody to sign
in as yet.

That form asks for a one-time **setup code**. While there are no accounts, the
server prints it to its log at startup as `First-run setup code: …`. With the
command above it's in the terminal you started it from, and from any other
terminal:

```sh
docker logs simple-balance | grep -i setup
```

Set `SETUP_TOKEN` to a string of at least 16 characters to choose the code
yourself instead of reading it from the log. It stops working as soon as an
account exists, and the claim is serialized, so two people racing for it can't
both win.

No code is needed when `ALLOWED_EMAILS` already admits the address signing up.
Leaving `ALLOWED_EMAILS` unset admits nobody, which is what keeps an
unconfigured deployment private: whoever holds the setup code gets the first
account, and nobody else can register. Set it when you want to let other people
in. [Configuration](/docs/configuration/) has the forms it takes, and the rest
of the settings the server reads.

## Running it for real

The application describes three shapes. What separates them is how many
machines there are and where the database lives.

| Profile  | What it is                                                                  |
| -------- | --------------------------------------------------------------------------- |
| `single` | One machine, running the app and whatever handles TLS.                      |
| `vps`    | One small VPS per service, with the database as one of them.                |
| `ha`     | A Kubernetes cluster, with PostgreSQL spread across several nodes by Citus. |

**Start with `single`.** It's the supported shape, and the one the
application's own docs assume. There are two ways to stand it up:

- [`deploy/compose/single`](https://github.com/thtmnisamnstr/simple-balance/tree/deployment-and-monetization/deploy/compose/single)
  runs the app under Docker Compose against a PostgreSQL you already have,
  managed or on a server you keep. Its `compose.caddy.yml` overlay adds Caddy,
  which gets and renews the certificate and sets `TRUST_PROXY` for you, and the
  unit in `deploy/systemd` starts it after a reboot. With a proxy of your own
  instead, set `TRUST_PROXY=true` yourself, once the proxy replaces
  `X-Forwarded-For` rather than appending to it
  ([Behind a proxy](/docs/configuration/#behind-a-proxy)).
- [`deploy/pulumi`](https://github.com/thtmnisamnstr/simple-balance/tree/deployment-and-monetization/deploy/pulumi)
  has `oci-single` and `aws-single`, which stand up one Oracle Cloud or EC2
  machine running the app and Caddy under systemd, against a PostgreSQL you
  supply. There's no database on the machine. Its separate data disk holds the
  nightly backups, the generated secret and the settings you add. The app waits
  for your `DATABASE_URL` before it starts, and the machine's login message says
  where that goes. After that, a setting is an edit to
  `/var/lib/simple-balance/env.local` followed by
  `sudo systemctl restart simple-balance`. The programs deploy the pinned
  release image, which is 0.1.6 until 0.2.0 is released. 0.1.6 has no billing
  and no ads, so those reach a machine with the 0.2.0 release. A machine that's
  already running moves to a new release on the machine itself, as the
  programs' README describes, not from another `pulumi up`.

[Deployment profiles](https://github.com/thtmnisamnstr/simple-balance/blob/deployment-and-monetization/docs/deployment-profiles.md)
compares the three, and the
[deployment reference](https://github.com/thtmnisamnstr/simple-balance/blob/deployment-and-monetization/docs/deployment.md)
covers the settings in more depth, along with the reverse proxy configuration
and backups.

## What to do next

[Import a statement](/docs/importing-a-statement/). The importer reads a CSV
your bank exported, suggests which column is which, asks you how its dates and
amounts are written, and stages the rows. Staged rows affect no balance until
you commit them, and a **Dry run** before staging shows how the file will be
read without creating anything.
