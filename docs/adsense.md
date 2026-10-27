# AdSense, from a site that shows none

**This site shows no ads and loads no ad script.** The ads run in the
application at `app.smpl.money`, to accounts on the free plan. `smpl.money`
carried them too for about four weeks — Google's loader on every page from
29 September 2026, and a banner unit on most pages from 4 October — until the
owner moved them to the application alone in October 2026: "I'm running ads
only in the app now." §7 is what that removed, and what came back.

**One file stays, and it is why this document still exists.** Google reads
`ads.txt` from the root domain, `app.smpl.money`'s root domain is this one,
and so `public/ads.txt` is what authorizes the application's inventory (§1).
It is the one thing about AdSense this repository still owns, and the one
mistake here that costs money with no symptom (§2).

**Everything else about the ads is the application's**: the account's
settings, the ad units, the consent messages, the environment the
application reads, and the upgrade path for the machine that runs it. Its own
documentation is the reference, and §5 says where, and what the application
still needs from this site.

## 1. Why a site with no ads has an `ads.txt`

Google reads `ads.txt` from the **root domain**, and the ads run on a
subdomain.

> "You only need to do this [add a `subdomain=` line] if the authorized seller
> or your publisher ID are different for the subdomain when compared to the
> root domain."
> — [Google AdSense, ads.txt guide](https://support.google.com/adsense/answer/9785052)

The application derives its own `/ads.txt` from its `ADSENSE_CLIENT_ID`,
which names the same account as this file, so the publisher id on
`app.smpl.money` and on `smpl.money` is **the same id**. The root record
therefore already covers the subdomain, and no `subdomain=` referral is
needed. The application's `docs/monetization.md` says the same thing, in a
section that once said the opposite.

**Do not add a `subdomain=` line.** A referral makes crawlers consume the
subdomain's file _instead of_ the root's, and the application only registers
that route while ads are configured — so a referral hands the whole
authorization chain to a file that disappears whenever `ADSENSE_CLIENT_ID` is
unset or the application is down. Root-only has no such single point of
failure.

**Do not delete the file because the ads left.** With the loader, the
banner and the five Google hosts gone from this site, the file looks like the
last of them, and removing it is what a tidy cleanup does next. It is not a
leftover. It is the root domain's statement that this publisher may sell the
application's inventory, and it is how this site was connected to the account
(§3). The same holds for the content type it is served with and for the
absence of a catch-all rewrite (§2): all three exist for the application's
ads, and none of them stopped mattering when this site's did.

## 2. The one way to lose money silently

> "Domains hosting an ads.txt file where the seller's publisher ID isn't listed
> are no longer monetized through Ad Manager, and Google no longer buys ads on
> such sites."

Read that twice. **A missing `ads.txt` is ignored and costs nothing. A
well-formed one that does not name your id demonetizes the domain.**

Every symptom of the bad state looks like success: the file is served, the
build is green, the application's ads render, the revenue is zero. Nothing on
this site would look any different, because nothing on this site shows an
ad.

Two ways to reach it, both guarded:

- **Shipping the file without the id in it.** `public/ads.txt` did not exist
  until the account did, and `tests/export-shape.test.ts` asserted that it did
  not. The file arrived with the id (§3), and the same check now holds it to
  exactly the DIRECT record naming that id and the `ownerdomain` line. That
  check writes the id out longhand rather than reading it from the file,
  because a check that reads its referent out of the thing it is checking
  passes whatever that thing says.
- **A catch-all rewrite.** `/* → /index.html 200` on a static host turns every
  unknown path into a 200 of HTML — including `/ads.txt` if the file were
  ever missing, and `/ads.tx` after a typo. `netlify.toml` has none and the
  same test refuses one, in `netlify.toml` and in a `_redirects` file alike
  (`operations.md` 2.1).

## 3. The order the site was connected in

**The order is Google's, not a preference.** Review does not start until the
site is connected to the account, connecting it needs the publisher id, and
the id exists the moment the account does. So the file carrying the id went
in _before_ the review request. An earlier version of this list put `ads.txt`
after approval and never connected the site at all, which is a review that
never starts.

1. **Real content first.** Thin content is the usual rejection, and it is this
   site a reviewer reads, not the application. The learn articles and the
   docs are written and announced: linked from the header and the footer,
   indexed, and in the sitemap. The blog is built and deliberately not
   announced (`content.md` 7.1).
2. **The privacy policy live** at `https://smpl.money/privacy/`. Google
   requires one before serving, and it is the address the application links
   (§5).
3. **The account**, with `smpl.money` as the site. The publisher id is shown
   as `pub-` and sixteen digits as soon as the account exists (Account, then
   Settings, then Account information), not on approval:
   `pub-9953156598757474`.
4. **`public/ads.txt`, then connect the site with it.** Deploy, then in
   AdSense's step for connecting the site choose the **ads.txt snippet**
   method and verify. Done, in one commit with the check that holds the file.
5. **Request review.** Everything after approval — the ad units, the consent
   messages, Auto ads, the application's settings — is the application's
   (§5).

**This site verifies by `ads.txt`, and now it is the only method of the
three that fits.** AdSense's code snippet would put Google's loader back on
every page, which `AGENTS.md` forbids now that the ads are the application's.
Its meta tag, `<meta name="google-adsense-account" content="ca-pub-…">`,
would work and stays refused because it is a **second place to write the
id**, and the two spellings of that id are the sharpest edge here (§4).
`ads.txt` has to exist regardless (§1), so it is the method that costs
nothing extra.

## 4. The file

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

**The id is written in two spellings, and this file holds the one the
application does not.** The AdSense dashboard shows it as `pub-…`, and this
file wants `pub-…`; the application's `ADSENSE_CLIENT_ID` wants `ca-pub-…`.
Getting that wrong is the second most common way to serve a file that
authorizes nobody. Nothing in this repository reads `ADSENSE_CLIENT_ID` any
more, so the two agree only because whoever sets it on the application
matches this file, which is the same responsibility it always was with the
literal in a different place.

`f08c47fec0942fa0` is Google's own TAG id and is the same for everyone.

`ownerdomain` is Recommended in ads.txt v1.1 and the spec says to include it
even when it matches the host.

`netlify.toml` pins the content type for this path (`operations.md` 2.3).
Nothing else is needed.

## 5. What the application owns, and what it needs from here

Whether an ad shows, and to whom, is decided by the application and the
AdSense account, and documented in the application's repository:

- the account's settings, Auto ads off among them, because it injects formats
  the application promises not to show;
- the ad units and their slot ids;
- the European regulations message and the US state regulations message, and
  `ADSENSE_CONSENT_MANAGED`, which the application sets so that the messages
  rather than its own code decide whether an ad is personalized;
- the application's environment, `ADSENSE_CLIENT_ID`,
  `ADSENSE_BANNER_SLOT_ID`, `ADSENSE_FOOTER_SLOT_ID` and `PRIVACY_POLICY_URL`
  among it, and how the machine that runs it gets onto a release that reads
  them.

The reference for all of it is the application's `docs/monetization.md` and
`docs/deployment.md`, with `docs/upgrades.md` for the machine, in
`https://github.com/thtmnisamnstr/simple-balance` at the ref `sync-from-app`
§0 resolves. **This document used to carry a copy of that procedure**, step by
step, and the copy is how a setting that does not exist,
`ADSENSE_PERSONALIZED`, came to be written here in place of the one that
does, and how a pinned release went stale here after it had moved there.
Check names against that reference, never against memory or an old copy.

**Two things the application needs from this site**, and both are this
repository's to keep:

- **This `ads.txt`** (§1).
- **The privacy policy, at `https://smpl.money/privacy/`.** The
  application's `PRIVACY_POLICY_URL` points at it, the application refuses to
  start with ads configured and no policy to link, and it links that address
  from its sidebar on every page. So the page cannot move without that
  setting moving with it. It carries the three disclosures Google requires of
  a site serving its ads, for the application (`AGENTS.md`), and says who is
  asked first, region by region. Keeping it true is `legal-review`, and that
  skill's §5 is where the reading of the consent messages from inside each
  region is owed.

## 6. Checking it

- **It is served as text, not HTML**: `curl -si https://smpl.money/ads.txt`
  returns `200` and `text/plain`, and its two records are §4's.
- **A wrong path is a 404, not a page**:
  `curl -so /dev/null -w '%{http_code}\n' https://smpl.money/ads.tx` prints
  `404`. A `200` there is the catch-all rewrite §2 is about, arriving from the
  host's settings rather than from `netlify.toml`.
- **The AdSense dashboard says it is found and authorized**, under Sites. A
  change to the file takes Google a few days to a month to pick up, so a stale
  status the day after an edit is not yet a fault.
- **The application's own `/ads.txt` names the same id**:
  `curl -s https://app.smpl.money/ads.txt`. Two files, one id. That one exists
  only while the application has ads configured, which is why nothing here may
  point at it (§1).
- **No page here asks Google for anything**:
  `curl -s https://smpl.money/ | grep -c googlesyndication` prints `0`. The
  build is held to that (`AGENTS.md`), and the live response is worth one look
  because a host can add to a page what no build contains.
- **If you ever add a second seller or a different id on the subdomain**, that
  is the case §1 rules out, and the moment a `subdomain=` line becomes
  correct. Re-read §1 before adding one.

## 7. When this site carried ads

From 29 September 2026 every page here loaded Google's AdSense loader, and
from 4 October a manual banner unit sat on every page but the legal pages and
the 404, its client and slot ids read at build time from the same
environment variables the application reads. To allow it, `AGENTS.md`'s rule
against a vendor script was rewritten to name one exception, and
`netlify.toml`'s content security policy admitted five of Google's hosts,
each measured rather than guessed: a build served over local HTTPS as
`smpl.money` and driven in Chromium reached `pagead2.googlesyndication.com`,
`googleads.g.doubleclick.net`, `ep1.adtrafficquality.google`,
`ep2.adtrafficquality.google` and `www.google.com`, and left one cookie,
`IDE` on `.doubleclick.net`, Google's advertising identifier. The privacy
policy said so, host by host.

In October 2026 the ads moved to the application alone. With them went the
loader, the banner and its stylesheet rules, `src/content/ads.ts`, the five
hosts, the variables this build read and the `.env.example` that listed them,
the consent setting on this origin, and the tests that held all of it. What
came back: a content security policy naming nothing but this origin
(`operations.md` 3.2), a Permissions-Policy that denies the Topics API, a
privacy policy that says this site loads nothing from another origin and sets
no cookie, and a rule with no exception in it (`web.md` 6.5).

**If ads ever come back here**, it is a decision `AGENTS.md` records first,
and the measurement is taken again rather than copied. The recipe, and why a
run on `localhost` measures a different page, is §8 of this document as it
stood at `1b426ad` (`git show 1b426ad:docs/adsense.md`). The five hosts above
are a record of what one script did in the autumn of 2026, not a list to paste
into a policy.
