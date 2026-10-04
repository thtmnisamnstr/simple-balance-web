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
 * (`content.md` 1.5). The comments here are prose for a maintainer and keep
 * theirs.
 */

/** Bumped whenever either document changes materially. Rendered on both. */
export const legalUpdated = "2026-10-04";

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
        // "The website collects nothing. There is no analytics, no tracking
        // pixel, and no cookie." True of a site that loaded nothing, and false
        // from the day smpl.money started serving Google's advertising script:
        // five Google hosts are contacted and a cookie lands in the reader's
        // browser. What survives is the half that is still true, said as
        // narrowly as it is true, because retreating to "we may use cookies"
        // would lose the part worth knowing along with the false part.
        //
        // First in the summary, and not buried after the application's
        // providers, because this is the one thing on this page that is
        // happening to the person reading it right now (`content.md` 2.4).
        "**This website loads Google's advertising script on every page**, this one included. " +
          "The site itself keeps nothing about you: no analytics, no tracking pixel, and " +
          "nothing of its own saved in your browser. Google's script is another matter, and " +
          "the hosts it reaches, the cookie it sets and how to opt out are under What the " +
          "website loads.",
        // Every provider the long version names, because a summary that lists
        // two of four is the version most people read and the one that was
        // wrong: it said "nobody except the payment processor and the
        // advertising network" while the host holding every balance went
        // unmentioned. Semicolons, and the role before the name: with commas,
        // "Oracle Cloud Infrastructure, which hosts it, the payment processor"
        // read as Oracle hosting the payment processor and everything after.
        //
        // Named, every one. The mail service was "an email delivery service
        // once one is in use" until one was chosen, and naming Gmail beside a
        // nameless "advertising network" would have hidden that both are
        // Google. Gmail keeps its own item, because it is a different thing
        // Google does with different data.
        "The application holds the ledger you put into it, the account you signed in with, and " +
          "the operational records needed to run a service. It shares them with nobody except " +
          "the providers that run the service: the host, Oracle Cloud Infrastructure; the " +
          "payment processor, Stripe; the advertising network on the free plan, Google; and " +
          "the email service, Gmail, which Google also runs. Each is described below. An AI " +
          "assistant sees your ledger only if you connect one.",
        // "Every transaction", not "everything": the export is the transaction
        // CSV and nothing else. Budgets, templates and recurring entries have
        // no export, and a policy that promised them would be promising a
        // portability the product does not provide.
        //
        // What outlasts a deletion, said beside the deletion, and all of it:
        // this said "two things" while the long version already had a third,
        // the server logs, and the hosted machine's nightly dump keeps the
        // newest 14 (`SB_BACKUP_KEEP`, from the stack's `backupKeep`), each
        // one the whole database. No count, so the next thing added cannot
        // leave a number behind that is wrong.
        "You can export every transaction as CSV at any time, and deleting your account deletes " +
          "your data. Some of it outlasts a deleted account: it stays in the database's nightly " +
          "backups for about two weeks, and in the server logs for the short time they're kept; " +
          "Stripe keeps its own record of any payments you made, as tax law requires; and a " +
          "copy of each email the application sent you stays in the Gmail mailbox it was sent " +
          "from until we delete it.",
      ],
    },
    {
      // "What the website collects" with the answer "Nothing" was the heading
      // and the paragraph, and the script made both wrong at once. Loading is
      // now the bigger of the two facts, so it goes first and the heading says
      // so: a section headed "collects" would hide a vendor's script behind a
      // word a reader reads as "stores".
      heading: "What the website loads, and what it collects",
      paragraphs: [
        /*
         * The measured behavior of the shipped snippet, driven in a browser
         * against a real build served as smpl.money: five hosts, one cookie,
         * nothing else. That is why this paragraph can name hosts at all, and
         * why the site's content security policy names those five rather than
         * allowing any https script the way the application's does. Guessing
         * would have produced a wider policy and a vaguer paragraph.
         *
         * A measurement dates. A new AdSense feature can add a host, so this
         * is a claim to re-measure whenever the snippet changes, and
         * `legal-review` is where that is written down.
         */
        "**Every page of smpl.money loads Google's advertising script**, from " +
          "pagead2.googlesyndication.com, carrying the publisher id for this site. Running it " +
          "contacts five Google hosts: pagead2.googlesyndication.com, " +
          "googleads.g.doubleclick.net, ep1.adtrafficquality.google, ep2.adtrafficquality.google " +
          "and www.google.com. Nothing else on the site reaches anywhere but itself.",
        /*
         * One banner unit, in a fixed place on each page, replacing Auto ads
         * rather than adding to it — Auto ads is still OFF, so Google is not
         * choosing the page or the format, only filling the one box this site
         * marks out. `src/components/ad-banner.tsx` is the unit and
         * `legal-review` is where this paragraph is re-checked whenever that
         * changes.
         *
         * Non-personalized is stated as a fact rather than a promise, because
         * it is forced in code (`ADSENSE_CONSENT_MANAGED` unset) rather than
         * asked for: `docs/adsense.md` §5 is why — no certified consent
         * platform is published from this account, and that is Google's
         * condition for personalized ads specifically. ePrivacy consent is
         * the separate rule this does not satisfy, covered in the next
         * paragraph and the cookies section below.
         */
        "That ad is non-personalized: it is not chosen using your browsing history or interests. " +
          "Requesting one still contacts the hosts above and still sets the cookie described " +
          "further down, whether or not the ad is filled.",
        /*
         * What the request carries, and the one place this origin is better
         * than the application: `Referrer-Policy: strict-origin-when-cross-origin`
         * in `netlify.toml` sends the origin and not the path. That is a fact
         * about the script load. An ad request made by the script carries the
         * page address itself, which is why the limit is stated for the load
         * and the ad request is pointed at Advertising rather than described
         * twice in different words.
         */
        "What Google receives from those requests is what any site it loads something from " +
          "receives: your IP address, your browser's details, and its own cookies where they're " +
          "allowed. The referrer is held to this origin, so the address of the page you're on " +
          "doesn't travel with the script. An ad requested by that script carries the page " +
          "address too, and on this site those addresses are public pages that name nothing " +
          "about you. Advertising says what Google does with what it gets.",
        // The cookie itself is under Cookies, where a reader who came looking
        // for cookies will look, and named here so that somebody reading this
        // section straight through is not told about the script and left to
        // discover the cookie somewhere else.
        "That script sets one cookie today, and it's Google's advertising identifier. Cookies " +
          "names it, says how long your browser keeps it and why nobody is asked about it " +
          "first, and says what you can do.",
        "The site stores nothing of its own in your browser. It has no analytics and no " +
          "tracking pixel, and the light or dark theme you see follows the setting your browser " +
          "already has, so there's nothing to save.",
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
        /*
         * The basis for the website's own cookie, said rather than left to be
         * inferred from a list that describes the application. Under ePrivacy
         * a non-essential cookie needs consent before it is set, whatever
         * lawful basis the processing after it would rest on, and no consent
         * is being collected on this origin today. Naming a different basis
         * for it would be picking the one that does not apply; saying nothing
         * would leave the list reading as complete.
         */
        "The website's advertising script is the one thing this policy describes with no " +
          "basis in that list. What it would rest on is your consent, and nothing on " +
          "smpl.money asks for it today. Cookies says so plainly, and says what you can do " +
          "in the meantime.",
      ],
    },
    {
      // "Advertising, on the free plan" was the whole heading, and it put the
      // website's script behind a qualifier that does not apply to it: a
      // Premium subscriber reading this page is loading Google's code while
      // reading a section headed as being about somebody else.
      heading: "Advertising, here and on the free plan",
      paragraphs: [
        "**This website carries Google's advertising script on every page**, whatever plan " +
          "you're on and whether or not you have an account at all. What it loads is under " +
          "What the website loads, and the cookie it sets is under Cookies. The rest of this " +
          "section is about the hosted application, and says where the two differ.",
        "The hosted application shows advertising to accounts on the free plan, supplied by " +
          "**Google AdSense**. Paid accounts are shown no advertising there, and a paid " +
          "account doesn't load Google's script in the application at all, because the server " +
          "decides and the browser is never told the rule.",
        // CalOPPA, Bus. & Prof. Code 22575(b)(6): whether another party may
        // collect information about somebody's activity over time and across
        // other sites. Google's advertising cookies are its own and are read on
        // every site that carries its ads, so it may, and the sentence after
        // is about how an ad here is chosen, which is a different question.
        "Google and its partners use cookies and similar technologies to serve ads, and through " +
          "the cookies it sets for advertising, Google may collect information about what you " +
          "do over time and across other websites. **In the application, ads are requested as " +
          "non-personalized by default**, which means they are based on the page and your " +
          "rough location rather than on a profile of you.",
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
        /*
         * This said the consent "is collected through Google's own certified
         * consent platform before any ad cookie is set", which is a claim
         * about a setting in an AdSense account rather than about anything
         * either repository ships. A browser driven against this site finds
         * `window.googlefc` undefined on every page, so no consent platform is
         * loading here and nobody is being asked. The promise was written from
         * the plan (`docs/adsense.md` §5, and the application's own
         * configuration page, which says outright that nothing in the software
         * can check the message exists) and the plan is not the deployment.
         *
         * So the requirement is stated, the mechanism is stated, and whether
         * it is in place is stated as the fact it is. A policy that promises a
         * notice nobody will see is worse than one that admits there is none:
         * the reader can act on the second.
         */
        "**Non-personalized is not the same as cookie-free.** Even these ads set cookies, for " +
          "frequency capping and fraud prevention, which is why consent is required in the " +
          "EEA, the UK and Switzerland regardless of whether the ads are personalized. That " +
          "consent is asked for through a notice Google delivers on the advertising account's " +
          "instructions, rather than through anything in the code of either site, and no such " +
          "notice is published today. Cookies says what that means for you and what you can do " +
          "instead. If one is published and you decline, that doesn't remove the ads. It keeps " +
          "them from being personalized and keeps Google from setting the advertising cookies " +
          "that need your consent, though Google may still show what it calls a limited ad in " +
          "the same place.",
        /*
         * True of the application and false of this website, said as two
         * sentences because one sentence covering both would have to be
         * vague about which. The application sets no consent management on
         * its tag, so every ad request it makes asks for a non-personalized
         * ad; the snippet on smpl.money is the plain loader with no such
         * parameter, so nothing here asks Google for one.
         */
        "In the application, ads are only ever personalized if you have consented to that " +
          "specifically, because every ad request it makes asks for a non-personalized ad " +
          "unless a consent platform has said otherwise. **The script on this website carries " +
          "no such instruction.** It's the plain AdSense loader, so where the law allows " +
          "personalization without consent, an ad here can be personalized.",
        /*
         * Named because the `Permissions-Policy` header stopped denying it,
         * and a header and a policy disagreeing about what reaches Google is
         * exactly the failure `content.md` 2.4 is about. The header carried
         * `browsing-topics=()` for a while; denying it was measured and does
         * work, costing relevance rather than fill. It was dropped
         * deliberately, because advertising is how this site is paid for —
         * so the honest thing is to say the signal is available rather than
         * let a header imply it is not.
         */
        "**Your browser may tell Google what you're interested in.** Chrome and some other " +
          "browsers keep a short list of topics inferred from the sites you visit, and offer " +
          "it to advertisers through what Google calls the Topics API. This website doesn't " +
          "block that, so an ad shown here may be chosen partly from it. The list is your " +
          "browser's rather than ours: we never see it, it's built from your browsing and " +
          "not from anything you do here, and your browser settings control it. In Chrome " +
          "that's Settings, then Privacy and security, then Ads.",
        // The request for an ad comes from the reader's browser, so Google
        // gets what any site gets from one, and the rough location above is
        // read from that address. A heading that reads as the whole list, with
        // only what the application adds on it, made the list look shorter
        // than it is (`content.md` 2.4).
        "**What Google receives.** What any site your browser loads something from receives: " +
          "your IP address and your browser's details, with Google's own cookies where they're " +
          "allowed. From us, it receives our publisher id and the address of the page the ad " +
          "sits on. That address is not nothing: pages in the application carry record identifiers " +
          "in their paths, so a URL identifies a row in your ledger, though not a person, a " +
          "name or an amount. No account name, no balance, no figure, no email address and no " +
          "identifier of yours is sent as a targeting parameter, and the browser's referrer is " +
          "held to this origin so it does not travel either. From this website it's the same " +
          "three things your browser hands any site, with the address of a public marketing " +
          "page rather than one of yours, and What the website loads carries the rest.",
        // youradchoices.com by name, because it is the opt-out Google's own
        // program policies point a publisher at, and aboutads.info is the
        // address of the program behind it rather than of the tool. Naming
        // only the second made the sentence correct and the instruction
        // harder to follow than it needs to be.
        "Google's own description of how it uses data from sites that use its services is at " +
          "policies.google.com/technologies/partner-sites. You can control ad personalization " +
          "across Google's products in Google's ad settings at myadcenter.google.com, and opt " +
          "out of third-party vendor cookies at youradchoices.com, which is the industry " +
          "opt-out run at aboutads.info, and at youronlinechoices.eu in Europe. Blocking " +
          "third-party cookies in your browser does the same thing for every site at once.",
        "In the application, advertising never appears on the billing page or the sign-in " +
          "screen. On this website the script is on every page, this one included, and Google " +
          "chooses where an ad goes, so this page and the page that sells the paid plan are " +
          "among the pages it may choose.",
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
         * The first kind only, because that is what `mail.ts` sends: an
         * address confirmation, a password reset, a recurring transaction's
         * notice and a template's reminder. This paragraph used to say what a
         * deployment with no mail server sends, which was the hosted one's
         * state until Gmail was chosen and is now somebody else's deployment,
         * which the introduction says this policy is not about.
         */
        "The application sends the email you asked for through Gmail. What Google receives " +
          "that way is under Who else sees your data, and how long Gmail keeps a copy is under " +
          "Where it is held.",
      ],
    },
    {
      heading: "Who else sees your data",
      paragraphs: [
        /*
         * "Share it for anyone else's marketing" with no exception sat above a
         * section saying Google receives an address and its cookies in order
         * to show somebody else's ad, so the exception is said here.
         */
        "**Nobody, other than the providers needed to run the service**, and an AI assistant " +
          "if you connect one yourself. We don't sell your data or rent it. What leaves for " +
          "advertising is what Google receives from this website on every visit, whoever you " +
          "are, and what it receives to show an ad to a free account in the application. Both " +
          "are set out under Advertising.",
        /*
         * Named, not "our providers" (`legal-review` §5). Oracle is the
         * application's host and holds the database, so it is the provider
         * holding every balance, and it was the one left unnamed. Netlify is
         * named above because it hosts only this site.
         *
         * "Providers", not "processors", which is a role each has under its
         * own terms rather than a word this page can pick. Google is a
         * controller for advertising under its Controller-Controller Data
         * Protection Terms unless restricted data processing is on
         * (business.safety.google/rdp), and is a processor for Gmail only
         * where the mailbox is Google Workspace, which nothing here shows.
         *
         * Gmail carries what the application sends, the four messages
         * `mail.ts` has, and nothing it does not. "Carries the messages above"
         * would take in the service email the Email section says is "sent to
         * every account", which the application has no way to send.
         *
         * Cloudflare because smpl.money's MX records are Cloudflare Email
         * Routing, so every request this policy invites, a deletion of Gmail's
         * copies included, reaches us through it.
         */
        "Those providers are: **Oracle Cloud Infrastructure**, which hosts the application and " +
          "stores its database; **Stripe**, for payments; **Google**, for the advertising " +
          "script this website loads and for advertising to a free account in the " +
          "application, for Google sign-in if you use it, and through **Gmail**, which carries the " +
          "email the application sends; and **Cloudflare**, which receives the mail you send " +
          "to info@smpl.money and forwards it to us. For advertising and for sign-in, Google " +
          "decides for itself how it uses what it receives, under its own privacy policy at " +
          "policies.google.com/privacy.",
        /*
         * Message by message, from the builders in the application's
         * `mail.ts`. Each goes to `user.email` alone, with no name on it. The
         * confirmation and the reset carry the application's address and a
         * link: the reset's is spent on use and both last an hour. The
         * recurrence notice carries the recurrence's name, the count and each
         * occurrence date; the template reminder its name and the one date.
         * Neither carries an amount, a payee or an account: `mail.ts` says
         * why, a total in a mail reads like a statement.
         *
         * Not "nothing from your ledger", which the Payments section can say
         * of Stripe and this paragraph cannot: a recurrence's name and its
         * dates are ledger data somebody typed, and the name goes in the
         * subject line too.
         *
         * And the limit is on what the builders add, not on what the mail
         * holds. Both names are free text (the forms suggest "Rent" and
         * "Weekly groceries"), so a recurrence called "Chase Visa payment"
         * sends a payee and an account to Google in its subject line, and an
         * unqualified "none of them holds a payee" was false for it.
         */
        "**What Google receives through Gmail.** The application sends four kinds of email, " +
          "each to the address on your account: one asking you to confirm that address, a " +
          "password reset when you ask for one, a notice that a recurring transaction has " +
          "proposed new entries for you to review, if you turned that on, and a reminder you " +
          "set on a template. So Google receives your email address and each message. A " +
          "confirmation or reset holds a link that stops working within an hour. A recurring " +
          "transaction's notice holds the name you gave it, how many entries it proposed and " +
          "the date of each, and a template's reminder holds the template's name and the date " +
          "it's for. Both put that name in the subject line. Each also holds a link back to " +
          "the application. The application adds nothing else: none of them holds your name, " +
          "an amount, a balance, a payee or the name of an account, unless you put one into " +
          "the name you gave the recurring transaction or the template.",
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
        /*
         * The other three as well, because the paragraph after this one keeps
         * copies at Google, and a reader of a section that names one place
         * takes everything to be there. Each takes part in the Data Privacy
         * Framework and its UK Extension: stripe.com/legal/data-privacy-framework,
         * policies.google.com/privacy/frameworks, and Cloudflare's trust hub.
         * Said as a fact about them rather than as the basis we rely on,
         * which is the operator's to state.
         */
        "Data for the hosted application is stored by Oracle Cloud Infrastructure, on servers in " +
          "the United States. Where you are in the UK or the EEA, transfers rely on the UK " +
          "Addendum and the European Commission's Standard Contractual Clauses. What Stripe, " +
          "Google and Cloudflare receive, the copies in Gmail included, is held by them, in the " +
          "United States and in other countries. Each of them takes part in the EU-U.S. Data " +
          "Privacy Framework and its UK Extension.",
        /*
         * `simple-balance-backup`, run nightly at 03:15 by its timer, which
         * the first-boot script enables on the hosted machine. It writes a
         * whole-database dump to the data volume and keeps the newest
         * `SB_BACKUP_KEEP`, which the Oracle stack sets from `backupKeep`,
         * 14 by default. A count of dumps rather than days, so a night that
         * fails keeps an old one a night longer, which is why the period is
         * said as the count and then as the nights it usually is.
         */
        "**Backups.** The database is backed up every night, and the 14 most recent backups " +
          "are kept, at Oracle, on the machine that runs the application. So what you delete, " +
          "or everything once you delete your account, stays in the backups taken before then " +
          "until 14 newer ones have replaced them, which is two weeks when every night's backup " +
          "runs.",
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
        /*
         * Google's IMAP help (support.google.com/mail/answer/78892): "Sent
         * messages are automatically copied to the Gmail/Sent folder if your
         * email client uses SMTP", which is how the application reaches
         * smtp.gmail.com. Nothing in the application can delete them, and no
         * period is promised because none has been set on that mailbox: the
         * copy stays until somebody deletes it, and the trash then keeps it
         * for up to 30 days (support.google.com/mail/answer/7401). What can be
         * kept is deleting on request, by searching Sent for the address.
         *
         * The Workspace relay, smtp-relay.gmail.com, keeps no Sent copy unless
         * comprehensive mail storage is on, so the copy is said as what
         * signing in to one mailbox does rather than as what Gmail does, and
         * a change of route is a change to this paragraph.
         *
         * Sent is not the only copy. A bounce goes back to the mailbox that
         * sent the message, and an automatic reply that ignores
         * `Auto-Submitted` goes to the reply address, and either can quote it,
         * so deleting on request means searching for all of them.
         */
        "**The copies Gmail keeps.** The application sends its email by signing in to one " +
          "Gmail mailbox, the way a mail program does, and Gmail keeps a copy of each message " +
          "sent that way in that mailbox's Sent mail. A message that bounces, or that draws an " +
          "automatic reply, can also come back to us with a copy of it inside. Those copies " +
          "stay until we delete them, and a deleted message stays in Gmail's trash for up to 30 " +
          "days before it's gone for good. Deleting your account doesn't reach them. Write to us " +
          "and we'll delete every copy of the email sent to you.",
      ],
    },
    {
      heading: "Deleting your account",
      paragraphs: [
        // "Every record the application keeps", not "every associated
        // record": the copies in Gmail's Sent mail are associated with the
        // account and are outside anything a deletion in the application can
        // reach. "From its database", because the nightly dumps are records
        // the deployment keeps too, and a deletion reaches none of them.
        "You can delete your account from the settings page. It removes your ledger, your " +
          "account and every record the application keeps about you from its database in one " +
          "operation, and it cancels any subscription at the same time. It cannot be undone, " +
          "which is why exporting first is worth doing. The nightly backups taken before then " +
          "still hold it until newer ones replace them, within about two weeks. The copies " +
          "Gmail keeps of the email the application sent you aren't part of it; we delete " +
          "those when you ask.",
        "Deletion is refused rather than partially completed if the payment processor cannot be " +
          "reached to cancel a subscription, so that nobody is left being charged for an account " +
          "that no longer exists.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        /*
         * Facts, where this said "We do not sell or share personal information
         * as those laws define it". That conclusion holds only while Google is
         * our service provider for the ad requests, which is what its
         * restricted data processing makes it (business.safety.google/rdp),
         * and "by default, ad requests to Google do not limit how data is
         * processed" (AdSense Help 9598414). The application sets no
         * restriction on the tag, so it rests on an account setting nothing
         * here can read. The sentence can come back naming it once it's on.
         *
         * "And on Premium nothing does" went the day this website started
         * loading Google's script: a Premium subscriber reading that sentence
         * was handing Google their address and their browser's details while
         * reading that they were not. Premium still takes the advertising out
         * of the application, which is what it was sold as, so the claim is
         * kept and given the boundary it always had.
         */
        "Where the UK or EU GDPR applies you have the right to access your data, to correct it, " +
          "to have it erased, to restrict or object to how it is used, and to receive it in a " +
          "portable form. The California Consumer Privacy Act gives California residents " +
          "comparable rights, including the right not to be discriminated against for exercising " +
          "them. What leaves for advertising is what Google receives, set out under What " +
          "Google receives: from this website on every visit, and from the application to " +
          "show an ad to a free account. Premium takes the advertising out of the " +
          "application. It doesn't take the script off this website.",
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
      /*
       * "Cookies, and why this site has no banner" answered a question the
       * site can no longer answer that way. The heading is the claim a reader
       * takes away from a contents list without opening the section, so it had
       * to move with the paragraph under it; leaving it and rewriting the body
       * would have left the lie in the one line most people read.
       *
       * The heading names the vendor rather than the site, because that is
       * where the cookie comes from: smpl.money still sets none of its own,
       * and a heading saying "the cookies this site sets" would trade one
       * false sentence for another.
       */
      heading: "Cookies, and the one Google sets on this website",
      paragraphs: [
        /*
         * Measured in a browser against a real build served as smpl.money,
         * not read off a vendor page, and measured twice because the first
         * reading stopped at the first page. The sequence is `test_cookie` on
         * `.doubleclick.net` while Google checks that cookies work, then
         * `IDE` on the next navigation, in the response that deletes
         * `test_cookie`. `IDE` is what the browser is left holding.
         *
         * The first telling of this paragraph called the cookie short-lived
         * and "not an identifier for you", which was the probe described and
         * the identifier missed, and it is the worst direction to be wrong
         * in: a reader who opens their own cookie list to check finds an
         * advertising identifier where the policy promised a probe. The
         * lifetime is stated because it was read off the stored cookie
         * (Google sends two years, the browser caps it at 400 days), not
         * copied from a consent manager's database.
         *
         * `__gads` and `__gpi` are named as what follows if an ad ever fills
         * here, rather than as what is set today, because an ad unit
         * rendering on this site is a change nothing in this repository would
         * announce. What is no longer said is that the identifier waits for
         * one: it does not, and saying so made an unfilled slot sound like a
         * reason not to worry.
         */
        "**smpl.money sets no cookie of its own, and Google's script on it sets one.** It's " +
          "called IDE, it belongs to doubleclick.net, which is Google's, and it's an " +
          "advertising identifier: a number that lets Google recognize your browser on the " +
          "other sites carrying its ads, for measurement and for targeting. Your browser " +
          "keeps it for about thirteen months. On a first visit a short-lived test_cookie " +
          "lands there instead, while Google checks that cookies work at all, and the next " +
          "page replaces it with IDE. No ad has filled on this site yet, and the identifier " +
          "is set anyway. If one ever fills, Google's advertising cookies __gads and __gpi " +
          "follow it, and this page will say so.",
        /*
         * The honest answer to "why is there no banner", which is no longer
         * "because there is nothing to ask about". A notice is published from
         * the AdSense account, `window.googlefc` is undefined on every page of
         * this site, and the cookie above lands on the first visit. Stating it
         * and giving the reader something to do about it is the only version
         * of this paragraph that is both true and useful; a vaguer one would
         * be true and useless.
         */
        "**Nobody is asked first, and in the EEA, the UK and Switzerland you should be.** " +
          "An advertising identifier needs your consent before it's set, and the notice that " +
          "asks for it is published from the advertising account rather than by this site's " +
          "code. None is published for smpl.money today, so a cookie is set on your first visit " +
          "with no notice and the identifier lands on the page after. That's the position as " +
          "it stands, said here rather than left for " +
          "you to find in your browser's developer tools. Until a notice is published, " +
          "blocking third-party cookies in your browser keeps this one out, and clearing your " +
          "cookies removes it. The opt-outs under Advertising work on what Google already " +
          "has: Google's own ad settings at myadcenter.google.com, and the industry opt-outs " +
          `at youradchoices.com and youronlinechoices.eu. Write to ${operator.contact} about ` +
          "any of it.",
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
        // The second of the two copies of the consent-platform promise. Both
        // said a notice asks before an ad cookie is set, and `googlefc` is
        // undefined on this site, so neither could be kept. They moved
        // together on purpose: a whole-document check for the sentence is
        // satisfied by either one, so fixing one and leaving the other is a
        // green suite and a page that still lies in the section a reader
        // opens looking for cookies.
        "**On the free plan, Google sets cookies for advertising**, and those are the ones " +
          "that do require your consent. In the EEA, the UK and Switzerland that consent has " +
          "to be asked for before any of them are set, through a notice published from the " +
          "advertising account. None is published today, for the application any more than " +
          "for this website, so this page doesn't tell you that you'll be asked. When one is " +
          "published, this page will say so, and you'll be able to change or withdraw your " +
          "answer from the notice itself.",
        "If a notice is published and you decline, that doesn't remove the ads. It keeps them " +
          "from being personalized and keeps Google from setting the advertising cookies that " +
          "need your consent, though Google may still show a limited ad. It doesn't limit the " +
          "product in any other way, and nothing about your account changes.",
        // CalOPPA, Bus. & Prof. Code 22575(b)(5), asks how the operator
        // responds to the signal, and the answer is that nothing reads it:
        // the application's source has no `doNotTrack` and no `DNT` header.
        // What Google's own script does with it is Google's, so it is not
        // promised here either way.
        "**Do Not Track.** Neither smpl.money nor the application responds to a browser's Do " +
          "Not Track signal. Neither one reads it, and what Google's script makes of it is " +
          "Google's to say rather than ours.",
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
          "and removes the advertising. Prices are in US dollars, and no sales tax, VAT or " +
          "other tax is added to them today.",
        /*
         * What the application does, not what a tax authority may one day
         * ask. `createStripeSubscription` sets no `automatic_tax` and adds no
         * tax rate, and no address is asked for to calculate one from; the
         * schedule in `scheduleStripeSubscriptionPrice` only carries over a
         * rate somebody set on a subscription in Stripe's dashboard. So what a
         * subscriber pays is the price. "Exclude any tax that may apply" left
         * a reader expecting a total that never arrives, and reserved a charge
         * nothing gave notice of. Adding tax to a renewal is a price increase
         * to the person paying it, so it gets the same notice.
         *
         * A window, not "at least 30 days". California's automatic renewal
         * law, Bus. & Prof. Code 17602(g)(2), for contracts from July 1, 2025
         * (17602(j)), wants notice of a fee change "no less than 7 days and no
         * more than 30 days before the fee change takes effect", carrying the
         * change and how to cancel, and "at least 30" with "no more than 30"
         * leaves exactly one day to send it on. Any change, not only a rise,
         * because the statute says "a change in the fee". A switch somebody
         * asks for themselves is left out of the promise because nothing
         * sends that notice.
         */
        "Subscriptions renew automatically at the end of each period until canceled. If we " +
          "change the price, or tax is added to what a renewal costs, we'll email you between " +
          "7 and 30 days before the change takes effect, saying what it will cost and how to " +
          "cancel, and you may cancel before it does.",
      ],
    },
    {
      heading: "Canceling, and refunds",
      paragraphs: [
        // Two ways, because 17602(d)(3) lets the online one require signing
        // in only if somebody unwilling or unable to sign in can still cancel
        // another way under 17602(c), and an email address is one it names.
        // Done by hand at Stripe, where a cancellation reaches the application
        // as a subscription delivery like any other.
        "You can cancel at any time from the plan page, or, without signing in, by writing to " +
          "info@smpl.money from the address on your account. Cancellation takes effect at the " +
          "end of the period you have already paid for; you keep Premium until then.",
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
        // 17602(g)(1) and (i)(3): notice of a material change goes out before
        // it's implemented and says how to cancel, which matters most here,
        // because continuing is what counts as accepting.
        "If these terms change materially, we'll email you before the change takes effect, " +
          "saying what's changing and how to cancel. Continuing to use the service after that " +
          "means accepting them.",
        /*
         * California, the operator's decision. Its conflict-of-laws rules are
         * excluded so the choice cannot route back to another state's law.
         * The courts are named without "exclusive", as the English clause
         * was, and the carve-out reaches the forum as well as the law: a
         * consumer in the EU or the UK may bring a claim where they live
         * whatever a clause chose beforehand, and a carve-out naming only the
         * law would have read as taking that away. No arbitration clause and
         * no class-action waiver, by the same decision.
         */
        "These terms are governed by the laws of the State of California, without regard to " +
          "its conflict-of-laws rules, and the state and federal courts located in California " +
          "have jurisdiction over any dispute about them. If you're a consumer and live " +
          "somewhere else, this doesn't take away the protection of the mandatory consumer law " +
          "where you live, including any right it gives you to bring a claim in your own courts.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["info@smpl.money."],
    },
  ] satisfies readonly Section[],
} as const;
