/**
 * The homepage copy, as data.
 *
 * Copy lives here rather than inline in the components for two reasons that
 * are both about keeping it honest. It can be read by a test — `tests/copy.test.ts`
 * holds every string against the banned-words list in
 * `docs/standards/content.md` — and it can be reviewed as prose, in one file,
 * without reading JSX around it. A claim about the product is a thing somebody
 * has to be able to check, and claims scattered through markup do not get
 * checked.
 *
 * Every claim below is true of the shipped application. `docs/standards/content.md`
 * 2.1 is Binding about that: a marketing page for a ledger that overstates what
 * the ledger does is the one kind of copy that loses the reader permanently.
 *
 * **Who this is written for.** Somebody with no personal-finance software at
 * all, who has never heard of double-entry bookkeeping and is not a developer.
 * `docs/standards/content.md` 1.3 holds the vocabulary rule and the argument.
 *
 * **The argument the page makes, and why this one.** A competitive read in
 * October 2026 found that almost everything this page used to lead on is said
 * by somebody else. "All your accounts in one place" is run by eight
 * competitors. "Know where your money went" is run by Copilot, Tiller,
 * PocketSmith and Simplifi. Multi-currency is marketed by Lunch Money and
 * PocketSmith. And agent access — which this page treated for a while as the
 * thing nothing else does — is now PocketSmith's too, down to the permission
 * levels and the promise that an answer can be checked against the figures
 * behind it.
 *
 * What survives that comparison is not one feature. It is that a figure here
 * can be taken apart: the running balance beside every row, a correction that
 * never erases what it corrected, and an import nothing counts until somebody
 * has looked at it. So the page leads on being able to explain a number, and
 * everything else is arranged behind that.
 *
 * **The assistant is fourth now, not third and not in the headline.** It has
 * been last (wrong, it is worth more than a footnote), first (wrong, it
 * answers a question nobody arrived with) and third (defensible only while it
 * was distinctive). It is a reason to stay rather than a reason a stranger
 * reads on, and the market has stopped letting it be more than that.
 *
 * **The page must not imply a bank connection, must not promise there will
 * never be one, and must say plainly that there is not one today.** All three,
 * and the third is new. There is no automatic transfer of transactions, so
 * copy describing one would be false (1.4). Leading on the refusal is the
 * mistake that cost a whole rewrite once, because pulling transactions on a
 * schedule is a thing this product may yet do. But saying nothing is its own
 * failure: every hosted competitor works the other way, so a reader assumes a
 * connection unless told, and finds out on their first afternoon. The
 * disclosure therefore sits inside the import card, after the value, in the
 * present tense.
 */

export type Proof = {
  /**
   * Which entries in the application's own feature list this card is the
   * rewrite of (`src/content/app-features.json`).
   *
   * Declared rather than inferred. The first version of the check that reads
   * this matched the application's wording against the page's, which is
   * exactly the wording the rewrite exists to change — it matched the word
   * "statement" somewhere else entirely and could not fail. An explicit
   * mapping is the only honest way to ask "is tier A covered".
   */
  readonly covers: readonly string[];
  /**
   * What the product does, stated as a claim rather than as the reader's
   * complaint.
   *
   * These were questions once, under a heading that announced "four money
   * problems, and what this does about them" — copy describing its own
   * structure rather than saying anything. The pain is now stated once, in
   * the section's heading, and each card answers it with something the
   * product does.
   */
  readonly claim: string;
  /** How it does it. One paragraph per idea, never one long one. */
  readonly body: readonly string[];
  /** A screenshot, where one is evidence for a claim the reader has reason
   *  to doubt. Two of the three carry one. The correction card has none
   *  because what it promises is a thing that is absent from a screen: you
   *  cannot photograph a figure not being overwritten. */
  readonly shot?: ScreenshotRef;
};

type ScreenshotRef = {
  /** Base name under `public/screenshots`, without theme or extension. */
  readonly name: string;
  readonly alt: string;
  readonly caption: string;
};

/** Every shot is 1600x1000, as the application publishes it. `sync-from-app` §4. */
export const SHOT_WIDTH = 1600;
export const SHOT_HEIGHT = 1000;

/**
 * The ledger in every screenshot is seeded demo data, and the page says so
 * once, plainly. A finance product showing invented balances without
 * disclosing it is the same defect as a testimonial from nobody.
 *
 * Worded for a reader rather than for a developer: "seeded demo data" is the
 * accurate phrase and means nothing to somebody who has not written a
 * fixture, so the sentence says what it means instead.
 */
export const shotDisclosure =
  "The money in these pictures is made up. They are photographs of the real product, filled with example spending so there's something to look at.";

export type Feature = {
  /** As `Proof["covers"]`. */
  readonly covers: readonly string[];
  readonly title: string;
  readonly body: string;
  /** Key into the icon map in `components/icons.tsx`. A closed set, so a typo
   *  is a type error rather than a missing glyph. */
  readonly icon: "wallet" | "split" | "target" | "copy" | "layers" | "list";
};

import { announcedSections } from "@/content/sections";

/**
 * One entry in the header or the footer. Both lists mix hand-written links
 * with the sections `announcedSections()` returns, so both need the shape the
 * two have in common rather than the literal types `as const` would give.
 */
export type NavLink = { readonly label: string; readonly href: string };

export const site = {
  name: "Simple Balance",
  domain: "smpl.money",
  appUrl: "https://app.smpl.money",
  sourceUrl: "https://github.com/thtmnisamnstr/simple-balance",
  /**
   * One address, deliberately.
   *
   * There was a second for support. Publishing two asks the reader to
   * classify their own message before they have written it, and a marketing
   * site is where somebody arrives *before* they are a customer with a
   * support question — so the split was sorting mail nobody had sent yet.
   */
  contactEmail: "info@smpl.money",
  /**
   * The brand line: the tab, the manifest, the social card and the alt text
   * on it.
   *
   * Two earlier versions each failed in one direction. "Double-entry
   * bookkeeping for your own money, on your own server" was two ideas a
   * general reader cannot use. "All your accounts, numbers you can check"
   * fixed the vocabulary and still opened on the one claim eight competitors
   * also make, with no word anywhere saying what kind of product this is.
   *
   * What replaces both is short enough to repeat and carries the category,
   * so a stranger seeing it in a result listing knows what they are looking
   * at before they click. The argument for the product is made on the page;
   * a tagline's job is to get somebody to it.
   *
   * **There were two of these and now there is one.** A `tagline` ending in a
   * period sat beside this one for link previews, from a round when the two
   * really did differ. Once both said the same thing, the second was a string
   * that could drift from the first with nothing to notice. A result listing
   * truncates near sixty characters and `Simple Balance — ` costs seventeen,
   * so what goes here has forty-three to work with.
   */
  titleTagline: "Personal finance that's simple",
  /**
   * The search snippet, and the one string written for somebody who has not
   * arrived yet.
   *
   * It used to be `hero.lede`, which is written for somebody already reading
   * the page and runs to 233 characters against a rendered 155 — so the last
   * third of it, every word about the assistant, was never shown to anybody
   * deciding whether to click.
   */
  description:
    "Keep your accounts, spending, budgets and repeating payments on one page, and follow any " +
    "total back to the payments behind it. Free for three accounts in use.",
} as const;

export const heroShot = {
  name: "dashboard",
  alt: "The Simple Balance overview for one month: a dollar total with balance, deposits, withdrawals and net cash flow across the top, then a checking account, a savings account and a credit card with their balances, beside spending by category as bars from rent down to subscriptions.",
} as const;

export const hero = {
  /**
   * One sentence, and the smallest promise that is also the whole argument.
   *
   * "See everything you have. Check every number." was two imperatives in a
   * row, which is the rhythm this page had everywhere and the thing that made
   * it read as written rather than said. It also asked the reader to infer
   * the category from "everything you have", which could as easily be
   * possessions or documents.
   *
   * **This one is a complaint the reader already has, agreed with.** Nobody
   * arrives wanting a ledger; they arrive having been told a number they
   * could not account for. `scripts/build-images.mjs` used to require exactly
   * two sentences here, for a social card with a `<text>` element per line,
   * and now draws one or two.
   */
  title: "Your money should add up.",
  lede:
    "Simple Balance keeps your accounts, your spending and your budgets on one page. When a " +
    "total looks wrong, you can open it and follow it back to the payments that made it, which " +
    "is usually how you find the payment that got counted twice.",
  /**
   * The app is not deployed yet, so this states the situation rather than
   * linking somewhere that 404s (`docs/standards/web.md` 6.1).
   *
   * It names what is coming in the reader's word for it. "Hosted version" is
   * the accurate phrase and asks a general reader to know what hosting is;
   * what they are actually waiting for is the ability to sign up.
   */
  primaryLabel: "Sign-ups open soon",
  /**
   * Not "Get the source". A general reader does not know what that offers
   * them, and a repository is a dead end for anybody who is not going to run
   * a machine. This says who the link is for, so the reader who is not that
   * person does not have to find out by following it.
   */
  secondaryLabel: "See how to run it yourself",
  note:
    "The version we run for you isn't open yet. If you already run your own software, you can " +
    "install the whole product today, free and with nothing left out.",
} as const;

/**
 * The first section's own heading: the pain, stated once.
 *
 * Here rather than in `src/app/page.tsx` because `docs/standards/content.md`
 * 3.1 says copy is checkable and markup is not: these two strings sat in the
 * JSX and so were the only text on the homepage the banned-words test could
 * not see.
 *
 * The heading used to be "Four money problems, and what this does about
 * them", which narrates the section's structure instead of saying anything a
 * reader can use. The replacement is the reader's own objection, which is
 * also the thing every card below it answers.
 */
export const proofSection = {
  eyebrow: "Why this one",
  title: "You shouldn't have to trust a number you can't explain.",
} as const;

export const proofs: readonly Proof[] = [
  {
    shot: {
      name: "transactions",
      alt: "A list of transactions by date, each with who was paid, which account it came from, what kind of spending it was and how much. Most are in dollars, a train fare from a euro account is in euros, and a move from checking to savings appears as one line.",
      caption:
        "Everything you've entered, in one list you can filter. Money you moved between two of your own accounts shows up once, not twice.",
    },
    covers: ["numbers-that-tie-out", "register"],
    claim: "Follow a total back to the payments behind it",
    body: [
      "Open any account and you get every payment in the order it happened, with the balance " +
        "after each one beside it. When a figure is wrong, that column is where you find the row " +
        "that made it wrong.",
      "Underneath, every dollar that leaves one place has to arrive somewhere else, and the two " +
        "sides have to agree before anything is saved. That's the reason the totals hold up.",
    ],
  },
  {
    covers: ["history"],
    claim: "A correction doesn't erase what it corrected",
    body: [
      "When you fix something, what it used to say stays with it. You can see the old figure and " +
        "the day it changed, so a correction is something you can go and look at rather than " +
        "something you take on trust.",
    ],
  },
  {
    shot: {
      name: "import",
      alt: "The import screen before a file is picked: a step headed Choose a CSV file, an empty drop target reading Drop in a file or browse, and a preview panel saying no file has been chosen yet.",
      caption:
        "Where the file goes. It figures out the columns itself, and shows you every row before any of them count.",
    },
    covers: ["import-statements", "duplicates"],
    claim: "Nothing counts until you've looked at it",
    body: [
      "Download the file your bank gives you and drag it in. Simple Balance works out which " +
        "column is the date, which is the amount and who you paid, and it recognizes the names " +
        "it has seen before.",
      "Anything that looks like a payment you already have is put beside the payment it resembles, " +
        "and nothing reaches your accounts until you say so.",
      "There's no automatic pull from your bank today: you download the file and bring it in " +
        "yourself. That's slower than it could be, and it's also why nothing lands in your " +
        "accounts without you seeing it first.",
    ],
  },
] as const;

/**
 * The everyday section's own heading. Here rather than in the JSX, for the
 * reason `proofSection` gives.
 *
 * "The parts you only notice when they are missing" was clever and told a
 * reader nothing about what was in the section. This one answers the
 * question somebody actually has after the argument above: does it do the
 * normal things as well.
 */
export const featuresSection = {
  eyebrow: "Day to day",
  title: "It does the ordinary things too.",
} as const;

export const features: readonly Feature[] = [
  {
    icon: "wallet",
    covers: ["all-accounts-one-page", "multi-currency"],
    title: "Every account on one page",
    body:
      "Checking, savings, credit cards, cash, a car loan. All of them on one page, for any date " +
      "you pick. If you hold more than one currency, each keeps its own totals instead of being " +
      "blended at a rate that will be wrong tomorrow.",
  },
  {
    icon: "target",
    covers: ["budgets", "categories"],
    title: "Budgets that carry what you don't spend",
    body:
      "Set an amount for groceries, gas, or whatever you actually watch. Anything left at the " +
      "end of the month can carry into the next one, and a refund goes back to the budget it " +
      "came out of instead of looking like income.",
  },
  {
    icon: "copy",
    covers: ["recurring", "payees"],
    title: "Set a repeating payment once",
    body:
      "Rent, payday, a subscription that renews once a year. Set it up and it turns up when it's " +
      "due, waiting for you to okay it. There's also a list of everyone you've ever paid, which " +
      "is usually where you spot a subscription you forgot about.",
  },
  {
    icon: "split",
    covers: ["splits"],
    title: "Split one purchase across categories",
    body:
      "A grocery run that was half food and half things for the house counts as both, in the " +
      "right amounts, from a single line. Change the split later and the money moves rather " +
      "than doubling.",
  },
  {
    icon: "list",
    covers: ["templates"],
    title: "Templates for what you enter every week",
    body:
      "The grocery run, the cash you take out, the transfer you make every payday. Save one once " +
      "and pick it off a list next time.",
  },
  {
    icon: "layers",
    covers: ["bulk-edits"],
    title: "Fix thousands of transactions at once",
    body:
      "Say a file came in with a year of groceries filed under the wrong category. Fix all of it " +
      "in a single step, up to ten thousand rows, after seeing exactly what will change. It all " +
      "changes or none of it does.",
  },
] as const;

/**
 * Two screens, shown where the features they belong to are described rather
 * than in a gallery of their own.
 *
 * They used to be a section headed "the two pages you will use most", which
 * made the product's own interface a thing to look at rather than evidence
 * for anything. A screenshot earns its place by proving a sentence somebody
 * has reason to doubt, so these sit under the cards whose claims they show,
 * and the disclosure that the money in them is invented sits with them.
 */
export const featureShots = [
  {
    name: "budgets",
    alt: "The budgets screen: a form for setting one, with fields for the category, the amount and how it's decided, the currency, a start date and an optional savings goal, and a checkbox for carrying what's left into next month, above a table of standing budgets for dining out and groceries.",
    caption:
      "Setting a budget. The checkbox near the bottom is what carries the remainder forward.",
  },
  {
    name: "reports",
    alt: "A net worth report with a separate table for each currency: checking, savings and a credit card totaled in dollars, and below it a euro account totaled in euros. No combined number appears anywhere.",
    caption: "What you own and what you owe, each currency counted on its own.",
  },
] as const;

/**
 * The assistant, fourth.
 *
 * The vocabulary it arrives in is still not the reader's. "Ships an MCP
 * server", "a token carries scopes" and a shell transcript reading
 * `$ ledger:stage` were three separate ways of saying this page is not for
 * you. What survives is the capability and its limit.
 *
 * **The body carried a broken phrase for a release.** It read "One that's
 * only allowed to suggest lines entries up for you to approve", which is the
 * application's own "queues entries for you to approve" mangled somewhere in
 * a rewrite. Nothing could see it: it contains no banned word, no British
 * spelling and no em dash, and it is grammatical enough to skim past. It is
 * the argument for reading this file as prose, which 3.1 is about.
 *
 * The permission levels are now one sentence with a colon rather than three
 * short ones in a row, because three sentences of the same length and shape
 * is the rhythm that made this page sound machine-made.
 */
export const agents = {
  /** As `Proof["covers"]`. */
  covers: ["agents", "find-anything"],
  eyebrow: "If you use an AI assistant",
  title: "Ask a question instead of hunting for the answer.",
  body:
    "Connect an AI assistant and it reads the same records you do. Ask it when you last paid " +
    "the electric bill, or what a store has cost you this year. You decide how far it goes: " +
    "reading only, or allowed to queue things up for you to approve, or allowed to make the " +
    "change itself. Settings lists what each assistant can do, and cuts an assistant off when " +
    "you want it gone.",
  sample: [
    { kind: "prompt", text: "What day did I pay the electric bill last month?" },
    { kind: "out", text: "  August 12, to Meridian Power, out of checking." },
    { kind: "out", text: "  The one before that was July 14." },
  ],
} as const;

/**
 * The section that answers the question a money product always raises.
 *
 * It is stated as a promise to the reader rather than as a property of the
 * software. "This is software you run, not a service you join" was an earlier
 * opening, and it asks the reader to translate an architecture into a reason
 * to feel safe — a translation this reader cannot do, and the diagnosed
 * reason the self-hosted alternatives fail to convert anybody who is not
 * already a developer.
 *
 * **It used to open on "we never ask for your bank password".** That is a
 * promise about the future, and this product may yet pull transactions on a
 * schedule. What replaces it is the part that does not depend on how the data
 * arrives: where the record lives, who can reach it, and that every
 * transaction can leave with you. Every transaction, not "everything": the
 * export is transactions only, so budgets, templates and recurrences stay
 * behind, and a privacy promise is the worst place to round that up.
 *
 * Every sentence is scoped, because the honest answer differs between the
 * version we run and the version you run. A privacy promise that one of the
 * two disproves is worse than none.
 */
export const privacy = {
  /** As `Proof["covers"]`. */
  covers: ["own-your-data"],
  eyebrow: "Your records",
  title: "Your records stay yours.",
  body:
    "Run it on your own computer and nobody else has a copy. If we run it for you, your records " +
    "live with us, and our privacy policy spells out exactly what we keep and who can reach it.",
  points: [
    "Pull every transaction out as a spreadsheet any time you want. We never hold your records back to keep you paying.",
    "No analytics in the product itself. On the free plan the ads bring Google's script with them. Premium and your own copy have neither.",
    "Nothing you put in is used to sell you anything, here or anywhere else.",
    "Anyone can read the code, and that isn't going to change.",
  ],
} as const;

/**
 * The closing section, and the one the page did not have.
 *
 * It ended on privacy, which is a good last impression and a bad last
 * sentence: the reader has been given every reason to trust the product and
 * no reason to find out what it costs. Everything above this is free to use,
 * and a page that spends two thousand words earning somebody's attention and
 * then stops has nowhere to put it.
 *
 * The numbers are written here rather than imported from
 * `src/content/pricing.ts` because they read differently in a sentence than
 * on a card, and `tests/app-facts.test.ts` holds every dollar figure in both
 * to the application's own contract, so the two cannot drift apart quietly.
 */
export const plans = {
  eyebrow: "Plans",
  title: "The whole product is free.",
  body:
    "Free gives you everything Simple Balance does, for three accounts you can use at once, " +
    "with ads on the page. Premium is $3 a month or $30 a year, and takes away both the limit " +
    "and the ads. Run it yourself and there's no plan at all.",
  ctaLabel: "See pricing",
  ctaHref: "/pricing/",
} as const;

/**
 * The pages announced in the header.
 *
 * Derived rather than listed, and the derivation is the point.
 * `src/content/sections.ts` promises that one flag moves three things at once
 * — the link, the `noindex` and the sitemap — so that "an unannounced section
 * cannot be half-launched by someone linking to it". Two of those three were
 * real: `announcedSections()` had exactly one caller, `src/app/sitemap.ts`,
 * and this list was written by hand. So announcing a section stopped its
 * `noindex`, entered it in the sitemap, and linked it from nowhere — a page
 * Google is invited to index and no reader can reach. A hand-written link
 * here is the same half-launch from the other side.
 */
export const primaryNav: readonly NavLink[] = [
  // Announced sections first: they are the product, and Pricing is the thing
  // you read after you know what it is.
  ...announcedSections().map((section) => ({ label: section.label, href: section.href })),
  { label: "Pricing", href: "/pricing/" },
];

/**
 * The header's one hand-written link, here rather than in the markup.
 *
 * It read "Source" in `site-header.tsx`, which is a shortening of "Get the
 * source" — a label `src/content/not-found.ts` records as retired from the
 * homepage for telling a general reader nothing they can act on. The header
 * kept it, and no copy test ever saw it, because 3.1 only reaches what is in
 * this module. Moving it here is the fix for both halves.
 */
export const headerSourceLink: NavLink = {
  label: "Run it yourself",
  href: "https://github.com/thtmnisamnstr/simple-balance",
};

export const contact = {
  eyebrow: "Get in touch",
  /**
   * One address, so there is no label. A single mailto under a heading
   * reading "General" is a category with nothing to distinguish it from.
   */
  address: "info@smpl.money",
} as const;

export const footer: { readonly blurb: string; readonly links: readonly NavLink[] } = {
  blurb:
    "Simple Balance keeps track of your money in one place, and lets you follow any number back to what actually happened.",
  links: [
    // The same derivation as `primaryNav`, because `sections.ts` promises the
    // header *and* the footer, and a flag that moves one of them is a flag
    // somebody has to remember the other half of.
    ...announcedSections().map((section) => ({ label: section.label, href: section.href })),
    { label: "Pricing", href: "/pricing/" },
    { label: "Privacy", href: "/privacy/" },
    { label: "Terms", href: "/terms/" },
    { label: "Source code", href: site.sourceUrl },
    { label: "License", href: `${site.sourceUrl}/blob/deployment-and-monetization/LICENSE` },
    { label: "Changelog", href: `${site.sourceUrl}/blob/deployment-and-monetization/CHANGELOG.md` },
    {
      label: "How to run it yourself",
      href: `${site.sourceUrl}/blob/deployment-and-monetization/docs/deployment.md`,
    },
  ],
};
