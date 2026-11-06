---
title: Deploying with Docker Compose
description: Run Simple Balance with Docker Compose on Linux machines you already have, with Caddy for HTTPS, systemd to start it on boot, and a nightly backup.
section: Self-hosting
order: 2
updated: 2026-11-04
---

This guide sets up Simple Balance with Docker Compose by hand, in the
project's `single` shape. At the end you have one machine running the app
behind Caddy, which gets and renews the HTTPS certificate, a PostgreSQL that
isn't reachable from the internet, and a backup every night. systemd starts it
all after a reboot.

It uses the files in the application's
[`deploy/compose/single`](https://github.com/thtmnisamnstr/simple-balance/tree/main/deploy/compose/single)
and [`deploy/systemd`](https://github.com/thtmnisamnstr/simple-balance/tree/main/deploy/systemd)
folders. The
[Compose README](https://github.com/thtmnisamnstr/simple-balance/blob/main/deploy/compose/single/README.md)
and the comments at the top of
[`simple-balance.service`](https://github.com/thtmnisamnstr/simple-balance/blob/main/deploy/systemd/simple-balance.service)
go into more depth. If you'd rather have the machines
built for you, [Deploying to Oracle Cloud or AWS](/docs/deploying-to-oracle-cloud-or-aws/)
does all of this with one command.

## What you need

- **An app machine** running Linux, with Docker, Docker Compose v2 (the
  `docker compose` command) and systemd. Open ports 80, 443 and 443/udp to
  the internet, SSH only to your own address if at all, and nothing else.
  Never open port 3000.
- **A DNS name** pointing at the app machine, such as `books.example.com`. Set
  it up first: Caddy can't get a certificate until the name resolves.
- **A PostgreSQL database**, 15 or later. It can be a managed database or one
  you already run, or you can set one up on a second machine below. It
  shouldn't be on the app machine: these files are written to keep the two
  apart.
- **The application's files** on each machine you set up:

```sh
git clone --depth 1 --branch v0.2.2 https://github.com/thtmnisamnstr/simple-balance.git
cd simple-balance
```

Every command below runs from that folder.

## 1. The database

### A database you already have

You need its connection string, for the role Simple Balance will use. If the
database it names doesn't exist yet, it's created on the first start, as long
as that role has `CREATEDB` and can connect to the server's `postgres`
database. Connect over TLS and have the app check the
server's certificate:

```text
postgresql://user:password@db.example.com:5432/simple_balance?sslmode=verify-full&sslrootcert=/var/lib/simple-balance/tls/db-ca.pem
```

If the database's certificate comes from a public authority, leave out
`&sslrootcert=…`. If your provider gives you its own authority's certificate
instead, save it as `ca.pem` for step 2. For Amazon RDS, that's:

```sh
curl -fsSo ca.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

Use `verify-full` as shown. The app reads `require` and `verify-ca` the same
way, but `require` without the certificate file fails against a private
authority, and the nightly backup, which uses PostgreSQL's own tools, checks
less with either.

### PostgreSQL on a second machine

This runs PostgreSQL 18 in a container on a machine of its own. Give it a
private address the app machine can reach, and a hostname for that address in
DNS, such as `db.example.internal` in a private zone or your provider's
internal DNS. An entry in the app machine's `/etc/hosts` isn't enough, because
the app runs in a container that doesn't read it. Open port 5432 to the app machine and
to nothing else. The database accepts TLS connections from any address, so
the firewall is what keeps it private.

**Make its certificate.** The app checks that the database's certificate names
the hostname it connects to, so you need a small certificate authority of
your own. On your own computer, with `db.example.internal` replaced by the
database machine's hostname:

```sh
openssl req -x509 -new -nodes -newkey rsa:2048 -days 3650 \
  -subj "/CN=Simple Balance database CA" -keyout ca.key -out ca.pem \
  -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,keyCertSign,cRLSign"
openssl req -new -nodes -newkey rsa:2048 \
  -subj "/CN=db.example.internal" -keyout server.key -out server.csr
printf 'subjectAltName=DNS:db.example.internal\n' > server.ext
openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial \
  -days 825 -extfile server.ext -out server.crt
```

`server.crt` and `server.key` go to the database machine, `ca.pem` goes to the
app machine, and `ca.key` stays somewhere safe that is neither of them.

**Install it.** On the database machine, with `server.crt` and `server.key` in
the `simple-balance` folder:

```sh
sudo cp deploy/systemd/simple-balance.service /etc/systemd/system/
sudo cp deploy/systemd/simple-balance.env /etc/default/simple-balance
sudo sed -i 's/^COMPOSE_FILE=.*/COMPOSE_FILE=compose.postgres.yml/' /etc/default/simple-balance
sudo install -d -m 0755 /opt/simple-balance
sudo cp deploy/compose/single/{compose.postgres.yml,pg_hba.conf,db-init.sh,node-exporter-web.yml} /opt/simple-balance/
sudo install -d -m 0755 /opt/simple-balance/db-tls
sudo install -m 0644 server.crt /opt/simple-balance/db-tls/server.crt
sudo install -m 0600 -o 999 -g 999 server.key /opt/simple-balance/db-tls/server.key
sudo install -d -m 0700 -o 999 -g 999 /var/lib/simple-balance/postgresql
sudo install -m 0600 deploy/compose/single/.env.postgres.example /opt/simple-balance/.env
sudo install -m 0755 deploy/systemd/simple-balance-waitdb /usr/local/sbin/
```

Then edit `/opt/simple-balance/.env`:

| Setting                 | What to put                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `SB_BIND_ADDRESS`       | The machine's private address. Never `0.0.0.0`.                                                    |
| `POSTGRES_PASSWORD`     | A password for PostgreSQL's own administrator, which can't sign in over the network.               |
| `POSTGRES_APP_PASSWORD` | The password Simple Balance will use. Letters and digits only, for example from the command below. |

```sh
openssl rand -base64 48 | tr -d '\n/+=' | cut -c1-48
```

Start it, and it starts again after every reboot:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now simple-balance.service
```

It creates a role and a database, both named `simple_balance`. The app's
connection string is then:

```text
postgresql://simple_balance:POSTGRES_APP_PASSWORD@db.example.internal:5432/simple_balance?sslmode=verify-full&sslrootcert=/var/lib/simple-balance/tls/db-ca.pem
```

## 2. The app machine

Copy the files into place:

```sh
sudo cp deploy/systemd/*.service deploy/systemd/*.timer /etc/systemd/system/
sudo cp deploy/systemd/simple-balance.env /etc/default/simple-balance
sudo install -d -m 0755 /opt/simple-balance
sudo cp deploy/compose/single/{compose.yml,compose.caddy.yml,compose.db-tls.yml,Caddyfile,collector.yaml} /opt/simple-balance/
sudo install -m 0600 deploy/compose/single/.env.example /opt/simple-balance/.env
sudo install -m 0755 deploy/systemd/simple-balance-waitdb /usr/local/sbin/
sudo install -m 0755 deploy/systemd/simple-balance-backup /usr/local/bin/
sudo install -m 0755 deploy/systemd/simple-balance-restore /usr/local/bin/
```

If your connection string names a `sslrootcert` file, put `ca.pem` where it
points:

```sh
sudo install -d -m 0755 /var/lib/simple-balance/tls
sudo install -m 0644 ca.pem /var/lib/simple-balance/tls/db-ca.pem
```

Then, in `/etc/default/simple-balance`, add `compose.db-tls.yml` to the list
of files, so the app can read it:

```sh
COMPOSE_FILE=compose.yml:compose.caddy.yml:compose.db-tls.yml
```

Now edit `/opt/simple-balance/.env`:

| Setting        | What to put                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | The connection string from step 1.                                                                |
| `AUTH_SECRET`  | A long random string from `openssl rand -base64 32`. Keep it: changing it signs everybody out.    |
| `APP_BASE_URL` | Your address, such as `https://books.example.com`, with no path and no slash at the end.          |
| `SITE_ADDRESS` | The same name without `https://`, such as `books.example.com`. Caddy gets its certificate for it. |
| `ACME_EMAIL`   | Optional. Where Let's Encrypt writes if something goes wrong with the certificate.                |

Compose reads this file and treats `$` as the start of a variable, so put a
value containing `$` in single quotes, and never use double quotes. Leave
`TRUST_PROXY` alone: `compose.caddy.yml` sets it.

Start it, with the nightly backup:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now simple-balance.service simple-balance-backup.timer
```

The first start sets up the database before the app answers, which can take
a few minutes, and the command waits for it. Once the app is up, Caddy asks
Let's Encrypt for a certificate over port 80, and keeps trying until your DNS
name resolves. It keeps the certificate in a Docker volume called
`simple-balance_caddy-data`.
Don't delete it: Let's Encrypt issues only five certificates for one name in
a week.

To see how it's doing:

```sh
sudo docker compose -f /opt/simple-balance/compose.yml logs -f app
curl -fsS http://127.0.0.1:3000/health/ready
```

## 3. The first account

Read the setup code from the log:

```sh
sudo docker compose -f /opt/simple-balance/compose.yml logs app | grep -i setup
```

Open your address and create the first account with it.
[The first account](/docs/self-hosting/#the-first-account) says how the code
works, and how to let other people sign up after you.

## Changing a setting

Settings live in `/opt/simple-balance/.env`. Edit it and restart:

```sh
sudo systemctl restart simple-balance
```

[Configuration](/docs/configuration/) lists every setting. Mail is the one
most worth adding next, because without it nobody can reset a forgotten
password.

`compose.yml` decides which of them reach the app, and a few don't. It fixes
`NODE_ENV`, `PORT`, `CSV_MAX_BYTES`, `CSV_MAX_ROWS` and the three `RECURRENCE_`
numbers, and passes neither `RECURRENCE_SCHEDULER` nor any `_FILE` form, so
setting one of those in `.env` changes nothing.

## Backups

The timer you turned on backs the database up every night between 03:15 and
03:45, checks that each backup can be read before keeping it, and keeps the newest
14 in `/var/backups/simple-balance`. `SB_BACKUP_DIR` and `SB_BACKUP_KEEP` in
`/etc/default/simple-balance` change where and how many.

A backup on the app machine goes with the app machine, so copy them somewhere
else. To take one now, or see when the next one runs:

```sh
sudo systemctl start simple-balance-backup.service
systemctl list-timers simple-balance-backup.timer
```

To restore one, step 2 installed `simple-balance-restore`. It checks that the
backup can be read before it changes anything, and asks you to type `RESTORE`,
because it replaces everything in the database with the backup. Then it stops
the app, empties the database, restores the backup into it, and starts the app
again, which runs any migration the backup predates.

<Callout kind="danger" title="On 0.2.2, a restore on the app machine stops halfway">
With this guide's files the app machine has no database of its own, so there
the script empties only the database's `public` schema. A backup also holds the `drizzle` schema,
where the app records which migrations have run, and the script leaves that
one in place, so the restore fails when it tries to create it again. That
leaves the app stopped and `public` empty. Until a release fixes it, don't run
it on the app machine.
</Callout>

**With PostgreSQL on a second machine**, run it on that machine instead, where
it drops and recreates the whole database. Copy the backup to your home folder
there, then from the `simple-balance` folder:

```sh
sudo install -m 0755 deploy/systemd/simple-balance-restore /usr/local/bin/
sudo /usr/local/bin/simple-balance-restore ~/simple-balance-20260914T031500Z.dump
```

Give it the backup's full path, as `~/` does, because it reads the file from
inside `/opt/simple-balance`. It can't stop the app from there, so it asks you to, with
`sudo systemctl stop simple-balance` on the app machine, and once it's done,
start it again there with `sudo systemctl start simple-balance`.

**With a database you already have**, restore into a new database as
[Backups](/docs/backups/#restoring-one) describes, then point `DATABASE_URL` in
`/opt/simple-balance/.env` at it and restart.

[Backups](/docs/backups/) has more on checking that a backup is one you could
use.

## Exporting metrics

From 0.2.2 the app machine can run two more containers, off until you ask for
them: an OpenTelemetry Collector and node-exporter. The collector scrapes the
app's `/metrics`, this machine's CPU, memory, load, disks and network through
node-exporter, the database machine's node-exporter if you name it, and itself,
and sends all of it to one backend, such as New Relic, over OTLP or Prometheus
remote write. Both listen on `127.0.0.1` alone and keep nothing on disk, and
Caddy answers `/metrics` with a 404, so the numbers never leave through the
site's own address.

It's a collector beside the app, rather than something the app does itself,
because the app only serves its figures in Prometheus' text format, and the
collector is what speaks to a backend. Doing the same job it measured lighter
than Prometheus in agent mode, about 52 MiB of memory against 72. It doesn't
scrape Caddy or PostgreSQL: the app already counts every request that reaches
it, and its connection pool is its view of the database.

To turn it on, add these lines to `/opt/simple-balance/.env`, with your own
key, then restart and check the collector's health:

```sh
COMPOSE_PROFILES=metrics
METRICS_ENABLED=true
SB_METRICS_EXPORT_ENDPOINT=https://otlp.nr-data.net
SB_METRICS_EXPORT_HEADERS='{"api-key":"<your New Relic ingest license key>"}'
```

```sh
sudo systemctl restart simple-balance
curl -fsS 127.0.0.1:13133
```

`METRICS_ENABLED` has to be there as well as the endpoint. Without it the
collector sends this machine's figures and none of the app's.
[Exporting metrics](/docs/configuration/#exporting-metrics) lists the other
settings, for another backend or another interval.

**On an AWS or Oracle Cloud machine, keep them off the metadata address
first.** The collector and node-exporter share the machine's network, where the
instance metadata address answers with the machine's own identity. Refuse it to
the users they run as, on both machines, and keep the rule the way the machine
keeps its firewall, which on Oracle's image is `sudo netfilter-persistent save`
after it:

```sh
sudo iptables -I OUTPUT -d 169.254.169.254 -m owner --uid-owner 10000-65534 -j REJECT
```

**To watch the database machine too, give it a node-exporter.** It runs beside
PostgreSQL, on the machine's private address at port 9100, serving TLS with the
database's own certificate. Open 9100 to the app machine and to nothing else,
then on the database machine make its copy of the certificate and key, turn its
profile on, and start it:

```sh
sudo install -d -m 0700 -o 61000 -g 61000 /opt/simple-balance/node-exporter-tls
sudo install -m 0644 /opt/simple-balance/db-tls/server.crt /opt/simple-balance/node-exporter-tls/server.crt
sudo install -m 0600 -o 61000 -g 61000 /opt/simple-balance/db-tls/server.key /opt/simple-balance/node-exporter-tls/server.key
echo COMPOSE_PROFILES=metrics | sudo tee -a /opt/simple-balance/.env
sudo docker compose -f /opt/simple-balance/compose.postgres.yml up -d --wait
```

That starts node-exporter and leaves PostgreSQL running. Then on the app
machine, name it in `.env` by the hostname its certificate carries, and
restart:

```sh
SB_METRICS_DATABASE_TARGET=db.example.internal:9100
```

The collector checks that certificate against the same `ca.pem` the app uses,
so it needs `compose.db-tls.yml` in the list from step 2.

**To turn it off, stop before you edit.** Stop the deployment, take the lines
out of `.env`, then start it. Stopping with the profile still in `.env` is
what takes the collector down with everything else; a restart after the edit
leaves it running. On the database machine it's
`sudo docker compose -f /opt/simple-balance/compose.postgres.yml rm --stop --force node-exporter`
and then the line removed, never a `down`, which takes PostgreSQL with it.

## Upgrading

`compose.yml` runs the pinned release image, which is 0.2.2. To move to a
newer release, back up, change the version in the `image:` line, and restart:

```sh
sudo systemctl start simple-balance-backup.service
sudo nano /opt/simple-balance/compose.yml
sudo docker compose -f /opt/simple-balance/compose.yml pull
sudo systemctl restart simple-balance
```

The new release upgrades the database when it starts. Never run two versions
against one database. To go back, put the old version back in `compose.yml`
and restore the backup you took before upgrading, the way [Backups](#backups)
says.

### Machines set up before 0.2.2

A machine keeps the files it was set up with, and the `image:` line moves only
the app. To bring one set up on an earlier release to 0.2.2, copy this
release's files from a checkout of it instead of editing that line, because its
`compose.yml` already names the 0.2.2 image. On the app machine, after the
backup:

```sh
sudo cp deploy/compose/single/{compose.yml,compose.db-tls.yml,Caddyfile,collector.yaml} /opt/simple-balance/
sudo cp deploy/systemd/simple-balance.service /etc/systemd/system/
sudo chmod 0600 /opt/simple-balance/.env
sudo systemctl daemon-reload
sudo docker compose -f /opt/simple-balance/compose.yml pull
sudo systemctl restart simple-balance
```

- **`compose.yml` names every setting the app is given.** A setting it doesn't
  name never reaches the app, without a word, and an older one doesn't name
  `SB_HOUSE_AD` or `SB_OPENAI_APPS_CHALLENGE`.
- **The `Caddyfile` answers `/metrics` with a 404.** An older one passes it to
  the app, which with `METRICS_ENABLED` on and no `METRICS_TOKEN` shows the
  numbers to anybody.
- **The unit starts the app and Caddy before the metrics collector.** They come
  up on their own first, so an image that can't be pulled costs the metrics and
  not the site.
- **`.env` is readable by its owner alone.** It holds the passwords, so run the
  same `chmod` on the database machine.

If you lowered `MAX_BODY_SIZE` in `.env`, raise it to `52MiB` or more, or Caddy
can refuse adding or moving a large Simple Balance file. If something outside the
machine checks the app's health at a path under `/health/` other than
`/health/live` or `/health/ready`, fix it first: from 0.2.2 such a path answers
a 404. Bare `/health` and `/health/` keep answering, as liveness.

On the database machine nothing else changes unless you
[export metrics](#exporting-metrics), which needs this release's files there
first:

```sh
sudo cp deploy/compose/single/{compose.postgres.yml,node-exporter-web.yml} /opt/simple-balance/
sudo cp deploy/systemd/simple-balance.service /etc/systemd/system/
sudo systemctl daemon-reload
```

## Your own proxy instead of Caddy

If something else already handles HTTPS, such as nginx or a cloud load
balancer, drop `compose.caddy.yml` from the list in
`/etc/default/simple-balance`, and keep `compose.db-tls.yml` if you added it:

```sh
COMPOSE_FILE=compose.yml:compose.db-tls.yml
```

Then point your proxy at `127.0.0.1:3000`. The app listens only on this
machine unless you set `APP_BIND_ADDRESS`, which a proxy on another machine
needs. Set `TRUST_PROXY=true` in
`/opt/simple-balance/.env` once you know your proxy replaces the
`X-Forwarded-For` header rather than adding to it.
[Behind a proxy](/docs/configuration/#behind-a-proxy) says why, and what nginx
needs.

Your proxy also has to let request bodies of at least 52 MiB through, for
adding or moving a Simple Balance file, and should answer `/metrics` with a 404
rather than pass it on, as the Caddyfile does; Behind a proxy has both. If it
checks the app's health, point it at `/health/live` or `/health/ready`. From
0.2.2 a path the app doesn't serve under `/api`, `/mcp` or `/health` answers a
JSON 404 rather than the app's page, and bare `/health` or `/health/` answers
as liveness.

Every response the app sends from 0.2.2 carries `X-Robots-Tag: noindex`, and
its `/robots.txt` lets every crawler in to read it, so search engines leave
your copy out of their index. Pass both through, and don't serve a robots file
of your own in front of it.
