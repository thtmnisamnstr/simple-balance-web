---
title: Configuration
description: Every environment variable the server reads, what it defaults to, and which ones are required.
section: Reference
order: 1
updated: 2026-09-17
---

Configuration is environment variables. There is no configuration file, and
nothing is read from the database at startup.

## Required

| Variable       | What it is                                                      |
| -------------- | --------------------------------------------------------------- |
| `DATABASE_URL` | A PostgreSQL connection string. The only persistent dependency. |
| `AUTH_SECRET`  | A long random string. Sessions are signed with it.              |
| `APP_BASE_URL` | Where this deployment is reachable. Used in links it sends.     |

## Commonly set

| Variable         | Default | What it does                                           |
| ---------------- | ------- | ------------------------------------------------------ |
| `AUTH_MODE`      | `local` | `local`, `google`, or `both`.                          |
| `ALLOWED_EMAILS` | unset   | Who may create an account. Decides nothing after that. |
| `PORT`           | `3000`  |                                                        |
| `LOG_LEVEL`      | `info`  |                                                        |

<Callout kind="warning" title="ALLOWED_EMAILS is about sign-up only">
It decides who may create an account, on every sign-up path. It is never a
condition of signing in, of keeping a session, or of linking a second method to
an account that already exists.
</Callout>

## Secrets from files

Any secret can be supplied as a file instead, which is what container
orchestrators mount:

<CodeTabs>
<CodeTab label="Directly">

```sh
AUTH_SECRET=a-long-random-string
```

</CodeTab>
<CodeTab label="From a file">

```sh
AUTH_SECRET_FILE=/run/secrets/auth_secret
```

</CodeTab>
</CodeTabs>

Set one or the other, never both.

## Mail is optional

With no `SMTP_HOST` the deployment offers no password reset, asks nobody to
confirm an address, and sends no reminders. Everything else works.

Adding a mail server later does not invalidate accounts created without one.
