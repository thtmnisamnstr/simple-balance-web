# Adding AdSense

This site does not serve ads. **The application at `app.smpl.money` does**, and
this site is what authorizes it. That inversion is the only genuinely
surprising thing in this document, and everything below follows from it.

## 1. Why a marketing site has an `ads.txt` at all

Google reads `ads.txt` from the **root domain**. Ads run on the subdomain.

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
- **A catch-all rewrite.** `/* → /index.html 200` on a static host turns every
  unknown path into a 200 of HTML — including `/ads.txt` before it exists, and
  `/ads.tx` after a typo. `netlify.toml` has none and the same test refuses
  one.

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

1. **Publish real content first.** Thin content is the usual rejection. Ship
   the documentation and a few posts, and _announce_ them
   (`src/content/sections.ts`), so the site a reviewer sees is not one page.
2. **Confirm the privacy policy is live** at `https://smpl.money/privacy/`
   (§4). It is written; Google requires it before serving, and the application
   will not start with ads configured and no policy to link to (step 9).
3. **Create the AdSense account**, with `smpl.money` as the site, and note the
   publisher id. It is shown as `pub-` and sixteen digits as soon as the
   account exists (Account, then Settings, then Account information), not on
   approval. Every later step uses it.
4. **Add `public/ads.txt` and connect the site with it.** The file is §6's,
   with that id. In the same commit, invert the expectation in
   `tests/export-shape.test.ts` that no `ads.txt` ships, and change
   `docs/standards/operations.md` 2.2 and `docs/roadmap.md` 2.1, which both
   describe the file as absent. Deploy, then in AdSense's step for connecting
   the site choose the **ads.txt snippet** method and verify.

   **This site verifies by `ads.txt`**, and the other two methods are why.
   The AdSense code snippet is a `<script>` from Google's domain, which the
   CSP in `netlify.toml` refuses, since its `script-src 'self' 'unsafe-inline'`
   allows no external script host, and which `AGENTS.md`'s rule against
   vendor scripts forbids. The meta tag,
   `<meta name="google-adsense-account" content="ca-pub-…">`, would work —
   it is markup on this origin, and would go in through `metadata.other` in
   `src/app/layout.tsx` — but it is a second place to write the id, and the
   file has to exist regardless. This is not the premature file §2 warns
   about: it names the id, which is the one thing that makes an `ads.txt`
   safe.

5. **Request review.**
6. **On approval, create the ad units**: one display unit for the banner, and
   a second for the footer if you want one. Note each slot id, which is ten
   digits.
7. **Publish a European regulations message.** In AdSense, open **Privacy and
   messaging**, create a **European regulations** message for `smpl.money`
   (which covers `app.smpl.money`), choose its wording, and publish it. This
   comes before any ad setting goes on the application: the privacy policy
   tells visitors in the EEA, the UK and Switzerland that they are asked
   before any ad cookie is set, and without the message the first ad makes
   that false. §5 has why this one message is all consent needs.
8. **Turn Auto ads off** for the site. It is an account setting no code can
   override, and it injects formats the application promises not to show.
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
     policy and the pricing page promise. §5 says why `true` would break
     both.

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
   without ever being asked. This site's privacy policy says ads are only
   ever personalized with specific consent, and the pricing page's answer
   about ads says the same, so following the application's docs here would
   make both false on the first ad. Their advice fits an operator whose own
   policy allows that, and this one's does not. §5 has the rest.

   Otherwise, the application's own reference for all of this is those two
   documents, in `https://github.com/thtmnisamnstr/simple-balance` at the
   ref `sync-from-app` §0 resolves. `PRIVACY_POLICY_URL` was missing from
   this step once, and `ADSENSE_PERSONALIZED`, a setting that does not
   exist, was here instead of `ADSENSE_CONSENT_MANAGED`; check the names
   against that reference rather than against memory.

## 4. The privacy policy

Google's terms require one on any site serving their ads, naming third-party
cookies, the vendors that set them, and how to opt out. The application is what
serves the ads, so the policy has to cover both surfaces.

**It is written, and live at `https://smpl.money/privacy/`**: an ordinary page
under `src/app/privacy/`, its words in `src/content/legal.ts`, and
`tests/legal.test.tsx` asserting the three disclosures. It is linked from this
site's footer, and that same URL is the application's `PRIVACY_POLICY_URL`
(§3 step 9), which the application links from its sidebar on every page.

Keeping it true is the `legal-review` skill, which names "before turning ads
on" as one of the times it must run. This document does not restate the
policy, because two copies of a promise are two chances for them to disagree.

## 5. Consent, for visitors in the EEA, the UK and Switzerland

Two separate rules, and this section used to run them together:

| Rule                       | Applies to                         | Satisfied by                               |
| -------------------------- | ---------------------------------- | ------------------------------------------ |
| **ePrivacy consent**       | Any ad cookie, personalized or not | A consent notice, before the cookie is set |
| Google's **certified CMP** | Personalized ads only              | A consent platform Google has certified    |

**ePrivacy consent applies to every ad.** A non-personalized ad still sets
cookies, for frequency capping and fraud prevention, so a visitor in the EEA,
the UK or Switzerland has to be asked before any is set, whatever the
application's settings say. Avoiding the second rule does not avoid this one.

**A certified CMP is Google's condition for personalized ads, and only those.**
With `ADSENSE_CONSENT_MANAGED` unset, the application forces
`requestNonPersonalizedAds` on every request, and Google serves those without
a certified platform.

**Google's own European regulations message satisfies both** (§3 step 7). It
is part of the AdSense account and is itself a certified platform, and the ad
tag the application already loads is what delivers it — so there is no third
vendor, no extra script, and no exception to either origin's content security
policy.

**It is this site's promise as much as the application's.** The privacy
policy on this site is what tells a visitor they will be asked before any ad
cookie is set. If the message is not published before the application serves
an ad, the policy is false, whichever repository you think the ads belong to.

**`ADSENSE_CONSENT_MANAGED` stays unset on `app.smpl.money`**, whatever the
application's own docs recommend once the message is published (§3 step 9
says where they differ). Setting it to
`true` stops forcing non-personalized ads and lets each visitor's consent
answer decide. But the European regulations message asks only visitors in
those three places, so everybody else, the United States included, would be
shown personalized ads without ever being asked. The privacy policy says ads
are only ever personalized with specific consent, and the pricing page's
answer about ads says the same. If personalization is ever wanted, rewrite
both in `src/content/legal.ts` and `src/content/pricing.ts` first, and change
the setting after.

This site sets no cookies and serves no ads, so it needs no notice of its own.

## 6. The file, when the time comes

`public/ads.txt`:

```
# smpl.money — authorized digital sellers
# Covers app.smpl.money: the same publisher id, so no subdomain= referral is
# needed and adding one would delegate authority to a file the application
# only serves while ads are configured.
# https://support.google.com/adsense/answer/9785052
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
ownerdomain=smpl.money
```

Replace `pub-XXXXXXXXXXXXXXXX` with the real id — **the `ca-` prefix removed**.
The AdSense dashboard shows it as `pub-…`; the application's environment
variable wants it as `ca-pub-…`; this file wants `pub-…`. Getting that wrong is
the second most common way to serve a file that authorizes nobody.

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
- **Check the application's sidebar has a Privacy link** to
  `https://smpl.money/privacy/`. It appears only when `PRIVACY_POLICY_URL`
  is set, so it is the visible sign that the setting reached the running
  container rather than stopping at `env.local`.
- **Check the European regulations message shows**, on the first page with an
  ad, to a browser in the EEA or the UK. A VPN is the practical way to be one.
  The dashboard saying it is published is not the same as seeing it.
- **If you ever add a second seller or a different id on the subdomain**, that
  is the case §1 rules out — and the moment a `subdomain=` line becomes
  correct. Re-read §1 before adding one.
