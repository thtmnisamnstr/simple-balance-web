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
 * that is most true of this product: **self-hosting has no plan at all**. The
 * limits exist only where an operator has configured billing. Somebody running
 * their own copy gets everything, unlimited, with no ads, forever, and saying
 * so is not a giveaway — it is the reason to trust the other two columns.
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
  title: "Two plans, and a third option that costs nothing.",
  lede:
    "Everything in the product is on every plan. What you pay for is how many accounts you " +
    "keep, and whether the page carries an ad.",
  note:
    "Prices are in US dollars. The annual plan is two months cheaper than paying monthly, and " +
    "you can move between them whenever you like. The hosted version is not open yet; " +
    "self-hosting is available today and always will be.",
} as const;

export const tiers: readonly Tier[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    priceNote: "forever",
    summary: `Up to ${MAX_FREE_ACCOUNTS} accounts, with ads.`,
    who: "Most people, most of the time. A current account, a savings account and a card is three.",
    cta: { label: "Hosted version soon", pending: true },
  },
  {
    key: "premium",
    name: "Premium",
    price: "$20",
    priceNote: "a year, or $2 a month",
    summary: "As many accounts as you need, and no ads.",
    who: "Anyone tracking more than three accounts, or anyone who would simply rather not see an ad on a page showing their balances.",
    cta: { label: "Hosted version soon", pending: true },
    featured: true,
  },
  {
    key: "self",
    name: "Self-hosted",
    price: "$0",
    priceNote: "it is your server",
    summary: "Everything, unlimited, no ads, no account with us.",
    who: "Anyone who would rather their transactions never left their own hardware. This is the same software, not a cut-down edition.",
    cta: { label: "Get the source", href: "https://github.com/thtmnisamnstr/simple-balance" },
  },
];

export type Row = {
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
    feature: "Financial accounts",
    free: `${MAX_FREE_ACCOUNTS}`,
    premium: "Unlimited",
    self: "Unlimited",
    note: "Archived accounts count, because a quota you can reset by archiving is not a quota. The accounts the ledger owns for its own bookkeeping do not.",
  },
  { feature: "Advertising", free: "Yes", premium: "None", self: "None" },
  { feature: "Transactions", free: "Unlimited", premium: "Unlimited", self: "Unlimited" },
  { feature: "Currencies", free: "Unlimited", premium: "Unlimited", self: "Unlimited" },
  { feature: "Double-entry ledger", free: true, premium: true, self: true },
  {
    feature: "Every report",
    free: true,
    premium: true,
    self: true,
    note: "Net worth, income and expenses, spending by category, cash flow, balance sheet and trial balance.",
  },
  { feature: "Budgets, with carry-over", free: true, premium: true, self: true },
  { feature: "CSV import, with duplicate review", free: true, premium: true, self: true },
  { feature: "CSV export", free: true, premium: true, self: true },
  { feature: "Recurring transactions", free: true, premium: true, self: true },
  { feature: "Templates", free: true, premium: true, self: true },
  { feature: "Bulk edit and delete, to 10,000 rows", free: true, premium: true, self: true },
  { feature: "Split transactions", free: true, premium: true, self: true },
  { feature: "Account register and audit history", free: true, premium: true, self: true },
  { feature: "MCP server, for AI agents", free: true, premium: true, self: true },
  { feature: "Email reminders", free: true, premium: true, self: "If you configure mail" },
  { feature: "Your data, exportable at any time", free: true, premium: true, self: true },
  { feature: "Runs on your own hardware", free: false, premium: false, self: true },
];

export const faq: readonly { readonly q: string; readonly a: string }[] = [
  {
    q: "What happens if I am on Free and already have more than three accounts?",
    a: "You keep all of them. The limit refuses a fourth; it never hides an account, stops an import, or takes anything away. If you are over the limit, you stay over it until you archive one or upgrade.",
  },
  {
    q: "Do archived accounts count toward the limit?",
    a: "Yes. An archived account is kept rather than deleted — its history is still in your ledger and still in your reports — so a limit that ignored archiving would be a limit you could reset by archiving and restoring.",
  },
  {
    q: "Is anything in the product held back for Premium?",
    a: "No. Every report, every import, the whole CSV round trip and the entire agent surface are the same on both plans. There are no transaction quotas and no feature flags. Premium raises the account limit and removes the ads.",
  },
  {
    q: "What do the ads look like?",
    a: "They are Google AdSense units, and they never appear on the billing page or the sign-in screen. Ad requests are made non-personalised unless a consent platform is collecting consent, so the default is that you are not profiled.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, from the plan tab, and it takes effect at the end of the period you have paid for. Nothing is deleted when a subscription ends: you go back to the free plan, keep every account you have, and the limit refuses a new one until you are back under it.",
  },
  {
    q: "What is the difference between paying and self-hosting?",
    a: "Where it runs and who keeps the data. The software is the same AGPL-licensed program either way, and self-hosting has no plan, no limit and no ads because there is nobody to bill you.",
  },
  {
    q: "Do you take a copy of my transactions?",
    a: "Only what the hosted deployment stores in order to be a hosted deployment. Self-host it and the answer is nobody does, including us.",
  },
  {
    q: "Can I move from hosted to self-hosted later?",
    a: "Yes. Export to CSV and import it into your own deployment. The CSV round trip is designed to survive it, including multiple currencies.",
  },
];
