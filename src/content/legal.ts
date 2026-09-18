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
 */

/** Bumped whenever either document changes materially. Rendered on both. */
export const legalUpdated = "2026-09-18";

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
    "deleted — for smpl.money and for the hosted application at app.smpl.money.",
  intro: [
    "This policy covers two things run by the same person: the website at smpl.money, and the " +
      "hosted application at app.smpl.money. It does not cover a copy of Simple Balance that " +
      "somebody else runs on their own server — if you are using one of those, the person who " +
      "runs it decides what happens to your data, and this document is not about them.",
    "Simple Balance is a double-entry ledger. It necessarily holds a detailed record of your " +
      "money, and that is the whole reason this policy is worth reading rather than skimming.",
  ],
  sections: [
    {
      heading: "Who is responsible",
      paragraphs: [
        "The data controller for smpl.money and for the hosted application at app.smpl.money " +
          `is **${operator.name}**, contactable at ${operator.contact}.`,
        "For a copy of Simple Balance that somebody else runs, the controller is whoever runs " +
          "it. That is the whole point of self-hosting, and it means this policy does not " +
          "describe their deployment and we have no access to it.",
      ],
    },
    {
      heading: "The short version",
      paragraphs: [
        "The website collects nothing. There is no analytics, no tracking pixel, and no cookie.",
        "The application holds the ledger you put into it, the account you signed in with, and " +
          "the operational records needed to run a service — and shares it with nobody except " +
          "the payment processor and, on the free plan, the advertising network, each described " +
          "below.",
        "You can export everything as CSV at any time, and deleting your account deletes your data.",
      ],
    },
    {
      heading: "What the website collects",
      paragraphs: [
        "Nothing. smpl.money is a set of static files. It sets no cookies, runs no analytics, " +
          "embeds no third-party scripts, and makes no network requests to anywhere other than " +
          "itself.",
        "Our hosting provider, Netlify, processes the technical information any web server " +
          "receives in order to serve a page — your IP address, the page requested, your browser " +
          "and the time — and retains it briefly for operational and security purposes. We do " +
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
        "**How you sign in.** A password you set, stored only as a hash that cannot be reversed, " +
          "or a Google account you chose to connect. Sessions are kept as a signed cookie which " +
          "is strictly necessary to keep you signed in.",
        "**Operational records.** Server logs, which include IP addresses and request paths, " +
          "kept briefly for security and debugging. An audit history of changes to your own " +
          "ledger, which is part of the product and visible to you.",
        "**If you subscribe.** Your subscription's status and the identifiers Stripe gives us. " +
          "**We never see or store your card details** — they go directly to Stripe.",
      ],
    },
    {
      heading: "Why we are allowed to hold it",
      paragraphs: [
        "Where the UK GDPR and the EU GDPR apply, the lawful bases are: **performance of a " +
          "contract**, for your account and the ledger itself, without which there is no " +
          "service to provide; **legitimate interests**, for security logging and fraud " +
          "prevention, balanced against your rights and kept to what is necessary; **legal " +
          "obligation**, for the financial records a payment processor and we must keep; and " +
          "**consent**, for personalized advertising and for optional emails, which you may " +
          "withdraw at any time.",
      ],
    },
    {
      heading: "Advertising, on the free plan",
      paragraphs: [
        "The hosted application shows advertising to accounts on the free plan, supplied by " +
          "**Google AdSense**. Paid accounts are shown no advertising, and — because the server " +
          "decides and the browser is never told the rule — a paid account does not load " +
          "Google's script at all.",
        "Google and its partners use cookies and similar technologies to serve ads. **Ads are " +
          "requested as non-personalized by default**, which means they are based on the page " +
          "and your rough location rather than on a profile of you.",
        "**Non-personalized is not the same as cookie-free.** Even these ads set cookies, for " +
          "frequency capping and fraud prevention, which is why consent is asked for in the " +
          "EEA, the UK and Switzerland regardless of whether the ads are personalized. That " +
          "consent is collected through Google's own certified consent platform before any ad " +
          "cookie is set, and you can change or withdraw it at any time from the same notice. " +
          "Declining means no ads are served to you.",
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
        "We store the identifiers Stripe returns, your subscription's status, and which plan you " +
          "are on, because those are what decide what your account may do. Stripe's privacy " +
          "policy is at stripe.com/privacy.",
      ],
    },
    {
      heading: "Email",
      paragraphs: [
        "**Email you asked for.** Confirming your address, resetting a password, and reminders " +
          "about recurring transactions if you turn them on. These stop when you stop asking " +
          "for them.",
        "**Email about the service itself** — planned maintenance, a change that affects your " +
          "data, a feature being retired, a security matter. These are part of running the " +
          "service rather than marketing, so they are sent to every account and there is no " +
          "unsubscribe from them. We keep them rare and we keep them factual.",
        "**Occasional email about the product**, such as a significant new capability. Every " +
          "one carries an unsubscribe link that works immediately and without signing in, and " +
          "unsubscribing from these does not affect the two kinds above. If you would rather " +
          "not receive any, say so when you create the account or unsubscribe from the first.",
        "There is no newsletter, nothing is sold to a mailing-list broker, and your address is " +
          "never shared for anybody else's marketing.",
        "A deployment configured with no mail server sends none of these, and the features that " +
          "need them are simply absent rather than broken.",
      ],
    },
    {
      heading: "Who else sees your data",
      paragraphs: [
        "**Nobody, other than the processors needed to run the service**, and we do not sell it, " +
          "rent it, or share it for anyone else's marketing.",
        "Those processors are: our hosting and database provider, which stores the data; " +
          "**Stripe**, for payments; **Google**, for advertising on the free plan and for Google " +
          "sign-in if you use it; and an email provider, for the messages above.",
        "We will disclose data if we are legally required to, and we will tell you unless we are " +
          "prohibited from doing so.",
      ],
    },
    {
      heading: "Where it is held, and for how long",
      paragraphs: [
        "Data for the hosted application is stored on servers in the United States. Where you " +
          "are in the UK or the EEA, transfers rely on the UK Addendum and the European " +
          "Commission's Standard Contractual Clauses.",
        "Your ledger is kept until you delete it or delete your account. Server logs are kept " +
          "for a short operational period. Records of payments are kept as long as tax and " +
          "accounting law requires, typically six years, and that is the one category that " +
          "survives deleting your account.",
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
        "Most of these you can exercise yourself and immediately: the product has CSV export for " +
          "portability, editing for correction, and account deletion for erasure. For anything " +
          "else, write to the address below and we will answer within one month.",
        "If you are not satisfied, you may complain to your data protection authority — in the " +
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
          "script. There is nothing to ask you about, so there is no banner — a consent notice " +
          "on a site that stores nothing would be theater.",
        "**The application sets two of its own.** A session cookie, which is strictly necessary " +
          "to keep you signed in, and a preference cookie remembering whether you chose the " +
          "light or dark theme. Neither is used for anything else, neither is shared, and " +
          "neither requires consent: one is essential to a service you asked for, the other " +
          "stores a choice you made.",
        "**On the free plan, Google sets cookies for advertising**, and those are the ones that " +
          "do require your consent. If you are in the EEA, the UK or Switzerland, you will be " +
          "asked before any of them are set, through a consent notice provided by Google's own " +
          "certified consent platform. You can change or withdraw that choice at any time from " +
          "the same notice.",
        "Declining means you see no advertising. It does not limit the product in any other " +
          "way, and nothing about your account changes.",
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
        "The free plan keeps up to three financial accounts and shows advertising. The Premium " +
          "plan is $20 per year or $2 per month, removes the account limit and removes the " +
          "advertising. Prices are in US dollars and exclude any tax that may apply where you are.",
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
        "**Nothing is deleted when a subscription ends.** You return to the free plan and keep " +
          "every account you have. The limit refuses a new one until you are back under it.",
        "If you are in the UK or the EEA you have a statutory right to cancel within 14 days of " +
          "first subscribing and receive a refund. Beyond that, payments are generally " +
          "non-refundable, but if something has gone wrong, write to us — we would rather sort " +
          "it out than stand on this paragraph.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: [
        "Do not use the service to break the law, to store somebody else's data without their " +
          "knowledge, to attack or overload the service, or to try to reach another person's " +
          "account. Automated access through the provided API and MCP interfaces is expected and " +
          "welcome, within the documented rate limits.",
      ],
    },
    {
      heading: "Email we will send you",
      paragraphs: [
        "Holding an account means we can email you about the service: maintenance, a change " +
          "that affects your data, a retirement, a security matter. There is no unsubscribe " +
          "from those, because they are how we tell you something you need to know.",
        "Anything else — occasional news about the product — carries an unsubscribe link that " +
          "works immediately, and unsubscribing does not affect your account or the messages " +
          "above. The privacy policy sets out the lawful basis for each.",
      ],
    },
    {
      heading: "Your data",
      paragraphs: [
        "Your ledger is yours. We claim no ownership of it, and you can export all of it as CSV " +
          "at any time.",
        "How it is handled is set out in the privacy policy, which forms part of these terms.",
      ],
    },
    {
      heading: "Availability, and what we promise",
      paragraphs: [
        "We aim to keep the service available and to keep backups, but this is a small service " +
          "and it is offered **without a guaranteed level of availability**. Planned maintenance " +
          "will be announced where we can.",
        "**Keep your own copy of anything you cannot afford to lose.** CSV export exists for " +
          "exactly this, and the software being open source means you can always run your own " +
          "deployment from your own export.",
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
          "fraud, or for anything else that cannot lawfully be limited — including your statutory " +
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
