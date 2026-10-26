---
title: Deploying with Docker Compose
description: Run Simple Balance with Docker Compose on Linux machines you already have, with Caddy for HTTPS, systemd to start it on boot, and a nightly backup.
section: Self-hosting
order: 2
updated: 2026-10-26
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
git clone --depth 1 --branch v0.2.1 https://github.com/thtmnisamnstr/simple-balance.git
cd simple-balance
```

Every command below runs from that folder.

## 1. The database

### A database you already have

You need its connection string, for the role Simple Balance will use. If the
database it names doesn't exist yet, it's created on the first start, as long
as that role has `CREATEDB`. Connect over TLS and have the app check the
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
sudo cp deploy/compose/single/{compose.postgres.yml,pg_hba.conf,db-init.sh} /opt/simple-balance/
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
sudo cp deploy/compose/single/{compose.yml,compose.caddy.yml,compose.db-tls.yml,Caddyfile} /opt/simple-balance/
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

To restore one, on the app machine:

```sh
sudo /usr/local/bin/simple-balance-restore /var/backups/simple-balance/simple-balance-20260914T031500Z.dump
```

It asks you to type `RESTORE`, because it replaces everything in the database
with the backup. It stops the app, restores, and starts the app again.
[Backups](/docs/backups/) has more on checking that a backup is one you could
use.

## Upgrading

`compose.yml` runs the pinned release image, which is 0.2.1. To move to a
newer release, back up, change the version in the `image:` line, and restart:

```sh
sudo systemctl start simple-balance-backup.service
sudo nano /opt/simple-balance/compose.yml
sudo docker compose -f /opt/simple-balance/compose.yml pull
sudo systemctl restart simple-balance
```

The new release upgrades the database when it starts. Never run two versions
against one database. To go back, put the old version back in `compose.yml`
and restore the backup you took before upgrading.

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
