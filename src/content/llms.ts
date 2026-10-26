import appFacts from "@/content/app-facts.json";

/**
 * The words in `/llms.txt` that aren't titles or descriptions of pages.
 *
 * Here rather than in the route for the reason every other string is in
 * `src/content/`: a test can read it. The prices are the application's, from
 * the same snapshot the pricing page is held to, and the bank sentence is the
 * one `content.md` 1.4 allows: the mechanism today, in the present tense,
 * with no promise about tomorrow.
 */
const { prices } = appFacts.facts.declared;
const freeLimit = appFacts.facts.derived.plans.free.accountLimit;
// Named once, because the note about Markdown copies names the two headings
// that have them, and a renamed heading would leave the note naming the old.
const DOCS_TITLE = "Docs";
const LEARN_TITLE = "Money basics";

export const llms = {
  summary:
    "Simple Balance is a budget app and spending tracker for your own money: every account on " +
    "one page, budgets that carry over, repeating payments, and totals you can follow back to " +
    "the payments behind them. Use it in a browser at https://app.smpl.money, or run your own " +
    "copy from its public source code. The free plan has every feature, for " +
    `${freeLimit} accounts in use at once, with ads. Premium is $${Number(prices.monthly)} a ` +
    `month or $${Number(prices.yearly)} a year for unlimited accounts and no ads. There's no ` +
    "automatic bank connection today: you download a statement file from your bank and import it.",
  notes: [
    // All three access levels, because the scopes are the client's to ask
    // for and one that asks for everything gets `ledger:write`. Saying only
    // "read and stage" told an agent reading this first something safer than
    // the truth (`/docs/agents-and-mcp/`).
    "An MCP server at https://app.smpl.money/mcp lets an AI assistant read your records, " +
      "stage entries for you to approve, or, if you allow it, make changes itself. It signs " +
      "in with OAuth, and you can see and revoke each connection in Settings.",
    `Every page under ${DOCS_TITLE} and ${LEARN_TITLE} has a plain-Markdown copy at the address linked here; the HTML page is the same URL without index.md.`,
    "Contact: info@smpl.money",
  ],
  docsTitle: DOCS_TITLE,
  learnTitle: LEARN_TITLE,
  plansTitle: "Plans",
  pricing: "Free, Premium, or run it yourself, and what changes between them.",
  optionalTitle: "Optional",
} as const;
