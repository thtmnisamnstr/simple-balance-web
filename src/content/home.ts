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
 * So the argument is the one thing that stays true either way: everything you
 * hold on one page, and any figure you doubt opens into the entries that made
 * it. An assistant reading the same record is a strong second — prominent,
 * and deliberately not the headline, because a reader deciding whether this
 * is for them is asking what it does with their money, not what it does with
 * their chatbot.
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
  "The money in these pictures is made up. They are photographs of the real product, filled with example spending so there's something to look at.";

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
  tagline: "All your accounts on one page, and you can see what's behind every number.",
  /**
   * The tab and search-result form of the tagline, kept separate because the
   * two have different jobs. `tagline` is a sentence and ends like one;
   * this one has to survive a result listing, which truncates near sixty
   * characters — the full sentence appended to the product name runs past it
   * and loses the half that says what it is.
   */
  titleTagline: "All your accounts, numbers you can check",
} as const;

export const heroShot = {
  name: "dashboard",
  alt: "The Simple Balance overview: what came in, what went out and what's left for the month, then each account with its balance and a breakdown of where the spending went, with dollars and euros reported separately.",
} as const;

export const hero = {
  /**
   * The headline pairs what every reader in this category wants with the one
   * thing most of them cannot get.
   *
   * "All your accounts in one place" on its own is table stakes — eight
   * competitors open on it — and "know where your money went" is the line
   * PocketSmith, Tiller, Quicken and Empower all already run. What makes the
   * pair distinctive is the second half: the common complaint about budgeting
   * apps is that the totals do not agree and there is no way to find out why.
   *
   * **Two headlines were tried and rejected before this one.** "We never ask
   * for your bank password" was true and was a promise about a future this
   * page does not decide. "Ask your records a question" put the assistant in
   * the headline, which overstates it: an assistant is a reason to stay, not
   * the reason a stranger reads on. It has its own section, third on the
   * page, and a clause here.
   */
  title: "See everything you have. Check every number.",
  lede:
    "Checking, savings, credit cards, cash. They all sit on one page. Wonder where a number came " +
    "from? Open it up and see every payment behind it. And if you use an AI assistant, it can " +
    "read all of this too, so sometimes you can just ask.",
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
    "The version we run for you isn't open yet. In the meantime you can run it yourself for " +
    "free. That one is really for people who already run their own software, and you don't " +
    "give anything up by doing it.",
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
  eyebrow: "What it's for",
  title: "Four money problems, and what this does about them.",
} as const;

export const problems: readonly Problem[] = [
  {
    covers: ["all-accounts-one-page", "multi-currency"],
    problem: "Your money is in five places and you never see it all at once.",
    answer: [
      "Checking, savings, credit cards, cash, a car loan. All on one page, for any day you pick.",
      "If you hold more than one currency, they stay separate. We don't convert them, because " +
        "today's exchange rate is wrong by tomorrow.",
    ],
  },
  {
    shot: {
      name: "reports",
      alt: "A report of what's owned and what's owed, with a separate table for each currency. Euro accounts are totaled in euros, dollar accounts in dollars, and no combined number appears anywhere.",
      caption: "What you own and what you owe, each currency counted on its own.",
    },
    covers: ["numbers-that-tie-out", "register"],
    problem: "The totals are wrong and there's no way to find out why.",
    answer: [
      "Click into the account behind any number. You get every payment in date order, with the " +
        "running balance next to it. That's how you find the one that's wrong.",
      "Underneath, every dollar that goes out has to come from somewhere, and the two have to " +
        "match before anything is saved. That's why the totals add up.",
    ],
  },
  {
    shot: {
      name: "payees",
      alt: "An alphabetical list of everyone paid, each with the number of payments recorded against them. Three for most, fifteen for the local market. A search box sits above the list.",
      caption:
        "Everyone you've ever paid, and how many times. A subscription you forgot about is somewhere in this list.",
    },
    covers: ["recurring", "payees"],
    problem: "You forgot about that yearly renewal, and it already came out.",
    answer: [
      "Rent, payday, a subscription. Set it up once and it shows up on the day, waiting for you " +
        "to okay it.",
      "There's also a list of everyone you've ever paid. That's usually where you spot the " +
        "one you forgot. Simple Balance can show you the charge, but you still cancel it yourself.",
    ],
  },
  {
    shot: {
      name: "import",
      alt: "A file from a bank part-way through being brought in: the columns it worked out on its own, the rows it's ready to add, and three marked as things that look like payments already recorded.",
      caption: "It figures out the columns itself, then shows you what it's about to do.",
    },
    covers: ["import-statements", "duplicates"],
    problem: "Typing in a year of history would take all night.",
    answer: [
      "Download the file your bank gives you and drag it in. It figures out which column is the " +
        "date, which is the amount, and who you paid.",
      "If something looks like a payment you already have, it shows you both side by side. " +
        "Nothing gets added until you say so.",
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
    title: "What you don't spend stays there",
    body:
      "Set a limit for groceries, gas, whatever you like. Anything you don't spend can roll " +
      "into next month, and a refund goes back where it came from instead of looking like income.",
  },
  {
    icon: "wallet",
    covers: ["categories"],
    title: "Where the money actually went",
    body:
      "Sort your spending the way you already think about it. Food, the car, the kids. Then see " +
      "what each one really cost next to what you meant to spend.",
  },
  {
    icon: "list",
    covers: ["templates"],
    title: "The things you type over and over",
    body:
      "Save the ones you enter every week, like the grocery run or the cash you pull out, and " +
      "pick them off a list next time.",
  },
  {
    icon: "split",
    covers: ["splits"],
    title: "One trip, counted as two things",
    body:
      "A grocery run that was half food and half stuff for the house counts as both, in the right " +
      "amounts, from one line. Change your mind later and the amount moves instead of doubling.",
  },
  {
    icon: "layers",
    covers: ["bulk-edits"],
    title: "Fix a whole year of it at once",
    body:
      "Say a file came in with twelve months of groceries filed under the wrong thing. Fix all of " +
      "it in one go, up to ten thousand lines, after seeing exactly what will change. It all " +
      "changes or none of it does.",
  },
  {
    icon: "copy",
    covers: ["history"],
    title: "A fix never erases what it fixed",
    body:
      "Corrections go on top of what was there, so you can always see what a number used to say " +
      "and when it changed.",
  },
] as const;

export const showcase = {
  eyebrow: "A look at it",
  title: "The two pages you will use most.",
  shots: [
    {
      name: "transactions",
      alt: "A list of payments by date, each with who was paid, which account it came from, what kind of spending it was and how much, with dollar and euro amounts side by side.",
      caption:
        "Everything you've entered, in one list you can filter. Money you moved between two of your own accounts shows up once, not twice.",
    },
    {
      name: "budgets",
      alt: "The budgets page, showing what was set aside for each kind of spending against what was really spent, with what went unspent last month carried into this one.",
      caption: "What you planned next to what actually happened, refunds included.",
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
  title: "Where your money lives, and who can see it.",
  body:
    "Run it on your own computer and nobody else has a copy. If we run it for you, our privacy " +
    "policy spells out exactly what we keep.",
  points: [
    "Pull everything out as a spreadsheet any time you want. We never hold it back to keep you paying.",
    "No analytics in the product itself. On the free plan the ads bring Google's script with them. Premium and your own copy have neither.",
    "Run it on your own computer and nobody has a copy, including us.",
    "Anyone can read the code, and that isn't going to change.",
  ],
} as const;

/**
 * The agent section, and the page's lead argument.
 *
 * It used to be last, on the reasoning that it is the thing nothing else
 * does — true, and an odd place to put it. It then spent a version *in the
 * headline*, which is the opposite mistake: an assistant is a reason to stay
 * rather than the reason a stranger reads on, and a page that opens on it is
 * answering a question nobody arrived with.
 *
 * Third, after the four problems, is where it earns its place — the reader
 * has been told what this does with their money before being told what it
 * does with their assistant.
 *
 * The vocabulary it arrives in is still not the reader's. "Ships an MCP
 * server", "a token carries scopes" and a shell transcript reading
 * `$ ledger:stage` were three separate ways of saying this page is not for
 * you. What survives is the capability and its limit.
 */
export const agents = {
  /** As `Problem["covers"]`. */
  covers: ["agents", "find-anything"],
  eyebrow: "If you use an AI assistant",
  title: "Hook up an AI assistant and just ask.",
  body:
    "Your assistant sees the same things you see. Ask it when you last paid someone, or have it " +
    "pull in a statement and file it. It can suggest, but nothing happens until you say yes, and " +
    "it can't move money.",
  sample: [
    { kind: "prompt", text: "What day did I pay the electric bill last month?" },
    { kind: "out", text: "  August 12, to Meridian Power, out of checking." },
    { kind: "out", text: "  The one before that was July 14." },
    { kind: "comment", text: "Every answer points at the line it came from." },
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
  blurb: "Simple Balance keeps track of your money, and every number shows you what's behind it.",
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
