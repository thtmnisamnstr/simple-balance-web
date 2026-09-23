---
title: Configuration
description: Every environment variable the server reads, what it defaults to, and which ones it refuses to start without.
section: Reference
order: 1
updated: 2026-09-22
---

Configuration is environment variables. There's no configuration file. This
page is written from the application's own reference,
[`docs/deployment.md`](https://github.com/thtmnisamnstr/simple-balance/blob/deployment-and-monetization/docs/deployment.md)
and
[`.env.example`](https://github.com/thtmnisamnstr/simple-balance/blob/deployment-and-monetization/.env.example),
which go into more depth on most settings.

Almost every setting is checked at startup. A value the server can't use stops
it with a message naming the variable, so a mistake shows up the moment you
deploy rather than the day somebody needs it. The settings under
[Operational settings](#operational-settings) that have a ceiling are the
exception: they warn, name the value, and run on the default.

## Required in production

| Variable       | What it is                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`     | `production`. The container image sets it for you. A host running `npm start` doesn't, and unset reads as development. Only `production`, `development` and `test` are accepted.                                          |
| `DATABASE_URL` | A PostgreSQL 15 or later connection string, and the only persistent dependency. If the database it names doesn't exist yet it's created, which needs a role with `CREATEDB`.                                              |
| `AUTH_SECRET`  | At least 32 random characters, for example from `openssl rand -base64 32`. Keep it: changing it signs everybody out. A value published in the project's own files, including whatever `.env.example` carried, is refused. |
| `APP_BASE_URL` | Your public origin, exactly as the browser sees it, with no path. HTTPS anywhere but localhost.                                                                                                                           |

`NODE_ENV` matters more than it looks. Outside production the first-run setup
code isn't asked for, sign-in attempts aren't rate limited, and cookies aren't
marked secure. A process that isn't in production and has been given an
`APP_BASE_URL` naming anything but localhost refuses to start, because that
setting is the one only a real deployment has.

`APP_BASE_URL` matters as much. Secure cookies, the OAuth issuer, redirect
checks and the audience on MCP tokens all come from it, so a wrong one breaks
sign-in in ways that look unrelated. `http://` is accepted only for `localhost` or a
loopback address. Anywhere else you need something in front of the app
terminating TLS, and then [`TRUST_PROXY`](#behind-a-proxy).

A database on another host should be reached over TLS. Put `sslmode=no-verify`
in `DATABASE_URL` for a server with a certificate it signed itself, or
`sslmode=verify-full` for one with a certificate from a CA the container already
trusts, such as a managed database. Don't use `sslmode=require`: the driver
checks the certificate anyway, so against a self-signed server it fails, and the
server refuses to start and says which setting to use instead.

## Sign-in and registration

| Variable         | Default   | What it does                                                                                                                                                                                                                               |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AUTH_MODE`      | `local`   | Which sign-in methods are offered: `local`, `google`, or `both`.                                                                                                                                                                           |
| `ALLOWED_EMAILS` | unset     | Who may create an account. Unset admits nobody but the first account. Required, and must admit somebody, when `AUTH_MODE` is `google` or `both`.                                                                                           |
| `SETUP_TOKEN`    | generated | The one-time code that claims a fresh instance. At least 16 characters if you set it; a shorter one refuses to start. Left unset, one is generated and, where password sign-in is on, printed to the startup log. It also takes a `_FILE`. |

`ALLOWED_EMAILS` is a comma-separated list, matched without regard to case, and
each entry is one of these:

| Entry             | Admits                                                        |
| ----------------- | ------------------------------------------------------------- |
| `you@example.com` | That address, and only it. A plus tag is a different address. |
| `example.com`     | Anybody at that domain.                                       |
| `@example.com`    | The same thing, written the way people often expect.          |
| `*`               | Anybody at all.                                               |

A domain matches only itself, so `example.com` doesn't admit
`someone@mail.example.com`. A subdomain is a different domain and may be under
somebody else's control.

Leaving it unset admits nobody, and that's what keeps an unconfigured deployment
private: whoever claims it with the setup code gets an account, and nobody else
can register. Set it when you want to let other people in.

<Callout kind="warning" title="ALLOWED_EMAILS is about sign-up only">
It decides who may create an account, on every sign-up path. It's never a
condition of signing in, of keeping a session, or of linking a second method to
an account that already exists. Somebody you take off the list keeps the account
they already have; to remove them, delete their account.
</Callout>

A domain entry is only as strong as the proof behind the address. With Google
sign-in, Google has confirmed the address. With passwords, it depends on mail:
with a [mail server](#mail) configured, a new account has to open a link sent to
its address before it works, and without one nothing is confirmed.

### The setup code

While a production deployment with password sign-in (`AUTH_MODE` `local` or
`both`) has no accounts, the server prints `First-run setup code: …` to its
log at startup, whatever `LOG_LEVEL` says. Whoever holds that code can create
an account the registration rule would otherwise turn away, and it stops
working the moment an account exists. When `ALLOWED_EMAILS` already admits the
person signing up, no code is asked for, and with `*` none is printed at all.
With `AUTH_MODE=google` none is printed either, and the first account goes to
whoever `ALLOWED_EMAILS` admits.

Set `SETUP_TOKEN` if you'd rather choose the code than read it from a log.
Guessing it is bounded to five attempts per client address every fifteen
minutes, counted in PostgreSQL so the bound holds across a restart.

### Google sign-in

| Variable               | Default | What it does                                                                                                                   |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `GOOGLE_CLIENT_ID`     | unset   | The OAuth client this deployment signs people in with. Required when `AUTH_MODE` is `google` or `both`, and ignored otherwise. |
| `GOOGLE_CLIENT_SECRET` | unset   | That client's secret. Required alongside the ID. It also takes a `_FILE`.                                                      |

Google modes refuse to start without both, and without an `ALLOWED_EMAILS` that
admits somebody, rather than silently letting everyone in. Register this
redirect URI on the Google OAuth web application, with your own host:

```text
https://simple-balance.example.com/api/auth/callback/google
```

Simple Balance asks Google for `openid`, `email` and `profile`, and nothing
else. To use both methods on one account in `both` mode, create the local
account first, sign in with it, then use **Connect Google** in Settings. Two
accounts sharing an email address aren't assumed to be the same person.

## Behind a proxy

| Variable      | Default | What it does                                                                  |
| ------------- | ------- | ----------------------------------------------------------------------------- |
| `TRUST_PROXY` | `false` | Turn it on when a reverse proxy sits in front and replaces `X-Forwarded-For`. |

Sign-in attempts are counted per client address. With this off, that address
is the far end of the connection, which behind a proxy is the proxy itself for
every visitor: everybody shares one allowance, and one stranger can spend it for
the rest. At `LOG_LEVEL` `info` or `debug`, a production server says so at
startup when it's counting against the connection address, and says nothing
when it isn't. At `warn` or `error` that line is never written, so silence tells
you nothing. Check with a test request instead. The allowance is three tries in
ten seconds per address, so get a second device on another network ready first,
such as a phone off Wi-Fi, with its sign-in form filled in. Then sign in with a
wrong password from the first network until you're turned away for trying too
often, and submit the other device's form within a few seconds. If that one's
turned away too, every visitor is sharing one allowance. A try made ten seconds
later gets through whatever the setting is, so it proves nothing.

Leave it off only when the application is reached directly, or when the proxy in
front passes `X-Forwarded-For` through rather than replacing it. With it on, the
server counts against the first address in that header, so behind a proxy that
appends, the first address is whatever the caller wrote: a caller can pick their
own allowance, and the limit stops binding. The proxy also has to send
`X-Forwarded-Proto`. Caddy does all of that without being told. nginx needs it
spelled out (`proxy_set_header X-Forwarded-For $remote_addr`, not
`$proxy_add_x_forwarded_for`, which appends), and the application's reference
has the block to copy.

## Mail

Set `SMTP_HOST` and `MAIL_FROM` together and three things switch on: people can
reset a forgotten password, a new account has to confirm its address before it
works, and scheduled reminders can be delivered. Leave both unset and none of
it happens. Setting only one of them refuses to start.

| Variable        | Default                                 | What it is                                                                                                                                        |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SMTP_HOST`     | unset                                   | The submission server. Setting it turns mail on.                                                                                                  |
| `MAIL_FROM`     | unset                                   | The address messages come from: `balance@example.com`, or `Simple Balance <balance@example.com>`. Required alongside `SMTP_HOST`.                 |
| `MAIL_REPLY_TO` | unset                                   | Where a reply should go, if not to `MAIL_FROM`. Same two forms.                                                                                   |
| `SMTP_PORT`     | `587`, or `465` when `SMTP_SSL` is true |                                                                                                                                                   |
| `SMTP_SSL`      | `false`                                 | `true` for a connection encrypted from the first byte, which is what 465 expects. `false` starts on 587 and upgrades with STARTTLS.               |
| `SMTP_USERNAME` | unset                                   | Set with `SMTP_PASSWORD` or not at all.                                                                                                           |
| `SMTP_PASSWORD` | unset                                   | Never sent unencrypted: with `SMTP_SSL` off and credentials set, the STARTTLS upgrade is required rather than attempted. It also takes a `_FILE`. |

Use a submission service, not the MX host your domain publishes. An MX record
says where mail to your domain is delivered; it doesn't accept authenticated
submission or relay to other domains. Every link in these messages is built
from `APP_BASE_URL`.

The connection to the relay is opened once at startup, so a wrong setting shows
up in the log. A refusal there is logged and the server keeps running, because
the ledger works whether or not mail does.

A reminder set up while there's no mail server is kept and starts arriving once
one is configured, but nothing queues in the meantime: a reminder whose moment
passed isn't sent later. Accounts created without a mail server keep working
after one is added.

## Selling a plan

<Callout kind="note" title="From 0.2.0">
The server reads these settings from 0.2.0 on. The 0.1.6 image, which `:latest`
and the application's deployment recipes run by default until 0.2.0 ships, has
no billing and ignores them.
</Callout>

| Variable                  | Default | What it does                                                                                                                                                                                                  |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SB_BILLING_ENABLED`      | `false` | Whether this deployment sells a plan and holds a free account to three financial accounts in use. `true` or `false`. Setting it without the five Stripe settings below refuses to start.                      |
| `STRIPE_SECRET_KEY`       | unset   | The key this process charges, refunds and cancels with: `sk_…`, or a restricted `rk_…`. A live key while `NODE_ENV` isn't `production` refuses to start. It also takes a `_FILE`.                             |
| `STRIPE_PUBLISHABLE_KEY`  | unset   | The key the browser loads Stripe's payment form with, `pk_…`. It's published to every visitor, so it's a setting rather than a secret. A live key beside a test secret key, or the reverse, refuses to start. |
| `STRIPE_WEBHOOK_SECRET`   | unset   | What a delivery from Stripe is verified against, `whsec_…`. It also takes a `_FILE`.                                                                                                                          |
| `STRIPE_PRICE_MONTHLY_ID` | unset   | The monthly price, `price_…`. A product id here is the usual mistake and is refused at startup.                                                                                                               |
| `STRIPE_PRICE_YEARLY_ID`  | unset   | The annual price, `price_…`. Both prices belong to one product.                                                                                                                                               |

**The five Stripe settings are set together or not at all.** Setting only some
of them refuses to start. Set none and this process never opens a connection to
Stripe.

They answer only whether Stripe can be reached. `SB_BILLING_ENABLED` answers
whether anything is for sale. Stripe configured with `SB_BILLING_ENABLED` left
off is the state for winding down: it goes on honoring and listening to the
subscriptions people already pay for, offers nothing new, and limits nobody. It
says so in the log at every start, in case that isn't what you meant.

### The webhook

Point a Stripe webhook endpoint at `https://your-host/api/billing/webhook` and
subscribe it to **exactly these event types**. Nothing in the deployment can see
what you chose, so an endpoint subscribed to the wrong set fails silently.

| Event                                                                                                  | Why it's needed                                                                                            |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `customer.subscription.created`                                                                        | A subscription that began somewhere other than the plan tab.                                               |
| `customer.subscription.updated`                                                                        | Every change of status, price, cancellation and renewal. This is the one that grants and revokes the plan. |
| `customer.subscription.deleted`                                                                        | The end of a subscription, however it ended.                                                               |
| `invoice.paid`                                                                                         | The only thing treated as proof that a first payment succeeded.                                            |
| `invoice.payment_failed`                                                                               | Starts the seven-day grace period, by recording when the failure happened.                                 |
| `setup_intent.succeeded`                                                                               | Makes a replacement card the one Stripe bills.                                                             |
| `customer.deleted`                                                                                     | Drops a customer mapping Stripe no longer has.                                                             |
| `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, `charge.dispute.funds_withdrawn` | Logged for an operator to act on. None of them changes a plan by itself.                                   |

Anything else is acknowledged and ignored, so subscribing to more costs only
noise. Subscribing to less is the failure that's hard to see.

A test delivery from Stripe's dashboard answering `200` with
`{"received": true}` proves the signature verified and nothing else. To prove a
subscription works end to end, make a real test-mode subscription and watch the
plan tab change.

`SB_CSP_REPORT_ONLY=true` rehearses the plan and billing tab's content security
policy instead of enforcing it, for the hour after turning billing on: that page
reports what would've been blocked and blocks nothing, and every other page goes
on enforcing. Never leave it on. The process warns at every start while it's
on. Like the rest of this section it's read from 0.2.0 on, and the 0.1.6 image
ignores it.

## Advertising

<Callout kind="note" title="From 0.2.0">
The server reads these settings from 0.2.0 on. The 0.1.6 image, which `:latest`
and the application's deployment recipes run by default until 0.2.0 ships,
shows no ads and ignores them.
</Callout>

| Variable                  | Default | What it does                                                                                                                                                                                                                                                                                               |
| ------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PRIVACY_POLICY_URL`      | unset   | Where this deployment's privacy policy lives. **Required whenever AdSense is configured**, because Google's program policies require one; the server refuses to start without it. Must be absolute and `https`. Linked from the sidebar on every page. Read from 0.2.0 on, and the 0.1.6 image ignores it. |
| `ADSENSE_CLIENT_ID`       | unset   | The AdSense publisher id, `ca-pub-` followed by sixteen digits. The dashboard shows it as `pub-…`, and the missing `ca-` is refused at startup.                                                                                                                                                            |
| `ADSENSE_BANNER_SLOT_ID`  | unset   | The ad unit shown once in the application shell. Ten digits. Set with the client id or not at all.                                                                                                                                                                                                         |
| `ADSENSE_FOOTER_SLOT_ID`  | unset   | A second unit at the foot of the page. An addition to the banner rather than a replacement, so setting it alone refuses to start.                                                                                                                                                                          |
| `ADSENSE_CONSENT_MANAGED` | `false` | Whether a certified consent platform decides which ads are personalized. Off, every ad request asks for non-personalized ads. Turn it on only if you want personalized ads, and read [the consent message](#the-consent-message) first.                                                                    |

**An ad is shown only where a limited plan is in force**: a free account on a
deployment that's selling one. Configuring AdSense with `SB_BILLING_ENABLED`
off shows no ads to anybody. Ads are never shown to a paid account, and never
on the plan and billing tab.

Know what it costs before turning it on. AdSense publishes no list of the hosts
it loads from, so serving it widens the app's content security policy on every
page that shows your balances, including allowing scripts to be evaluated at
runtime. A deployment that sets none of these keeps the `default-src 'self'`
policy the container ships with.

### The consent message

**Publish a European regulations message whether or not you want personalized
ads.** It's in AdSense's own **Privacy and messaging**, and the ad tag the app
already loads delivers it. A non-personalized ad still sets cookies, and
visitors in the EEA, the UK and Switzerland have to be asked about those first.

Set `ADSENSE_CONSENT_MANAGED=true` only if you want personalized ads. The
message asks nobody outside those regions, so with it on, a visitor anywhere
else can be shown personalized ads without ever being asked. If your privacy
policy says ads are personalized only with consent, leave it off. Nothing in
the software can check that the message exists.

## Operational settings

| Variable                      | Default              | What it does                                                                                                                                                                |
| ----------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                        | `3000`               | The port inside the container. Change it and your published port mapping has to follow.                                                                                     |
| `LOG_LEVEL`                   | `info`               | `debug`, `info`, `warn`, or `error`. A refusal at startup is reported whatever it's set to, and so is the first-run setup code.                                             |
| `DATABASE_POOL_SIZE`          | `10`                 | Connections held open, per process. Ceiling 100.                                                                                                                            |
| `DIRECT_DATABASE_URL`         | `DATABASE_URL`       | A second connection string that bypasses a transaction pooler such as PgBouncer. Only needed when one sits in front. It also takes a `_FILE`.                               |
| `CSV_MAX_BYTES`               | `10485760`           | Largest CSV accepted for import, 10 MB. Ceiling 104857600.                                                                                                                  |
| `CSV_MAX_ROWS`                | `10000`              | Most rows accepted from one CSV. Ceiling 10000, the same number one mass edit, commit or delete covers.                                                                     |
| `RECURRENCE_SCHEDULER`        | `true`               | Whether this process runs the schedule: proposing recurring transactions and sending reminders. Turn it off only where another container runs it.                           |
| `RECURRENCE_TICK_SECONDS`     | `300`                | How often it looks for work that's come due. Ceiling 3600.                                                                                                                  |
| `RECURRENCE_CATCH_UP_LIMIT`   | `50`                 | Most occurrences one recurrence catches up in one tick. Ceiling 500.                                                                                                        |
| `RECURRENCE_CLAIM_LIMIT`      | `500`                | Most recurrences examined in one tick. Ceiling 5000.                                                                                                                        |
| `IDEMPOTENCY_RETENTION_HOURS` | `0`, meaning forever | How long a used idempotency key keeps replaying. Nothing prunes the stored responses unless you set it, and the pruning rides the scheduler's tick. Ceiling 8760, one year. |
| `METRICS_ENABLED`             | `false`              | Whether this process answers `GET /metrics` in Prometheus' text format. With it off there's no such route.                                                                  |
| `METRICS_TOKEN`               | unset                | A bearer token `GET /metrics` demands before it answers. Unset means anybody who can reach the port can scrape it. It also takes a `_FILE`.                                 |

The six with a ceiling and a default above zero (`DATABASE_POOL_SIZE`,
`CSV_MAX_BYTES`, `CSV_MAX_ROWS` and the three `RECURRENCE_` numbers) are each a
whole number between 1 and the ceiling shown. Anything else (a word, a zero, a
negative, a number past the ceiling) warns at startup, names the variable and
the value, and uses the default. `IDEMPOTENCY_RETENTION_HOURS` is the one where
zero is a real answer: it takes 0 up to its ceiling, and an unreadable value
warns and keeps everything rather than pruning on a typo.

Every `true` or `false` setting accepts those two words and nothing else, and
anything else refuses to start, because a misspelling would otherwise read as
the default with no symptom at all. `PORT` has to be a whole number from 1 to
65535 and `LOG_LEVEL` one of its four words, or the server refuses to start.

Running the app split into separate containers, under Kubernetes or Compose,
adds settings of its own for the nginx frontend container. Four of them arrive
in 0.2.0:

- `SB_BILLING_CONFIGURED` and `SB_ADS_CONFIGURED` have to agree with the
  server's Stripe and AdSense settings, because nginx decides the content
  security policy those pages arrive with.
- `SB_CSP_REPORT_ONLY` goes on the frontend as well as the server when a split
  deployment rehearses the plan and billing tab's policy.
- `SB_TRUSTED_PROXY_CIDR` decides whose word nginx takes for a visitor's
  address. When something terminates TLS in front of nginx, it has to name that
  terminator's range, or the server counts every visitor against one
  allowance, even with [`TRUST_PROXY`](#behind-a-proxy) on.

The application's reference covers all of them, along with what the containers
have to agree about.

## Secrets from files

Seven variables also answer to a `NAME_FILE` form, naming a file whose contents
are the value: `AUTH_SECRET`, `DATABASE_URL`, `DIRECT_DATABASE_URL`,
`SMTP_PASSWORD`, `GOOGLE_CLIENT_SECRET`, `SETUP_TOKEN` and `METRICS_TOKEN`.
From 0.2.0 on, `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` do too, which
makes nine; the 0.1.6 image ignores `STRIPE_SECRET_KEY_FILE` and
`STRIPE_WEBHOOK_SECRET_FILE`. Having the form is what makes a name a secret
here, so nothing else takes one. That's what container orchestrators mount:

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

Set one or the other, never both. Both set warns and uses `NAME`, naming the
file it's ignoring. One trailing newline is stripped and nothing more. A file
that's empty, or that the process can't read, refuses to start, and that
includes `SMTP_PASSWORD_FILE`: a mail secret the server can't read stops the
whole server, not only the mail.
