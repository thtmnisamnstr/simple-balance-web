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
  title: "What it costs, and what you get.",
  lede:
    "Every plan gets the whole product. What you pay for is how many accounts you can keep, and " +
    "whether you see ads.",
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
    "Your records leave with you, as a spreadsheet, whenever you want them.",
    "An AI assistant works on every plan, and it can't change anything without your okay.",
    "Stop paying and you keep every account you have. We delete nothing.",
  ],
  note:
    "Prices are in US dollars. A year costs $20, or pay $2 a month and switch between the two " +
    "whenever you like. The version we run for you isn't open yet. Running it yourself works " +
    "today, and always will.",
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
    "Only the first three lines are different. How many accounts you keep, whether you see ads, " +
    "and where it runs. Everything under them is in every plan, free one included.",
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
    who: "Most people, most of the time. Checking, savings, and one credit card is three.",
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
    who: "Anyone with more than three accounts, or anyone who would rather not see ads next to their balances.",
    cta: { label: hero.primaryLabel, pending: true },
    featured: true,
  },
  {
    key: "self",
    name: "Run it yourself",
    price: "$0",
    priceNote: "it's your computer",
    summary: "Everything, unlimited, no ads, no account with us.",
    who: "People who already run their own software and would rather their money never left their own computer. Same product, nothing stripped out.",
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
    note: "An account you closed still counts toward this. Closing it zeroes it out and drops it from your totals, but the history stays and you can reopen it.",
  },
  {
    id: "ads",
    feature: "Ads",
    free: "Yes",
    premium: "None",
    self: "None",
    note: "Never on the sign-in page or the billing page, and never picked using your spending.",
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
    note: "What you own and what you owe, what came in and what went out, and where it all went.",
  },
  {
    id: "budgets",
    feature: "Budgets, with what you don't spend carried over",
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
    note: "Including the rows that look like payments you already have, shown before any of them count.",
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
    note: "Run it yourself and this is the one piece that needs a mail server. Nothing else does, and nothing else breaks without one.",
  },
];

export const faq: readonly { readonly q: string; readonly a: string }[] = [
  {
    q: "How does my spending get in?",
    a: "You bring it in yourself. Your bank lets you download a file of what you spent, the kind that opens in a spreadsheet. Drag it in and Simple Balance figures out which column is which, files the names it knows, and flags anything that looks like a payment you already have before it counts. You can also type entries in by hand, or have an AI assistant line them up for you to approve.",
  },
  {
    q: "What do I actually get for free?",
    a: "Everything the product does, for up to three accounts, with ads on the page. It isn't a trial and nothing is stripped out, and we don't ask for a card. Premium gets you a fourth account and beyond, and no ads.",
  },
  {
    q: "What if I already have more than three accounts?",
    a: "You keep all of them. The limit only stops you adding a new one. It never hides an account, blocks a file, or takes anything away. If you're over, you stay over until you close one or upgrade.",
  },
  {
    q: "If I close an account, does it still count?",
    a: "Yes, toward the number of accounts you're allowed. Closing an account zeroes it out and drops it from your running totals, but we keep it rather than delete it, so the history is still there and you can reopen it. That is why it still counts. Otherwise you could get around the limit by closing accounts and reopening them.",
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
    /*
     * Shorter than it was, and still holding the two things
     * `content.md` 2.4 requires of it: it must name personalization and
     * consent, and it must not round the policy down to "nothing about you".
     * The detail it used to carry — what does reach Google, and that a page
     * address can name a record — lives in the policy, which this now points
     * at rather than paraphrasing.
     */
    a: "Ordinary Google ads, never on the billing page or the sign-in screen. They aren't picked from what you spend, and they are only personalized if you specifically agreed to that. In the UK, the EEA and Switzerland you get asked before any advertising cookie is set, and saying no means you see none. The privacy policy covers the rest, including what does reach Google.",
  },
  {
    q: "How do I cancel, and will you keep charging me?",
    a: "You cancel from the plan tab, and it stops at the end of the period you already paid for. No notice period, no phone call, no offer to sit through. Nothing is deleted when it ends. You go back to the free plan, keep every account you have, and can't add a new one until you're back under the limit.",
  },
  {
    q: "What happens to everything I have put in if I stop paying?",
    a: "You keep it. Every account, every payment, every report stays exactly as it was, and you can pull all of it out as a spreadsheet any time, on any plan. We never hold your own records back to keep you paying.",
  },
  {
    q: "Why is it $20 when everything else costs more? Will you still be here next year?",
    a: "Because there isn't much to pay for. It is one small program, and there's nobody else's data to look after. As for the second question, here's a fact rather than a promise: the whole product is free to run yourself, and what you export is built to load straight into your own copy. If we stop, your records don't.",
  },
  {
    q: "What is the difference between paying and running it yourself?",
    a: "Where it runs, and who keeps it. The product is the same either way. Running it yourself has no plan, no limit and no ads, because there's nobody to bill you. It really is for people who already run their own software. If that isn't you, wait for the version we run.",
  },
  {
    q: "Do I need to know accounting?",
    a: "No. Underneath, every amount is recorded as coming from one place and going to another, which is what makes the totals add up and lets you open any number to see what it's made of. You never have to think about it or learn what it's called.",
  },
  {
    /*
     * The question the privacy section on the homepage raises and cannot
     * finish answering, because the honest answer differs by plan. Leaving
     * it out was the real risk: a privacy promise the hosted plan disproves
     * is worse than no promise, so the split is stated rather than blurred.
     */
    q: "Do you keep a copy of what I spend?",
    a: "If we run it for you, your records sit on our server. That is what running it for you means, and the privacy policy says exactly what's stored and who can get at it. Run it yourself and nobody has a copy, including us. Either way there's no tracking inside the product, and nothing about your spending is used to pick the ads.",
  },
  {
    q: "Can I move from the version you run to my own copy later?",
    a: "Yes. Export everything as a spreadsheet and bring it into your own copy. What comes out is built to go back in unchanged, even if you hold more than one currency.",
  },
];
