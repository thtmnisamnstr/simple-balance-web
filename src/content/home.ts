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
 */

export type Problem = {
  /** The reader's situation, in their words, as a statement rather than a question. */
  readonly problem: string;
  /** What the product does about it. One paragraph per idea, never one long one. */
  readonly answer: readonly string[];
  /** A screenshot that shows the answer, where one does. Two of the four have
   *  one: a picture of a ledger that ties out is worth more than the sentence
   *  saying it does, and a picture of a page that merely exists is not. */
  readonly shot?: Shot;
};

export type Shot = {
  /** Base name under `public/screenshots`, without theme or extension. */
  readonly name: string;
  readonly alt: string;
  readonly caption: string;
};

/** Every shot is 1600x1000, written by `scripts/capture-screenshots.mjs`. */
export const SHOT_WIDTH = 1600;
export const SHOT_HEIGHT = 1000;

/**
 * The ledger in every screenshot is seeded demo data, and the page says so
 * once, plainly. A finance product showing invented balances without
 * disclosing it is the same defect as a testimonial from nobody.
 */
export const shotDisclosure =
  "Screenshots show a demo ledger seeded with example transactions, captured from the running application.";

export type Feature = {
  readonly title: string;
  readonly body: string;
  /** Key into the icon map in `components/icons.tsx`. A closed set, so a typo
   *  is a type error rather than a missing glyph. */
  readonly icon: "wallet" | "split" | "target" | "copy" | "layers" | "list";
};

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
  tagline: "Double-entry bookkeeping for your own money, on your own server.",
  /**
   * The tab and search-result form of the tagline, kept separate because the
   * two have different jobs. `tagline` is a sentence and ends like one;
   * this one has to survive a result listing, which truncates near sixty
   * characters — the full sentence appended to the product name runs to
   * seventy-nine and loses the half that says what it is.
   */
  titleTagline: "Self-hosted double-entry bookkeeping",
} as const;

export const heroShot = {
  name: "dashboard",
  alt: "The Simple Balance overview: balance, deposits, withdrawals and net cash flow for the month, then accounts and spending by category, reported separately for each currency the ledger holds.",
} as const;

export const hero = {
  title: "Know where your money is, and where it went.",
  lede:
    "Every account on one page, bank statements that file themselves, and reports that " +
    "trace back to the entries that made them. Self-hosted, so the only copy of your " +
    "transactions is the one you keep.",
  /**
   * The app is not deployed yet, so this states the situation rather than
   * linking somewhere that 404s (`docs/standards/web.md` 6.1).
   *
   * "Coming soon" on its own was two words that answered neither question a
   * reader has: what is coming, and why would they wait for it. This names
   * the thing — a version somebody else runs — which is the one capability
   * the page has just finished saying it does not have.
   */
  primaryLabel: "Hosted version soon",
  secondaryLabel: "Get the source",
  note:
    "Self-host it today — AGPL-3.0, one machine and a PostgreSQL. A hosted " +
    "version you do not have to run is coming.",
} as const;

export const problems: readonly Problem[] = [
  {
    problem: "Your net worth is spread across eight logins.",
    answer: [
      "Checking, savings, cards, cash, loans, investments and crypto wallets sit on one " +
        "page, each in its own currency, with balances as of any date you ask for.",
      "Currencies are never added together, because there are no exchange rates here to " +
        "add them with. A total in dollars and a total in euros are two totals, reported " +
        "side by side, and neither is a guess.",
    ],
  },
  {
    shot: {
      name: "import",
      alt: "A bank CSV part-way through import: the columns it worked out, the rows it will stage, and three flagged as possible duplicates of entries already in the ledger.",
      caption: "The importer maps the columns itself, then shows you what it will do.",
    },
    problem: "Importing a statement costs you an evening.",
    answer: [
      "Point it at a CSV your bank exported and it works out the format, maps the columns, " +
        "and files the payees and categories it recognises.",
      "Anything that looks like a row you already have is opened beside the one it " +
        "resembles, so you can fix either side. Nothing counts toward a balance until you " +
        "say so.",
    ],
  },
  {
    problem: "You find out about the annual renewal when it leaves the account.",
    answer: [
      "Rent, a salary, a subscription: set it up once and it proposes itself on the day, " +
        "as a draft you approve rather than a transaction that appeared.",
      "If you want an email about it, it sends one. If you never configure a mail server, " +
        "everything else still works — nothing here breaks because a feature you did not " +
        "set up is missing.",
    ],
  },
  {
    shot: {
      name: "reports",
      alt: "The net worth report, with a separate table per currency: euro accounts totalled in euro, dollar accounts in dollars, and no combined figure.",
      caption:
        "Net worth, per currency, with closing balances that reconcile to the postings behind them.",
    },
    problem: "The numbers in your budgeting app do not tie out.",
    answer: [
      "Underneath this is real double-entry bookkeeping. Every transaction settles to zero " +
        "in every currency it touches, checked before anything is written.",
      "That is what lets any figure on any page be traced back to the entries that made " +
        "it. When a number looks wrong you can open the register and find the row it went " +
        "wrong on, instead of taking a dashboard's word for it.",
    ],
  },
] as const;

export const features: readonly Feature[] = [
  {
    icon: "wallet",
    title: "Currencies kept apart",
    body:
      "A conversion records what left one account and what arrived in the other, and the " +
      "rate it implies. No global rate table, no overnight revaluation, no figure that " +
      "changes because a market moved.",
  },
  {
    icon: "split",
    title: "One receipt, several categories",
    body:
      "Split a transaction across as many categories as it actually covers, each " +
      "attributed on its own. Recategorising a leg is one update and writes no new " +
      "postings.",
  },
  {
    icon: "target",
    title: "Budgets that carry",
    body:
      "Per category, per group, or for a single month. What a period did not spend rolls " +
      "into the next if you want it to, and a back-dated correction changes every period " +
      "after it.",
  },
  {
    icon: "copy",
    title: "Duplicates caught on the way in",
    body:
      "A row that resembles one you already have is shown next to it, before either " +
      "counts. Import the same statement twice and you get one ledger, not two.",
  },
  {
    icon: "layers",
    title: "Ten thousand rows at a time",
    body:
      "Change or delete up to ten thousand transactions in one go, from any view, after " +
      "seeing exactly what it will touch. It applies atomically or not at all.",
  },
  {
    icon: "list",
    title: "A register for every account",
    body:
      "Every posting with the balance before and after it. Corrections append rather than " +
      "overwrite, so the history of a mistake survives the fix.",
  },
] as const;

export const showcase = {
  eyebrow: "A look at it",
  title: "The pages you would actually live in.",
  shots: [
    {
      name: "transactions",
      alt: "The transactions list: dated rows with payee, account, category and amount, dollar and euro entries side by side, each amount signed and right-aligned.",
      caption:
        "Every entry, filterable, with transfers shown as one row moving between two accounts.",
    },
    {
      name: "budgets",
      alt: "The budgets page, showing each category's assigned amount against what was actually spent, with the remainder carried from the previous period.",
      caption: "Budgets compared against what was really spent, including what a refund gave back.",
    },
  ],
} as const;

export const privacy = {
  eyebrow: "Self-hosted",
  title: "The only copy of your transactions is yours.",
  body:
    "This is software you run, not a service you join. There is no account on our side, " +
    "because there is no our side — one deployment, one PostgreSQL, and whoever you " +
    "choose to give an account to.",
  points: [
    "Your ledger sits on hardware you control, wherever you choose to put it.",
    "No analytics, no telemetry, and nothing phoning home to be counted.",
    "PostgreSQL is the only thing it needs. No queue, no cache, no object store.",
    "AGPL-3.0, so the source is readable and stays that way.",
  ],
} as const;

export const agents = {
  eyebrow: "For agents",
  title: "Let an assistant do the filing, without handing over the keys.",
  body:
    "Simple Balance ships an MCP server with the same capabilities as the web app, so an " +
    "AI agent can import a statement, tidy categories and chase duplicates. What it " +
    "cannot do is skip the part where you check its work: staged rows affect no balance " +
    "until they are committed, and a token carries scopes that stop well short of " +
    "spending money.",
  sample: [
    { kind: "comment", text: "# the agent proposes; nothing has moved yet" },
    { kind: "prompt", text: "ledger:stage" },
    { kind: "out", text: "  42 rows staged from statement-2026-08.csv" },
    { kind: "out", text: "   3 flagged as possible duplicates" },
    { kind: "comment", text: "# you commit, or you do not" },
  ],
} as const;

/**
 * The pages announced in the header. Blog and docs are deliberately absent —
 * `src/content/sections.ts` holds that decision and the flag behind it.
 */
export const primaryNav = [{ label: "Pricing", href: "/pricing/" }] as const;

export const contact = {
  eyebrow: "Get in touch",
  /**
   * One address, so there is no label. A single mailto under a heading
   * reading "General" is a category with nothing to distinguish it from.
   */
  address: "info@smpl.money",
} as const;

export const footer = {
  blurb:
    "Simple Balance is free software for keeping your own books. Run it yourself; " +
    "nobody else gets a copy.",
  links: [
    { label: "Pricing", href: "/pricing/" },
    { label: "Privacy", href: "/privacy/" },
    { label: "Terms", href: "/terms/" },
    { label: "Source", href: site.sourceUrl },
    { label: "License", href: `${site.sourceUrl}/blob/main/LICENSE` },
    { label: "Changelog", href: `${site.sourceUrl}/blob/main/CHANGELOG.md` },
    { label: "Deployment guide", href: `${site.sourceUrl}/blob/main/docs/deployment.md` },
  ],
} as const;
