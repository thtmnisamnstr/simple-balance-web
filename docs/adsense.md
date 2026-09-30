# Adding AdSense

**Both origins carry Google's ad script.** The application at `app.smpl.money`
shows ads to accounts on the free plan. This site, `smpl.money`, loads the same
account's script on every page. The root domain's `ads.txt` is what authorizes
the inventory on both, which is the genuinely surprising thing in this document
and what §1 is about.

What ships here is one element in `src/app/layout.tsx`, built from
`src/content/ads.ts` so the id has one home:

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9953156598757474"
  crossorigin="anonymous"
></script>
```

That is the account's own snippet, unmodified, on all twenty-two pages and the
404 — the homepage, the pricing page, the docs and the legal pages alike.
**Nothing in this repository declares an ad unit.** There is no
`<ins class="adsbygoogle">` anywhere, so whether a reader of `smpl.money` ever
sees an ad is Google's Auto ads account setting and not a decision in this
tree. **That setting is on** (§3 step 8): the script places its own
`ins.adsbygoogle` and asks for an ad on every page, and the ask comes back
unfilled today because the account is not approved yet. So this origin is
already asking for inventory, not merely loading a loader, and the first page
that fills is a state nobody here has seen.

This document used to open "This site does not serve ads", and most of what
followed was reasoned from that. Three things follow from its being false, and
each has a section here:

- The content security policy had to admit hosts. It names five, because five
  is what a real browser running the real script actually contacted — **§8 is
  the measurement and the recipe for repeating it.**
- The privacy policy had to stop saying this site sets no cookies, because it
  now sets one (§4), and had to stop saying a visitor in the EEA or the UK is
  asked first, because today nobody is (§5).
- `AGENTS.md`'s rule against a script from a vendor's domain had to be
  rewritten to record the decision rather than be broken quietly. It now
  permits this one script by name and still forbids every other vendor image,
  font, widget, analytics tag and consent vendor.

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
   a second for the footer if you want one. Note each slot id, which is ten
   digits. These are the application's units. This site declares none.
7. **Publish a European regulations message. This is the open gap, not a
   future step.** In AdSense, open **Privacy and messaging**, create a
   **European regulations** message for `smpl.money` (which covers
   `app.smpl.money`), choose its wording, and publish it.

   **Nothing is published today, and that was measured rather than assumed.**
   `window.googlefc` is `undefined` on every page of this site, which is how
   you can tell Google's consent platform is not loading, and the ad script
   sets a cookie on `.doubleclick.net` regardless (§8). So a visitor in the
   EEA, the UK or Switzerland gets an ad vendor's cookie with no notice at
   all.

   The plan was for this message to be published before any ad script went
   anywhere. It was not, and the script shipped first. What that costs is a
   promise: the privacy policy and the pricing page may not tell a visitor
   they are asked before an ad cookie is set, because on this origin they are
   not. **The legal pages say the true thing instead**, which is the only
   remedy this repository can apply on its own — the message itself is an
   account setting, published from the AdSense dashboard, and no commit here
   can publish it. §5 has the two rules it satisfies.

   **When it is published, come back and re-read the legal pages.** They are
   written for the state above, and they are wrong in the other direction once
   a notice exists. The `legal-review` skill names "before turning ads on" as
   one of the times it must run; this is the same trigger arriving late.

8. **Decide Auto ads deliberately. On this site it is off.** For the
   application it is an account setting no code can override and it injects
   formats the application promises not to show, so there it must be off.

   **On `smpl.money` it is the only thing that could put an ad on the page**,
   because this repository declares no ad unit. With it off, both halves are
   absent: no slot is declared here and none is injected there, so this site
   loads Google's script and displays nothing. That is the intended state.
   The script is carried for verification and because `ads.txt` on this domain
   is what authorizes the advertising the application serves — §1 — not
   because this site sells inventory.

   The consequence to keep in view is that the script still runs. It is
   fetched, it still reaches Google, and it still sets the cookie the privacy
   policy names. "No ads displayed" is not "no third party involved", and the
   policy is written for the second.

   **The pages Google may choose include `/privacy/` and `/pricing/`**: the
   page that discloses the advertising, and the page that sells the plan
   without it. That is the decision to take on purpose rather than discover,
   and it is the one reason to turn it off here. The legal pages are written
   for either state, because they describe the script rather than the
   inventory, and §8's measurement is not: it was taken unfilled, and the
   first page that fills is the one to watch a console on.

9. **Wait for the crawl, then configure the application.** Confirm in the
   AdSense dashboard that `ads.txt` is found and authorized.

   **Two things have to be true of the machine first**, and neither is one
   of the ad settings below, so check both before touching those:
   - **It runs a release that carries ads, 0.2.0 or later.** Billing and
     ads arrive in 0.2.0. The Oracle Cloud and AWS programs deploy the
     pinned release image, which is 0.1.6 until 0.2.0 is released and has
     neither, so until then nothing below would do anything.
     `sudo docker ps --format '{{.Image}}'` on the machine names the image
     it is actually running.

     How the machine gets onto 0.2.0 depends on when it was made. One
     created from the 0.2.0 release starts on it, because the programs
     write the pinned tag into its compose file at first boot. **On a
     machine that is already running, `pulumi up` changes nothing on it**:
     neither program runs first boot again or replaces the instance, so the
     compose file keeps the image it was written with. That machine takes
     0.2.0 the way any deployment does, by the release's own upgrade:
     `docs/upgrades.md` in the application, at the release's tag: its note
     for 0.2.0, then its How to upgrade. Two parts of it matter on this
     machine:
     - **The backup goes through the unit.** Run
       `sudo systemctl start simple-balance-backup.service`, so the dump
       lands in `/var/lib/simple-balance/backups` on the data volume; the
       script run bare writes to its own default on the boot disk. Check
       that `sudo journalctl -u simple-balance-backup.service -n 5` shows a
       line starting `simple-balance-backup: wrote`.
     - **The whole compose file is replaced, not its `image:` line.** The
       note says that a deployment running its own copy of a compose file
       takes the release's, because an older copy silently drops
       `PRIVACY_POLICY_URL`, and without it the application refuses to start
       once the AdSense ids are set. `/opt/simple-balance/compose.yml` is
       this machine's own copy, the one its first boot wrote, and one
       written from an earlier commit can leave `PRIVACY_POLICY_URL` out.
       Put the release's `deploy/compose/single/compose.yml` there, which
       already pins the 0.2.0 image, then run
       `sudo docker compose -f /opt/simple-balance/compose.yml pull` and
       `sudo systemctl restart simple-balance`. Before any ad setting goes
       into `env.local`,
       `grep -nE 'PRIVACY_POLICY_URL|ADSENSE_CLIENT_ID|SB_BILLING_ENABLED' /opt/simple-balance/compose.yml`
       must name all three, and `docker ps` must name the 0.2.0 image.

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
   - `ADSENSE_CONSENT_MANAGED` — **leave it unset**, which is `false`. That
     forces non-personalized ads on every request, which is what the privacy
     policy and the pricing page promise **of the application**. §5 says why
     `true` would break both, and why the same assurance does not reach this
     site.

   On the Oracle Cloud and AWS single machines these go in
   `/var/lib/simple-balance/env.local`, which is on the data volume and
   survives a rebuild. Edit it, then run
   `sudo systemctl restart simple-balance`. That is enough on a machine
   whose unit has a systemd drop-in, which folds `env.local` into the
   configuration on every start; `systemctl cat simple-balance` lists one
   if it is there. **A machine made before the programs installed that
   drop-in has none**, and a restart there brings the containers back
   with the configuration they already had. On one of those, run
   `sudo /usr/local/sbin/simple-balance-firstboot`, which rebuilds the
   configuration from `env.local` and is safe to run again, and then
   restart. Either way, §7's Privacy link is how you know it took. Every
   compose recipe in the application passes `PRIVACY_POLICY_URL` through to
   the container, but a machine runs its own copy, the one its first boot
   wrote, which is why a machine that was already running replaces that
   file above rather than editing it. A split deployment, with nginx in its
   own container, also needs `SB_ADS_CONFIGURED=true` on that frontend,
   because nginx decides the content security policy every page arrives
   with; the compose recipes derive it from `ADSENSE_CLIENT_ID`.

   **This step departs from the application's own docs on one setting, on
   purpose.** The application's `docs/deployment.md` says to set
   `ADSENSE_CONSENT_MANAGED` to `true` once a European regulations message
   is published. Its `docs/monetization.md` says to set it only if you want
   personalized ads, and then lists it as the third step of publishing the
   message, which is exactly where step 7 leaves you.
   **`app.smpl.money` keeps it unset anyway.** The message asks only
   visitors in the EEA, the UK and Switzerland, so with `true` everybody
   else, the United States included, would be shown personalized ads
   without ever being asked. This site's privacy policy says the
   application's ads are only ever personalized with specific consent, and
   the pricing page's answer about ads says the same, so following the
   application's docs here would make both false on the first ad. Their
   advice fits an operator whose own policy allows that, and this one's does
   not. §5 has the rest.

   Otherwise, the application's own reference for all of this is those two
   documents, in `https://github.com/thtmnisamnstr/simple-balance` at the
   ref `sync-from-app` §0 resolves. `PRIVACY_POLICY_URL` was missing from
   this step once, and `ADSENSE_PERSONALIZED`, a setting that does not
   exist, was here instead of `ADSENSE_CONSENT_MANAGED`; check the names
   against that reference rather than against memory.

## 4. The privacy policy

Google's terms require one on any site serving their ads, naming third-party
cookies, the vendors that set them, and how to opt out. **Both origins load
their script now**, so the policy has to cover both, and until this change it
covered one and denied the other in so many words.

**The trigger is the tag going into the head, not the first ad rendering.** A
script that contacts an ad vendor and is handed a cookie has already done the
thing a policy exists to disclose, whether or not anything was drawn on the
page — and nothing is drawn today, because the account is not approved and
every ask comes back unfilled (§3 step 8). So the rewrite came with the
element, not with the inventory, and it needs no second pass when the first
ad fills.

**It is written, and live at `https://smpl.money/privacy/`**: an ordinary page
under `src/app/privacy/`, its words in `src/content/legal.ts`, and
`tests/legal.test.tsx` asserting the disclosures. It is linked from this
site's footer, and that same URL is the application's `PRIVACY_POLICY_URL`
(§3 step 9), which the application links from its sidebar on every page.

**Four sentences in it were true when they were written and are not now**, and
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
  of them are set". Nobody is asked; §5 and §3 step 7 are why.

**A marketing claim is never stronger than the privacy policy it links to**, and
this is the inverse failure: the policy was stronger than the origin it
described. The pricing page inherited it, because it was written against the
policy, and it outlived the fix by a commit: the policy stopped promising a
consent notice while `src/content/pricing.ts` went on saying "in the UK, the
EEA and Switzerland you get asked before any advertising cookie is set" — the
strongest consent promise on the site, on the page selling the paid plan, one
click from a policy denying it. It states the requirement now and says no
notice is published. The check that missed it asked whether consent was
_mentioned_; `tests/legal.test.tsx` now also asks that it not be _promised_.
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

**ePrivacy consent applies to every ad, and to this site's script even with no
ad.** A non-personalized ad still sets cookies, for frequency capping and
fraud prevention, so a visitor in the EEA, the UK or Switzerland has to be
asked before any is set, whatever the application's settings say. Avoiding the
second rule does not avoid this one. And the loader on `smpl.money` leaves
`IDE` on `.doubleclick.net`, Google's advertising identifier, before any ad
unit exists at all (§8), so this origin is inside the first rule already and
is inside it with the cookie that matters most rather than a probe.

**A certified CMP is Google's condition for personalized ads, and only those.**
With `ADSENSE_CONSENT_MANAGED` unset, the application forces
`requestNonPersonalizedAds` on every request, and Google serves those without
a certified platform. **That assurance does not reach this site.** The snippet
here is the bare loader with no such parameter, so nothing in this repository
makes a request non-personalized, and the privacy policy may not imply
otherwise about `smpl.money`.

**Google's own European regulations message satisfies both** (§3 step 7). It
is part of the AdSense account and is itself a certified platform, and the ad
tag both origins already load is what delivers it — so there is no third
vendor and no extra script. It is not free of consequence for the content
security policy, though: the old claim that it needs "no exception to either
origin's" policy was written when this origin loaded no ad script. Today the
policy here admits the five hosts in §8, and the consent platform arrives over
those same hosts, so **re-measure when it is published** rather than assuming
the list still holds.

**It is not published, so the promise is the thing that changed.** The privacy
policy used to be what told a visitor they would be asked before any ad cookie
is set. It is not asked and it is set, so the policy says what is actually
true and points at Google's own controls instead. When the message goes up,
that paragraph is wrong in the other direction and has to move back.

**`ADSENSE_CONSENT_MANAGED` stays unset on `app.smpl.money`**, whatever the
application's own docs recommend once the message is published (§3 step 9
says where they differ). Setting it to
`true` stops forcing non-personalized ads and lets each visitor's consent
answer decide. But the European regulations message asks only visitors in
those three places, so everybody else, the United States included, would be
shown personalized ads without ever being asked. The privacy policy says the
application's ads are only ever personalized with specific consent, and the
pricing page's answer about ads says the same. If personalization is ever
wanted, rewrite both in `src/content/legal.ts` and `src/content/pricing.ts`
first, and change the setting after.

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

**The id is written three ways and two of them are in this repository.** The
AdSense dashboard shows it as `pub-…`; this file wants `pub-…`; the
application's environment variable and the script's `client` parameter want
`ca-pub-…`. Getting that wrong is the second most common way to serve a file
that authorizes nobody. `src/content/ads.ts` holds the `pub-` form once and
derives the `ca-pub-` one from it, so the file and the script tag cannot name
two different publishers — a state in which everything renders, every check
that reads only one of the two passes, and the revenue is zero.

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
  container rather than stopping at `env.local`.
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
section exists. **The snippet is the account's own, unmodified, and nothing is
added beside it** — no second tag, no ad unit, no consent vendor of our own.
And **the hosts it may reach are a closed list that was observed**, not a
category. `netlify.toml` names five; `src/content/ads.ts` says what each is
for; `tests/adsense.test.ts` parses that policy and fails if it loses a
measured host, grows a wildcard, or admits one nobody measured.

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

### No consent platform

`window.googlefc` is `undefined` on every page. That is the global Google's
Funding Choices platform defines, so its absence is how you can tell no
consent message is loading on this origin. An EEA or UK visitor gets `IDE`,
an advertising identifier, with no notice. §3 step 7 is what closes that, and
it is an account setting rather than a commit.

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

**It was taken with Auto ads ON and every slot unfilled, and that is the
limit of what it proves.** At the time of the run the script placed an
`ins.adsbygoogle` and asked on every page, and every ask came back `unfilled`
because the account was not approved. Auto ads has since been turned **off**
(§3 step 8), so the script now asks for nothing at all — which can only
*narrow* what it contacts, never widen it. The five-host list is therefore a
ceiling rather than an exact figure, and a ceiling is the safe direction for a
policy: the risk of a CSP is being too tight, and this one is measured against
a busier state than the site is now in.

A filled ad would draw its creative inside the
`googleads.g.doubleclick.net` frame, which this origin's policy does not
reach, so the five hosts should still hold if Auto ads is ever turned back on
— **should**, not do. The first page that fills is the one to open a console
on, and it is the one occasion on
this list where finding a sixth host would be unsurprising rather than
alarming.
