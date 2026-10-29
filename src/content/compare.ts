/**
 * The comparison pages: Simple Balance beside the apps people ask for an
 * alternative to.
 *
 * `docs/roadmap.md` 3 decided against these once, because a page about
 * somebody else's product is work to keep honest and ages badly. Both halves
 * are true. The owner reopened it on 29 October 2026, because "an alternative
 * to YNAB" is a question answer engines answer from comparison pages and this
 * site had none, so the cost is paid in the structure rather than hoped away:
 *
 * - **Every fact about another app names its source**, the vendor's own page
 *   wherever there is one, and `tests/compare.test.ts` fails on a claim
 *   without one. A plain "No" may stand alone, because an absence has no page
 *   to cite.
 * - **Every page says the day it was checked**, on the page and in the
 *   sitemap, and `scripts/check-comparisons.mjs` opens an issue from the
 *   weekly workflow once one is more than 90 days old. A price is the fact
 *   most likely to move, and nothing here can see it move.
 * - **Simple Balance's column is the contract's.** Its prices and the free
 *   limit are read from `app-facts.json` by `ours()`, and its words are held
 *   to the bank rule the homepage is (`content.md` 1.4), because a reader
 *   comparing two apps is the reader most likely to assume a bank connection.
 *
 * **No import, on purpose.** `scripts/build-images.mjs` and the weekly check
 * load this file with Node's own TypeScript support, which resolves no `@/`
 * alias and reads no JSON import, so the contract reaches `ours()` as an
 * argument from the pages that have it.
 */

export type RowKey =
  | "cost"
  | "free"
  | "in"
  | "files"
  | "budget"
  | "sharing"
  | "source"
  | "self"
  | "assistant"
  | "devices";

/**
 * The rows, in the order a reader decides in: what it costs, how the money
 * gets in, how it budgets, and only then who can see it and where it runs.
 */
export const rows: readonly { readonly key: RowKey; readonly label: string }[] = [
  { key: "cost", label: "What it costs" },
  { key: "free", label: "A free plan" },
  { key: "in", label: "How your transactions get in" },
  { key: "files", label: "Files it imports" },
  { key: "budget", label: "How budgets work" },
  { key: "sharing", label: "Sharing with a partner" },
  { key: "source", label: "Open source" },
  { key: "self", label: "Run your own copy" },
  { key: "assistant", label: "AI assistants" },
  { key: "devices", label: "Where you use it" },
];

/** The rows the index's one table shows across every app. */
export const summaryRows: readonly RowKey[] = ["cost", "free", "in", "source", "self"];

/**
 * A fact about another app. `source` is the 1-based number of the page it
 * came from, in that app's `sources`, which is the number the page prints,
 * or several where one sentence rests on two pages.
 */
export type Claim = { readonly text: string; readonly source?: number | readonly number[] };

/** A claim's source numbers, as a list whichever way it was written. */
export const citations = (claim: Claim): readonly number[] =>
  claim.source === undefined
    ? []
    : typeof claim.source === "number"
      ? [claim.source]
      : claim.source;

export type Source = { readonly label: string; readonly url: string };

export type Rival = {
  readonly slug: string;
  /** As the vendor writes it. */
  readonly name: string;
  readonly url: string;
  /**
   * The whole title, without the layout's " — Simple Balance": it's
   * "Simple Balance vs YNAB", the search itself, so the name is already in
   * it once (`tests/sitemap.test.ts` refuses it twice).
   */
  readonly title: string;
  readonly heading: string;
  readonly description: string;
  /** The day every claim and source below was read, as a calendar day. */
  readonly checked: string;
  /**
   * The paragraph under the heading: the answer, in sentences an engine can
   * lift whole. Each names both apps rather than "it", and carries the
   * figures with their subjects. A function of the contract, so Simple
   * Balance's figures in it are the application's.
   */
  readonly answer: (contract: Contract) => string;
  readonly them: Readonly<Record<RowKey, Claim>>;
  readonly chooseThem: readonly Claim[];
  readonly chooseUs: readonly Claim[];
  /** Paragraphs, each citing the page it states another app's facts from. */
  readonly moving: readonly Claim[];
  readonly sources: readonly Source[];
};

export type Contract = {
  readonly prices: { readonly monthly: string; readonly yearly: string };
  readonly freeLimit: number;
};

const dollars = (price: string) => `$${Number(price)}`;

/** The free limit as the rest of the site writes a small number: as a word. */
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
export const spell = (count: number) => WORDS[count] ?? String(count);

/**
 * Simple Balance's column. A function of the contract rather than a table of
 * strings, so a price or the free limit moves here when the application's
 * does and never by hand.
 */
export function ours({ prices, freeLimit }: Contract): Readonly<Record<RowKey, string>> {
  return {
    cost: `Free, or ${dollars(prices.monthly)} a month or ${dollars(prices.yearly)} a year for Premium`,
    free: `Yes, with every feature, for ${spell(freeLimit)} accounts in use at once and with ads`,
    in: "You download a CSV file from your bank and import it, or type entries in. There's no bank connection.",
    files: "CSV",
    budget: "A budget for each category or group, which can carry what's left into the next month",
    sharing: "No. Each person who signs up has their own books.",
    source: "Yes, under the AGPL-3.0 license",
    self: "Yes, free, with no plan, no account limit and no ads",
    assistant:
      "An MCP server an assistant can sign in to, to read, to propose entries for you to approve, or to make changes as you allow",
    devices: "A web browser, on a computer or a phone. There's no app-store app.",
  };
}

/** Words every comparison page shares. */
export const compareCopy = {
  eyebrow: "Compare",
  checked: "Checked",
  checkedNote:
    "Prices and features change. Every fact about the other app links to the page it came from, and this page is checked again every three months.",
  tableTitle: "Side by side.",
  tableCaption: (name: string) => `Simple Balance and ${name}, feature by feature`,
  feature: "Feature",
  sourceLabel: (number: number, label: string) => `Source ${number}: ${label}`,
  chooseThemTitle: (name: string) => `When ${name} is the better choice.`,
  chooseUsTitle: "When Simple Balance is the better choice.",
  movingTitle: (name: string) => `Moving from ${name}.`,
  /*
   * What's true of any file brought in from another app, said once for
   * every page. Both read from the importer at the snapshot's release
   * (`src/shared/csv.ts`): every row goes into the one account chosen on the
   * import screen, and an amount with a currency sign in it is refused with
   * "Amount must be a number", leaving the row on Staged.
   */
  movingOurs: [
    "Simple Balance puts every row of a file into the one account you choose, so a file that holds more than one account needs splitting into one file per account first. Its amounts have to be plain numbers, without a currency sign, and a row that can't be read waits on Staged for you to fix rather than counting.",
    "Your bank's own CSV files work as well, and they're what the import is built for. Budgets don't come across either way: set them up again on Budgets, and the bills that repeat on Recurring.",
  ],
  movingLink: "Importing a statement, step by step",
  sourcesTitle: "Sources.",
  trademarks:
    "Product names are their owners' trademarks. Simple Balance isn't affiliated with or endorsed by any of them.",
  ctaTitle: "Try it with your own money",
  ctaBody: (freeLimit: number) =>
    `The free plan has every feature, for ${spell(freeLimit)} accounts you can use at once. There's nothing to install and no card to start.`,
  ctaSecondaryLabel: "See pricing",
  ctaSecondaryHref: "/pricing/",
  otherTitle: "Other comparisons",
} as const;

/**
 * How long a comparison's facts are trusted before they're read again. A
 * quarter, because the fact most likely to move is a price, and prices move
 * at the turn of a year or a quarter more often than in between.
 */
export const RECHECK_DAYS = 90;

/**
 * The comparisons due to be read again, oldest first. A pure function of the
 * day, so `scripts/check-comparisons.mjs` can run it weekly and the tests can
 * run it on a day of their choosing, rather than either waiting for one.
 */
export function dueForCheck(
  list: readonly Pick<Rival, "slug" | "name" | "checked">[],
  today: string,
  days: number = RECHECK_DAYS,
): readonly Pick<Rival, "slug" | "name" | "checked">[] {
  const limit = Date.parse(`${today}T00:00:00Z`) - days * 86_400_000;
  return list
    .filter((rival) => Date.parse(`${rival.checked}T00:00:00Z`) < limit)
    .toSorted((a, b) => a.checked.localeCompare(b.checked));
}

/**
 * Simple Balance's figures as an answer states them, from the contract: the
 * free plan's limit and Premium's two prices, in one clause every answer
 * shares so the four can't describe the plans four ways.
 */
const ourPlans = ({ prices, freeLimit }: Contract) =>
  `free for ${spell(freeLimit)} accounts in use at once, with ads, or ${dollars(prices.monthly)} a month or ${dollars(prices.yearly)} a year for Premium`;

/*
 * The apps, in the order people search for an alternative to them, with
 * Actual Budget last because it's the one closest to Simple Balance: free,
 * open source, and yours to run. Every fact below was read on the vendor's
 * own pages on the day `checked` gives, and the research behind it is in
 * the pull request that added these pages.
 */
export const rivals: readonly Rival[] = [
  {
    slug: "ynab",
    name: "YNAB",
    url: "https://www.ynab.com/",
    title: "Simple Balance vs YNAB: prices, bank connections and budgets",
    heading: "Simple Balance and YNAB",
    description:
      "YNAB costs $14.99 a month or $109 a year and can connect to your bank. Simple Balance has a free plan, imports your bank's CSV file, and is open source.",
    checked: "2026-10-29",
    answer: (contract) =>
      "YNAB and Simple Balance are both budget apps, and they differ most in price and in how transactions get in. " +
      "YNAB costs $14.99 a month or $109 a year after a 34-day free trial, and it can connect to your bank. " +
      `Simple Balance is ${ourPlans(contract)}, and you import a CSV file you download from your bank instead. ` +
      "Simple Balance is also open source, so you can run your own copy for free.",
    them: {
      cost: { text: "$14.99 a month, or $109 a year", source: 1 },
      free: { text: "No. A 34-day free trial, with no card needed", source: 1 },
      in: {
        text: "Direct Import can connect to your bank through MX or Plaid. It's optional, and you can import files instead.",
        source: 2,
      },
      files: { text: "CSV, OFX, QFX and QIF", source: 3 },
      budget: {
        text: "The YNAB Method: each time money comes in, you decide what it's for",
        source: 4,
      },
      sharing: { text: "Up to six people on one subscription", source: 1 },
      source: { text: "No" },
      self: { text: "No" },
      assistant: {
        text: "No official one. A public API, which MCP servers built by other people use",
        source: 6,
      },
      devices: { text: "The web, iPhone and iPad, Android and Apple Watch", source: 5 },
    },
    chooseThem: [
      {
        text: "You want transactions to arrive without downloading anything. YNAB's Direct Import brings transactions in from your bank, and Simple Balance has no bank connection.",
        source: 2,
      },
      {
        text: "You want the YNAB Method, deciding what each dollar is for as it comes in.",
        source: 4,
      },
      {
        text: "You share your money with a partner or a family. One YNAB subscription covers up to six people, and Simple Balance gives each person separate books.",
        source: 1,
      },
      { text: "You want an app from an app store, on a phone or an Apple Watch.", source: 5 },
      {
        text: "Your bank offers OFX, QFX or QIF files and not CSV. YNAB reads all three, and Simple Balance reads CSV only.",
        source: 3,
      },
    ],
    chooseUs: [
      {
        text: "You'd rather pay less, or nothing. Simple Balance's free plan has every feature, and it isn't a trial.",
      },
      {
        text: "You'd rather check each transaction before it counts. Everything you import waits on Staged until you commit it.",
      },
      {
        text: "You want to read the code or run your own copy. Simple Balance is open source under the AGPL-3.0 license, and free to run yourself with no limit and no ads.",
      },
      {
        text: "You keep money in more than one currency. Each account keeps its own, and nothing is converted at an exchange rate.",
      },
      {
        text: "You want an AI assistant to work in your books through an MCP server the app runs itself.",
      },
    ],
    moving: [
      {
        text: "YNAB exports a plan's transactions as a CSV file from its web app: choose the plan's name at the top of the sidebar, then Export Plan.",
        source: 7,
      },
    ],
    sources: [
      { label: "YNAB pricing", url: "https://www.ynab.com/pricing" },
      {
        label: "How Direct Import works, YNAB Help",
        url: "https://support.ynab.com/en_us/how-direct-import-works-H1IGYLgnxl",
      },
      {
        label: "File-based import: a guide, YNAB Help",
        url: "https://support.ynab.com/en_us/file-based-import-a-guide-Bkj4Sszyo",
      },
      { label: "The YNAB Method", url: "https://www.ynab.com/ynab-method" },
      { label: "YNAB's app lineup", url: "https://www.ynab.com/our-app-lineup" },
      { label: "The YNAB API, and the projects that work with it", url: "https://api.ynab.com/" },
      {
        label: "How to export plan data, YNAB Help",
        url: "https://support.ynab.com/en_us/how-to-export-plan-data-Sy_CouWA9",
      },
    ],
  },
  {
    slug: "monarch",
    name: "Monarch",
    url: "https://www.monarch.com/",
    title: "Simple Balance vs Monarch: prices, bank connections and sharing",
    heading: "Simple Balance and Monarch",
    description:
      "Monarch costs $14.99 a month or $99.99 a year and connects to your bank. Simple Balance has a free plan, imports a CSV file instead, and is open source.",
    checked: "2026-10-29",
    answer: (contract) =>
      "Monarch and Simple Balance are both budget apps, and they differ most in price and in how transactions get in. " +
      "Monarch costs $14.99 a month or $99.99 a year after a 7-day free trial, and it connects to your bank. " +
      `Simple Balance is ${ourPlans(contract)}, and you import a CSV file you download from your bank instead. ` +
      "Both let an AI assistant connect through MCP, and only Simple Balance is open source and free to run yourself.",
    them: {
      cost: { text: "Core: $14.99 a month or $99.99 a year. Plus: $199.99 a year", source: 1 },
      free: { text: "No. A 7-day free trial, with a payment method", source: 1 },
      in: { text: "By connecting to your bank, through Plaid, Finicity or MX", source: 3 },
      files: { text: "CSV, in the web app", source: 4 },
      budget: { text: "Flex budgeting, or a budget for each category", source: 5 },
      sharing: { text: "Other members of your household, at no extra cost", source: 2 },
      source: { text: "No" },
      self: { text: "No" },
      assistant: {
        text: "An official MCP connector for assistants such as Claude and ChatGPT, read-only unless you allow changes",
        source: 6,
      },
      devices: { text: "The web, iPhone, iPad and Android, in the US and Canada", source: [1, 2] },
    },
    chooseThem: [
      {
        text: "You want transactions to arrive from your bank on their own. Monarch connects to your bank, and Simple Balance doesn't.",
        source: 3,
      },
      {
        text: "You share your money with a household. Monarch adds its members at no extra cost, and Simple Balance gives each person separate books.",
        source: 2,
      },
      { text: "You want an app from an app store, on a phone or an iPad.", source: 1 },
    ],
    chooseUs: [
      {
        text: "You'd rather pay less, or nothing. Simple Balance's free plan has every feature, and it isn't a trial.",
      },
      {
        text: "You live outside the US and Canada, where Monarch says it isn't available.",
        source: 2,
      },
      {
        text: "You want to read the code or run your own copy. Simple Balance is open source under the AGPL-3.0 license, and free to run yourself with no limit and no ads.",
      },
      {
        text: "You keep money in more than one currency. Each account keeps its own, and nothing is converted at an exchange rate.",
      },
      {
        text: "You'd rather check each transaction before it counts. Everything you import waits on Staged until you commit it.",
      },
    ],
    moving: [
      {
        text: "Monarch exports your transactions as a CSV file from its web app: for one account from that account's page, or for every account under Settings, then Data.",
        source: 7,
      },
    ],
    sources: [
      { label: "Monarch pricing", url: "https://www.monarch.com/pricing" },
      {
        label: "Monarch FAQs, Monarch Help",
        url: "https://help.monarch.com/hc/en-us/articles/19985735202068-Monarch-FAQs",
      },
      {
        label: "Understanding data providers and connections, Monarch Help",
        url: "https://help.monarch.com/hc/en-us/articles/33707613533972-Understanding-Data-Providers-and-Connections",
      },
      {
        label: "Importing transactions manually, Monarch Help",
        url: "https://help.monarch.com/hc/en-us/articles/4409682789908-Importing-Transactions-Manually",
      },
      {
        label: "Creating your budget in Monarch, Monarch Help",
        url: "https://help.monarch.com/hc/en-us/articles/360048883631-Creating-Your-Budget-in-Monarch",
      },
      {
        label: "Monarch MCP Connector, Monarch Help",
        url: "https://help.monarch.com/hc/en-us/articles/50207234679956-Monarch-MCP-Connector",
      },
      {
        label: "Downloading transaction or account history, Monarch Help",
        url: "https://help.monarch.com/hc/en-us/articles/15526600975764-Downloading-Transaction-or-Account-History",
      },
    ],
  },
  {
    slug: "quicken-simplifi",
    name: "Quicken Simplifi",
    url: "https://www.quicken.com/products/simplifi/",
    title: "Simple Balance vs Quicken Simplifi: prices and bank connections",
    heading: "Simple Balance and Quicken Simplifi",
    description:
      "Quicken Simplifi is $6.99 a month, billed yearly, and connects to your bank. Simple Balance has a free plan, imports a CSV file, and is open source.",
    checked: "2026-10-29",
    answer: (contract) =>
      "Quicken Simplifi and Simple Balance are both budget apps, and they differ most in price and in how transactions get in. " +
      "Quicken Simplifi costs $6.99 a month, billed once a year, with no free trial, and it connects to your bank. " +
      `Simple Balance is ${ourPlans(contract)}, and you import a CSV file you download from your bank instead. ` +
      "Simple Balance is also open source, so you can run your own copy for free.",
    them: {
      cost: { text: "$6.99 a month, billed once a year. There's no monthly plan.", source: [1, 2] },
      free: { text: "No, and no free trial. A 30-day money-back guarantee", source: 2 },
      in: {
        text: "By connecting to your bank, which brings transactions in automatically",
        source: 3,
      },
      files: { text: "CSV, in the web app", source: 4 },
      budget: {
        text: "A spending plan: your monthly income, minus bills and subscriptions",
        source: 1,
      },
      sharing: { text: "One other person in each space", source: 2 },
      source: { text: "No" },
      self: { text: "No" },
      assistant: { text: "Quicken AI Chat, an assistant inside the app", source: 5 },
      devices: { text: "The web, and phone apps for iPhone and Android", source: 2 },
    },
    chooseThem: [
      {
        text: "You want transactions to arrive from your bank on their own. Simplifi connects to your bank, and Simple Balance doesn't.",
        source: 3,
      },
      {
        text: "You share your money with one other person. Simplifi shares each space with one, and Simple Balance gives each person separate books.",
        source: 2,
      },
      { text: "You want phone apps from the App Store or Google Play.", source: 2 },
    ],
    chooseUs: [
      {
        text: "You'd rather pay less, or nothing. Simple Balance's free plan has every feature, and Simplifi has no free plan or trial.",
        source: 2,
      },
      {
        text: "You want to read the code or run your own copy. Simple Balance is open source under the AGPL-3.0 license, and free to run yourself with no limit and no ads.",
      },
      {
        text: "You want to connect an AI assistant of your own through MCP. Simplifi's assistant is one built into its app.",
        source: 5,
      },
      {
        text: "You keep money in more than one currency. Each account keeps its own, and nothing is converted at an exchange rate.",
      },
      {
        text: "You'd rather check each transaction before it counts. Everything you import waits on Staged until you commit it.",
      },
    ],
    moving: [
      {
        text: "Simplifi exports transactions as a CSV file from its web app, for one account or for several at once, from the menu on Transactions.",
        source: 6,
      },
    ],
    sources: [
      { label: "Quicken Simplifi", url: "https://www.quicken.com/products/simplifi/" },
      {
        label: "Quicken Simplifi subscription questions, Simplifi Help",
        url: "https://support.simplifi.quicken.com/en/articles/3363727-quicken-simplifi-subscription-questions",
      },
      {
        label: "How does Quicken Simplifi connect to my bank?, Simplifi Help",
        url: "https://support.simplifi.quicken.com/en/articles/5687989-how-does-quicken-simplifi-connect-to-my-bank",
      },
      {
        label: "How to manually import transactions, Simplifi Help",
        url: "https://support.simplifi.quicken.com/en/articles/4413430-how-to-manually-import-transactions",
      },
      {
        label: "Using Quicken AI Chat, Simplifi Help",
        url: "https://support.simplifi.quicken.com/en/articles/13343650-using-quicken-ai-chat",
      },
      {
        label: "How to export transactions, Simplifi Help",
        url: "https://support.simplifi.quicken.com/en/articles/3404263-how-to-export-transactions-from-quicken-simplifi",
      },
    ],
  },
  {
    slug: "actual-budget",
    name: "Actual Budget",
    url: "https://actualbudget.org/",
    title: "Simple Balance vs Actual Budget: two open source budget apps",
    heading: "Simple Balance and Actual Budget",
    description:
      "Both are free, open source and yours to run. Actual Budget is envelope budgeting on a server or desktop you set up; Simple Balance also has a hosted app.",
    checked: "2026-10-29",
    answer: (contract) =>
      "Actual Budget and Simple Balance are both open source budget apps you can run yourself for free, and they differ in how you use them and how they budget. " +
      "Actual Budget uses envelope budgeting, runs on a server you set up or as a desktop app, and can sync with your bank through a service such as SimpleFIN. " +
      `Simple Balance also runs as a hosted app at app.smpl.money, ${ourPlans(contract)}, and it doesn't connect to a bank: you import a CSV file from your bank instead.`,
    them: {
      cost: {
        text: "Free. Services from other companies cost extra, such as SimpleFIN bank sync at $15 a year",
        source: [1, 10],
      },
      free: { text: "Yes. Everything is free", source: 1 },
      in: {
        text: "Optional bank sync on a server you run, with your own keys, through SimpleFIN in North America and other services elsewhere. Or you import a file.",
        source: 2,
      },
      files: { text: "CSV, QIF, OFX, QFX and CAMT", source: 3 },
      budget: {
        text: "Envelope budgeting, where you budget only money you already have",
        source: 4,
      },
      sharing: {
        text: "Several people on one server, once you set up an OpenID sign-in provider",
        source: 8,
      },
      source: { text: "Yes, under the MIT license", source: 5 },
      self: {
        text: "Yes, free, on your own server with Docker or with a hosting service",
        source: 6,
      },
      assistant: {
        text: "No official one. Its docs list MCP servers other people built",
        source: 9,
      },
      devices: {
        text: "The web from your own server, desktop apps for Windows, Mac and Linux, and an iPhone app in beta. No Android app",
        source: [6, 7],
      },
    },
    chooseThem: [
      {
        text: "You want bank sync and don't mind setting it up. Actual's optional sync runs on your own server through a service such as SimpleFIN, and Simple Balance has no bank connection.",
        source: 2,
      },
      { text: "You want envelope budgeting, giving out only money you already have.", source: 4 },
      { text: "Your bank offers OFX, QFX, QIF or CAMT files and not CSV.", source: 3 },
      { text: "You want a desktop app, on Windows, Mac or Linux.", source: 6 },
      {
        text: "You want the MIT license, which asks less of anybody who changes the code and shares it than the AGPL-3.0 license does.",
        source: 5,
      },
    ],
    chooseUs: [
      {
        text: "You don't want to run a server. Simple Balance's cloud app at app.smpl.money has a free plan and nothing to install.",
      },
      {
        text: "You keep money in more than one currency. Each account keeps its own, and nothing is converted at an exchange rate.",
      },
      {
        text: "You want an AI assistant to work in your books through an MCP server that comes with the app. Actual's docs point to ones other people built.",
        source: 9,
      },
      {
        text: "You want to open any total and see the transactions behind it, with a history where a correction never erases what it corrected.",
      },
    ],
    moving: [
      {
        text: "Actual exports an account's transactions from the menu on that account's page, as a CSV file, so each account arrives in a file of its own.",
        source: [11, 12],
      },
    ],
    sources: [
      { label: "Actual Budget on GitHub", url: "https://github.com/actualbudget/actual" },
      { label: "Bank sync, Actual docs", url: "https://actualbudget.org/docs/advanced/bank-sync" },
      {
        label: "Importing transactions, Actual docs",
        url: "https://actualbudget.org/docs/transactions/importing",
      },
      { label: "Actual Budget", url: "https://actualbudget.org/" },
      { label: "Vision, Actual docs", url: "https://actualbudget.org/docs/vision" },
      { label: "Installing Actual, Actual docs", url: "https://actualbudget.org/docs/install" },
      {
        label: "Frequently asked questions, Actual docs",
        url: "https://actualbudget.org/docs/faq",
      },
      {
        label: "Multi-user support, Actual docs",
        url: "https://actualbudget.org/docs/config/multi-user",
      },
      {
        label: "Community projects, Actual docs",
        url: "https://actualbudget.org/docs/community-repos",
      },
      {
        label: "SimpleFIN bank sync, Actual docs",
        url: "https://actualbudget.org/docs/advanced/bank-sync/simplefin",
      },
      { label: "Accounts, Actual docs", url: "https://actualbudget.org/docs/tour/accounts" },
      {
        label: "Actual's CSV export, in its source code",
        url: "https://github.com/actualbudget/actual/blob/master/packages/loot-core/src/server/transactions/export/export-to-csv.ts",
      },
    ],
  },
];

/** The comparisons' own index, `/compare/`. */
export const compareIndex = {
  crumb: "Compare",
  title: "Simple Balance vs YNAB, Monarch, Simplifi and Actual Budget",
  heading: "How Simple Balance compares with other budget apps.",
  description:
    "Simple Balance beside YNAB, Monarch, Quicken Simplifi and Actual Budget: what each costs, how your transactions get in, and which you can run yourself.",
  answer:
    "Simple Balance is a free budget app and spending tracker. The biggest difference from YNAB, Monarch and Quicken Simplifi is how transactions get in: all three can connect to your bank, and Simple Balance imports a CSV file you download from your bank instead. Simple Balance also has a free plan, which none of those three has, and like Actual Budget it's open source and free to run yourself.",
  checkedNote:
    "Prices and features change. Each app's facts link to the pages they came from, and every comparison is checked again every three months.",
  tableTitle: "Five apps, side by side.",
  tableCaption: "Simple Balance, YNAB, Monarch, Quicken Simplifi and Actual Budget, compared",
  pagesTitle: "One app at a time.",
  sourcesNote:
    "Each number in the table links to the page that fact came from, listed under Sources on that app's own comparison.",
  allLink: "Every app, side by side",
} as const;

const days = rivals.map((rival) => rival.checked).toSorted();
/** The oldest check, which is how current the index's one table is. */
export const compareChecked = days[0]!;
/** The newest, which is when the index last changed, for the sitemap. */
export const compareUpdated = days.at(-1)!;
