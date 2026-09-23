---
name: legal-review
description: Bring the privacy policy and terms back to true after something changes what data is handled, who handles it, or what the site sends. Use when adding a vendor, script, cookie, form or email, before turning ads on, or on a periodic review.
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
- **Before turning ads on**, or changing anything about them.
- **A new kind of email.** See §4; this is where the next change is coming.
- A periodic read, twice a year, because rot is silent.

## 1. What actually changed

```sh
git diff main...HEAD --stat
```

Then ask the question the diff does not answer: **does anything now leave the
browser that did not before?** A `fetch`, a `<script src>`, an `<img>` from
another origin, a form action. `operations.md` 3.2 leans on this origin
talking to nothing, so a new outbound request is a CSP change _and_ a policy
change.

```sh
grep -rn "fetch(\|<script\|src=\"http\|action=" src/ | grep -v "\.test\." | head
```

## 2. The three disclosures AdSense requires

Non-negotiable once ads serve: **third-party cookies**, **the vendors that
set them**, and **how to opt out**. Missing one is a breach whose penalty is
account suspension, not ads that fail to render.

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

Avoiding the first is not avoiding the second. `docs/adsense.md` §5 and the
policy's cookies section both carry this; check they still agree.

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
  1. **`smpl.money`**: nothing, in the cookie list or in local storage.
  2. **The application's sign-in screen, then the dashboard**, before
     `/settings/plan`. Expect the sign-in cookies once you are signed in, and
     **no theme cookie**: the theme is saved on the account, with a copy in
     local storage so the first paint is the right color, which is where
     devtools shows it. On the free plan, with ads configured, also expect
     Google's advertising cookies, which the policy covers. In the EEA, the
     UK and Switzerland the consent message asks first, and none of them
     may appear until consent is given. Once the message is answered,
     whichever way, expect Google's record of the answer, `FCCDCF`: it
     stores the choice and is not an advertising cookie. After a decline,
     no advertising cookie (`__gads`, `__gpi`, `__eoi`) may appear. In the
     Network panel, **no request to `js.stripe.com`**, and no Stripe cookie.
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
- **Jurisdiction and contact.** Still right?

## 6. Where the policy covers two surfaces

It covers `smpl.money` **and** `app.smpl.money`, and explicitly not a
deployment somebody else runs. If the application changed, most of what you
are checking is over there — run **`sync-from-app`** first or alongside; the
checks in its §1 say whether anything moved.

## 7. Finish

Update `src/content/legal.ts`, bump `legalUpdated`, and add an assertion to
`tests/legal.test.tsx` for any disclosure that is now load-bearing — the
existing ones are the model: they check for the _claim_, not the prose.

Then `npm run verify` and **`merge-prep`**.

**If a change is material**, the policy says notice goes out by email before
it takes effect. That is a promise in the document; keep it.
