/**
 * The words in the budget categories article's pictures.
 *
 * Here rather than in the drawing for the reason every other word on this
 * site is in `src/content/`: `tests/copy.test.ts` reads this module, and it
 * cannot read an SVG. The spending shares are the Bureau of Labor Statistics'
 * 2024 figures the article cites, and the food split is the article's own
 * $640 example, so a change to either is a change to both.
 */
export const budgetCategoriesArt = {
  hero: {
    home: "Home",
    food: "Food",
    fun: "Fun",
  },
  diagrams: {
    "budget-categories-spending": {
      caption:
        "Where the average U.S. household's money went in 2024, from the Bureau of Labor Statistics. Housing, getting around and food took more than 60% of it.",
      description:
        "Bars showing how the average U.S. household's $78,535 of spending in 2024 was shared out, largest first: housing 33.4%, getting around (transportation) 17.0%, food 12.9% (7.9% on groceries and 5.0% on eating out), Social Security and retirement, mostly taken out of pay (the survey calls it personal insurance and pensions), 12.5%, healthcare 7.9%, entertainment 4.6%, everything else, such as personal care, 4.2%, gifts and donations (the survey calls them cash contributions) 2.9%, clothes and shoes 2.5%, and education 2.0%. The first three are boxed together and marked as more than 60% of all spending. Source: Bureau of Labor Statistics, Consumer Expenditures, 2024.",
      labels: {
        total: "Average household in 2024: $78,535",
        together: "Together: more than 60%",
        rows: [
          { name: "Housing", share: "33.4%" },
          { name: "Getting around", share: "17.0%" },
          { name: "Food", share: "12.9%" },
          { name: "Social Security and retirement", share: "12.5%" },
          { name: "Healthcare", share: "7.9%" },
          { name: "Entertainment", share: "4.6%" },
          { name: "Everything else", share: "4.2%" },
          { name: "Gifts and donations", share: "2.9%" },
          { name: "Clothes and shoes", share: "2.5%" },
          { name: "Education", share: "2.0%" },
        ],
        groceries: { name: "Groceries", share: "7.9%" },
        eatingOut: { name: "Eating out", share: "5.0%" },
      },
    },
    "budget-categories-split": {
      caption:
        "As one Food category, all you can see is that you spent $640. Split it in two, and you can see that $260 of it was eating out.",
      description:
        "Two bars of the same length. The first is one category, Food, at $640. The second is the same money split into two categories: Groceries at $380 and Eating out at $260. A dashed line marks where the split falls, and below it, $380 plus $260 equals $640.",
      labels: {
        before: "One category",
        after: "Split in two",
        food: "Food",
        foodAmount: "$640",
        groceries: "Groceries",
        groceriesAmount: "$380",
        eatingOut: "Eating out",
        eatingOutAmount: "$260",
        sum: "$380 + $260 = $640",
      },
    },
  },
} as const;
