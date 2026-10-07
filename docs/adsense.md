# Adding AdSense

**Both origins carry Google's ad script, and now both carry a banner unit
from the same account.** The application at `app.smpl.money` shows the unit to
accounts on the free plan. This site, `smpl.money`, shows the same unit on
every page except the legal pages and the 404. The root domain's `ads.txt` is
what authorizes the inventory on both, which is the genuinely surprising thing
in this document and what §1 is about.

The loader is one element in `src/app/layout.tsx`, on every page regardless of
where the unit itself appears:

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9953156598757474"
  crossorigin="anonymous"
></script>
```

That is the account's own snippet, unmodified. The banner unit is a second,
smaller piece of the account's own markup, in `src/components/ad-banner.tsx`
and built from `src/content/ads.ts`, which both origins' ids are read into
from the same two environment variables the application uses —
`ADSENSE_CLIENT_ID` and `ADSENSE_BANNER_SLOT_ID` — rather than from a literal
in source:

```html
<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-9953156598757474"
  data-ad-slot="…"
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

That is the snippet as the live build renders it, with `ADSENSE_CONSENT_MANAGED`
on. With it off, a `requestNonPersonalizedAds = 1` line goes before the push,
which is what both origins rendered until the consent messages in §3 step 7
were published.

**Auto ads stays off.** It would be the only thing choosing the page and the
format if nothing else did, and now something else does: a manual unit, whose
format is fixed and whose pages are a decision in this tree rather than
Google's to make — every page except `/privacy/`, `/terms/` and the 404,
`tests/ad-placement.test.ts` holds the set by route and by name.

This document used to open "This site does not serve ads", and later "this
repository declares no ad unit". Both were true when written and neither is
now. What follows each still has a section here:

- The content security policy had to admit hosts. It names five, because five
  is what a real browser running the real script actually contacted — **§8 is
  the measurement and the recipe for repeating it**, and it needs repeating:
  it was taken while Auto ads asked on every page, which is a different shape
  of traffic from one persistent unit asking on ten.
- The privacy policy had to stop saying this site sets no cookies, because it
  now sets one (§4), and had to stop saying a visitor in the EEA or the UK is
  asked first, because for a while nobody was (§5). It then had to stop
  saying no advertising is displayed, because now some is, and then had to
  say who is asked, region by region, once the consent messages were
  published.
- `AGENTS.md`'s rule against a script from a vendor's domain had to be
  rewritten to record the decision rather than be broken quietly. It now
  permits this one script and this one manual unit by name, and still forbids
  every other vendor image, font, widget, analytics tag and consent vendor.

## 1. Why a marketing site has an `ads.txt` at all

Google reads `ads.txt` from the **root domain**. Ads run on the subdomain too.

> "You only need to do this [add a `subdomain=` line] if the authorized seller
> or your publisher ID are different for the subdomain when compared to the
> root domain."
> — [Google AdSense, ads.txt guide](https://support.google.com/adsense/answer/9785052)

The application derives its own `/ads.txt` from one `ADSENSE_CLIENT_ID`, so the
publisher id on `app.smpl.money` and on `smpl.money` are **the same id**. The
root record therefore already covers the subdomain, and no `subdomain=`
referral is needed.

**Do not add a `subdomain=` line.** A referral makes crawlers consume the
subdomain's file _instead of_ the root's, and the application only registers
that route while ads are configured — so a referral hands the whole
authorization chain to a file that disappears whenever `ADSENSE_CLIENT_ID` is
unset or the app is down. Root-only has no such single point of failure.

<!-- This paragraph corrects the application repository's own
     docs/monetization.md, which stated the referral as mandatory. -->

## 2. The one way to lose money silently

> "Domains hosting an ads.txt file where the seller's publisher ID isn't listed
> are no longer monetized through Ad Manager, and Google no longer buys ads on
> such sites."

Read that twice. **A missing `ads.txt` is ignored and costs nothing. A
well-formed one that does not name your id demonetizes the domain.**

Every symptom of the bad state looks like success: the file is served, the
build is green, the ads render, the revenue is zero.

Two ways to reach it, both guarded:

- **Shipping the file without the id in it.** `public/ads.txt` did not exist
  until the account did, and `tests/export-shape.test.ts` asserted that it did
  not. The file arrived with the id (§3 step 4), and the same check now holds
  it to exactly the DIRECT record naming that id and the `ownerdomain` line.
  That check writes the id out longhand rather than reading it from the file,
  because a check that reads its referent out of the thing it is checking
  passes whatever that thing says.
- **A catch-all rewrite.** `/* → /index.html 200` on a static host turns every
  unknown path into a 200 of HTML — including `/ads.txt` before it exists, and
  `/ads.tx` after a typo. `netlify.toml` has none and the same test refuses
  one, in `netlify.toml` and in a `_redirects` file alike.

## 3. The order to do this in

AdSense review is the longest lead time in this project — days to weeks — and
`ads.txt` changes then take Google **a few days to a month** to pick up. Start
early and expect to wait twice.

**The order is Google's, not a preference.** Review does not start until the
site is connected to the account, connecting it needs the publisher id, and
the id exists the moment the account does. So the file carrying the id goes
in _before_ the review request. An earlier version of this list put `ads.txt`
after approval and never connected the site at all, which is a review that
never starts.

1. **Publish real content first.** Thin content is the usual rejection. The
   docs are written and **announced**: seven pages, linked from the header and
   the footer, indexed, and in the sitemap, so the site a reviewer sees is not
   one page.

   **The blog is written and deliberately not announced.** Two finished posts
   exist and `/blog/` is built, styled and routable, and it carries `noindex`
   and is in no sitemap because what goes in it has not been decided. This
   step asked for both, and half of it is a decision rather than an omission.
   `announced` in `src/content/sections.ts` is the flag, and announcing the
   blog is more than flipping it: five blog routes have no sitemap entry, and
   `/blog/page/1/` is a deliberate non-canonical duplicate that must stay out
   by name rather than be added.

2. **Confirm the privacy policy is live** at `https://smpl.money/privacy/`
   (§4). It is written; Google requires it before serving, and the application
   will not start with ads configured and no policy to link to (step 9).
3. **Create the AdSense account**, with `smpl.money` as the site, and note the
   publisher id. It is shown as `pub-` and sixteen digits as soon as the
   account exists (Account, then Settings, then Account information), not on
   approval. Every later step uses it. **Done:** `pub-9953156598757474`.
4. **Add `public/ads.txt` and connect the site with it.** The file is §6's,
   with that id. **Done**, in one commit with the check that holds it. Deploy,
   then in AdSense's step for connecting the site choose the **ads.txt
   snippet** method and verify.

   **This site verifies by `ads.txt`**, and that is now a choice among three
   rather than the only one open. The argument used to be that the other two
   were impossible here; it is not, and the conclusion survives anyway.

   - **The AdSense code snippet** would work, because that snippet ships on
     every page as of this change. It proves nothing `ads.txt` does not, and
     `ads.txt` has to exist regardless (§2), so it is redundant rather than
     wrong.
   - **The meta tag**, `<meta name="google-adsense-account" content="ca-pub-…">`,
     would also work — it is markup on this origin, and would go in through
     `metadata.other` in `src/app/layout.tsx`. It stays refused because it is
     a **second place to write the id**, and the two spellings of that id are
     already the sharpest edge in this whole procedure (§6).

   This is not the premature file §2 warns about: it names the id, which is
   the one thing that makes an `ads.txt` safe.

5. **Request review.**
6. **On approval, create the ad units**: one display unit for the banner, and
   a second for the footer if the application should have one. Note each slot
   id, which is ten digits. **The banner unit is shared.** Its slot id is the
   one both origins read into `ADSENSE_BANNER_SLOT_ID` — one Google object
   filled by two deployments rather than two separate units, which is what
   "the same banner ad unit as in the app" means. The footer slot, if created,
   belongs to the application alone; this site declares no second unit.
7. **Publish a European regulations message and a US state regulations
   message.** In AdSense, open **Privacy and messaging**, create both, for
   `smpl.money` and `app.smpl.money`, choose their wording, and publish them.
   The European one asks for consent before any advertising cookie; the US
   one offers residents of the states whose laws give the right an opt-out of
   the sale or sharing of their information.

   **Both were published on 4 October 2026, by the operator's account, and
   neither has been seen working here yet.** The same day, a build served as
   `smpl.money` and driven from California, one of the states the US message
   covers, found `window.googlefc` undefined on every page and no request for
   a message at all (§8). The likeliest reason is that a site that serves no
   ads yet is served no messages either, and that is a guess, so the first
   measurement from inside each region is owed before the policy's
   description of asking counts as observed.

   **Watch the content security policy when it does load.** Google's
   messages are normally served from `fundingchoicesmessages.google.com`,
   which is not one of the five hosts §8 measured, and `netlify.toml` admits
   no host nobody has watched. A run that shows the message refused is the
   observation that adds it, in the directives it was refused in, and not
   before. The script shipped before any message existed, and the legal pages
   said so for as long as that was true; §5 has the two rules a message
   satisfies.

   **When it is published, come back and re-read the legal pages.** They are
   written for the state above, and they are wrong in the other direction once
   a notice exists. The `legal-review` skill names "before turning ads on" as
   one of the times it must run; this is the same trigger arriving late.

8. **Decide Auto ads deliberately. On this site it is off.** For the
   application it is an account setting no code can override and it injects
   formats the application promises not to show, so there it must be off.

   **On `smpl.money` it would be the only thing choosing the page and the
   format**, and a manual unit is now what does both instead:
   `src/components/ad-banner.tsx` is the unit, placed in code on every page
   except `/privacy/`, `/terms/` and the 404 — `/pricing/` included, which is
   a decision taken on purpose rather than left to Google: the legal pages are
   excluded because one discloses the advertising and a reader there should
   not be reading it beside an ad, and because a consent-adjacent policy page
   framed by the thing it is disclosing reads as the wrong kind of example.
   `tests/ad-placement.test.ts` holds the exact set by route, so a page added
   later carries the unit by doing nothing and a legal page added later has
   to be named there deliberately.

   The consequence to keep in view is the one that held when nothing was
   declared and holds more now that something is: the script runs regardless
   of where the unit appears, on the legal pages too, still reaches Google,
   and still sets the cookie the privacy policy names. "No ad shown on this
   page" is not "no third party involved", and the policy is written for the
   second.

9. **Wait for the crawl, then configure the application.** Confirm in the
   AdSense dashboard that `ads.txt` is found and authorized.

   **Two things have to be true of the machine first**, and neither is one
   of the ad settings below, so check both before touching those:
   - **It runs 0.2.1 or later.** Billing and ads arrived in 0.2.0, and
     0.1.6 has neither, so on a machine still running it nothing below would
     do anything. And 0.2.0 is not enough either: its sign-in and session
     answers handed the session cookie's value back in JSON, readable by any
     script on the page, and a page showing ads allows scripts from any HTTPS
     origin. 0.2.1's answers no longer carry it. The Oracle Cloud and AWS programs
     deploy the pinned release image, which is 0.2.1 now, but a machine keeps
     the image it was made with.
     `sudo docker ps --format '{{.Image}}'` on the machine names the image
     it is actually running.

     How the machine gets onto 0.2.1 depends on when it was made. One
     created from the 0.2.1 release starts on it, because the programs
     write the pinned tag into its compose file at first boot. **On a
     machine that is already running, `pulumi up` changes nothing on it**:
     neither program runs first boot again or replaces the instance, so the
     compose file keeps the image it was written with. That machine takes
     0.2.1 the way any deployment does, by the release's own upgrade:
     `docs/upgrades.md` in the application, at the release's tag: its note
     for every release after the one the machine runs, then its How to
     upgrade. From 0.1.6, 0.2.0's note is the one with work in it, and three
     parts of it matter on this machine:
     - **The backup goes through the unit.** Run
       `sudo systemctl start simple-balance-backup.service`, so the dump
       lands in `/var/lib/simple-balance/backups` on the data volume; the
       script run bare writes to its own default on the boot disk. Check
       that `sudo journalctl -u simple-balance-backup.service -n 5` shows a
       line starting `simple-balance-backup: wrote`.
     - **The settings move out of `env.local` and into the stack.** From
       0.2.0 the programs keep a single machine's settings in the Pulumi
       stack and the cloud's own secret store, and a machine built by them
       does not read `env.local` at all. A machine built before still runs
       the scripts it was built with, which do, so the note's move is four
       steps: copy `env.local` into the stack with
       `deploy/pulumi/settings-from-env.mjs`, `pulumi up`, take a backup and
       replace the application instance with
       `pulumi up --replace <the instance's URN>`, which keeps its data
       volume, and delete `env.local` once the new machine is running. The
       new machine boots from the release, image and compose file both, so
       on this path the compose-file step below is already done. On Oracle
       Cloud, somebody who is not a tenancy administrator needs the vault,
       key, secret, policy and dynamic-group policies the programs' README
       lists before that `pulumi up`.
     - **Kept rather than replaced, the whole compose file is replaced, not
       its `image:` line.** A machine upgraded in place goes on reading
       `env.local`, and needs this instead. The
       note says that a deployment running its own copy of a compose file
       takes the release's, because an older copy silently drops
       `PRIVACY_POLICY_URL`, and without it the application refuses to start
       once the AdSense ids are set. `/opt/simple-balance/compose.yml` is
       this machine's own copy, the one its first boot wrote, and one
       written from an earlier commit can leave `PRIVACY_POLICY_URL` out.
       Put the release's `deploy/compose/single/compose.yml` there, which
       already pins the release's own image, then run
       `sudo docker compose -f /opt/simple-balance/compose.yml pull` and
       `sudo systemctl restart simple-balance`. Before any ad setting is
       set,
       `grep -nE 'PRIVACY_POLICY_URL|ADSENSE_CLIENT_ID|SB_BILLING_ENABLED' /opt/simple-balance/compose.yml`
       must name all three, and `docker ps` must name the 0.2.1 image.

   - **It is selling Premium**, which is `SB_BILLING_ENABLED=true` with
     Stripe configured. Ads appear only where a limited plan is in force:
     free accounts, on a deployment that sells the paid plan. With billing
     off, these settings show no ad to anybody, which looks like a fault and
     is not one.

   Then set every setting the application reads when ads are on, and restart
   it:
   - `ADSENSE_CLIENT_ID` — `ca-pub-` followed by the sixteen digits from
     step 3. The dashboard shows `pub-…` and the `ca-` goes in front;
     anything but `ca-pub-` and sixteen digits refuses to start.
   - `ADSENSE_BANNER_SLOT_ID` — the banner's slot id from step 6, ten
     digits. It is set together with the client id or not at all, and one
     without the other refuses to start.
   - `ADSENSE_FOOTER_SLOT_ID` — optional, the footer's slot id, ten digits.
     It is an addition to the banner, so set on its own it refuses to start.
   - `PRIVACY_POLICY_URL=https://smpl.money/privacy/` — **required** whenever
     AdSense is configured, and it must be absolute and https. Without it the
     application refuses to start, because serving Google's ads with no
     policy breaches their terms from the first impression. The application
     links it from the sidebar on every page.
   - `ADSENSE_CONSENT_MANAGED=true`, once step 7's messages are published.
     It stops forcing non-personalized ads and lets the message decide, by
     region, which is what the privacy policy and the pricing page now say
     of both origins. §5 says what that costs and why it was chosen.

   **Where these go on the Oracle Cloud and AWS single machines depends on
   which scripts the machine runs**, which is the choice made above.
   - **A machine built by the programs from 0.2.0 on, or replaced by the
     settings move above, takes them from the stack.** One command each, from the
     stack's directory:
     `pulumi config set --path 'simple-balance:env.ADSENSE_CLIENT_ID' ca-pub-…`
     and the same for the others, then `pulumi up`. The machine checks every
     five minutes, and
     `sudo systemctl start simple-balance-settings` on it applies them now.
     It does not read `env.local`, and a file left there is ignored with a
     line in the log on every start, so an edit to it is the mistake that
     looks like a fault in AdSense.
   - **A machine upgraded in place still reads
     `/var/lib/simple-balance/env.local`**, until it is replaced. Edit it,
     then run `sudo systemctl restart simple-balance`. That is enough on a
     machine whose unit has a systemd drop-in, which folds `env.local` into
     the configuration on every start; `systemctl cat simple-balance` lists
     one if it is there. **A machine made before the programs installed that
     drop-in has none**, and a restart there brings the containers back
     with the configuration they already had. On one of those, run
     `sudo /usr/local/sbin/simple-balance-firstboot`, which rebuilds the
     configuration from `env.local` and is safe to run again, and then
     restart.

   Either way, §7's Privacy link is how you know it took. Every
   compose recipe in the application passes `PRIVACY_POLICY_URL` through to
   the container, but a machine runs its own copy, the one its first boot
   wrote, which is why a machine that was already running replaces that
   file above rather than editing it. A split deployment, with nginx in its
   own container, also needs `SB_ADS_CONFIGURED=true` on that frontend,
   because nginx decides the content security policy every page arrives
   with; the compose recipes derive it from `ADSENSE_CLIENT_ID`.

   **`app.smpl.money` sets `ADSENSE_CONSENT_MANAGED=true`, as this site
   does.** The application's own `docs/deployment.md` and
   `docs/monetization.md` both say to set it only if you want personalized
   ads, and the operator does. What it costs is said in the privacy policy
   rather than avoided: the European message asks only in the EEA, the UK
   and Switzerland, the US message offers an opt-out rather than asking, and
   everybody else is shown personalized ads without being asked. §5 has the
   rest.

   Otherwise, the application's own reference for all of this is those two
   documents, in `https://github.com/thtmnisamnstr/simple-balance` at the
   ref `sync-from-app` §0 resolves. `PRIVACY_POLICY_URL` was missing from
   this step once, and `ADSENSE_PERSONALIZED`, a setting that does not
   exist, was here instead of `ADSENSE_CONSENT_MANAGED`; check the names
   against that reference rather than against memory.

10. **Configure this site.** Far shorter than step 9, because there is no
    machine, no systemd unit and no `PRIVACY_POLICY_URL` to set — the privacy
    policy lives here, so there is nowhere else for its own link to point.

    `src/content/ads.ts` reads the same two names step 9 does,
    `ADSENSE_CLIENT_ID` and `ADSENSE_BANNER_SLOT_ID`, from `process.env` at
    build time rather than from a request: this is a static export, so
    "configure it" means "set it where the build that ships runs", which is
    Netlify's own environment variables (Site configuration → Environment
    variables) for the live site, and a local `.env` or `.env.local` for
    `next dev` — `.env.example` has both names, commented out, with the
    format each must satisfy. Never `netlify.toml`, which is committed.

    Set both to the same values step 9 used — one account, one banner unit,
    shown on both origins — trigger a new deploy, and confirm with
    `curl -s https://smpl.money/ | grep -o 'data-ad-slot="[^"]*"'`, which
    should print the slot id back. Absent, this site builds and ships exactly
    as it did before this change: no loader, no unit, nothing to the content
    security policy's five hosts. Half-set — one variable with no other —
    fails the build outright, in Netlify's own log, rather than shipping a
    page with one half missing and no indication why.

    **Set `ADSENSE_CONSENT_MANAGED=true` here too**, the same as step 9.
    The privacy policy says Google's message decides on both origins, so
    `tests/adsense.test.ts` fails a build without it, by name, in Netlify's
    own log, which is how a deploy preview first showed that the setting and
    the policy disagreed. §5 has the two rules it does and does not satisfy,
    and the `legal-review` skill is where the policy is re-read whenever it
    changes.

## 4. The privacy policy

Google's terms require one on any site serving their ads, naming third-party
cookies, the vendors that set them, and how to opt out. **Both origins load
their script now**, so the policy has to cover both, and until this change it
covered one and denied the other in so many words.

**The trigger is the tag going into the head, not the first ad rendering.** A
script that contacts an ad vendor and is handed a cookie has already done the
thing a policy exists to disclose, whether or not anything is drawn on the
page. So the rewrite came with the element, not with the inventory, and the
same policy covers both an unfilled request and a filled one without needing
a second pass when the account's approval state changes between them.

**It is written, and live at `https://smpl.money/privacy/`**: an ordinary page
under `src/app/privacy/`, its words in `src/content/legal.ts`, and
`tests/legal.test.tsx` asserting the disclosures. It is linked from this
site's footer, and that same URL is the application's `PRIVACY_POLICY_URL`
(§3 step 9), which the application links from its sidebar on every page.

**Five sentences in it were true when they were written and are not now**, and
they are recorded here because the shape of the mistake matters more than the
words. Each was a summary of the site rather than a claim about the
application, and each rounded in the flattering direction:

- "The website collects nothing. There is no analytics, no tracking pixel, and
  no cookie."
- "Nothing. smpl.money is a set of static files. It sets no cookies, runs no
  analytics, embeds no third-party scripts, and makes no network requests to
  anywhere other than itself."
- "**smpl.money sets no cookies at all.** … There is nothing to ask you about,
  so there is no banner: a consent notice on a site that stores nothing would
  be theater." Under a heading, "Cookies, and why this site has no banner",
  that the same change made wrong.
- That a visitor in the EEA, the UK or Switzerland "will be asked before any
  of them are set", written before any message was published. It may be said
  again now that one is, and only of those three places; §5 and §3 step 7
  are why.
- "That script doesn't currently show you any advertising … so nothing is
  displayed", under a paragraph arguing that Auto ads being off meant no ad
  could appear. A manual unit is what now stands where that argument stood.
  Its replacement said the ad was non-personalized, as a fact, while a later
  section of the same policy said an ad here could be personalized; both
  went when the consent messages were published, and one sentence now says
  the ad can be personalized and points at who is asked.

**A marketing claim is never stronger than the privacy policy it links to**, and
this is the inverse failure: the policy was stronger than the origin it
described. The pricing page inherited it, because it was written against the
policy, and it outlived the fix by a commit: the policy stopped promising a
consent notice while `src/content/pricing.ts` went on saying "in the UK, the
EEA and Switzerland you get asked before any advertising cookie is set" — the
strongest consent promise on the site, on the page selling the paid plan, one
click from a policy denying it. Now that the messages are published it says
who is asked, by region. The check that missed it asked whether consent was
_mentioned_; `tests/legal.test.tsx` now holds every "asked before" on either
surface to the region it is true in.
§8 is what the replacement sentences are written from: the vendor, the five
hosts, the cookie and what a visitor can do about it.

Keeping it true is the `legal-review` skill, which names "before turning ads
on" as one of the times it must run. This document does not restate the
policy, because two copies of a promise are two chances for them to disagree.

## 5. Consent, for visitors in the EEA, the UK and Switzerland

Two separate rules, and this section used to run them together:

| Rule                       | Applies to                         | Satisfied by                               |
| -------------------------- | ---------------------------------- | ------------------------------------------ |
| **ePrivacy consent**       | Any ad cookie, personalized or not | A consent notice, before the cookie is set |
| Google's **certified CMP** | Personalized ads only              | A consent platform Google has certified    |

**ePrivacy consent applies to every ad, and to this site's script even before
either origin's unit asks for one.** A non-personalized ad still sets cookies,
for frequency capping and fraud prevention, so a visitor in the EEA, the UK or
Switzerland has to be asked before any is set, whatever the two settings say.
Avoiding the second rule does not avoid this one. And the loader on
`smpl.money` leaves `IDE` on `.doubleclick.net`, Google's advertising
identifier, on the first navigation (§8), so this origin is inside the first
rule already and is inside it with the cookie that matters most rather than a
probe.

**A certified CMP is Google's condition for personalized ads, and only
those.** With `ADSENSE_CONSENT_MANAGED` unset, a unit forces
`requestNonPersonalizedAds` on every request, and Google serves those without
a certified platform. Both origins did, this one through
`src/components/ad-banner.tsx`, which sets the flag the same way the
application does, before the same `push({})`. Both now set the setting, so
neither forces the flag, and the published message is what stands between a
visitor in Europe and a personalized ad.

**Google's own European regulations message satisfies both** (§3 step 7). It
is part of the AdSense account and is itself a certified platform, and the ad
tag both origins already load is what delivers it — so there is no third
vendor and no extra script. It is not free of consequence for the content
security policy, though: Google normally serves it from
`fundingchoicesmessages.google.com`, which this origin's policy does not
admit, and no run here has seen it requested (§3 step 7). **Re-measure from
inside the region** rather than assuming either way.

**`ADSENSE_CONSENT_MANAGED` is set on `app.smpl.money` and on `smpl.money`
alike, as of 4 October 2026**, with a European and a US state message
published for both. The decision used to be the opposite, and the argument
for it still holds as a description of the cost: the European message asks
only visitors in those three places, the US message offers an opt-out rather
than asking, and everybody else is shown personalized ads without ever being
asked. The operator chose that, and the order this section always asked for
was kept: `src/content/legal.ts` and `src/content/pricing.ts` were rewritten
to say so in the same change that made `tests/adsense.test.ts` require the
setting, on both origins at once. The application's own privacy policy is
this site's, so there is no third document to move.

## 6. The file

`public/ads.txt`, as shipped:

```
# smpl.money — authorized digital sellers
# Covers app.smpl.money: the same publisher id, so no subdomain= referral is
# needed and adding one would delegate authority to a file the application
# only serves while ads are configured.
# https://support.google.com/adsense/answer/9785052
google.com, pub-9953156598757474, DIRECT, f08c47fec0942fa0
ownerdomain=smpl.money
```

**The id is written in two spellings, and this file holds the one the other
does not.** The AdSense dashboard shows it as `pub-…`; this file wants
`pub-…`; `ADSENSE_CLIENT_ID` — on both origins, in Netlify's environment
variables and in the application's — and the script's `client` parameter want
`ca-pub-…`. Getting that wrong is the second most common way to serve a file
that authorizes nobody. This file is the only place the bare `pub-` form is
written at all: `src/content/ads.ts` no longer derives one from the other the
way it once did, because there is no longer a `pub-` form in source to derive
it from — `ca-pub-…` is what the environment variable holds, matching the
application exactly, and this file is what a build-time value can never keep
in sync with on a static export. The two have to agree by whoever sets
`ADSENSE_CLIENT_ID` matching this file, same as they always did when the
`pub-` form lived in source instead of in an environment variable — what
moved is where the literal is written, not who is responsible for the two
agreeing.

`f08c47fec0942fa0` is Google's own TAG id and is the same for everyone.

`ownerdomain` is Recommended in ads.txt v1.1 and the spec says to include it
even when it matches the host.

`netlify.toml` already pins the content type for this path. Nothing else is
needed.

## 7. Afterwards

- **Check it is served as text, not HTML**: `curl -si https://smpl.money/ads.txt`
  must return `200` and `text/plain`.
- **Check the AdSense dashboard** says the file is found and valid.
- **Check the application's own** `/ads.txt` matches, once it is configured.
  Two files, one id.
- **Check the script is in `<head>` on the deployed site**, not in `<body>`.
  React hoists it, and it only hoists an `async` script with a `src` and no
  event handler — drop the `async`, write `defer`, or add an `onLoad`, and it
  silently stays where it was written with no build error. View source on
  `https://smpl.money/` and look above `</head>`.
- **Check the application's sidebar has a Privacy link** to
  `https://smpl.money/privacy/`. It appears only when `PRIVACY_POLICY_URL`
  is set, so it is the visible sign that the setting reached the running
  container rather than stopping in the stack, or in `env.local` on a
  machine upgraded in place.
- **Check this site's banner reads back the real slot id**:
  `curl -s https://smpl.money/ | grep -o 'data-ad-slot="[^"]*"'` should print
  the one from step 6, not the placeholder `.github/workflows/verify.yml`
  builds this repository's own CI with. Check a page from the excluded set
  too — `curl -s https://smpl.money/privacy/ | grep -c adsbygoogle` should
  print `0` — because the two states look identical in the AdSense dashboard
  and differ only in what a page actually sent.
- **Check the European regulations message shows**, on the first page with an
  ad, to a browser in the EEA or the UK. A VPN is the practical way to be one.
  The dashboard saying it is published is not the same as seeing it. Until it
  does show, §3 step 7 is an open gap rather than a pending step.
- **Re-measure whenever an ad stops rendering, or before trusting the policy
  again.** §8 is the recipe. Google changes what the script loads, and the
  symptom of a sixth host is a blocked subresource in a console nobody is
  watching.
- **If you ever add a second seller or a different id on the subdomain**, that
  is the case §1 rules out — and the moment a `subdomain=` line becomes
  correct. Re-read §1 before adding one.

## 8. What the script actually does, and how that was measured

One subsection of argument, then the facts it rests on. Everything from
**Five hosts** down is an **observation**, not a reading of Google's
documentation, and the content security policy in `netlify.toml` is written
from it. That is why the policy here is far narrower than the application's own
ads policy: the application has no AdSense account to watch and had to allow a
blanket `https:`, and this repository does have one, so guessing wide was their
only option and is not ours.

### Why a rule had to be rewritten first

`AGENTS.md` forbade "no script or image from a vendor's domain", flatly, and
the snippet at the top of this document is a script from a vendor's domain. Nothing here was
grandfathered: the rule was written when this origin needed no vendor script
and the site's whole privacy claim was that it made no request to anywhere but
itself, and an AdSense account changes what that rule is about rather than
whether it is worth having. So the invariant was rewritten in the same change,
to name this one exception and keep refusing everything else it always did — a
vendor logo, a badge, a "powered by" mark, a font from a CDN, an analytics
tag, a share widget, a chat bubble, a consent vendor. The repository's own
discipline is that a guide records a disagreement rather than quietly losing
it, and the state to avoid is the third one: a rule the shipped tree breaks
while the document still says it does not.

Two things keep it an exception rather than a door, and both are why this
section exists. **The loader is the account's own, unmodified, and the only
thing allowed beside it is the account's own manual ad unit, also unmodified**
— one banner, in the exact shape Google documents, and nothing past that: no
second unit, no consent vendor of our own, no analytics tag. `AGENTS.md` is
where the boundary is drawn, not restated here. And **the hosts it may reach
are a closed list that was observed**, not a category. `netlify.toml` names
five; `src/content/ads.ts` says what each is for; `tests/adsense.test.ts`
parses that policy and fails if it loses a measured host, grows a wildcard,
or admits one nobody measured.

**What no test here catches is a sixth host.** `tests/adsense.test.ts` reads
a string in a TOML file and `tests/branding.test.ts` reads built markup, where
only `pagead2.googlesyndication.com` ever appears — the other four are reached
at runtime by injected script, which is the same reason this section exists
at all. So a host Google starts using is a blocked subresource in a console
nobody is watching, and the remedy is the recipe below rather than a check.
Widening the list on a hunch is exactly how one exception becomes a general
permission, which is why it is written out rather than left as "measure it".

There is a second consequence, and it is not about scripts at all. A script
that reaches another origin is a **disclosure**: this site is no longer a set
of files that talks to nobody, so `src/content/legal.ts` has to say what it
does, to the same standard the privacy policy holds the application to. Three
sentences in that file went false in the commit that added one element (§4).

### Five hosts

`src/content/ads.ts` is the machine-readable copy, with what each one is for.
The directives are where each host was needed, not where it might be allowed:

| Host                            | Needed in                              |
| ------------------------------- | -------------------------------------- |
| `pagead2.googlesyndication.com` | `script-src`, `img-src`, `connect-src` |
| `googleads.g.doubleclick.net`   | `frame-src`                            |
| `ep1.adtrafficquality.google`   | `img-src`, `connect-src`               |
| `ep2.adtrafficquality.google`   | `script-src`, `frame-src`              |
| `www.google.com`                | `frame-src`                            |

Two things about the policy that look like omissions and are not.
**`frame-src` has no `'self'`**: naming `frame-src` overrides `default-src`
for frames, so nothing same-origin can be framed. Nothing is today.
**`worker-src` and `child-src` are absent** and fall back to
`default-src 'self'`. The measurement was clean without them, so they stay
out; widening on a hunch is the habit this whole section exists to replace.

### One cookie, and it takes two pages to see which

`googleads.g.doubleclick.net` sets `test_cookie=CheckForPermission` on the
first page, with a fifteen-minute expiry. On the **next navigation** the same
host sets `IDE` and deletes `test_cookie` in the same response, so the browser
is left holding one cookie: `IDE` on `.doubleclick.net`, `Secure`, `HttpOnly`,
`SameSite=None`. Google sends a two-year expiry and the browser stores it
capped at 400 days, about thirteen months.

`IDE` is DoubleClick's per-browser advertising identifier, and it arrives with
every slot unfilled and no consent notice. No cookie on `smpl.money` itself,
and no other third-party cookie from any of the five hosts.

**A run that stops at the first page reports the probe and misses the
identifier**, which is what happened: the privacy policy said for a while that
the one cookie was short-lived and "not an identifier for you", and the check
holding it asserted the same wrong string. So step 3 of the recipe below says
to navigate, not just to load. This site still stores nothing of its own — the
theme follows `prefers-color-scheme` with no local storage — so the honest
sentence is that the site stores nothing and Google's script stores an
advertising identifier.

### The consent messages, published and not yet seen

`window.googlefc` is the global Google's consent messages define, so it is
how you tell whether one loaded. The first run recorded here found it
undefined on every page with no message published. The second, on
4 October 2026, after the operator published a European and a US state
message for both origins, served this branch's build as `smpl.money` with
`ADSENSE_CONSENT_MANAGED=true` and drove it from California: still undefined
on all six page shapes, no request for a message, no refusal from the
content security policy, the same five hosts, and `test_cookie` then `IDE`
on `.doubleclick.net` with every slot unfilled. From California the US
message should have loaded, so either a site that serves no ads is served no
messages, or the messages do not reach this origin yet. Measure from inside
the EEA and a covered US state once ads fill, and check the console for
`fundingchoicesmessages.google.com` being refused (§3 step 7).

### How it was measured, so it can be done again

The content security policy is served by Netlify and by nothing else:
`npm start` serves `out/` with no headers at all, and the test suite's own
server sends none either. **So nothing in this repository can observe the live
policy**, and the checks over it are textual. That is the reason this recipe
exists rather than a test.

1. Build the site with the script in it: `npm run build`.
2. Serve `out/` over **HTTPS**, at the hostname `smpl.money`, sending the
   header block from `netlify.toml` — a `hosts` entry pointing `smpl.money` at
   `127.0.0.1` and a locally trusted certificate for it. Both halves matter.
   Over `http://localhost` the browser applies different third-party cookie
   rules and `upgrade-insecure-requests` does nothing, and the script reports
   the page's origin to Google, so a measurement taken on `localhost` is a
   measurement of a different page.
3. Open it in Chromium with the console visible and **navigate** through at
   least one page of each shape in one session, rather than loading each in a
   fresh one: the homepage, `/pricing/`, `/docs/`, a docs page, `/blog/` and a
   post. A violation shows up as `Refused to load …` naming the directive.
   One session and more than one page is not a detail — the cookie changes on
   the second navigation, and a per-page run never sees it.
4. Read the cookies from the browser's own storage pane rather than
   `document.cookie`, which cannot see another origin's. Read them **after
   each navigation**, and read the raw `Set-Cookie` headers too: the response
   that sets `IDE` is the one that deletes `test_cookie`, and a jar inspected
   once at the end shows the result without the sequence.
5. Evaluate `window.googlefc`.

A run is only evidence if it produced **zero** violations across all six page
shapes. The run this section records did.

**It was taken with Auto ads ON and every slot unfilled, and both halves of
that have changed since.** At the time of the run the script placed an
`ins.adsbygoogle` and asked on every page, and every ask came back `unfilled`
because the account was not approved. Auto ads is now off and a manual banner
asks instead, on ten pages rather than all twenty-some, and whether it fills
is whatever the account's approval state is at the time this is read rather
than something this document can assert. Neither change obviously widens what
is contacted — a persistent display unit is not a format Auto ads would
refuse to place, and asking on fewer pages can only narrow — but neither was
true of the run that produced these five, so **this measurement is now a
thing to repeat, not a ceiling to trust on the strength of that argument
alone.** Re-run the recipe above once the unit is live and reads back a real
slot id, and sooner if a console shows a blocked subresource in the meantime.

A filled ad draws its creative inside the `googleads.g.doubleclick.net` frame,
which this origin's policy does not reach, so the five hosts should still hold
once the banner fills — **should**, not do, for the reason above. The first
page that fills is the one to open a console on.
