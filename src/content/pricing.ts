import { hero } from "@/content/home";

/**
 * The two plans, as the application actually enforces them.
 *
 * Every figure here is checkable against the application's source:
 * `MAX_FREE_ACCOUNTS` is 3 (`src/shared/domain.ts`), and it limits how many
 * accounts are **in use at once, never how many somebody keeps**. Three
 * functions beside it hold that. `frozenAccountIds` works out which accounts
 * past the three are frozen (readable, counted in every total, closed to every
 * write). Until the person chooses it keeps up to three of the oldest still
 * marked active: every account for somebody who never chose, so the three
 * oldest, but after a choice and a paid spell the ones chosen plus any opened
 * or reopened since, which is why the FAQ says "your three oldest" only about
 * somebody who has never chosen.
 * `activeAccountChange` lets that choice be made once and afterwards only fill
 * a place that has come free; and `accountAllowance` refuses a fourth account,
 * opened or brought back from the archive, while three are in use.
 * `getAdPlacement` (`src/server/services/billing.ts`) returns null unless the
 * free plan is in force. So the limit is always worded as what you can use at
 * once, never as what you keep: this page's first line went on saying "how
 * many accounts you can keep" for two commits after the product stopped
 * meaning it, on the branch written to describe the change.
 * `docs/standards/content.md` 2.1 is Binding about claims being true of the
 * shipped product, and pricing is where an overstatement is most expensive.
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
    "Every plan gets the whole product. What you pay for is how many accounts you can use at " +
    "once, and whether you see ads.",
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
    "Your transactions leave with you, as a spreadsheet, whenever you want them.",
    "An AI assistant works on every plan, and it gets only what you agree to when you connect it.",
    "Stop paying and nothing is deleted. Using more than three accounts? You pick three to keep using, and the rest stay readable.",
  ],
  note:
    "Prices are in US dollars. A year costs $30, or pay $3 a month and switch between the two " +
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
    "Only the first three lines are different. How many accounts you can use at once, whether " +
    "you see ads, and where it runs. Everything under them is in every plan, free one included.",
  compareCaption: "What is in each plan: Free, Premium, and running it yourself",
  columns: ["Free", "Premium", "Run it yourself"],
  faqTitle: "Questions people actually ask.",
} as const;

/**
 * The pricing page's search snippet and link preview.
 *
 * Here rather than in `src/app/pricing/page.tsx` because both carry a price,
 * and a price written into markup is one no test reads: when the app moved
 * from $20 to $30 these two were among the places nothing checked, and
 * `tests/app-facts.test.ts` now holds every dollar figure in them to the
 * application's contract. They also said "up to three accounts" with no
 * "at once", which is the old limit, in the one string Google shows.
 */
export const pricingMeta = {
  description:
    "Free for up to three accounts in use at once, with ads. Premium is $30 a year for as many " +
    "as you like, with no ads. Run it yourself and there's no plan at all.",
  socialDescription:
    "Free for three accounts in use at once, $30 a year for as many as you like, or run it " +
    "yourself for nothing.",
} as const;

export const tiers: readonly Tier[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    priceNote: "",
    summary: `Up to ${MAX_FREE_ACCOUNTS} accounts in use at once, and you see ads.`,
    who: "Most people, most of the time. Checking, savings, and one credit card is three.",
    // One string, shared with the header's control, because a header saying
    // one thing and a pricing button saying another describes two different
    // states. It used to be a second literal that happened to match.
    cta: { label: hero.primaryLabel, pending: true },
  },
  {
    key: "premium",
    name: "Premium",
    price: "$3",
    priceNote: "a month, or $30 a year",
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
    feature: "Accounts you can use at once",
    free: `${MAX_FREE_ACCOUNTS}`,
    premium: "Unlimited",
    self: "Unlimited",
    // The row used to say "accounts you can keep", and that stopped being the
    // limit: you keep all of them on every plan. What the free plan caps is how
    // many you can keep adding to, which is a different sentence and a much
    // easier one to be honest about.
    note: "You keep every account you ever open, on every plan. On the free plan you choose which three you keep using, once. The rest stay readable and still count in your totals, and one can take a place when you close or delete an account you were using.",
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
    feature: "Taking every transaction out as a spreadsheet",
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
    feature: "Changing thousands of lines at once",
    free: true,
    premium: true,
    self: true,
  },
  {
    id: "splits",
    feature: "One trip counted as two things",
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
    a: "Everything the product does, for up to three accounts you can use at once, with ads on the page. It isn't a trial and nothing is stripped out, and we don't ask for a card. Premium lets you use as many accounts as you like, and takes the ads away.",
  },
  {
    q: "What if I already have more than three accounts?",
    // Worked out by `frozenAccountIds`: the three oldest of the accounts still
    // marked in use. Only the chooser (`setActiveAccounts`) unmarks one, and
    // opening or reopening one marks it, so somebody who never chose has every
    // account marked and keeps the three oldest. After a choice,
    // `activeChoicePending` asks again only once more than three are marked,
    // which a paid spell that opened or reopened nothing never reaches: the
    // earlier choice stands and `activeAccountChange` refuses a swap. The
    // round before this said "after that ... you can pick any three", which
    // promised that swap. "Up to three" because somebody who closed some of
    // their chosen accounts while subscribed comes back with fewer in use and
    // nothing to choose, only free places to fill.
    a: "You keep every one of them, and you choose three to keep using. The others are frozen: still there, still complete, still counted in every balance and report you look at. You just can't add to them or change them. Until you choose, up to three stay usable. If you've never chosen, those are your three oldest, and you can pick any three, not just those. The choice is made once, so an account you are using stays that way until you close it or delete it, and only then can a frozen one take its place. That is the part worth knowing before you pick: it isn't a switch you can flip back and forth. Nothing is hidden and nothing is deleted, and upgrading brings all of them back at once. If you subscribe again, your choice still stands when that plan ends, unless you opened or reopened accounts while subscribed. Then you choose again, from all of them, and until you do, the three that stay usable are the oldest of the ones you chose and the new ones.",
  },
  {
    q: "If I close an account, does it still count?",
    a: "No. Closing an account zeroes it out, drops it from your running totals and frees the place it held, so a frozen account can take that place. We keep it rather than delete it, so the history is still there. Reopening it needs a free place of its own, which is what stops the three from being cycled: you can close as many as you like, and you still can't use more than three at a time.",
  },
  {
    q: "What are the ads like?",
    /*
     * Worded against the privacy policy rather than against the impression we
     * would like to give. The first version said the ads were "requested
     * without anything about you attached", which the policy contradicts in
     * its own words: a non-personalized ad is still chosen from the page and
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
    a: "Ordinary Google ads, never on the billing page or the sign-in screen. They aren't picked from what you spend, and they are only personalized if you specifically agreed to that. In the UK, the EEA and Switzerland you get asked before any advertising cookie is set, and saying no keeps the ads off your spending rather than off the page. The privacy policy covers the rest, including what does reach Google.",
  },
  {
    q: "How do I cancel, and will you keep charging me?",
    a: "You cancel from the plan tab, and it stops at the end of the period you already paid for. No notice period, no phone call, no offer to sit through. Nothing is deleted when it ends. You go back to the free plan and keep every account you have. If more than three are in use, you pick three to keep using. You make that choice once: the rest stay readable, and one can take a place when you close or delete an account you were using.",
  },
  {
    q: "What happens to everything I have put in if I stop paying?",
    a: "You keep it. Every account, every payment and every report is still there and still adds up, and you can pull every transaction out as a spreadsheet any time, on any plan. What the free plan limits is how many accounts you can keep adding to: three, and you choose which. We never hold your own records back to keep you paying.",
  },
  {
    q: "Why is it $30 when everything else costs more? Will you still be here next year?",
    a: "Because there isn't much to pay for. It is one small program, and there's nobody else's data to look after. As for the second question, here's a fact rather than a promise: the whole product is free to run yourself, and every transaction you have can be exported and brought into your own copy. If we stop, your transactions don't have to.",
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
    a: "If we run it for you, your records sit on our server. That is what running it for you means, and the privacy policy says exactly what's stored and who can get at it. Run it yourself and nobody has a copy, including us. Nothing about your spending is used to pick the ads. The product itself has no analytics either way, though on the free plan the ads bring Google's script with them.",
  },
  {
    /*
     * Every step is here because the application does something a reader
     * wouldn't guess. The export is transactions only, so budgets and
     * recurrences stay behind. An import puts every row into the one account
     * picked for it, hence one account at a time. An opening balance is
     * posted with no transaction (`postOpeningBalance`), so no export carries
     * it, and the answer before this one, which never said so, left every
     * account off by where it started. An account page exports what its date
     * bar shows, and the bar starts on This month (`presetFromParam`), so a
     * reader who skips the All time step moves one month of each account.
     * A transfer is in both accounts' files and arrives with neither account
     * filled in; picked in the second file, it matches the first as a
     * duplicate, and committing it anyway records it twice. The importer
     * takes 10,000 rows and its own refusal says to go a date range at a
     * time, which is that same bar set shorter. `tests/app-facts.test.ts`
     * holds the answer to the last four.
     */
    q: "Can I move from the version you run to my own copy later?",
    a: "Yes, one account at a time. Only your transactions move, so you'd set up budgets and repeating payments again. First, make each account in your own copy. Give it the same currency, starting balance and start date it has here. The starting balance isn't in the file. Then open each account here, set the dates at the top to All time, export its transactions as a spreadsheet, and bring that file into the matching account. Everything in one file goes into the account you pick when you bring it in. A transfer between two of your accounts is in both files. The first time, pick both accounts for it. The second time, leave it out, since you already have it. If you pick its accounts there anyway, it's marked as one you already have. If an account has more than 10,000 transactions, pick a shorter range of dates there and move one range at a time, because that's the most one file can bring in.",
  },
];
