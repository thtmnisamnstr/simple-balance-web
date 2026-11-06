---
name: legal-review
description: Bring the privacy policy and terms back to true after something changes what data is handled, who handles it, or what the site sends. Use when adding a vendor, script, cookie, form or email, when production's configuration changes (the ad it serves, its mail, its backups), before changing the application's ads, or on a periodic review.
---

# Keep the legal pages true

A privacy policy is the one document on this site whose failure mode is not
embarrassment. A generic one is a false statement about what happens to
somebody's data; a stale one is the same thing with a date on it.

**Not legal advice, and the documents say so.** What this skill does is make
sure they describe what the software actually does, and carry the
disclosures somebody else's terms demand.

## When to run it

Any of these, and the first five are not optional:

- **A new processor.** Anything that now sees user data — a vendor, a host,
  an email provider, an error tracker.
- **A new script, cookie, embed or form.** Including one that only runs on
  one page.
- **Before changing anything about the application's ads**, and before any
  ad or ad script comes back to this site, which `AGENTS.md` has to permit
  first.
- **A change to production's configuration**, which no diff of this
  repository or of the application shows: the ad production serves, its mail
  host, how many backups it keeps and where they're copied, metrics export,
  how long it keeps the copies of its replies, and a move to another stack.
  §6's production read is where each one shows.
- **A new kind of email.** See §4; this is where the next change is coming.
- **An application release.** `sync-from-app` §6 runs this skill for one,
  and §6 here is the half that matters.
- **Every branch, from `merge-prep` §6**, where most runs end at §1 below,
  which after a sync judges only what changed since it.
- A periodic read, twice a year, because rot is silent.

## 1. What actually changed

Run the scope block in `merge-prep` §1. It fetches `main` first and diffs the
working tree against where the branch left it, and it says there why each
line is needed. When `merge-prep` called this skill, run the block again
rather than reusing the list it wrote: an upgrade or a fix made since can be
exactly what this section is looking for, such as a package that now runs in
the browser. On a periodic read there may be no branch to diff, and the review
is §2 to §6 whole.

Then ask the question the diff does not answer: **does anything now leave the
browser that did not before?** A `fetch`, a `<script src>`, an `<img>` from
another origin, a form action. A new outbound request is a CSP change _and_ a
policy change: `netlify.toml`'s policy names no origin but this one
(`operations.md` 3.2), so the request is blocked on the live site and nowhere
else, and the privacy policy says in so many words that the website loads
nothing from another origin.

**No vendor script is expected here** (`web.md` 6.5). Anything from another
origin is the thing this grep is looking for.

```sh
grep -rn "fetch(\|<script\|src=\"http\|action=" src/ | grep -v "\.test\." | head
```

**A branch that changed nothing about data stops here.** If nothing leaves the
browser that didn't, and the diff touches none of what the policy and the
terms describe, say so in a line. That line is the run's whole finish, and
nothing in §7 is updated for it. What they describe, as it shows up in a
diff of this repository:

- `src/content/legal.ts`, the headers in `netlify.toml`, a form, a cookie, a
  script or an email;
- a price, a limit or what a plan does, which the snapshot in
  `src/content/app-facts.json` and the pricing page carry;
- a processor or a provider, named anywhere;
- a docs page that says what's kept, deleted, exported, emailed or open to a
  connected assistant, the pages §6 lists.

**An application release doesn't stop here**, because nothing it changes is in
this repository's diff: §6 is where its half is, and it's the larger one.

**Nor does a change to production's configuration, which is in no diff at
all.** Before a run stops here, make §6's production read and set what it
prints beside what the policy says, line by line as §6 says what each
decides. If they agree, the line saying nothing about data changed says that
too, and the run still stops. If they don't, what moved goes through §2 to §5.
§2 has the case that taught this.

**After a sync, this section judges only what changed since it.** When
`merge-prep` calls this skill after `sync-from-app` §6 ran it in the same
session, the release has had §2 to §6 already, and the scope block still
lists the whole branch. The sync's own `src/content/legal.ts` and
`app-facts.json` are in that list, so judged by it this section never stops,
and the release is reviewed twice. `sync-from-app` §8 ends by staging the
sync's work, so what came after it is what isn't staged:

```sh
git diff --name-only
git ls-files --others --exclude-standard   # a file made since, which the diff doesn't list
```

Ask the two questions above of that list alone. Nothing about data is the
usual answer, and the line saying so is the finish. The sync's run made §6's
production read already, so it isn't made again. Something about data
goes through §2 to §5 for that change, and through §6's docs check if it
touched a page §6 lists, but not §6's release diff, which the sync has run.
In a later session than the sync's, nothing records that its review ran, and
anything may have been staged since, so the whole list applies. So it does
after a sync whose §6 didn't run this skill, since there's no review to avoid
repeating.

## 2. The three disclosures AdSense requires

**Which ad production serves decides what this section and §3 describe**,
and that's deployment configuration rather than application code, so no
release diff, kit or `scripts/check-app-sync.mjs` can show it. §6's
production read says which, and this answers 200 only while AdSense is
configured:
`curl -s -o /dev/null -w '%{http_code}' https://app.smpl.money/ads.txt`.
Since 2026-11-04 production runs the house ad, per the private deployment
repository: the `ADSENSE_*` settings came out and `SB_HOUSE_AD=true` went in
that day, with no diff here, and nothing there says whether AdSense comes
back. Read it again rather than trust this paragraph.

**With AdSense configured**, alone or beside the house ad, three disclosures
are non-negotiable: **third-party cookies**, **the vendors that set them**,
and **how to opt out**. Missing one is a breach whose penalty is account
suspension, not ads that fail to render. The ads serve in the application,
and this is the policy it links from every page, so the disclosures are about
the application; the policy says just as plainly that the website shows none
and loads no advertising script. Beside the house ad is still this case: the
`ADSENSE_*` settings go on widening the application's content security policy
and serving its `/ads.txt` while they're set, and a free account sees AdSense
wherever the house ad stands down.

**With the house ad, or no ad, the three describe nothing that runs.** The
house ad is the application's own bar for Premium: it loads nothing from
another origin, sets no cookie, needs no consent and records no impression or
click. So the policy, the pricing FAQ and the homepage may say the free plan
carries an ad, which the contract's `advertising: true` says without saying
which kind, and must not say Google's ads run there. A disclosure of a third
party that isn't there is as false as silence about one that is.

**While `AGENTS.md` requires the three**, and `tests/legal.test.tsx` asserts
all three are present, this skill can't bring the policy back to true on its
own with production off AdSense. Taking them out, or making them conditional
on the ad production serves, and narrowing those tests to match, is the
owner's decision, which `AGENTS.md` records first. A run that finds
production off AdSense puts that decision at the top of its report, and never
deletes the disclosures or `public/ads.txt` by itself: the file still verifies
the domain to the AdSense account, and it's what the application's ads would
rest on the day AdSense is configured again. The tests can't assert the
disclosures are still _accurate_, in either state, which is this skill's job.

## 3. The trap that has already been walked into

**This section is the AdSense case** (§2 says how to tell which case
production is in). With the house ad or no ad there's no advertising cookie
to consent to, and what's below is what the policy has to say again the day
AdSense is configured.

**Non-personalized is not cookie-free.** Those ads still set cookies for
frequency capping and fraud prevention, so ePrivacy consent is required in
the EEA, the UK and Switzerland whether or not anybody is profiled.

Two separate rules, and both the application's docs and this policy conflated
them once:

| Rule                       | Applies to               | Satisfied by             |
| -------------------------- | ------------------------ | ------------------------ |
| Google's **certified CMP** | Personalized ads only    | A certified platform     |
| **ePrivacy consent**       | Any non-essential cookie | Any valid consent notice |

Avoiding the first is not avoiding the second. The policy's cookies section
and the application's own `docs/monetization.md` both carry this; check they
still agree. Since 0.2.2 its house-ad section's "What it does not do" is what
the policy has to agree with when production runs the house ad.

**While AdSense ran, both were satisfied by one thing**: Google's European
regulations message, which the operator published from the AdSense account
on 4 October 2026, beside a US state regulations message. Only the
application loaded Google's script, so it was the only place either could
appear. Production set `ADSENSE_CONSENT_MANAGED`, so the application didn't
force non-personalized ads, and the policy says who is asked, region by
region: Europe before any advertising cookie, the US states through an
opt-out link, and nobody elsewhere. **On 2026-11-04 production unset that
setting with the rest of AdSense**: only Google's ad tag delivers the
message, so it can't appear on app.smpl.money now, and the policy's
region-by-region description of asking describes a message nobody can be
shown. This is the review that moves it,
once the owner's decision in §2 is recorded. No reading of the application
from inside each region was ever taken (§5, the cookies sweep, step 2). None
is owed while AdSense is off; if it comes back, one is owed again before the
policy's description of asking can be called observed, with the messages
checked as still published in the AdSense account. AdSense back without
`ADSENSE_CONSENT_MANAGED` among §6's names is the other direction: the
application forces non-personalized ads, and the policy's "an ad can be
personalized" is false.

## 4. Email

The policy separates three kinds, and the separation is load-bearing:

1. **Asked for** — verification, password reset, reminders. Contract.
2. **About the service** — maintenance, retirements, security. Contract, and
   **no unsubscribe**, because it is how somebody is told something they need
   to know.
3. **About the product** — occasional news. Legitimate interests, and an
   **unsubscribe in every message** that works without signing in.

Conflating 2 with 3 is how a maintenance notice becomes unsendable. Adding a
newsletter, a campaign or a drip sequence is a change to this section and to
the terms, and it may need opt-in at sign-up rather than opt-out.

## 5. The rest of the sweep

- **Processors.** Is everything in §"Who else sees your data" still true, and
  is anything new missing? Each needs naming, not "our providers". Google's
  roles follow the ad production serves (§2): advertising, sign-in and Gmail
  with AdSense configured, and sign-in and Gmail alone without it, when every
  sentence naming Google for advertising is false.

  **Mail goes through Gmail**, and the policy says what each of the
  application's four messages carries: read the builders in its `mail.ts`
  again if the paragraph "What Google receives through Gmail" is to stay
  true. It also says the application signs in to one Gmail mailbox and that
  Gmail keeps a copy of each message in that mailbox's Sent mail until it is
  deleted, which is what `smtp.gmail.com` does. The Workspace relay,
  `smtp-relay.gmail.com`, keeps no copy unless comprehensive mail storage is
  on, so if `SMTP_HOST` changes, so does that paragraph, and §6's production
  read prints it. A request to delete them means searching the whole
  mailbox, Sent, the inbox for bounces and automatic replies, and the trash.

  **Providers, not processors.** The policy lists them as providers and
  says Google decides for itself for advertising and sign-in; while AdSense
  is off, only the sign-in half is true. Whether Google is a processor for
  Gmail depends on the mailbox being Google Workspace (then its Cloud Data
  Processing Addendum applies) or a consumer account (then Google's own
  terms do), and the policy says neither until the operator does.
  Production's settings answer which: the domain of `SMTP_USERNAME`, which
  §6's production read prints without the address. `@gmail.com` is a
  consumer account, and a domain of the operator's own is Workspace; whether
  the policy says which is still the operator's to decide.

  **Cloudflare receives the mail sent to info@smpl.money**, because
  smpl.money's MX records are Cloudflare Email Routing. `dig MX smpl.money`
  says whether that is still so, and wherever it forwards to is a provider
  the policy has to name. The application's own mail is from, and replies
  to, an address at smpl.money as well (`MAIL_FROM` and `MAIL_REPLY_TO`, whose
  domain §6 prints), so a reply or an automatic reply to anything it sends
  arrives the same way, while the policy names info@ alone. Whether
  Cloudflare routes that address too, and where it forwards, is the same
  provider question, and the operator's to answer.

  **Metrics export is a provider the day it's turned on.** Since 0.2.2 the
  application's collector can send operational and host metrics to whatever
  backend `SB_METRICS_EXPORT_ENDPOINT` names, New Relic being the one its docs
  were written around, and unset means off. The application says no metric
  label carries anybody's identity (its `metrics.ts`), but the backend still
  receives metrics about app.smpl.money, so that name appearing in §6's
  production read is a provider for the policy to name. It's absent as of
  2026-11-04.

- **Backups.** The policy says the database is backed up every night and
  the 14 most recent backups are kept, which is `backupKeep` in the
  application's Oracle stack and `SB_BACKUP_KEEP` on the machine. A change
  there, or backups copied anywhere else, is a change to the retention
  section, the deletion section and the short version. Read the deployment
  note's `Where backups are copied` row as well as the count (§6): the 14 in
  `deploy/pulumi/single-common/index.ts` is the program's default, and where
  the copies go is written only in that note. **Copies elsewhere already
  exist.** The private deployment repository's backup and roll commands copy
  a whole-database production dump to the operator's own machine, and no
  retention rule covers those copies, so the policy's "at Oracle", "about two
  weeks" and "stored by Oracle Cloud Infrastructure" leave copies out.
  Whether the policy names them and how long they're kept, or they stop being
  kept off Oracle, is the owner's call, and it goes at the top of the report
  until one of the two is true. A move to the ha stack
  (`deploy/pulumi/oci/` there) is the same trigger from the other side: that
  stack backs nothing up on its own.
- **Selling and sharing.** The policy draws no CCPA conclusion about selling
  or sharing, because that rests on restricted data processing being on in
  the AdSense account, which the application's tag does not set. Once it is
  on, the sentence may come back, naming it. While AdSense is off the premise
  is moot: no advertising cookie personalizes anything, and the policy's
  California paragraph and its opt-out link describe a message that can't
  appear. What the policy may say then, an outright "doesn't sell or share"
  included, is the owner's call, and `tests/legal.test.tsx` refuses that
  sentence without restricted data processing beside it, so the test is
  narrowed in the same change.

- **Retention.** Still what the software does? The copies of the replies to
  somebody's changes are kept until the account is deleted, which holds only
  while production leaves `IDEMPOTENCY_RETENTION_HOURS` unset or at zero
  (§6); above zero, it rewrites the retention sentence, and the directory
  listings that restate it (§7). The server-log sentence rests on production's `LOG_LEVEL`, which
  §6 prints too: debug adds a line per request, with its path.
- **Rights.** CSV export is a portability claim, the Simple Balance file is
  another, and account deletion is the erasure claim. All three must still
  work — test them, do not assume. The file is 0.2.2's, made on the
  **Import/Export** page, and the application's `src/shared/ledger-file.ts`
  says what each kind carries: a whole-ledger file can hold budgets,
  templates, recurring transactions and, when it's ticked, the activity
  history without the owner's id, and a file of chosen accounts holds those
  accounts, their categories and their entries, deleted ones included, and
  nothing else. Export one from
  app.smpl.money once §6 says it runs a release that has it, and check it
  holds what the policy, the terms and the docs say an export holds. The
  policy's "CSV export of your transactions" stays true and now says less
  than the product does; the comment in `src/content/legal.ts` saying
  budgets, templates and recurring entries have no export is false of it,
  and the terms' "Keep your own copy" paragraph, which describes CSV alone
  and a move one account at a time, says less too.
- **Cookies.** The list must match what is actually set. Look with devtools,
  and know what to expect before you do.

  **Start from a fresh private window, and visit the pages in order.** A
  cookie outlives the page that set it: Stripe's `__stripe_mid` is set on
  `app.smpl.money` itself and lasts a year, so once the plan page has been
  opened in a browser, devtools lists it on every page after, including the
  sign-in screen. A window that has been to the plan page cannot tell you
  which page loaded Stripe.
  1. **`smpl.money`**: no cookie from anybody, nothing in local storage, and
     in the Network panel no request to any origin but `smpl.money`. Open two
     pages, not one: a script can set one cookie on the first page and
     another on the second, and a run that stopped at the first is how the
     policy once described a probe and missed an advertising identifier.
     `window.googlefc` is undefined here, correctly, since nothing on the site
     loads Google's script. Start the window here rather
     than after the application, because a cookie the application set for
     the whole of `smpl.money` rather than for `app.smpl.money` alone would
     show here too, without this site having set it.
  2. **The application's sign-in screen, then the dashboard**, before
     `/settings/plan`. Expect the sign-in cookies once you are signed in, and
     **no theme cookie**: the theme is saved on the account, with a copy in
     local storage so the first paint is the right color, which is where
     devtools shows it. In the Network panel, **no request to
     `js.stripe.com`**, and no Stripe cookie. The rest depends on the ad
     production serves (§2):
     - **The house ad, or no ad**: no Google cookie of any kind,
       `window.googlefc` undefined from every region, and no request to any
       origin but `app.smpl.money` from any page here but two to Google: a
       Google sign-in's own trip there, and, for an account signed in with
       Google, its profile picture, which the sidebar loads from Google's
       image host on every page (the application's `App.tsx`). Check the
       policy accounts for that picture and that request, under the
       processors above. A free account's house ad is drawn by the page and
       asks for nothing. A Google cookie, a defined `window.googlefc` or a
       request to Google's ad hosts means AdSense is configured after all,
       and §2 decides again.
     - **AdSense configured.** On the free plan also expect Google's
       advertising cookies, which the policy covers. `window.googlefc` is the
       global Google's consent messages define, so it is how you tell whether
       one loaded: from the EEA, the UK or Switzerland it must be defined and
       the message must ask before any advertising cookie appears; from a US
       state the policy names, it must be defined and offer the opt-out link;
       anywhere else, undefined is correct. Nobody has read it here yet, and
       the one reading taken anywhere was undefined from California, which
       the policy does not allow, so check that first. This is the live
       origin rather than a local build, so a VPN is the practical way to be
       in each region. Once the message is answered, whichever way, expect
       Google's record of the answer, `FCCDCF`: it stores the choice and is
       not an advertising cookie. After a decline, no advertising cookie
       (`__gads`, `__gpi`, `__eoi`) may appear.
  3. **`/settings/plan`, as far as the payment form.** The page asks for
     Stripe's script when that form opens, and choosing a price is what
     opens it, which starts a subscription at Stripe that waits for a card,
     so use an account that can take that. Now expect the request to
     `js.stripe.com` and Stripe's own cookies, `__stripe_mid` and
     `__stripe_sid`, set by Stripe's script for fraud prevention. The policy
     covers them without naming them, as the cookies Stripe sets there to
     prevent fraud, and says this is the one page that loads the script.

  A Stripe request or cookie at step 2 makes that sentence false, and the
  fix is in the application. The `@stripe/stripe-js` package's default entry
  injects the script as soon as it is imported, and the app shell imports
  the plan page, so that entry loads Stripe on every page;
  `@stripe/stripe-js/pure` waits until `loadStripe` is called. Which one the
  application imports is what decides it.

- **Both documents' dates.** `legalUpdated` in `src/content/legal.ts` is one
  value for both; bump it when either changes materially.
- **Tax.** The terms say no sales tax, VAT or other tax is added to the
  price. That holds while the application sets no `automatic_tax` on a
  subscription and nobody sets a tax rate on one in Stripe's dashboard,
  which the application would carry into the next phase. Doing either is a
  change to the terms, with the notice by email they promise before tax
  reaches a renewal: between 7 and 30 days ahead, with what it will cost and
  how to cancel, which is California's window (Bus. & Prof. Code 17602(g)(2))
  and so not a number to widen at either end.
- **Cancellation and notices.** The terms promise a way to cancel that
  needs no signing in, by writing to the contact address, and notice by
  email of a price change or a material change. The application sends none
  of that mail, so each is kept by hand: a cancellation by email is done at
  Stripe.
- **Jurisdiction and contact.** The terms are governed by California law,
  its conflict-of-laws rules excluded, with California's state and federal
  courts, and a consumer elsewhere keeps the law and the courts of where
  they live. That is the operator's decision, and so is having no
  arbitration clause and no class-action waiver: do not add either as
  boilerplate. A change to any of it is material. Is the contact address
  still the one published?

## 6. Where the policy covers two surfaces

It covers `smpl.money` **and** `app.smpl.money`, and explicitly not a
deployment somebody else runs. If the application changed, most of what you
are checking is over there. How this section learns whether it did depends
on who called it:

- **`sync-from-app` §6**, which is how a release normally arrives. It has
  already pinned the two commits and fetched them, and the diff below takes
  them.
- **`merge-prep`.** Run `node scripts/check-app-sync.mjs`, the script
  `sync-from-app` §1 runs, only to learn whether the application moved. An
  exit of 1 is a move the site hasn't synced, and 2 is a check that couldn't
  tell (`sync-from-app` §0 says how to tell why). Either goes at the top of
  the report as waiting on the owner, and this run reviews the policy against
  the application at the commit `src/content/app-facts.json` records, with no
  release diff, since the snapshot hasn't moved. Set both sides of the diff
  below to that commit, and its loop fetches the one tree there is to read.
  **Never start a sync from here.** A sync ends by running `merge-prep`, so
  one started inside `merge-prep` begins a second preparation, a second
  commit and a second push in the middle of the first. A sync is its own
  run, and the owner starts it.
- **On its own**, the same script says whether anything moved since the
  snapshot. A release it finds is a sync to run instead of this one, and the
  sync runs this skill from its §6 with the commits pinned.

**Whoever called it, this section ends with the production read** below,
because app.smpl.money changes without the application changing, and no
release diff sees that half.

**When the application has released, §1's diff of this repository is the
smaller half.** The policy and the terms describe the application too, and a
release changes them without a line moving here. Diff the code either side of
the release, only in the files that decide what is collected, who receives
it, and what a plan does:

```sh
APP=thtmnisamnstr/simple-balance OLD=v0.2.1 NEW=v0.2.2   # an example pair; either side: two tags, or two commits
for at in "$OLD" "$NEW"; do
  [ -f "/tmp/app-$at/.fetched" ] && continue
  rm -rf "/tmp/app-$at" && mkdir -p "/tmp/app-$at" &&
    curl -fsSL "https://codeload.github.com/$APP/tar.gz/$at" | tar xz -C "/tmp/app-$at" --strip-components=1 &&
    touch "/tmp/app-$at/.fetched" || echo "could not fetch $APP at $at: a failed check"
done
for f in src/server/auth.ts src/server/auth-policy.ts src/server/http-security.ts \
  src/server/config.ts src/server/mail.ts src/server/stripe.ts src/server/db/schema.ts \
  src/server/services/billing.ts src/server/services/account-deletion.ts \
  src/server/services/accounts.ts src/server/services/helpers.ts \
  src/client/pages/PlanPage.tsx deploy/pulumi/single-common/index.ts public/robots.txt \
  src/server/services/ledger-file.ts src/shared/ledger-file.ts src/shared/ledger-file-import.ts \
  src/shared/ledger-file-move.ts src/client/ads.tsx src/server/mcp.ts src/client/App.tsx \
  src/server/api.ts src/server/metrics.ts deploy/compose/single/collector.yaml; do
  diff -q "/tmp/app-$OLD/$f" "/tmp/app-$NEW/$f" >/dev/null 2>&1 || echo "changed: $f"
done
```

**In a sync, the two are commits, not tags.** A release still on its pull
request has no tag yet, and `main` can sit ahead of the last one, so a diff
of tags would read other code than the sync's sweeps did. Replace the first
line with `. /tmp/app-sync.env; NEW=$SHA`, which keeps `APP` and `OLD` from
`sync-from-app` §0, and the loop finds both trees already fetched by their
`.fetched` marks.

Each file in that list is the source of a sentence here: the sign-in scopes
and the session (`auth.ts`), the hosts the page may reach
(`http-security.ts`), the ad and policy settings, the house ad's among them
(`config.ts`), what each email carries (`mail.ts`), what Stripe is sent and
whether its script loads on every page (`stripe.ts`, `PlanPage.tsx`), what
is stored (`schema.ts`), what a plan and a downgrade do (`billing.ts`,
`accounts.ts`), what the history of changes keeps of an edit or a deletion
(`writeAudit` in `helpers.ts`), what deleting an account deletes, and how
many backups the program keeps by default (`single-common/index.ts`), which
production's own stack can change (the production read below). The history
was the one left out, and the policy said a deletion inside the ledger erased
what it deleted while `writeAudit` kept a copy of it until the account went.

The rest of the list joined it with 0.2.2: what a Simple Balance file carries
out of a ledger, the activity history without the owner's id among it
(`services/ledger-file.ts`, `shared/ledger-file.ts`), and what adding or
moving one writes (`ledger-file-import.ts`, `ledger-file-move.ts`); which ad
a free account sees, and on which pages (`ads.tsx`); what a connected
assistant learns about the person, `whoami` giving the name and the email
only with the profile and email scopes (`mcp.ts`); what the consent screen
tells somebody before they grant access, the signed-in email and where
approving sends them, and the policy and terms links on every page
(`App.tsx`); what the per-request log line carries and when `/ads.txt` is
served (`api.ts`); and what metrics leave the machine and what their labels
may carry (`collector.yaml`, `metrics.ts`). A file the old side doesn't have
prints as changed, which is right. `api.ts`, `App.tsx` and `mcp.ts` change in
nearly every release, so read their diffs for those lines rather than whole.
Read the diff of each one that changed, and read the release's changelog
beside it: **0.2.1 changed no processor, cookie or email, and still made the
terms false**, because both of their downgrade paragraphs said a frozen
account accepts no changes and `accounts.ts` had stopped refusing an archive
or a delete. That was a sentence in the changelog's first section, and nothing
in this repository moved.

**The docs state data handling too, and nothing holds them to the policy.**
They say what deleting an account removes, what an export holds, which emails
the application sends, what a downgrade or a failed renewal does to a plan,
and what a connected assistant can read and change:
`content/docs/your-account-and-plan.md`, `content/docs/agents-and-mcp.md`,
`content/docs/activity-history.md`, `content/docs/limits.md` and
`content/docs/configuration.md` above all, and
`content/docs/moving-between-cloud-and-self-hosted.md` and
`content/docs/importing-a-statement.md` for what an export holds.
`tests/legal.test.tsx` reads the policy, the terms and the marketing pages,
and none of these. So when
`src/content/legal.ts` changes, grep the docs for its subject:

```sh
grep -rn -i "<the subject>" content/docs
```

And when a docs page states a retention period, a deletion, an email or what
an assistant's access allows, read the policy's sentence on the same thing
beside it. The configuration page once gave a failed payment a seven-day grace
period while the application gives 15: a fact about somebody's plan, stated on
a docs page, which nothing that reads the legal pages could have seen.

### What production runs, which no diff shows

Which ad app.smpl.money serves, which release it runs, what sends its mail,
how many backups it keeps and where they're copied, whether it exports
metrics, how long it keeps the copies of its replies, and the policy and terms
addresses it links from every page are all production's configuration. They
live in the private deployment repository, and no diff of this repository or
of the application shows them, which is how the policy came to describe
AdSense to a production that had stopped serving it (§2). **This is the one
copy of this read**; other skills cite it here rather than copying it.

Read it by URL with `gh api`, under the owner's token, because the repository
is private, and never from a folder on this machine, which holds whatever
state it was left in. Every run that reaches this section makes it, and so
does a run before it stops at §1.

```sh
DEPLOY=thtmnisamnstr/simple-balance-deploy
NOTE=deployments/oci-single-production.md STACK=deploy/pulumi/oci-single/Pulumi.production.yaml
deployed() { for file; do gh api "repos/$DEPLOY/contents/$file" -H 'Accept: application/vnd.github.raw+json'; done; }
gh api "repos/$DEPLOY" -q .full_name || echo "no access to the deployment repository: a failed check, not an empty one"
for note in $(gh api "repos/$DEPLOY/contents/deployments" -q '.[].name' | grep -v TEMPLATE); do
  echo "$note: $(deployed "deployments/$note" | grep -E '^\| (Hostname|Image tag|Deployed|Where backups are copied) \|' | tr '\n' ' ')"
done
deployed "$STACK" | grep -E '^    [A-Z][A-Z0-9_]*:' | sed -E 's/^ +//; s/:.*//' | sort | tr '\n' ' '; echo   # names only
deployed "$STACK" | grep -E '^    (SB_HOUSE_AD|SMTP_HOST|LOG_LEVEL|IDEMPOTENCY_RETENTION_HOURS|PRIVACY_POLICY_URL|TERMS_OF_USE_URL):'
deployed "$STACK" | grep -E '^    (MAIL_FROM|MAIL_REPLY_TO|SMTP_USERNAME):' | sed -E -e 's/^ +([A-Z_]+):.*@([^>" ]*).*/\1 @\2/' -e t -e 's/^ +([A-Z_]+):.*/\1: no domain/'   # domains only, never a value
deployed "$STACK" | grep -E '^  simple-balance:(hostname|backupKeep):'
for file in "$STACK" "$NOTE"; do
  gh api "repos/$DEPLOY/commits?path=$file&per_page=10" -q '.[] | .commit.committer.date[0:10] + " " + .sha[0:7] + " " + (.commit.message | split("\n")[0])'
done
grep -n 'legalUpdated =' src/content/legal.ts
curl -sI https://app.smpl.money/ | grep -iE '^(content-security-policy|referrer-policy|x-robots-tag):' | cut -c1-200
curl -s -o /dev/null -w 'ads.txt %{http_code}\n' https://app.smpl.money/ads.txt
curl -s https://app.smpl.money/health/live; echo
```

What each part decides:

- **The notes.** Production is the note whose Hostname is app.smpl.money and
  whose `Deployed` row is a date rather than not yet or not deployed. Its
  `Image tag`, which each roll writes, is the release app.smpl.money runs,
  which `sync-from-app` §1 reads, after `/health/live`, to decide what it
  applies and what it defers;
  the `UPSTREAM` sha in `Deployed` is the commit its last `up` was synced
  from, and agrees only when the two were the same release. Its
  `Where backups are copied` row is §5's backups: anything past the nightly
  dumps kept on the machine is a copy the policy has to account for. Production moving to another note is a move to another
  stack, the ha stack's being `deployments/oci-production.md` with its
  settings in `deploy/pulumi/oci/Pulumi.production.yaml`: set `NOTE` and
  `STACK` to it and read again, and §5's backup sentences are owed a review,
  since that stack backs nothing up on its own.
- **The names.** `ADSENSE_CLIENT_ID` among them is AdSense configured, with
  or without `SB_HOUSE_AD`; `SB_HOUSE_AD` at true without it is the house
  ad; neither is no ad (§2). `ADSENSE_CONSENT_MANAGED` beside
  `ADSENSE_CLIENT_ID` is the consent message deciding personalization (§3),
  and without it the application forces non-personalized ads.
  `SB_METRICS_EXPORT_ENDPOINT` among them is metrics export on, and a
  provider to name (§5). A name that's missing is a
  setting left unset, so a missing `IDEMPOTENCY_RETENTION_HOURS` is the reply
  copies kept until the account is deleted, as the policy says; present and
  above zero, its value is how long (zero is forever, as unset is), and §5's
  retention and §7's listings follow it.
- **The values.** `SMTP_HOST` is §5's Gmail paragraph. `LOG_LEVEL` is the
  server-log sentence: info writes no line per request, and debug adds one
  with its path. `PRIVACY_POLICY_URL` and `TERMS_OF_USE_URL` are the links on
  every page of the application, so `/privacy/` and `/terms/` keep those
  exact addresses, trailing slash and all. Both are in `seo-review` §4's
  pinned set, so a rename owes the 301 and the owner items it names there,
  and one more, to change both settings in the private deployment
  repository.
- **The domains.** `SMTP_USERNAME`'s says whether the mailbox is a consumer
  Gmail account or Workspace, and those of `MAIL_FROM` and `MAIL_REPLY_TO`
  where replies arrive (§5, processors). The addresses aren't printed, and
  aren't needed. A login with no domain prints as no domain, and leaves the
  mailbox question to the operator.
- **The hostname line.** Printed with no `backupKeep` line beside it,
  production keeps the program's default of 14. No hostname line at all
  means the file wasn't read, not that nothing is set.
- **The commits.** One dated after `legalUpdated` is configuration the policy
  hasn't been read against: the lines above say what's true now, and its
  whole message,
  `gh api repos/thtmnisamnstr/simple-balance-deploy/commits/<sha> -q .commit.message`,
  says what moved. Read past the first line: the commit that took AdSense
  out was titled for the release.
- **The live checks** need no access, and they're the fallback. A
  `script-src` of `'self'` alone and a same-origin referrer are no script
  from anybody else on that page; `https:` and `'unsafe-eval'` in
  `script-src`, with a strict-origin-when-cross-origin referrer, are AdSense
  configured (the application's `http-security.ts`). `/ads.txt` answers 200
  only while AdSense is configured, and 404 otherwise. `/health/live`
  answers with the version production runs, the public half of the note's
  `Image tag`. Since 0.2.2 every response carries `X-Robots-Tag: noindex`.

And the rules that keep it safe to make:

- **Read nothing else.** Never `.env`, anything under `state/`, a `*.pem`, or
  a `secure:` value, and never print the stack file whole: its plain values
  include personal ones, which is why every line above prints a name, a
  domain or a value on the list.
- **Never copy a value from that repository** into this one, a commit, a
  pull request or a report, beyond what the policy itself already says. Say
  what it means instead: "production runs the house ad", "a consumer Gmail
  account".
- **A 404 from `gh` is no access**, not an empty repository. Say so in the
  report, fall back to the live checks and the owner, and never read silence
  as nothing changed.

## 7. Finish

**A run that found both documents true has nothing to update**, and one that
stopped at §1 is the usual case: its finish is the line saying nothing about
data changed. It leaves `src/content/legal.ts` alone, and `legalUpdated`
above all, because a new date tells every reader of both documents that
they changed when they didn't.

A run that found either one false updates `src/content/legal.ts`, bumps
`legalUpdated` when the change is material (§5), and adds an assertion to
`tests/legal.test.tsx` for any disclosure that is now load-bearing — the
existing ones are the model: they check for the _claim_, not the prose.

Then `npm run verify` and **`merge-prep`**.

**When `merge-prep` or `sync-from-app` called this, return to it instead.**
The caller verifies and pushes: `merge-prep` in its §12 and §13, and a sync by
ending in `merge-prep`. Starting `merge-prep` from here would begin the whole
preparation again in the middle of one.

**If a change is material**, the policy says notice goes out by email before
it takes effect. That is a promise in the document; keep it. Sending it is
the owner's, so it goes first in the report.

**Taking the advertising disclosures out is one to weigh.** It reduces what's
done with anybody's data rather than adding to it, and production stopped
doing it before any notice could have gone. Whether it's material, and so
owes the emailed notice, stays the owner's call, and it goes first in the
report, beside §2's decision.

**The directory listings restate both documents.** The
[connectors repository](https://github.com/thtmnisamnstr/simple-balance-mcp-connectors)'s
answers to the directories, the data-handling section of its
`submissions/claude-directory.md` and its `submissions/copy.md` above all,
restate what the policy and the terms say about hosting, logs, backups, the
reply copies, the minimum age, advice and ads, and every page a listing gives
names the operator `src/content/legal.ts` names. A change here to any of
those is an owner item for that repository (`aeo-review` §9), naming the
file. Read that file again before reporting what it says.
