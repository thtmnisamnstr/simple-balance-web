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
 * `docs/standards/content.md` 1.4 holds the vocabulary rule and the argument;
 * the short version is that the previous copy assumed both a budgeting app the
 * reader had already given up on and a server they already owned, and a reader
 * who has neither could not tell what this was.
 *
 * **The page must not imply a bank connection, and must not promise there
 * will never be one.** There is no automatic sync today, so copy describing
 * one would be false — `docs/standards/content.md` 1.5 holds that. But the
 * page also used to *lead* on "we never ask for your bank password", which is
 * a promise about the future rather than a description of the present:
 * pulling transactions on a schedule is a thing this product may do. A
 * positioning built on a refusal has to be abandoned the day the refusal
 * ends, and everything written around it goes with it.
 *
 * So the argument is the one thing that stays true either way: this is a
 * record you can interrogate. An assistant can read it, and every answer
 * names the entry behind it.
 */

export type Problem = {
  /**
   * Which entries in the application's own feature list this section is the
   * rewrite of (`src/content/app-features.json`).
   *
   * Declared rather than inferred. The first version of the check that reads
   * this matched the application's wording against the page's, which is
   * exactly the wording the rewrite exists to change — it matched the word
   * "statement" somewhere else entirely and could not fail. An explicit
   * mapping is the only honest way to ask "is tier A covered".
   */
  readonly covers: readonly string[];
  /** The reader's situation, in their words, as a statement rather than a question. */
  readonly problem: string;
  /** What the product does about it. One paragraph per idea, never one long one. */
  readonly answer: readonly string[];
  /** A screenshot that shows the answer, where one does. Three of the four
   *  have one: a picture is worth more than the sentence where it is evidence
   *  for a claim the reader has reason to doubt, and worth nothing where the
   *  page it shows merely exists. The first section has none because "your
   *  accounts on one page" is what the hero shot above it already shows. */
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
  "The money in these pictures is made up. They are photographs of the real product, filled with example spending so there is something to look at.";

export type Feature = {
  /** As `Problem["covers"]`. */
  readonly covers: readonly string[];
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
  /**
   * The sentence a link preview and a search engine get.
   *
   * It used to read "Double-entry bookkeeping for your own money, on your own
   * server", which is two ideas a general reader cannot use: an accounting
   * term with no consumer meaning, and a machine they do not have. What this
   * says instead is the one thing no competitor can say at all.
   */
  tagline: "A record of your money you can ask questions of, and answers you can check.",
  /**
   * The tab and search-result form of the tagline, kept separate because the
   * two have different jobs. `tagline` is a sentence and ends like one;
   * this one has to survive a result listing, which truncates near sixty
   * characters — the full sentence appended to the product name runs past it
   * and loses the half that says what it is.
   */
  titleTagline: "Ask your records, check the answer",
} as const;

export const heroShot = {
  name: "dashboard",
  alt: "The Simple Balance overview: what came in, what went out and what is left for the month, then each account with its balance and a breakdown of where the spending went, with dollars and euros reported separately.",
} as const;

export const hero = {
  /**
   * The headline is the thing nothing else in the category offers, and the
   * thing that stays true however the product gets its data in.
   *
   * It led on "we never ask for your bank password" for a while. That was
   * true, and it was a promise about the future made by a page that does not
   * get to decide the future. Leading on the outcome instead — "know where
   * your money went" — is the line PocketSmith, Tiller, Quicken and Empower
   * all already run, which identifies the product as one of a crowd of eight.
   *
   * What is left is the honest difference: this is a record you can ask
   * things of, and the answers open.
   */
  title: "Ask your records a question. Check the answer yourself.",
  lede:
    "Simple Balance keeps a proper record of what you earn and what you spend, and an AI " +
    "assistant can read it — so you can ask in plain words and get an answer that names the " +
    "entry it came from.",
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
    "The version we run for you is not open yet. Until it is, you can run the whole thing " +
    "yourself for nothing — that is for people who already run things themselves, and nothing " +
    "about it is held back.",
} as const;

/**
 * The problems section's own heading.
 *
 * Here rather than in `src/app/page.tsx` because `docs/standards/content.md`
 * 3.1 says copy is checkable and markup is not: these two strings sat in the
 * JSX and so were the only text on the homepage the banned-words test could
 * not see.
 */
export const problemsSection = {
  eyebrow: "What it is for",
  title: "Four things that go wrong with money, and what this does about each one.",
} as const;

export const problems: readonly Problem[] = [
  {
    covers: ["all-accounts-one-page", "multi-currency"],
    problem: "Your money is in five places and you never see it all at once.",
    answer: [
      "Current account, savings, credit cards, cash, a loan, whatever you hold — they sit on one " +
        "page, each showing what is in it, on whatever day you ask about.",
      "Money in different currencies is never added together. Dollars are totalled with dollars " +
        "and euros with euros, because an exchange rate from this morning would turn the total " +
        "into a guess by tomorrow.",
    ],
  },
  {
    shot: {
      name: "reports",
      alt: "A report of what is owned and what is owed, with a separate table for each currency: euro accounts totalled in euro, dollar accounts in dollars, and no combined figure anywhere.",
      caption: "What you own and what you owe, each currency counted on its own.",
    },
    covers: ["numbers-that-tie-out", "register"],
    problem: "The totals are wrong and there is no way to find out why.",
    answer: [
      "Every figure can be traced back to what made it. Open the account behind a number and you " +
        "get every entry in date order with the balance before it and after it, so you can find " +
        "the exact line that went wrong instead of taking a chart's word for it.",
      "That works because of how the record is kept underneath: every amount has a place it came " +
        "from and a place it went, and both sides have to agree before anything is written down. " +
        "You never have to think about that. It is the reason the totals match.",
    ],
  },
  {
    shot: {
      name: "payees",
      alt: "An alphabetical list of everyone paid, each with the number of payments recorded against them — three for most, fifteen for the local market — with a box for searching them by name.",
      caption:
        "Everyone you have ever paid, and how many times. A subscription you forgot about is somewhere in this list.",
    },
    covers: ["recurring", "payees"],
    problem: "The yearly renewal you forgot about has already left your account.",
    answer: [
      "Rent, payday, a subscription: set it up once and it turns up on the day, waiting for you " +
        "to say yes. Nothing is added behind your back.",
      "For the ones you have not set up, there is a list of everyone you have ever paid and " +
        "everything you paid them. That is usually where a subscription you forgot about turns " +
        "up. Simple Balance can show you the charge; it cannot cancel it for you.",
    ],
  },
  {
    shot: {
      name: "import",
      alt: "A file from a bank part-way through being brought in: the columns it worked out on its own, the rows it is ready to add, and three marked as things that look like payments already recorded.",
      caption: "It works out the columns itself, then shows you what it is about to do.",
    },
    covers: ["import-statements", "duplicates"],
    problem: "Getting a year of history in should not cost you an evening.",
    answer: [
      "Your bank has a button that downloads what you spent as a file — the kind that opens in a " +
        "spreadsheet. Drag it in and Simple Balance works out which column is the date, which is " +
        "the amount and who you paid, then files the names it recognises.",
      "Anything that looks like a payment you already have is put side by side with it, so you " +
        "can drop whichever one is the spare. Nothing counts towards your money until you say so.",
    ],
  },
] as const;

/**
 * The features section's own heading. Here rather than in the JSX, for the
 * reason `problemsSection` gives.
 */
export const featuresSection = {
  eyebrow: "What else is in it",
  title: "The parts you only notice when they are missing.",
} as const;

export const features: readonly Feature[] = [
  {
    icon: "target",
    covers: ["budgets"],
    title: "What you do not spend stays there",
    body:
      "Give each kind of spending a limit for the month. What you do not use can stay there for " +
      "next month, and money you get refunded goes back where it came out of rather than " +
      "counting as income.",
  },
  {
    icon: "wallet",
    covers: ["categories"],
    title: "Where the money actually went",
    body:
      "Group your spending the way you already think about it — food, the car, the kids — and " +
      "see what each one really cost, next to what you meant it to cost.",
  },
  {
    icon: "list",
    covers: ["templates"],
    title: "The things you type over and over",
    body:
      "Save an entry you record often — the weekly shop, the cash you take out — and pick it from " +
      "a list next time instead of typing it again.",
  },
  {
    icon: "split",
    covers: ["splits"],
    title: "One shop, counted as two things",
    body:
      "A supermarket run that was partly food and partly something for the house is counted as " +
      "both, in the right amounts, from one line. Changing your mind later moves the amount " +
      "rather than adding another one.",
  },
  {
    icon: "layers",
    covers: ["bulk-edits"],
    title: "Fix a whole year of it in one go",
    body:
      "If a file came in with twelve months of shopping under the wrong heading, change all of " +
      "it at once — up to ten thousand lines — after seeing exactly what it will touch. It all " +
      "changes or none of it does.",
  },
  {
    icon: "copy",
    covers: ["history"],
    title: "A correction never hides what it corrected",
    body:
      "A fix is added on top rather than rubbing out what was there, so you can always see what " +
      "a number used to say and when it changed. That is the difference between a record and a " +
      "guess.",
  },
] as const;

export const showcase = {
  eyebrow: "A look at it",
  title: "The two pages you would spend the most time on.",
  shots: [
    {
      name: "transactions",
      alt: "A list of payments by date, each with who was paid, which account it came from, what kind of spending it was and how much, with dollar and euro amounts side by side.",
      caption:
        "Everything you have recorded, in one list you can narrow down. Money moved between two of your own accounts shows as one line, not two.",
    },
    {
      name: "budgets",
      alt: "The budgets page, showing what was set aside for each kind of spending against what was really spent, with what went unspent last month carried into this one.",
      caption: "What you planned against what really happened, including what a refund gave back.",
    },
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
 * arrives: where the record lives, who can reach it, and that you can leave
 * with all of it.
 *
 * Every sentence is scoped, because the honest answer differs between the
 * version we run and the version you run. A privacy promise that one of the
 * two disproves is worse than none.
 */
export const privacy = {
  /** As `Problem["covers"]`. */
  covers: ["own-your-data"],
  eyebrow: "Your records",
  title: "Where your money sits, and who can reach it.",
  body:
    "If we run it for you, your record is on our server and the privacy policy says exactly what " +
    "is kept and who can touch it. Run it yourself and there is no copy anywhere but yours. " +
    "Either way, what you put in is yours to take out.",
  points: [
    "Take everything with you as a spreadsheet whenever you want. Your own record is never held back to keep you paying.",
    "The product itself has no analytics and nothing that profiles you. On the free plan the ads bring Google's script with them — that is what the ads cost you, and neither Premium nor your own copy has it.",
    "Run it on a computer you own and nobody else has a copy, including us.",
    "The source is readable and stays that way, so how it handles your money is not something you have to take on trust.",
  ],
} as const;

/**
 * The agent section, and the page's lead argument.
 *
 * It used to be last, on the reasoning that it is the thing nothing else
 * does — true, and an odd place to put it. It is now the section directly
 * under the hero, because "you can ask your own records a question" is the
 * only claim here a reader cannot get from eight other products, and because
 * it survives the product gaining a bank connection, which the old headline
 * did not.
 *
 * The vocabulary it arrives in is still not the reader's. "Ships an MCP
 * server", "a token carries scopes" and a shell transcript reading
 * `$ ledger:stage` were three separate ways of saying this page is not for
 * you. What survives is the capability and its limit.
 */
export const agents = {
  /** As `Problem["covers"]`. */
  covers: ["agents", "find-anything"],
  eyebrow: "The part nothing else does",
  title: "Point an assistant at your records and just ask.",
  body:
    "Simple Balance can be connected to an AI assistant, which then has the same reach over your " +
    "records that you have on the web. Ask it when you last paid something, where a month went, " +
    "or to bring a statement in and tidy up where things were filed. What it cannot do is skip " +
    "you: anything it proposes sits and waits, counts toward nothing until you say yes, and it " +
    "is never able to move money.",
  sample: [
    { kind: "prompt", text: "What day did I pay the electric bill last month?" },
    { kind: "out", text: "  12 August, to Meridian Power, from the current account." },
    { kind: "out", text: "  The one before it was 14 July." },
    { kind: "comment", text: "Every answer names the entry it came from." },
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
    "Simple Balance keeps a record of your money you can ask questions of, and answers that name " +
    "the entry they came from.",
  links: [
    { label: "Pricing", href: "/pricing/" },
    { label: "Privacy", href: "/privacy/" },
    { label: "Terms", href: "/terms/" },
    { label: "Source code", href: site.sourceUrl },
    { label: "License", href: `${site.sourceUrl}/blob/main/LICENSE` },
    { label: "Changelog", href: `${site.sourceUrl}/blob/main/CHANGELOG.md` },
    { label: "How to run it yourself", href: `${site.sourceUrl}/blob/main/docs/deployment.md` },
  ],
} as const;
