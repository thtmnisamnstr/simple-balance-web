---
title: Getting started
description: Run Simple Balance on one machine with Docker and PostgreSQL, and sign in for the first time.
section: Install
order: 1
---

Simple Balance runs as a container against a PostgreSQL database. There is no
hosted version to sign up for, so "installing it" and "getting an account" are
the same step.

## What you need

- A machine that can run Docker, with a few hundred megabytes free.
- PostgreSQL 16 or later. It can be managed, or a container beside the app.
- A domain, if you want anybody other than you to reach it.

Nothing else. There is no queue, no cache and no object store, and the project
treats adding one as a change that has to be argued rather than a convenience.

## The shortest thing that works

```sh
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/simple_balance" \
  -e AUTH_SECRET="$(openssl rand -hex 32)" \
  -e APP_BASE_URL="http://localhost:3000" \
  ghcr.io/thtmnisamnstr/simple-balance:latest
```

Migrations run at startup, under an advisory lock, so starting two copies at
once is safe and the second waits. If a migration fails the readiness probe
fails with it: the container will not start serving a database it could not
finish upgrading.

## The first account

Open the address you set as `APP_BASE_URL`. On an empty deployment the first
visitor gets the sign-up form rather than a sign-in form, because there is
nobody to sign in as yet.

That first-account claim is transactional and serialized, so two people racing
it cannot both win. If you would rather it were not open at all, set
`ALLOWED_EMAILS` to the addresses you want to admit and `SETUP_TOKEN` to a long
random string; an address the allow list turns away can then still register
once, with the token.

## What to do next

Import a statement. The importer reads a CSV your bank exported, works out the
format, and stages the rows — staged rows affect no balance until you commit
them, so there is nothing to undo if the mapping was wrong.
