---
name: legal-review
description: Bring the privacy policy and terms back to true after something changes what data is handled, who handles it, or what the site sends. Use when adding a vendor, script, cookie, form or email, before changing the application's ads, or on a periodic review.
---

# Keep the legal pages true

A privacy policy is the one document on this site whose failure mode is not
embarrassment. A generic one is a false statement about what happens to
somebody's data; a stale one is the same thing with a date on it.

**Not legal advice, and the documents say so.** What this skill does is make
sure they describe what the software actually does, and carry the
disclosures somebody else's terms demand.

## When to run it

Any of these, and the first four are not optional:

- **A new processor.** Anything that now sees user data — a vendor, a host,
  an email provider, an error tracker.
- **A new script, cookie, embed or form.** Including one that only runs on
  one page.
- **Before changing anything about the application's ads**, and before any
  ad or ad script comes back to this site, which `AGENTS.md` has to permit
  first.
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
usual answer, and the line saying so is the finish. Something about data
goes through §2 to §5 for that change, and through §6's docs check if it
touched a page §6 lists, but not §6's release diff, which the sync has run.
In a later session than the sync's, nothing records that its review ran, and
anything may have been staged since, so the whole list applies. So it does
after a sync whose §6 didn't run this skill, since there's no review to avoid
repeating.

## 2. The three disclosures AdSense requires

Non-negotiable once ads serve: **third-party cookies**, **the vendors that
set them**, and **how to opt out**. Missing one is a breach whose penalty is
account suspension, not ads that fail to render. The ads serve in the
application, and this is the policy it links from every page, so the
disclosures are about the application; the policy says just as plainly that
the website shows none and loads no advertising script.

`tests/legal.test.tsx` asserts all three are present. It cannot assert they
are still _accurate_, which is this skill's job.

## 3. The trap that has already been walked into

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
still agree.

**Both are meant to be satisfied by one thing now**: Google's European
regulations message, which the operator published from the AdSense account
on 4 October 2026, beside a US state regulations message. Only the
application loads Google's script, so it is the only place either can
appear. It sets `ADSENSE_CONSENT_MANAGED`, so it does not force
non-personalized ads, and the policy says who is asked, region by region:
Europe before any advertising cookie, the US states through an opt-out link,
and nobody elsewhere. **The state to check is whether that is still true.**
No reading of the application from inside each region has been taken yet
(§5, the cookies sweep, step 2), and one is owed before the policy's
description of asking can be called observed. If the messages are ever unpublished, or the application
turns the setting off, the policy is wrong in the other direction and this is
the review that has to move it back.

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
  is anything new missing? Each needs naming, not "our providers".

  **Mail goes through Gmail**, and the policy says what each of the
  application's four messages carries: read the builders in its `mail.ts`
  again if the paragraph "What Google receives through Gmail" is to stay
  true. It also says the application signs in to one Gmail mailbox and that
  Gmail keeps a copy of each message in that mailbox's Sent mail until it is
  deleted, which is what `smtp.gmail.com` does. The Workspace relay,
  `smtp-relay.gmail.com`, keeps no copy unless comprehensive mail storage is
  on, so if `SMTP_HOST` changes, so does that paragraph. A request to delete
  them means searching the whole mailbox, Sent, the inbox for bounces and
  automatic replies, and the trash.

  **Providers, not processors.** The policy lists them as providers and
  says Google decides for itself for advertising and sign-in. Whether Google
  is a processor for Gmail depends on the mailbox being Google Workspace
  (then its Cloud Data Processing Addendum applies) or a consumer account
  (then Google's own terms do), and the policy says neither until the
  operator does.

  **Cloudflare receives the mail sent to info@smpl.money**, because
  smpl.money's MX records are Cloudflare Email Routing. `dig MX smpl.money`
  says whether that is still so, and wherever it forwards to is a provider
  the policy has to name.

- **Backups.** The policy says the database is backed up every night and
  the 14 most recent backups are kept, which is `backupKeep` in the
  application's Oracle stack and `SB_BACKUP_KEEP` on the machine. A change
  there, or backups copied anywhere else, is a change to the retention
  section, the deletion section and the short version.
- **Selling and sharing.** The policy draws no CCPA conclusion about selling
  or sharing, because that rests on restricted data processing being on in
  the AdSense account, which the application's tag does not set. Once it is
  on, the sentence may come back, naming it.

- **Retention.** Still what the software does?
- **Rights.** CSV export is the portability claim, account deletion is the
  erasure claim. Both must still work — test them, do not assume.
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
     devtools shows it. On the free plan, with ads configured, also expect
     Google's advertising cookies, which the policy covers.
     `window.googlefc` is the global Google's consent messages define, so it
     is how you tell whether one loaded: from the EEA, the UK or Switzerland
     it must be defined and the message must ask before any advertising
     cookie appears; from a US state the policy names, it must be defined and
     offer the opt-out link; anywhere else, undefined is correct. Nobody has
     read it here yet, and the one reading taken anywhere was undefined from
     California, which the policy does not allow, so check that first. This
     is the live origin rather than a local build, so a VPN is the practical
     way to be in each region. Once the message is answered, whichever way,
     expect Google's record of the answer, `FCCDCF`: it stores the choice and
     is not an advertising cookie. After a decline, no advertising cookie
     (`__gads`, `__gpi`, `__eoi`) may appear. In the Network panel, **no
     request to `js.stripe.com`**, and no Stripe cookie.
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

**When the application has released, §1's diff of this repository is the
smaller half.** The policy and the terms describe the application too, and a
release changes them without a line moving here. Diff the code either side of
the release, only in the files that decide what is collected, who receives
it, and what a plan does:

```sh
APP=thtmnisamnstr/simple-balance OLD=v0.2.0 NEW=v0.2.1   # either side: two tags, or two commits
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
  src/client/pages/PlanPage.tsx deploy/pulumi/single-common/index.ts public/robots.txt; do
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
(`http-security.ts`), the ad and policy settings (`config.ts`), what each
email carries (`mail.ts`), what Stripe is sent and whether its script loads on
every page (`stripe.ts`, `PlanPage.tsx`), what is stored (`schema.ts`), what a
plan and a downgrade do (`billing.ts`, `accounts.ts`), what the history of
changes keeps of an edit or a deletion (`writeAudit` in `helpers.ts`), what
deleting an account deletes, and how many backups are kept
(`single-common/index.ts`). The history was the one left out, and the policy
said a deletion inside the ledger erased what it deleted while `writeAudit`
kept a copy of it until the account went.
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
`content/docs/configuration.md` above all. `tests/legal.test.tsx` reads the
policy, the terms and the marketing pages, and none of these. So when
`src/content/legal.ts` changes, grep the docs for its subject:

```sh
grep -rn -i "<the subject>" content/docs
```

And when a docs page states a retention period, a deletion, an email or what
an assistant's access allows, read the policy's sentence on the same thing
beside it. The configuration page once gave a failed payment a seven-day grace
period while the application gives 15: a fact about somebody's plan, stated on
a docs page, which nothing that reads the legal pages could have seen.

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
