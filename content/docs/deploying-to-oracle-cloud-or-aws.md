---
title: Deploying to Oracle Cloud or AWS
description: Let a Pulumi program build Simple Balance's machines, network, secrets and nightly backups on Oracle Cloud or AWS, then point a DNS name at it and sign in.
section: Self-hosting
order: 3
updated: 2026-11-04
---

Simple Balance ships two Pulumi programs, `oci-single` for Oracle Cloud and
`aws-single` for AWS, that build the project's `single` shape for you. One
command creates:

- an app machine with a public address, running Simple Balance behind Caddy,
  which gets and renews the HTTPS certificate,
- a database machine running PostgreSQL 18, with no public address,
- the network and firewall rules between them, with only ports 80 and 443 open
  to the internet,
- a data disk on each machine, protected from being deleted by accident,
- the cloud's own secret store for your settings, and
- a backup of the database every night.

You don't need to make a secret or a database first. The program makes the
database's password when you run it, and the app machine makes the app's own
secret the first time it starts. The
[Pulumi README](https://github.com/thtmnisamnstr/simple-balance/blob/main/deploy/pulumi/README.md)
goes into more depth than this page.

## What it costs

These are the application's own estimates, at US list prices in September
2026, from its
[cost notes](https://github.com/thtmnisamnstr/simple-balance/blob/main/docs/deployment-costs.md).
Treat them as a guide, not a quote.

| `size`   | AWS                | Oracle Cloud, after the Always Free allowance |
| -------- | ------------------ | --------------------------------------------- |
| `small`  | about $96 a month  | about $14 a month                             |
| `medium` | about $204 a month | about $40 a month                             |
| `large`  | about $382 a month | about $102 a month                            |

`small` is the default. Using a database you already run instead of the
database machine costs less, and is covered
[below](#a-database-you-already-have).

## What you need

- The [Pulumi CLI](https://www.pulumi.com/docs/install/), signed
  in somewhere to keep its state. `pulumi login` uses Pulumi Cloud, and
  `pulumi login --local` keeps it on your own computer.
- Node.js 20 or later.
- A DNS name you can point at a new address, such as `books.example.com`.
- **For AWS:** credentials the AWS tools can find, such as from
  `aws configure`, and the `aws` command with its Session Manager plugin, which
  is how you reach the machine.
- **For Oracle Cloud:** a tenancy, a compartment other than the root one, an
  API signing key set up with `oci setup config`, and an SSH key pair. If your
  user isn't an administrator, the README lists the policies it needs.

Then get the programs:

```sh
git clone --depth 1 --branch v0.2.2 https://github.com/thtmnisamnstr/simple-balance.git
cd simple-balance/deploy/pulumi
npm install
```

## Build it

**On AWS:**

```sh
pulumi -C aws-single stack init books
pulumi -C aws-single config set aws:region us-west-2
pulumi -C aws-single config set simple-balance:hostname books.example.com
pulumi -C aws-single up
```

**On Oracle Cloud:**

```sh
pulumi -C oci-single stack init books
pulumi -C oci-single config set oci:region us-ashburn-1
pulumi -C oci-single config set simple-balance:compartmentOcid ocid1.compartment.oc1..xxxx
pulumi -C oci-single config set simple-balance:hostname books.example.com
pulumi -C oci-single config set simple-balance:sshPublicKey "$(cat ~/.ssh/id_ed25519.pub)"
pulumi -C oci-single up
```

Use your home region on Oracle Cloud if you want the Always Free allowance.
Two things can go wrong there on the first try. If `up` stops while it waits
for the new vault's address to appear in DNS, wait a few minutes and run
`pulumi up` again: the vault is kept, and it picks up where it stopped. If it
stops with `Out of host capacity`, Oracle has no free machines in that zone
just then. In a region with more than one availability domain, set
`simple-balance:availabilityDomain` to another and try again.

A few settings are worth knowing before the first `up`:

| Setting                        | What it does                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `simple-balance:size`          | `small`, `medium` or `large`. The default is `small`.                              |
| `simple-balance:allowedEmails` | Who may sign up besides you. Empty by default, which admits nobody else.           |
| `simple-balance:acmeEmail`     | Where Let's Encrypt writes if something goes wrong with the certificate.           |
| `simple-balance:sshCidr`       | One address range allowed to reach the app machine over SSH. Needs `sshPublicKey`. |
| `simple-balance:timezone`      | The machines' timezone. `Etc/UTC` by default.                                      |
| `simple-balance:backupKeep`    | How many nightly backups to keep. 14 by default.                                   |

## After it's built

1. **Point your DNS name at it.** Add an A record from your `hostname` to the
   address `pulumi -C aws-single stack output publicIp` prints (or
   `oci-single`). Caddy gets the certificate once the name resolves, and keeps
   trying until then. On AWS the address stays the same if the machine is
   replaced. On Oracle Cloud a replaced machine gets a new address, and the
   record has to follow it.
2. **Reach the machine.** On AWS, the `shell` output is the
   `aws ssm start-session` command to run. On Oracle Cloud, use the Bastion
   steps in the README, or set `sshCidr` and run `ssh ubuntu@` followed by the
   public address. Then wait for setup to finish:
   `sudo cloud-init status --wait`. The app machine is ready in about a minute
   and a half, and the database machine about four minutes after that.
3. **Claim the first account.** Read the setup code from the log, open your
   address and create the account with it:

   ```sh
   sudo docker compose -f /opt/simple-balance/compose.yml logs app | grep -i setup
   ```

   If you set `allowedEmails` to `*`, there's no code, and anybody can sign up.
   [The first account](/docs/self-hosting/#the-first-account) says more.

`pulumi -C aws-single stack output nextSteps` (or `oci-single`) prints these
steps for your stack, with its own names filled in.

## Changing a setting

On these machines, settings live in the stack, and the program keeps them in
the cloud's own secret store, so nothing gets typed into a file on the
machine. Set them and apply them, and the machine picks them up within five and
a half minutes: it checks every five, plus up to 30 seconds. Mail is the one most worth adding first, because without it nobody
can reset a forgotten password:

```sh
pulumi -C aws-single config set --path 'simple-balance:env.SMTP_HOST' smtp.example.com
pulumi -C aws-single config set --path 'simple-balance:env.SMTP_USERNAME' books@example.com
pulumi -C aws-single config set --secret --path 'simple-balance:secrets.SMTP_PASSWORD'
pulumi -C aws-single config set --path 'simple-balance:env.MAIL_FROM' 'Simple Balance <books@example.com>'
pulumi -C aws-single up
```

Use `oci-single` on Oracle Cloud. The third line names a secret and no value,
so Pulumi asks for it, which keeps it out of your shell history.

**Set everything a feature needs before you run `up`.** The machine applies
the change and restarts the app by itself, and a server given half of a
feature's settings refuses to start: billing, for instance, needs all five
of its Stripe settings at once. If it has stopped that way, the check won't
start it again, because it restarts only an app that's running: after the `up`
that sets the rest, run `sudo systemctl restart simple-balance` on the app
machine. Anything under `env` is stored as plain
text in the stack's file, and anything under `secrets` is encrypted. To apply
a change at once rather than at the next check, run
`sudo systemctl start simple-balance-settings` on the app machine.

A few settings come from the stack itself and can't be set this way:
`APP_BASE_URL` comes from `hostname`, `ALLOWED_EMAILS` from `allowedEmails`,
Caddy sets `TRUST_PROXY`, `NODE_ENV` and `PORT` are fixed, and with a database
machine of its own the program sets `SB_METRICS_DATABASE_TARGET`. The stack
accepts `CSV_MAX_BYTES`, `CSV_MAX_ROWS`, the three `RECURRENCE_` numbers and
`RECURRENCE_SCHEDULER`, but they change nothing: the machine's `compose.yml`
fixes the first five at their defaults and doesn't pass the last.
[Configuration](/docs/configuration/) lists everything else the server reads.

## A database you already have

Set `simple-balance:databaseNode` to `false` before the first `up`, and you
get only the app machine. It's installed but waits, with a message saying so
when you sign in to it, until the stack has a connection string. If your
database's certificate comes from its own authority, put that certificate on
the machine first:

```sh
sudo install -m 0644 ca.pem /var/lib/simple-balance/tls/db-ca.pem
```

Then, where you run Pulumi:

```sh
pulumi -C aws-single config set --secret --path 'simple-balance:secrets.DATABASE_URL' \
  'postgresql://user:password@host:5432/simple_balance?sslmode=verify-full&sslrootcert=/var/lib/simple-balance/tls/db-ca.pem'
pulumi -C aws-single up
```

And on the machine again, once that has finished:

```sh
sudo /usr/local/sbin/simple-balance-firstboot
```

Write any unusual character in the password the way a URL would, such as
`%40` for `@`. A single quote isn't accepted.

## Backups

The app machine backs the database up every night to
`/var/lib/simple-balance/backups`, on its own data disk, and keeps the newest
`backupKeep`. To take one now:

```sh
sudo systemctl start simple-balance-backup
```

Those backups survive the machine being replaced, because its data disk does,
but not `pulumi destroy`, which deletes the disk, so copy them somewhere else.

To restore one, the app machine has `simple-balance-restore`. It checks that
the backup can be read before it changes anything, and asks you to type
`RESTORE`, because it replaces everything in the database with the backup.
Then it stops the app, empties the database, restores the backup into it, and
starts the app again, which runs any migration the backup predates.

<Callout kind="danger" title="On 0.2.2, the restore stops halfway">
The database is always on another machine here, so the script empties only its
`public` schema. A backup also holds the `drizzle` schema, where the app
records which migrations have run, and the script leaves that one in place, so
the restore fails when it tries to create it again. That leaves the app stopped
and `public` empty. Until a release fixes it, don't run it.
</Callout>

With [a database you already have](#a-database-you-already-have), restore into
a new database as [Backups](/docs/backups/#restoring-one) describes, and point
the stack's `DATABASE_URL` at it. A database machine the stack built has no
restore script of its own, and admits the app's role to the `simple_balance`
database alone, a role that can't create another, so on 0.2.2 neither way
works there.

## Exporting metrics

From 0.2.2 the stack can send the app's figures and its machines' to one
backend, such as New Relic, through an OpenTelemetry Collector on the app
machine. Machines built before 0.2.2 need that release's files first, under
[Machines built before 0.2.2](#machines-built-before-022). It's off until the
stack has an endpoint:

```sh
pulumi -C aws-single config set --path 'simple-balance:env.SB_METRICS_EXPORT_ENDPOINT' https://otlp.nr-data.net
pulumi -C aws-single config set --secret --path 'simple-balance:secrets.SB_METRICS_EXPORT_HEADERS'
pulumi -C aws-single preview
pulumi -C aws-single up
```

Use `oci-single` on Oracle Cloud. At the second line's prompt, type the
backend's credential as JSON, such as
`{"api-key":"<your New Relic ingest license key>"}`. The preview shows a new
version of the settings secret, no machine replaced, and with a database
machine of the stack's own, one new firewall rule: port 9100 into it from the
app machine alone. Within about five minutes the app machine restarts onto the
collector, which it turns on from the endpoint along with `METRICS_ENABLED`,
and the program names the database machine for it to scrape.
[Exporting metrics](/docs/configuration/#exporting-metrics) lists the other
settings, for another backend or another interval.

The collector scrapes the app's `/metrics`, the machines' CPU, memory, load,
disks and network through node-exporter, and itself. It doesn't scrape Caddy
or PostgreSQL: the app already counts every request that reaches it, and its
connection pool is its view of the database. Nothing it runs publishes a port
on the app machine or keeps anything on disk, and Caddy answers `/metrics` with
a 404, so the numbers never leave through the site's own address. It's a
collector beside the app, rather than something the app does itself, because
the app only serves its figures in Prometheus' text format, and the collector
is what speaks OTLP or remote write to a backend. Doing the same job it
measured lighter than Prometheus in agent mode, about 52 MiB of memory against
72, and it fits on the app machine you already have.

**A database machine made before the stack exported needs its half by hand.**
The program turns node-exporter on in a database machine only when the stack is
already exporting the day the machine is made. On one made before, over the
shell the
[Pulumi README](https://github.com/thtmnisamnstr/simple-balance/blob/main/deploy/pulumi/README.md#the-database-these-programs-build)
describes for it:

```sh
echo COMPOSE_PROFILES=metrics | sudo tee -a /opt/simple-balance/env.base
sudo sh -c 'iptables -I INPUT 1 -p tcp --dport 9100 -j ACCEPT && netfilter-persistent save'
sudo /usr/local/sbin/simple-balance-db-firstboot
```

The second line is for Oracle Cloud alone, whose image keeps a host firewall
the security list doesn't reach. The last copies the certificate and key for
node-exporter and restarts the deployment, PostgreSQL included, for a few
seconds.

**To turn it off, take the endpoint out.** Run
`pulumi -C aws-single config rm --path 'simple-balance:env.SB_METRICS_EXPORT_ENDPOINT'`
and `up`, and the app machine drops the collector at the restart that follows.

## Upgrading

The programs deploy the pinned release image, which is 0.2.2. A machine that's
already running moves to a new release on the machine itself, not from another
`pulumi up`. Back up, change the version in the `image:` line, and restart:

```sh
sudo systemctl start simple-balance-backup
sudo nano /opt/simple-balance/compose.yml
sudo docker compose -f /opt/simple-balance/compose.yml pull
sudo systemctl restart simple-balance
```

Changing `size` to a larger one and running `pulumi up` resizes the machines
in place, with a restart. Neither cloud shrinks a disk, so a size can only go
up.

### Machines built before 0.2.2

A machine keeps the files it was first set up with, and the `image:` line moves only
the app. Run `pulumi` from a checkout of 0.2.2 from now on, because an older
one refuses `SB_HOUSE_AD` and the metrics settings as settings it doesn't know.
Then, on the app machine, copy these files from that checkout instead of
editing `compose.yml`, whose new copy already names the 0.2.2 image. If the
stack sets `imageRepository` or `imageTag`, that copy names the public image
instead of yours, so keep the `image:` line the machine's own `compose.yml`
has:

| From the checkout                                                                           | To                                           | Mode   |
| ------------------------------------------------------------------------------------------- | -------------------------------------------- | ------ |
| `deploy/compose/single/compose.yml`, `compose.db-tls.yml`, `Caddyfile` and `collector.yaml` | `/opt/simple-balance/`                       | `0644` |
| `deploy/systemd/simple-balance-env`                                                         | `/usr/local/sbin/simple-balance-env`         | `0700` |
| `deploy/systemd/simple-balance.service`                                                     | `/etc/systemd/system/simple-balance.service` | `0644` |

```sh
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

These machines already keep `.env` readable by its owner alone, so there's
nothing to change there.

**Before you export metrics, keep the exporters off the metadata address.** Do
it on both machines. The collector and node-exporter share the machine's network,
where the instance metadata address answers with the machine's own identity,
which on the app machine reads every secret in the stack. Machines built on
0.2.2 refuse it to the users they run as, and one built before needs the rule
by hand. On AWS it lasts until the machine reboots, so keep it the way the
machine keeps its firewall, or add it again after a reboot:

```sh
sudo iptables -I OUTPUT -d 169.254.169.254 -m owner --uid-owner 10000-65534 -j REJECT
```

On Oracle Cloud, save it with the firewall the image keeps, once on each
machine, because a second run saves a second copy:

```sh
sudo sh -c 'iptables -I OUTPUT -d 169.254.169.254 -m owner --uid-owner 10000-65534 -j REJECT && netfilter-persistent save'
```

The database machine, for metrics, also takes this release's
`compose.postgres.yml` and `node-exporter-web.yml` in `/opt/simple-balance/`,
`simple-balance-db-firstboot` in `/usr/local/sbin/` at `0700` and the unit,
then `sudo systemctl daemon-reload` and the steps under
[Exporting metrics](#exporting-metrics). The application's
[upgrade notes](https://github.com/thtmnisamnstr/simple-balance/blob/main/docs/upgrades.md#before-you-upgrade-to-022)
have checks to run on Oracle Cloud once the rule is in.

## Tearing it down

The data disks are protected, so `pulumi destroy` on its own fails.
Copy your backups off first, or take a snapshot of both disks, then:

```sh
pulumi -C aws-single config set simple-balance:protectDataVolume false
pulumi -C aws-single up
pulumi -C aws-single destroy
```

Use `oci-single` on Oracle Cloud, where the vault then waits between 7 and 30
days before it's deleted for good.
