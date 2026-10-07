import { hero } from "@/content/home";

/**
 * The two plans, as the application actually enforces them.
 *
 * Every figure here is checkable against the application's source:
 * `MAX_FREE_ACCOUNTS` is 3 (`src/shared/domain.ts`), and it limits how many
 * accounts are **in use at once, never how many somebody keeps**. Three
 * functions beside it hold that. `frozenAccountIds` works out which accounts
 * past the three are frozen (readable, counted in every total, closed to every
 * change to what they hold, and still free to be archived or deleted). Until
 * the person chooses it keeps up to three of the oldest still marked active:
 * every account for somebody who never chose, so the three oldest, but after a
 * choice and a paid spell the ones chosen plus any opened or reopened since,
 * which is why the FAQ says "your three oldest" only about somebody who has
 * never chosen.
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
 * and saying so is not a giveaway — it is the reason to trust the other two
 * columns.
 *
 * **The ads are disclosed first, in the word "ads".** They used to arrive in
 * the lede as "whether the page carries an ad" and again as a table row
 * reading "Advertising / Yes". A reader who discovers ads in a money app
 * after signing up treats it as a betrayal rather than as a term they
 * accepted, so the blunt word goes above the prices and the reassurance
 * follows it rather than replacing it.
 *
 * **The page's own argument is the monetization model, and it was buried.**
 * The headline read "What it costs, and what you get", which heads any
 * pricing page ever written, while the genuinely unusual fact — that the free
 * plan is the whole product and the paid one raises a limit and removes
 * advertising — sat in the lede underneath it. A sixteen-row comparison table
 * then argued the opposite of that lede: thirteen of its rows were identical
 * across all three columns, so the picture said "lots of differences" while
 * the sentence above it said "three". The table now carries only the lines
 * that change, and `included` carries the rest as a list, which is the same
 * information arranged so that it proves the claim instead of undercutting
 * it.
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
  title: "Every plan is the whole product.",
  lede:
    "Free gives you everything Simple Balance does, for three accounts you can use at once, " +
    "with ads on the page. Premium takes away the limit and the ads for $3 a month or $30 a " +
    "year. You can also run the whole thing yourself, for nothing.",
  /**
   * The strip under the prices that answers "what am I risking".
   *
   * Every competitor closes its price block with one of these and ours had
   * none. Each line is a fact rather than a promise: there is nothing to
   * cancel on a free plan because there is nothing being charged, and the
   * export is a feature of the product rather than a policy that could be
   * revised.
   *
   * The line about an AI assistant left this list, not because it stopped
   * being true but because it was answering a question nobody asks with a
   * price in front of them. What goes here is the four things somebody
   * hesitating over a card is actually weighing: whether they need one,
   * whether they can stop, whether stopping costs them anything, and whether
   * they can leave with what they put in.
   */
  reassurances: [
    "No card to start, and nothing to cancel on the free plan.",
    "Cancel Premium yourself, from your own plan page, whenever you want.",
    "Stop paying and nothing is deleted. If more than three accounts are in use, you pick three to keep using and the rest stay readable.",
    "Your transactions leave with you, as a spreadsheet, whenever you want them.",
  ],
  /*
   * "Running it yourself works today, and always will" is what this said. The
   * license makes continued independent use about as durable as software gets,
   * and "always" is still a word a marketing page does not get to use about
   * the future. The present tense says the part that is checkable.
   */
  note:
    "Prices are in US dollars. A year costs $30, or pay $3 a month and switch between the two " +
    "whenever you like. The version we run for you isn't open yet. Running it yourself works " +
    "today.",
  /** The flag over the recommended tier. */
  featuredFlag: "Unlimited accounts, no ads",
  compareTitle: "Only four lines change.",
  /**
   * The lede over the table, which now describes a table that agrees with it.
   * It promised that only three lines differed while the table showed sixteen
   * rows, thirteen of them identical across all three columns, which is an
   * argument with its own illustration.
   */
  compareLede:
    "How many accounts you can use at once, whether you see ads, who runs it, and what it " +
    "costs. Everything else is the same on all three, the free plan included.",
  compareCaption: "What changes between Free, Premium, and running it yourself",
  columns: ["Free", "Premium", "Run it yourself"],
  includedTitle: "In every plan, including the free one.",
  faqTitle: "Questions about pricing.",
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
  /**
   * The page title a result listing shows, which was the word "Pricing".
   *
   * True, and it wastes the one line a searcher reads deciding between this
   * result and nine others. The price is the thing they are searching for and
   * it is small, so it goes in the title rather than being discovered a click
   * later. `%s — Simple Balance` is the template every route gets, which
   * leaves this one forty-three characters before the composed title runs past
   * what a listing renders.
   *
   * Here rather than in `src/app/pricing/page.tsx` for the reason the two
   * below are: a price written into markup is a price no test reads, and
   * `tests/app-facts.test.ts` sweeps every string in this object.
   */
  title: "Pricing: free, or $30 a year",
  /** The link preview's headline, which names the third option a search result has no room for. */
  socialTitle: "Pricing: free, Premium, or run it yourself",
  description:
    "Every feature is in every plan. Free covers three accounts in use at once, with ads. " +
    "Premium is $3 a month or $30 a year for as many as you like, with no ads. Run it yourself " +
    "and there's no plan at all.",
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
    /*
     * "Most people, most of the time" was a claim about the reader rather
     * than about the plan, and it is slightly rude to somebody with four
     * accounts: they are being told they are unusual on the page where they
     * are deciding whether to pay. The condition is the honest version, and
     * the example is an example rather than a conclusion.
     */
    who: "A good fit if three accounts cover what you actually use. For example: checking, savings and one credit card.",
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
    /*
     * "it's your computer" was here, which is a joke in the slot where a
     * reader is looking for a number's terms. The slot beside a price says
     * what the price repeats on, and for this one the answer is nothing.
     */
    priceNote: "No subscription",
    summary: "Everything, unlimited, with no ads.",
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

/**
 * The lines that differ, and only those.
 *
 * Thirteen rows left this table and became `included` below. Each of them was
 * a tick in all three columns, which is a row that answers "is the cheap one
 * the cut-down one" at the cost of making the table look like a feature
 * matrix — and a feature matrix is a picture of a product with tiers. This
 * one has no tiers, only a limit and some advertising, and four rows is what
 * that actually looks like.
 */
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
    id: "subscription",
    feature: "What it costs",
    free: "Nothing",
    premium: "$3 a month or $30 a year",
    self: "Nothing",
  },
];

/**
 * Everything that does not change between plans.
 *
 * This is the thirteen rows that used to be ticks, as a list, which is the
 * shape that matches the claim. It is checked against the application's own
 * published capability list rather than written freely:
 * `tests/app-facts.test.ts` holds the count beside
 * `facts.declared.capabilities`, so a capability the application adds cannot
 * quietly fail to reach the one place on this site that enumerates them.
 */
export const included: readonly string[] = [
  "A running balance beside every payment, and a record of every correction",
  "Every report: what you own and what you owe, what came in and what went out, and where it all went",
  "Budgets, with what you don't spend carried over",
  "Bringing in a file from your bank, with anything that looks like a duplicate shown first",
  "Taking every transaction out as a spreadsheet",
  "Rent, payday and renewals, set up once",
  "Saved entries for what you record often",
  "One purchase split across categories",
  "Changing thousands of lines at once",
  "As many payments and as many currencies as you like",
  "Letting an AI assistant do the filing",
  "Email reminders, where there's a mail server to send them",
];

export type FaqItem = {
  readonly q: string;
  readonly a: string;
  /**
   * A page the answer names, where it names one.
   *
   * The migration answer ended "the guide to moving to your own copy has
   * every step" and was plain text in a `<p>`, so it named a page and gave
   * no way to reach it. That is worse than the eleven-sentence procedure it
   * replaced: the long answer at least worked.
   */
  readonly link?: { readonly label: string; readonly href: string };
};

export const faq: readonly FaqItem[] = [
  {
    q: "How does my spending get in?",
    /*
     * The no-connection disclosure, in the second-to-last sentence rather
     * than the first. A reader needs to know this before they sign up and
     * after they know what the product is for, and `content.md` 1.4 is the
     * rule: describe the mechanism, state its present limits, promise nothing
     * about the future.
     */
    a: "You bring it in yourself, because there's no automatic pull from your bank today. Your bank lets you download a file of what you spent, the kind that opens in a spreadsheet. Drag it in and Simple Balance figures out which column is which, files the names it knows, and flags anything that looks like a payment you already have before it counts. You can also type entries in by hand, or have an AI assistant queue them up for you to approve.",
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
    //
    // Shorter than it was by about a third, and every one of those clauses is
    // still here. What went was the restatement: the answer said three times,
    // in different words, that nothing is deleted.
    //
    // "You just can't add to them or change them" stopped being true in 0.2.1,
    // when `setAccountArchived` and `deleteAccount` dropped their freeze check:
    // somebody who downgrades with thirty accounts can now put away the ones
    // they no longer use without upgrading first. Said as closing, this page's
    // word for archiving, and not as deleting, which only an account with
    // nothing on it allows.
    a: "You keep every one of them, and you choose three to keep using. The others are frozen: still there, still complete, still counted in every balance and report you look at. You can't add to them or change what's in them, but you can still close the ones you no longer use. The part worth knowing before you pick is that it isn't a switch you can flip back and forth. The choice is made once, so an account you are using stays usable until you close it or delete it, and only then can a frozen one take its place. Until you choose, up to three stay usable. If you've never chosen, those are your three oldest, and you can pick any three, not just those. Upgrading brings all of them back at once. If you subscribe again, your choice still stands when that plan ends, unless you opened or reopened accounts while subscribed. Then you choose again, from all of them, and until you do, the three that stay usable are the oldest of the ones you chose and the new ones.",
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
    /*
     * **It said "you get asked before any advertising cookie is set"**, which
     * was false for a while: no consent message was published, so it was a
     * promise to everybody that nobody kept, and the answer was rewritten to
     * say none was published. The operator has since published Google's
     * European and US-state messages for both origins and turned off the
     * forced non-personalized flag, so the answer now says what happens by
     * region, and never as a promise to everybody: a reader in Ohio is not
     * asked, and a sentence telling them they are would be the old failure
     * back again. `tests/legal.test.tsx` holds every "asked before" to the
     * region it is true in.
     *
     * The invariant is one-directional: a marketing claim may not be
     * *stronger* than the policy it links to. "They are only personalized if
     * you specifically agreed" went for that reason — outside Europe they
     * can be, without anybody agreeing.
     */
    a: "Ordinary Google ads, never on the billing page or the sign-in screen. They aren't picked from what you spend, but they can be personalized from what Google knows of your browsing. In the UK, the EEA and Switzerland, Google's message asks for your consent before any advertising cookie is set; in US states with privacy laws, it offers a link to opt out instead. Saying no doesn't remove the ads. It keeps them from being personalized. The privacy policy covers the rest, including what does reach Google and the cookie this website itself sets.",
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
    a: "If we run it for you, your records live on our computers. That is what running it for you means, and the privacy policy says exactly what's stored and who can get at it. Run it yourself and nobody has a copy, including us. Nothing about your spending is used to pick the ads. The product itself has no analytics either way, though on the free plan the ads bring Google's script with them.",
  },
  {
    /*
     * The procedure that used to be here is now
     * `content/docs/moving-to-your-own-copy.md`, and
     * `tests/app-facts.test.ts` reads it there. A pricing page has to settle
     * whether somebody is locked in; it does not have to teach them a
     * multi-step data migration before they have decided to sign up, and the
     * eleven-sentence version that did was the longest answer on the page by
     * a distance.
     *
     * What stays is the part that bears on the purchase: it is possible, it
     * is not one button, and two things do not travel.
     */
    q: "Can I move from the version you run to my own copy later?",
    a: "Yes, and it's worth knowing up front that it isn't one button. Your transactions move, one account at a time, as spreadsheets you export here and bring in there. Budgets and repeating payments you set up again, and each account's starting balance is carried over by hand, because it isn't in the file. The guide to moving to your own copy has every step.",
    link: { label: "Moving to your own copy", href: "/docs/moving-to-your-own-copy/" },
  },
];
