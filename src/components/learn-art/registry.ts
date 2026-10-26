import type { ArticleArt } from "./types";
import { art as trackYourSpending } from "./track-your-spending";
import { art as budgetCategories } from "./budget-categories";
import { art as makeABudget } from "./make-a-budget";
import { art as zeroBasedBudgeting } from "./zero-based-budgeting";
import { art as envelopeBudgeting } from "./envelope-budgeting";
import { art as sinkingFunds } from "./sinking-funds";
import { art as budgetWithIrregularIncome } from "./budget-with-irregular-income";
import { art as balanceYourCheckingAccount } from "./balance-your-checking-account";
import { art as budgetWithACreditCard } from "./budget-with-a-credit-card";
import { art as findYourSubscriptions } from "./find-your-subscriptions";
import { art as netWorth } from "./net-worth";
import { art as emergencyFund } from "./emergency-fund";

/**
 * Every learn article's art, by slug.
 *
 * Written out rather than discovered, because a static export resolves its
 * imports at build time and a file named wrong would otherwise be a page with
 * no picture. `tests/learn.test.ts` holds this list and the articles under
 * `content/learn/` to one set, in both directions.
 */
export const learnArt: Readonly<Record<string, ArticleArt>> = {
  "track-your-spending": trackYourSpending,
  "budget-categories": budgetCategories,
  "make-a-budget": makeABudget,
  "zero-based-budgeting": zeroBasedBudgeting,
  "envelope-budgeting": envelopeBudgeting,
  "sinking-funds": sinkingFunds,
  "budget-with-irregular-income": budgetWithIrregularIncome,
  "balance-your-checking-account": balanceYourCheckingAccount,
  "budget-with-a-credit-card": budgetWithACreditCard,
  "find-your-subscriptions": findYourSubscriptions,
  "net-worth": netWorth,
  "emergency-fund": emergencyFund,
};
