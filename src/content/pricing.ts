import { hero } from "@/content/home";

/**
 * The two plans, as the application actually enforces them.
 *
 * Every figure here is checkable against the application's source:
 * `MAX_FREE_ACCOUNTS` is 3 (`src/shared/domain.ts`), `accountAllowance` is
 * what refuses a fourth, and `getAdPlacement` returns null for anybody not on
 * the free plan. `docs/standards/content.md` 2.1 is Binding about claims being
 * true of the shipped product, and pricing is where an overstatement is most
 * expensive.
 *
 * The third column is the one most pricing pages would leave out and the one
 * that is most true of this product: **running it yourself has no plan at
 * all**. The limits exist only where an operator has configured billing.
 * Somebody running their own copy gets everything, unlimited, with no ads,
 * forever, and saying so is not a giveaway — it is the reason to trust the
 * other two columns.
 *
 * **The ads are disclosed first, in the word "ads".** They used to arrive in
 * the lede as "whether the page carries an ad" and again as a table row
 * reading "Advertising / Yes". A reader who discovers ads in a money app
 * after signing up treats it as a betrayal rather than as a term they
 * accepted, so the blunt word goes above the prices and the reassurance
 * follows it rather than replacing it.
 */

export type Tier = {
  readonly key: "free" | "premium" | "self";
  readonly name: string;
  readonly price: string;
  readonly priceNote: string;
  readonly summary: string;
  /** What this tier is for, in the reader's terms. */
  readonly who: string;
  readonly cta: { readonly label: string; readonly href?: string; readonly pending?: boolean };
  readonly featured?: boolean;
};

export const MAX_FREE_ACCOUNTS = 3;

export const pricing = {
  eyebrow: "Pricing",
  title: "What it costs, and why the free plan has ads.",
  lede:
    "Nothing in the product is held back on any plan. What you pay for is how many accounts you " +
    "keep, and whether you see ads — and the free plan does show ads, because that is what pays " +
    "for it.",
  /**
   * The strip under the prices that answers "what am I risking".
   *
   * Every competitor closes its price block with one of these and ours had
   * none. Each line is a fact rather than a promise: there is nothing to
   * cancel on a free plan because there is nothing being charged, and the
   * export is a feature of the product rather than a policy that could be
   * revised.
   */
  reassurances: [
    "No card to start, and nothing to cancel on the free plan.",
    "Your record leaves with you, as a spreadsheet, whenever you want it.",
    "An AI assistant can read your records on every plan, and can change nothing without your yes.",
    "Stop paying and you keep every account you have. Nothing is deleted.",
  ],
  note:
    "Prices are in US dollars. A year costs $20, or you can pay $2 a month and move between " +
    "the two whenever you like. The version we run for you is not open yet; running it yourself " +
    "is available today and always will be.",
  /** The flag over the recommended tier. */
  featuredFlag: "If you outgrow Free or hate ads",
  compareTitle: "What each one includes.",
  /**
   * The three rows at the top are the only rows that differ. The other
   * fourteen are identical across all three columns and are there to answer
   * "is the cheap one the cut-down one" — which is the question a reader
   * actually has, and the answer is no.
   */
  compareLede:
    "Only the first three lines differ: how many accounts you keep, whether you see ads, and " +
    "where it runs. Everything below them is in every plan, including the free one.",
  compareCaption: "What is in each plan: Free, Premium, and running it yourself",
  columns: ["Free", "Premium", "Run it yourself"],
  faqTitle: "Questions people actually ask.",
} as const;

export const tiers: readonly Tier[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    priceNote: "",
    summary: `Up to ${MAX_FREE_ACCOUNTS} accounts, and you see ads.`,
    who: "Most people, most of the time. A current account, a savings account and a card is three.",
    // One string, shared with the header's control, because a header saying
    // one thing and a pricing button saying another describes two different
    // states. It used to be a second literal that happened to match.
    cta: { label: hero.primaryLabel, pending: true },
  },
  {
    key: "premium",
    name: "Premium",
    price: "$2",
    priceNote: "a month, or $20 a year",
    summary: "As many accounts as you need, and no ads.",
    who: "Anyone keeping more than three accounts, or anyone who would rather not be sold something on a page showing their balances.",
    cta: { label: hero.primaryLabel, pending: true },
    featured: true,
  },
  {
    key: "self",
    name: "Run it yourself",
    price: "$0",
    priceNote: "it is your computer",
    summary: "Everything, unlimited, no ads, no account with us.",
    who: "People who already run things themselves and would rather their money never left their own machine. It is the same product, not a cut-down one.",
    cta: {
      label: "See how to run it yourself",
      href: "https://github.com/thtmnisamnstr/simple-balance",
    },
  },
];

export type Row = {
  /**
   * A stable name for the row, independent of what it is called on screen.
   *
   * `tests/pricing.test.tsx` used to find rows by their visible label, which
   * made the account-limit check fail the moment the label was reworded for
   * a general reader — a copy edit breaking a test about a number. The id is
   * what the tests hold; the label is free to change.
   */
  readonly id: string;
  readonly feature: string;
  /** A string renders as text; true as a tick; false as a dash. */
  readonly free: string | boolean;
  readonly premium: string | boolean;
  readonly self: string | boolean;
  /** Why this row is worth a line, where that is not obvious. */
  readonly note?: string;
};

export const comparison: readonly Row[] = [
  {
    id: "accounts",
    feature: "Accounts you can keep",
    free: `${MAX_FREE_ACCOUNTS}`,
    premium: "Unlimited",
    self: "Unlimited",
    // The reason matters and the first version had it backwards: closing an
    // account posts its balance out, so it stops counting toward your totals.
    // It still counts toward the plan limit, which is the point of the row.
    note: "An account you have closed still counts toward this. Closing one settles it to zero and takes it out of your totals, but its history stays and you can reopen it.",
  },
  {
    id: "ads",
    feature: "Ads",
    free: "Yes",
    premium: "None",
    self: "None",
    note: "Never on the sign-in page or the billing page, and never chosen using your spending.",
  },
  {
    id: "own-hardware",
    feature: "Runs on a computer you own",
    free: false,
    premium: false,
    self: true,
  },

  {
    id: "payments",
    feature: "Payments you can record",
    free: "Unlimited",
    premium: "Unlimited",
    self: "Unlimited",
  },
  {
    id: "currencies",
    feature: "Currencies",
    free: "Unlimited",
    premium: "Unlimited",
    self: "Unlimited",
  },
  {
    id: "reports",
    feature: "Every report",
    free: true,
    premium: true,
    self: true,
    note: "What you own and what you owe, what came in and what went out, where the spending went, and month by month.",
  },
  {
    id: "budgets",
    feature: "Budgets, with what you do not spend carried over",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "import",
    feature: "Bringing in a file from your bank",
    free: true,
    premium: true,
    self: true,
    note: "Including showing you the rows that look like payments you already have, before any of them count.",
  },
  {
    id: "export",
    feature: "Taking everything out as a spreadsheet",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "recurring",
    feature: "Rent, payday and renewals, set up once",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "templates",
    feature: "Saved entries for what you record often",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "bulk",
    feature: "Changing thousands of lines in one go",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "splits",
    feature: "One shop counted as two things",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "history",
    feature: "A running balance, and a record of every correction",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "agents",
    feature: "Letting an AI assistant do the filing",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "email",
    // A tick in all three columns with the condition in the note, rather than
    // "If you set up email" in the third. The condition is real but it is not
    // a plan difference — it is a thing you configure on a machine you own —
    // and putting it in the column made the lede above the table false, since
    // that promises the first three lines are the only ones that change.
    feature: "Email reminders",
    free: true,
    premium: true,
    self: true,
    note: "Run it yourself and this is the one part that needs a mail server. Nothing else does, and nothing else stops working without one.",
  },
];

export const faq: readonly { readonly q: string; readonly a: string }[] = [
  {
    q: "How does my spending get in?",
    a: "You bring it in yourself, from the file your bank lets you download — the kind that opens in a spreadsheet. Drag it in and Simple Balance works out which column is which, files the names it recognises, and shows you anything that looks like something you already have before it counts. You can also type an entry straight in, or let a connected AI assistant stage one for you to approve.",
  },
  {
    q: "What do I actually get for free?",
    a: "Everything the product does, for up to three accounts, with ads on the page. Not a trial, not a cut-down version, and there is no card to hand over. What Premium adds is the fourth account onwards, and no ads.",
  },
  {
    q: "What if I already have more than three accounts?",
    a: "You keep all of them. The limit refuses a new one; it never hides an account, stops you bringing a file in, or takes anything away. If you are over the limit you stay over it until you close one or upgrade.",
  },
  {
    q: "If I close an account, does it still count?",
    a: "Yes, toward the number of accounts you are allowed. Closing an account settles it to zero and takes it out of your running totals, but it is kept rather than deleted — the history is still there and you can reopen it. That is why it still counts: a limit that ignored closed accounts would be one you could reset by closing an account and reopening it.",
  },
  {
    q: "What are the ads like?",
    /*
     * Worded against the privacy policy rather than against the impression we
     * would like to give. The first version said the ads were "requested
     * without anything about you attached", which the policy contradicts in
     * its own words: a non-personalised ad is still chosen from the page and
     * your rough location. `tests/legal.test.tsx` holds the two surfaces
     * together now, because a pricing page that undersells what is collected
     * is the same failure as a policy that oversells it.
     */
    a: "They are the ordinary Google ads you see elsewhere on the web, and they never appear on the billing page or the sign-in screen. They are not picked from what you spend: by default they are chosen from the page you are looking at and your rough location, never from a profile of you, and they are only ever personalised if you have specifically agreed to that. What does go to Google is the address of the page the ad sits on, and on some pages an address names one of your own records — which is the plainest reason to prefer a plan without ads. In the UK, the EEA and Switzerland you are asked before any advertising cookie is set, and saying no means you see no ads at all.",
  },
  {
    q: "How do I cancel, and will you keep charging me?",
    a: "You cancel from the plan tab, and it stops at the end of the period you have already paid for. There is no notice period, no phone call and no offer to sit through. Nothing is deleted when it ends: you go back to the free plan, keep every account you have, and the limit refuses a new one until you are back under it.",
  },
  {
    q: "What happens to everything I have put in if I stop paying?",
    a: "You keep it. Every account, every payment and every report stays exactly as it was, and you can take the whole lot out as a spreadsheet at any time, on any plan. Your own record is never held back to keep you paying for it.",
  },
  {
    q: "Why is it $20 when everything else costs more? Will you still be here next year?",
    a: "Because there is not much to pay for: one small program, and nobody's data to look after beyond your own. And the answer to the second question is a fact rather than a promise — the whole product is free to run yourself, and what you take out is built to load straight into your own copy. If this stops, your record does not.",
  },
  {
    q: "What is the difference between paying and running it yourself?",
    a: "Where it runs and who keeps it. The product is the same either way. Running it yourself has no plan, no limit and no ads, because there is nobody to bill you — and it is genuinely for people who already run things themselves. If that is not you, the version we run is the one to wait for.",
  },
  {
    q: "Do I need to know accounting?",
    a: "No. Underneath, every amount is recorded as coming from one place and going to another, which is what makes the totals match and lets you open any number and see what it is made of. You never have to think about it, name it, or learn it.",
  },
  {
    /*
     * The question the privacy section on the homepage raises and cannot
     * finish answering, because the honest answer differs by plan. Leaving
     * it out was the real risk: a privacy promise the hosted plan disproves
     * is worse than no promise, so the split is stated rather than blurred.
     */
    q: "Do you keep a copy of what I spend?",
    a: "If we run it for you, your record sits on our server — that is what running it for you means — and the privacy policy says exactly what is stored and who can touch it. Run it yourself and the answer is that nobody has a copy, including us. Either way there is no tracking inside the product, and nothing about your spending is used to choose the ads.",
  },
  {
    q: "Can I move from the version you run to my own copy later?",
    a: "Yes. Take everything out as a spreadsheet and bring it into your own copy. What comes out is built to go back in unchanged, including accounts held in more than one currency.",
  },
];
