/**
 * The legal pages, as data.
 *
 * Same reason as the rest of the copy (`content.md` 3.1): it can be read by a
 * test, and it can be reviewed as prose. It also means the "last updated" date
 * is in one place rather than at the bottom of two documents where one of them
 * will be wrong.
 *
 * **This is not legal advice and the documents say so.** What they are is the
 * standard shape for a self-hosted product with a hosted option, an ad-funded
 * free tier and a Stripe-billed paid tier — written specifically rather than
 * generically, because a policy that describes a product nobody built is worse
 * than none: it is a false statement about what happens to somebody's data.
 *
 * **No em dash in anything a reader sees**, the same as the marketing pages
 * (`content.md` 1.6). The comments here are prose for a maintainer and keep
 * theirs.
 */

/** Bumped whenever either document changes materially. Rendered on both. */
export const legalUpdated = "2026-09-22";

const operator = {
  /** Who is responsible for the hosted deployment, in the legal sense. */
  name: "Gavin Johnson",
  contact: "info@smpl.money",
} as const;

export type Section = { readonly heading: string; readonly paragraphs: readonly string[] };

export const privacy = {
  title: "Privacy policy",
  description:
    "What Simple Balance collects, why, who else sees it, and how to get it back or have it " +
    "deleted, for smpl.money and for the hosted application at app.smpl.money.",
  intro: [
    "This policy covers two things run by the same person: the website at smpl.money, and the " +
      "hosted application at app.smpl.money. It does not cover a copy of Simple Balance that " +
      "somebody else runs on their own server. If you are using one of those, the person who " +
      "runs it decides what happens to your data, and this document is not about them.",
    "Simple Balance is a double-entry ledger. It necessarily holds a detailed record of your " +
      "money, and that is the whole reason this policy is worth reading rather than skimming.",
  ],
  sections: [
    {
      heading: "Who is responsible",
      paragraphs: [
        "The data controller for smpl.money and for the hosted application at app.smpl.money " +
          `is **${operator.name}**, who can be reached at ${operator.contact}.`,
        "For a copy of Simple Balance that somebody else runs, the controller is whoever runs " +
          "it. That is the whole point of self-hosting, and it means this policy does not " +
          "describe their deployment and we have no access to it.",
      ],
    },
    {
      heading: "The short version",
      paragraphs: [
        "The website collects nothing. There is no analytics, no tracking pixel, and no cookie.",
        // Every provider the long version names, because a summary that lists
        // two of four is the version most people read and the one that was
        // wrong: it said "nobody except the payment processor and the
        // advertising network" while the host holding every balance went
        // unmentioned. Semicolons, and the role before the name: with commas,
        // "Oracle Cloud Infrastructure, which hosts it, the payment processor"
        // read as Oracle hosting the payment processor and everything after.
        "The application holds the ledger you put into it, the account you signed in with, and " +
          "the operational records needed to run a service. It shares them with nobody except " +
          "the providers that run the service: the host, Oracle Cloud Infrastructure; the " +
          "payment processor; the advertising network on the free plan; and an email delivery " +
          "service once one is in use. Each is described below. An AI assistant sees your " +
          "ledger only if you connect one.",
        // "Every transaction", not "everything": the export is the transaction
        // CSV and nothing else. Budgets, templates and recurring entries have
        // no export, and a policy that promised them would be promising a
        // portability the product does not provide.
        "You can export every transaction as CSV at any time, and deleting your account deletes " +
          "your data. Stripe keeps its own record of any payments you made, as tax law requires.",
      ],
    },
    {
      heading: "What the website collects",
      paragraphs: [
        "Nothing. smpl.money is a set of static files. It sets no cookies, runs no analytics, " +
          "embeds no third-party scripts, and makes no network requests to anywhere other than " +
          "itself.",
        "Our hosting provider, Netlify, processes the technical information any web server " +
          "receives in order to serve a page (your IP address, the page requested, your browser " +
          "and the time) and retains it briefly for operational and security purposes. We do " +
          "not analyze it, and we cannot identify you from it.",
      ],
    },
    {
      heading: "What the application collects",
      paragraphs: [
        "**What you give it.** Your name and email address, and everything you enter into the " +
          "ledger: accounts, balances, transactions, payees, categories, budgets, notes and any " +
          "file you import. This is the substance of the service and it is stored because the " +
          "service cannot work otherwise.",
        // The session row carries both columns because Better Auth fills them
        // unless told not to, and the application does not tell it. A policy
        // that described the cookie and not the row was describing half of
        // what a sign-in stores.
        "**How you sign in.** A password you set, stored only as a hash that cannot be reversed, " +
          "or a Google account you chose to connect. Sessions are kept as a signed cookie which " +
          "is strictly necessary to keep you signed in, and each one records the IP address and " +
          "browser it was started from.",
        "**Operational records.** Server logs, which include IP addresses and request paths, " +
          "kept briefly for security and debugging. Sign-up and sign-in attempts are counted " +
          "per IP address, so nobody can guess at passwords one after another. An audit " +
          "history of changes to your own ledger, which is part of the product and visible to " +
          "you.",
        // `billing_customer` and `billing_subscription`, named rather than
        // summed up as "payment details", which reads as the card this very
        // paragraph says is never here.
        "**If you subscribe.** The identifiers Stripe gives your customer record and your " +
          "subscription, and your subscription's status and dates. **We never see or store " +
          "your card details**: they go directly to Stripe.",
      ],
    },
    {
      heading: "Why we are allowed to hold it",
      paragraphs: [
        "Where the UK GDPR and the EU GDPR apply, the lawful bases are: **performance of a " +
          "contract**, for your account and the ledger itself, without which there is no " +
          "service to provide; **legitimate interests**, for security logging and fraud " +
          "prevention, balanced against your rights and kept to what is necessary; **legal " +
          "obligation**, for the payment records tax law requires to be kept; and " +
          "**consent**, for personalized advertising and for optional emails, which you may " +
          "withdraw at any time.",
      ],
    },
    {
      heading: "Advertising, on the free plan",
      paragraphs: [
        "The hosted application shows advertising to accounts on the free plan, supplied by " +
          "**Google AdSense**. Paid accounts are shown no advertising, and a paid account " +
          "doesn't load Google's script at all, because the server decides and the browser is " +
          "never told the rule.",
        "Google and its partners use cookies and similar technologies to serve ads. **Ads are " +
          "requested as non-personalized by default**, which means they are based on the page " +
          "and your rough location rather than on a profile of you.",
        /*
         * What declining does, and it is not "no ads". This said "Declining
         * means no ads are served to you" while the pricing page said saying
         * no "keeps the ads off your spending rather than off the page", and
         * the pricing page was the one that was right: the application renders
         * the slot whatever the answer, and consent decides only how Google may
         * fill it. `CHANGELOG.md` records the pricing page being corrected for
         * this; the policy kept the false sentence, twice, until
         * `tests/legal.test.tsx` started holding the two surfaces together.
         *
         * Worded around what the answer controls rather than around what
         * Google will do with it, which this page does not decide: a "limited
         * ad" is Google's name for what it may serve without the cookies that
         * were declined.
         */
        "**Non-personalized is not the same as cookie-free.** Even these ads set cookies, for " +
          "frequency capping and fraud prevention, which is why consent is asked for in the " +
          "EEA, the UK and Switzerland regardless of whether the ads are personalized. That " +
          "consent is collected through Google's own certified consent platform before any ad " +
          "cookie is set, and you can change or withdraw it at any time from the same notice. " +
          "Declining doesn't remove the ads. It keeps them from being personalized and keeps " +
          "Google from setting the advertising cookies that need your consent, though Google " +
          "may still show what it calls a limited ad in the same place.",
        "Ads are only ever personalized if you have consented to that specifically.",
        "**What Google receives.** Our publisher id, and the address of the page the ad sits " +
          "on. That address is not nothing: pages in the application carry record identifiers " +
          "in their paths, so a URL identifies a row in your ledger, though not a person, a " +
          "name or an amount. No account name, no balance, no figure, no email address and no " +
          "identifier of yours is sent as a targeting parameter, and the browser's referrer is " +
          "held to this origin so it does not travel either.",
        "Google's own description of how it uses data from sites that use its services is at " +
          "policies.google.com/technologies/partner-sites. You can control ad personalization " +
          "across Google's products at myadcenter.google.com, and opt out of third-party vendor " +
          "cookies at aboutads.info and youronlinechoices.eu.",
        "Advertising never appears on the billing page or the sign-in screen.",
      ],
    },
    {
      heading: "Payments",
      paragraphs: [
        "Payments are processed by **Stripe**. When you subscribe, your card details are " +
          "collected by Stripe's own form and sent directly to Stripe; they do not pass through " +
          "our servers and we never store them.",
        // What `customers.create` sends, field for field. The id is
        // `simpleBalanceUserId`, the application's own opaque id for the
        // person, which is what lets an operator tie a dashboard row back to
        // an account without Stripe learning anything a support agent could
        // not already see. It said "an internal account identifier", and in a
        // policy where "accounts" are also the checking and savings accounts
        // somebody enters, that read as a bank account's id going to Stripe.
        "To create your customer record, we send Stripe your name, your email address and an " +
          "internal identifier for your Simple Balance account, not for any account in your " +
          "ledger. Nothing from your ledger is sent.",
        /*
         * Column for column. `billing_customer` holds the Stripe customer id;
         * `billing_subscription` the subscription id, its status, the price,
         * when the period ends, whether it cancels then, when a payment first
         * failed and any change of price scheduled. `billing_operation` is the
         * record `underIdempotency` writes before every billing request it
         * sends to Stripe, and finishes with the answer or the error, so a
         * retry after a timeout is the same request rather than a second
         * charge. That is four requests, not only changes to a subscription:
         * `subscription.set` (subscribing, or switching between monthly and
         * yearly), `subscription.cancellation` (canceling, or taking the
         * cancellation back), and `payment.setup` and `payment.setup.confirm`,
         * which replace a card and store the SetupIntent id, a Stripe
         * identifier and not card data. "Each change to your subscription"
         * left the last two out of a list the retention paragraph then says is
         * what deleting removes. The client secret in Stripe's answer is
         * nulled before it is stored. `billing_override` is a plan the
         * operator sets by hand, with the reason. None of it is a card number,
         * and every row cascades from the user.
         */
        "We store the identifiers Stripe gives your customer record and your subscription, the " +
          "price you're on, and your subscription's status and dates, such as when the current " +
          "period ends and whether it's set to cancel then, because those are what decide what " +
          "your account may do. We also keep a record of each billing request you make, such as " +
          "subscribing, changing or canceling your plan, or replacing your card, and how it " +
          "ended, so a request retried after a timeout is carried out once rather than twice, " +
          "and, if we ever give you a plan ourselves rather than through Stripe, a note of why " +
          "and for how long. None of it includes your card details. Stripe's privacy policy is " +
          "at stripe.com/privacy.",
      ],
    },
    {
      heading: "Email",
      paragraphs: [
        // The application's four messages: address confirmation, password
        // reset, a recurring transaction's proposal notice and a template's
        // reminder. The last two are both switched on by the person, on the
        // record they are about.
        "**Email you asked for.** Confirming your address, resetting a password, and the " +
          "reminders you turn on for a recurring transaction or a template. These stop when " +
          "you stop asking for them.",
        "**Email about the service itself**: planned maintenance, a change that affects your " +
          "data, a feature being retired, a security matter. These are part of running the " +
          "service rather than marketing, so they are sent to every account and there is no " +
          "unsubscribe from them. We keep them rare and we keep them factual.",
        /*
         * A promise about a mechanism that does not exist yet, stated as one.
         * The application sends no product email and has nothing to unsubscribe
         * from: the sign-up form asks for a name, an address and a password,
         * so "say so when you create the account" pointed at a field nobody
         * could find. The unsubscribe stays promised, because it is what any
         * such mail would have to carry, and writing in is the opt-out that
         * works today.
         */
        "**Occasional email about the product**, such as a significant new capability. None is " +
          "sent today. If that changes, every one will carry an unsubscribe link that works " +
          "immediately and without signing in, and unsubscribing from these won't affect the " +
          `two kinds above. You can opt out in advance at any time by writing to ${operator.contact}.`,
        "There is no newsletter, nothing is sold to a mailing-list broker, and your address is " +
          "never shared for anybody else's marketing.",
        /*
         * The application's four messages, and only those. This said "sends
         * none of these", which took in the service email above "sent to
         * every account", and beside "the hosted application doesn't use one
         * yet" it read as the hosted service sending nobody anything. No
         * configuration sends service or product email, so neither belongs in
         * a sentence about configuration. A reminder is saved rather than
         * absent: the form says so and keeps the setting, because a setting
         * refused for want of a mail server would be lost once one is added.
         */
        "A deployment configured with no mail server sends no confirmation, reset or reminder " +
          "email. It asks nobody to confirm an address and offers no password reset, and a " +
          "reminder you turn on is saved, with nothing sent until a mail server is added.",
      ],
    },
    {
      heading: "Who else sees your data",
      paragraphs: [
        "**Nobody, other than the processors needed to run the service**, and an AI assistant " +
          "if you connect one yourself. We do not sell your data, rent it, or share it for " +
          "anyone else's marketing.",
        /*
         * Named, not "our providers" (`legal-review` §5). Oracle is the
         * application's host and holds the database, so it is the processor
         * holding every balance, and it was the one left unnamed. Netlify is
         * named above because it hosts only this site.
         *
         * The mail relay is the one that cannot be named yet, because none has
         * been chosen. Saying so is true; naming a plausible one would not be.
         * The service is named here in the same change that sets `SMTP_HOST`
         * on the application.
         *
         * Only that. It went on "so it sends none of those messages today",
         * which took in the service email the section above says is "sent to
         * every account", and the notice by email both Changes sections and
         * the terms' price clause promise: one document saying mail goes to
         * everybody and none goes to anybody. "Carries the messages above" did
         * the same thing more quietly, so the relay is said to carry what the
         * application sends, the four messages `mail.ts` has, and nothing it
         * does not.
         */
        "Those processors are: **Oracle Cloud Infrastructure**, which hosts the application and " +
          "stores its database; **Stripe**, for payments; **Google**, for advertising on the " +
          "free plan and for Google sign-in if you use it; and an email delivery service, which " +
          "carries the confirmation, reset and reminder email the application sends. The " +
          "hosted application doesn't use one yet, and this page will name the service before " +
          "one is in use.",
        // Not a processor: the person chooses the assistant and approves what
        // it may do, and its provider answers to them rather than to us. The
        // homepage promotes connecting one, so the policy has to say where
        // that data goes.
        "**An AI assistant you connect** sees what you grant it when you approve the " +
          "connection, and what its provider does with that is governed by the provider's own " +
          "terms, not by this policy. Nothing reaches an assistant unless you connect one, and " +
          "you can disconnect it from the settings page at any time.",
        "We will disclose data if we are legally required to, and we will tell you unless we are " +
          "prohibited from doing so.",
      ],
    },
    {
      heading: "Where it is held, and for how long",
      paragraphs: [
        "Data for the hosted application is stored by Oracle Cloud Infrastructure, on servers in " +
          "the United States. Where you are in the UK or the EEA, transfers rely on the UK " +
          "Addendum and the European Commission's Standard Contractual Clauses.",
        /*
         * What the software deletes, not what "we" hold. `closeBillingForDeletion`
         * deletes the Stripe customer and then the row mapping the account to
         * it, and everything else cascades from the user. Deleting a Stripe
         * customer does not delete its charges and invoices: they stay in the
         * operator's Stripe account with the billing details on them, and that
         * is the record the lawful basis "legal obligation, for the payment
         * records tax law requires" is about. So "deleting your account also
         * deletes what we hold about your payments" was stronger than the
         * product. "Typically six years" was HMRC's figure, carried over from
         * the British draft, and the period is Stripe's to state rather than
         * ours.
         *
         * "Billing records", not "payment details": in ordinary use payment
         * details are the card, and the policy says the card is never here.
         * What is here is what the Payments section lists, and the sentence
         * after says so where somebody reading about deletion will look.
         */
        "Your ledger is kept until you delete it or delete your account. Server logs are kept " +
          "for a short operational period. Deleting your account deletes the billing records " +
          "the application keeps and your customer record at Stripe. Those records are the " +
          "ones listed under Payments, such as Stripe's identifiers and your subscription's " +
          "status and dates, and none of them holds your card details. The payments themselves " +
          "stay in Stripe's records for as long as tax law requires, under Stripe's own " +
          "privacy policy.",
      ],
    },
    {
      heading: "Deleting your account",
      paragraphs: [
        "You can delete your account from the settings page. It removes your ledger, your " +
          "account and every associated record in one operation, and it cancels any subscription " +
          "at the same time. It cannot be undone, which is why exporting first is worth doing.",
        "Deletion is refused rather than partially completed if the payment processor cannot be " +
          "reached to cancel a subscription, so that nobody is left being charged for an account " +
          "that no longer exists.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Where the UK or EU GDPR applies you have the right to access your data, to correct it, " +
          "to have it erased, to restrict or object to how it is used, and to receive it in a " +
          "portable form. The California Consumer Privacy Act gives California residents " +
          "comparable rights, including the right not to be discriminated against for exercising " +
          "them. **We do not sell or share personal information** as those laws define it.",
        "Most of these you can exercise yourself and immediately: the product has CSV export of " +
          "your transactions for portability, editing for correction, and account deletion for " +
          "erasure. For anything else, write to the address below and we will answer within " +
          "one month.",
        "If you are not satisfied, you may complain to your data protection authority: in the " +
          "UK, the Information Commissioner's Office at ico.org.uk.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "The service is not directed at children under 16 and we do not knowingly collect their " +
          "data. If you believe a child has created an account, write to us and we will delete it.",
      ],
    },
    {
      heading: "Cookies, and why this site has no banner",
      paragraphs: [
        "**smpl.money sets no cookies at all.** No analytics, no tracking pixel, no third-party " +
          "script. There is nothing to ask you about, so there is no banner: a consent notice " +
          "on a site that stores nothing would be theater.",
        // Better Auth's session cookie, and the short-lived ones it sets while
        // a sign-in or an agent's authorization is under way. The application
        // writes no cookie of its own beyond those.
        "**The application sets only the cookies it needs to sign you in.** A session cookie " +
          "keeps you signed in, and short-lived cookies hold a sign-in or an assistant's " +
          "authorization while it is in progress. None of them is used for anything else or " +
          "shared, and none needs consent, because each is essential to something you asked " +
          "for.",
        // This said "a preference cookie" for the theme. The theme is a column
        // on the account, and the browser keeps a copy in local storage only
        // so the first paint is the right color, which `legal-review` §5's
        // "open devtools and look" would have shown: no theme cookie at all.
        "**Your theme is not a cookie.** Whether you chose the light or dark theme is saved on " +
          "your account, and a copy is kept in your browser's local storage so the page opens " +
          "in the right colors. Signing out clears that copy.",
        // Stripe.js sets its own cookies on the page that loads it, for fraud
        // prevention. "The only one" holds only while the application imports
        // `@stripe/stripe-js/pure`: the package's default entry injects the
        // script the moment the module is evaluated, which puts it on every
        // page, the sign-in screen included, and makes this sentence false.
        "**On the plan page, Stripe sets its own cookies.** That page, where you subscribe, is " +
          "the only one that loads Stripe's script, and Stripe sets cookies there to prevent " +
          "fraud. They are covered by Stripe's privacy policy.",
        "**On the free plan, Google sets cookies for advertising**, and those are the ones that " +
          "do require your consent. If you are in the EEA, the UK or Switzerland, you will be " +
          "asked before any of them are set, through a consent notice provided by Google's own " +
          "certified consent platform. You can change or withdraw that choice at any time from " +
          "the same notice.",
        "Declining doesn't remove the ads. It keeps them from being personalized and keeps " +
          "Google from setting the advertising cookies that need your consent, though Google " +
          "may still show a limited ad. It doesn't limit the product in any other way, and " +
          "nothing about your account changes.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "If this policy changes materially we will say so on this page and, where the change " +
          "affects how your data is used, by email before it takes effect.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Write to info@smpl.money about anything on this page, or anything else. There is a " +
          "person at the other end.",
      ],
    },
  ] satisfies readonly Section[],
} as const;

export const terms = {
  title: "Terms of use",
  description:
    "The terms for using the hosted Simple Balance at app.smpl.money, including the paid plan, " +
    "cancellation and refunds.",
  intro: [
    "These terms cover the hosted service at app.smpl.money and the website at smpl.money. " +
      "They do not cover a copy of Simple Balance you run yourself: that is governed by the " +
      "AGPL-3.0 license the software is published under, and nothing here restricts the rights " +
      "that license gives you.",
  ],
  sections: [
    {
      heading: "The service",
      paragraphs: [
        "Simple Balance is a double-entry bookkeeping application for your own money. It is a " +
          "record-keeping tool. **It is not financial, tax, accounting or legal advice**, it does " +
          "not file anything on your behalf, and it does not move money.",
      ],
    },
    {
      heading: "Your account",
      paragraphs: [
        "You are responsible for keeping your password and your sign-in method secure, and for " +
          "what is done through your account. Tell us promptly if you think somebody else has " +
          "access to it.",
        "You must be at least 16 to hold an account.",
      ],
    },
    {
      heading: "Plans and payment",
      paragraphs: [
        /*
         * A first choice, then no swap. This said frozen accounts accept
         * changes "until you choose them instead", which the next section's
         * "that choice is made once" forbids. While `activeChoicePending`
         * holds, `activeAccountChange` accepts any set within the limit, so a
         * frozen account can be picked then. Once the choice is made it
         * refuses any change that would take an active account out of use,
         * and the ways out are a place coming free, which it allows, and the
         * paid plan, which `frozenAccountRefusal` names.
         *
         * "May put to you", not "the one-time choice after a downgrade": not
         * every downgrade opens one. `activeChoicePending` holds only while
         * more live accounts are marked in use than the plan keeps, so a
         * second lapse after a subscription that opened and restored nothing
         * asks nothing, and the earlier choice stands. The next section says
         * when it is open.
         */
        "The free plan lets you use up to three financial accounts at a time and shows " +
          "advertising. Accounts beyond that are frozen: they stay readable and keep counting " +
          "toward your totals, but accept no changes. One can be used again if you pick it in " +
          "the one-time choice a downgrade may put to you, if you give it a place that has come " +
          "free by archiving or deleting an account you're using, or if you subscribe. The " +
          "Premium plan is $30 per year or $3 per month, lets you use every account you have " +
          "and removes the advertising. Prices are in US dollars and exclude any tax that may " +
          "apply where you are.",
        "Subscriptions renew automatically at the end of each period until canceled. We will " +
          "give at least 30 days' notice by email before any price increase, and you may cancel " +
          "before it takes effect.",
      ],
    },
    {
      heading: "Canceling, and refunds",
      paragraphs: [
        "You can cancel at any time from the plan page. Cancellation takes effect at the end of " +
          "the period you have already paid for; you keep Premium until then.",
        /*
         * What `frozenAccountIds` does in the gap before anybody chooses:
         * nobody is present when a subscription lapses, so the oldest three of
         * the live accounts still marked active keep working and the rest
         * freeze at once. On a first downgrade every account is still marked,
         * since the column defaults to true and nothing writes it on the way
         * down, so that is the three oldest. After a choice,
         * `setActiveAccounts` has unmarked the ones left out, and an account
         * opened or restored since arrives marked, so it is the oldest three
         * among the ones still chosen and those: an account frozen when
         * the second subscription began does not come back ahead of a newer
         * one. "The oldest of the accounts you were using" said neither, and
         * to somebody who had been using every account while subscribed it
         * read as the three oldest again.
         *
         * "Any three" because `activeAccountChange` accepts any set within the
         * limit while `activeChoicePending` holds, frozen accounts included.
         * But that holds only while more live accounts are marked active than
         * the plan keeps, so the promise carries its condition in the same
         * sentence. It said "you return to the free plan, keep every account
         * you have, and choose any three", as if every downgrade asked:
         * somebody who chose A, C and E, subscribed again, opened nothing and
         * lapsed has three marked, nothing pending, and a request for A, B
         * and C refused as a swap. "In use" is the `active` column in words a
         * reader can follow: an account arrives marked (0024's default), a
         * restore writes true, and `setActiveAccounts` unmarks the ones a
         * choice leaves out. The condition starts when the subscription ends,
         * since a cancellation takes effect at the end of the period.
         */
        "**Nothing is deleted when a subscription ends.** You return to the free plan and keep " +
          "every account you have. An account counts as in use from when you open or restore " +
          "it until a choice leaves it out or you archive or delete it. If more than three are " +
          "in use when a subscription ends, which can happen on a first downgrade and again " +
          "after a subscription in which you opened or restored accounts, you choose any three " +
          "to keep using; if three or fewer are, nothing is asked and they stay in use. Any " +
          "others are frozen: readable in full, still counted in your totals, and closed to " +
          "changes. Until you choose, the oldest three of the accounts in use stay usable: on a " +
          "first downgrade, your three oldest accounts; after an earlier choice, the oldest " +
          "three among the accounts still chosen and any you've opened or restored since, so an " +
          "account that was frozen when you subscribed again isn't one of them. That choice is " +
          "made once. After that, an account you're using stays active until you archive or " +
          "delete it, and only then can a frozen account take its place; subscribing again " +
          "makes all of them usable at once.",
        "If you are in the UK or the EEA you have a statutory right to cancel within 14 days of " +
          "first subscribing and receive a refund. Beyond that, payments are generally " +
          "non-refundable, but if something has gone wrong, write to us. We would rather sort " +
          "it out than stand on this paragraph.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: [
        // It said "within the documented rate limits", and there are none to
        // document: the application limits sign-up, sign-in and the setup
        // code, and nothing on the API or the MCP surface. A clause pointing at
        // a document that does not exist binds nobody. The sentence before it
        // already rules out overloading the service.
        "Do not use the service to break the law, to store somebody else's data without their " +
          "knowledge, to attack or overload the service, or to try to reach another person's " +
          "account. Automated access through the provided API and MCP interfaces is expected and " +
          "welcome.",
      ],
    },
    {
      heading: "Email we will send you",
      paragraphs: [
        "Holding an account means we can email you about the service: maintenance, a change " +
          "that affects your data, a retirement, a security matter. There is no unsubscribe " +
          "from those, because they are how we tell you something you need to know.",
        "We don't send news about the product today. If we ever do, every message will carry " +
          "an unsubscribe link that works immediately, and unsubscribing won't affect your " +
          "account or the messages above. You can also write to us to opt out before anything " +
          "is sent. The privacy policy sets out the lawful basis for each.",
      ],
    },
    {
      heading: "Your data",
      paragraphs: [
        "Your ledger is yours. We claim no ownership of it, and you can export every " +
          "transaction in it as CSV at any time.",
        "How it is handled is set out in the privacy policy, which forms part of these terms.",
      ],
    },
    {
      heading: "Availability, and what we promise",
      paragraphs: [
        "We aim to keep the service available and to keep backups, but this is a small service " +
          "and it is offered **without a guaranteed level of availability**. Planned maintenance " +
          "will be announced where we can.",
        /*
         * What the export holds, said where somebody is told to rely on it.
         * It is the transaction CSV: an account's opening balance is set on
         * the account rather than written to the file, and budgets, templates
         * and recurring entries are not in it either. Size was not the only
         * thing standing between the file and a deployment of your own: an
         * import names one account and puts every row there (the
         * application's `csv.md` §8 lists accounts as not preserved), and the
         * export follows the list's filters, so the Transactions page's,
         * unfiltered, holds every account and loaded whole lands in one of
         * them. What goes back is each account's own export, from its own
         * page, into the matching account, and the importer takes ten
         * thousand rows, so an account past that goes a date range at a time
         * too. Where the file comes from is said outright, because "one
         * account at a time" alone reads as loading the one file repeatedly.
         *
         * The date range is one of those filters, and the one that is never
         * empty. `TransactionBrowser` builds the Export CSV link from the
         * range on screen, and the date bar starts at This month
         * (`presetFromParam` falls back to it), so an export taken as the
         * page opens holds one month. Said as the bar's own label, All time,
         * in the paragraph that opens "keep your own copy", because following
         * it without that dropped everything older. A transfer is in both
         * accounts' files, and the second import flags it as a duplicate;
         * said so the reader expects the flag rather than committing it twice.
         */
        "**Keep your own copy of anything you cannot afford to lose.** CSV export exists for " +
          "exactly this. It holds every transaction you ask it for, but not what sits around " +
          "them, such as an account's opening balance, budgets, templates and recurring " +
          "entries. Because the software is open source, you can load your transactions into a " +
          "deployment of your own one account at a time: export each account from its own page " +
          "with the dates set to All time, and bring that file into the matching account. An " +
          "account past 10,000 transactions goes in a date range at a time, one export per " +
          "range. Each import puts every row into the one account you pick, so a file holding " +
          "several accounts lands in one of them. A transfer between two of your accounts is " +
          "in both files, and the second import flags it as a duplicate.",
      ],
    },
    {
      heading: "Liability",
      paragraphs: [
        "To the extent the law allows, the service is provided as is, and we are not liable for " +
          "indirect or consequential loss, or for any decision you make on the basis of figures " +
          "in your ledger. Where liability cannot be excluded, it is limited to what you have " +
          "paid in the twelve months before the claim.",
        "Nothing here limits liability for death or personal injury caused by negligence, for " +
          "fraud, or for anything else that cannot lawfully be limited, including your statutory " +
          "rights as a consumer, which these terms do not affect.",
      ],
    },
    {
      heading: "Ending it",
      paragraphs: [
        "You can stop using the service and delete your account at any time.",
        "We may suspend or close an account that breaks these terms, and we will tell you why " +
          "and give you a chance to export your data unless the law prevents us.",
        "If the hosted service is ever discontinued, we will give at least 60 days' notice, " +
          "refund any unused prepaid period, and keep export working until the end. The software " +
          "is AGPL-3.0, so a deployment of your own remains possible regardless.",
      ],
    },
    {
      heading: "Changes, and law",
      paragraphs: [
        "If these terms change materially we will give notice by email before the change takes " +
          "effect. Continuing to use the service after that means accepting them.",
        "These terms are governed by the laws of England and Wales, and the courts there have " +
          "jurisdiction. If you are a consumer elsewhere, this does not deprive you of the " +
          "protection of your own country's mandatory consumer law.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["info@smpl.money."],
    },
  ] satisfies readonly Section[],
} as const;
