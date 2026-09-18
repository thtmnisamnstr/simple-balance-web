# Adding AdSense

This site does not serve ads. **The application at `app.smpl.money` does**, and
this site is what authorises it. That inversion is the only genuinely
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
authorisation chain to a file that disappears whenever `ADSENSE_CLIENT_ID` is
unset or the app is down. Root-only has no such single point of failure.

<!-- This paragraph corrects the application repository's own
     docs/monetization.md, which stated the referral as mandatory. -->

## 2. The one way to lose money silently

> "Domains hosting an ads.txt file where the seller's publisher ID isn't listed
> are no longer monetized through Ad Manager, and Google no longer buys ads on
> such sites."

Read that twice. **A missing `ads.txt` is ignored and costs nothing. A
well-formed one that does not name your id demonetises the domain.**

Every symptom of the bad state looks like success: the file is served, the
build is green, the ads render, the revenue is zero.

Two ways to reach it, both guarded:

- **Shipping the file before you have an id.** `public/ads.txt` does not exist
  and `tests/export-shape.test.ts` asserts that it does not.
- **A catch-all rewrite.** `/* → /index.html 200` on a static host turns every
  unknown path into a 200 of HTML — including `/ads.txt` before it exists, and
  `/ads.tx` after a typo. `netlify.toml` has none and the same test refuses
  one.

## 3. The order to do this in

AdSense review is the longest lead time in this project — days to weeks — and
`ads.txt` changes then take Google **a few days to a month** to pick up. Start
early and expect to wait twice.

1. **Publish real content first.** Thin content is the usual rejection. Ship
   the documentation and a few posts, and _announce_ them
   (`src/content/sections.ts`), so the site a reviewer sees is not one page.
2. **Write the privacy policy** (§4). Google requires it before serving.
3. **Apply to AdSense**, with `smpl.money` as the site.
4. **On approval**, create the ad units in the AdSense dashboard and note the
   publisher id and the slot ids.
5. **Add `public/ads.txt`** (§6) and invert the test that refuses it. Deploy.
6. **Wait for the crawl.** Confirm in the AdSense dashboard that `ads.txt` is
   found and valid before step 7.
7. **Only then configure the application**: set `ADSENSE_CLIENT_ID` and the
   slot ids there. Turn **Auto ads off** in the account — it is an account
   setting no code can override, and it injects formats the application
   promises not to show.

## 4. The privacy policy

Google's terms require one on any site serving their ads, naming third-party
cookies, the vendors that set them, and how to opt out. The application is what
serves the ads, so the policy has to cover both surfaces.

It is not written yet — `docs/roadmap.md` 3.1. When it is, it lives at
`/privacy/` as an ordinary page under `src/app/privacy/`, and it is linked from
the footer of both this site and the application.

This repository cannot write it for you: most of its content is about who you
are and what else you run.

## 5. Consent, for EEA and UK readers

The application requests **non-personalised ads by default**
(`ADSENSE_PERSONALIZED` defaults to false there), which is the setting that
makes the default configuration defensible without a consent platform.

It does **not** remove the consent obligation for EEA and UK traffic. If you
have meaningful traffic from either, Google requires a certified consent
management platform bound to your publisher account — a third vendor, a third
script, and a CSP exception on the application.

That is the application's problem, not this site's, unless this site ever
serves ads itself. It does not, and there is no reason for it to.

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
the second most common way to serve a file that authorises nobody.

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
- **If you ever add a second seller or a different id on the subdomain**, that
  is the case §1 rules out — and the moment a `subdomain=` line becomes
  correct. Re-read §1 before adding one.
