/**
 * The words in the make-a-budget article's pictures.
 *
 * Here rather than in the drawing for the reason every other word on this
 * site is in `src/content/`: `tests/copy.test.ts` reads this module, and it
 * cannot read an SVG. The article gives no figures of its own, so both
 * diagrams use one small example, and each caption says it is one.
 */
export const makeABudgetArt = {
  hero: {},
  diagrams: {
    "make-a-budget-move": {
      caption:
        "An example check-in. Eating out ran $30 over, so $30 of the fun budget moves to cover it. The two budgets still add up to $180.",
      description:
        "Two budgets, before and after a weekly check-in, each drawn as a bar with a line where its budget ends. Green is what was spent within the budget, and red is what was spent over it. Before: eating out has a $100 budget and $130 spent, so it's $30 over. Fun has an $80 budget and $20 spent, so it has $60 left, and $30 of what's left is outlined. An arrow moves that $30 of the fun budget to eating out. After: eating out has a $130 budget and $130 spent, with $0 left, and its whole bar is green. Fun has a $50 budget and $20 spent, with $30 left. Together the two budgets are still $180.",
      labels: {
        spent: "Spent",
        overLegend: "Over",
        budget: "Budget",
        before: "Before",
        after: "After",
        eatingOut: "Eating out",
        fun: "Fun",
        over: "$30 over",
        funLeftBefore: "$60 left",
        eatingOutLeftAfter: "$0 left",
        funLeftAfter: "$30 left",
        move: "Move $30",
        eatingOutBudgetBefore: "$100 budget",
        funBudgetBefore: "$80 budget",
        eatingOutBudgetAfter: "$130 budget",
        funBudgetAfter: "$50 budget",
      },
    },
    "make-a-budget-row": {
      caption:
        "An example month that isn't over yet. Groceries is under its budget so far. Eating out has already gone $30 over, so its bar is full and red.",
      description:
        "Two budget rows for October, halfway through the month, so the month is marked so far. Each row has a badge, then a bar that ends at a line for the budget. The whole bar is the budget, the filled part is what's been spent, and the empty part is what remains. Groceries: a budget of $400, $260 spent, $140 remaining, marked So far, with its bar about two-thirds full and green. Eating out: a budget of $100, $130 spent, so remaining is minus $30, marked Over, and its bar is full and red.",
      labels: {
        month: "October (so far)",
        today: "Today",
        groceries: "Groceries",
        eatingOut: "Eating out",
        budget: "Budget",
        spent: "Spent",
        remaining: "Remaining",
        soFar: "So far",
        over: "Over",
        groceriesBudget: "$400",
        groceriesSpent: "$260",
        groceriesRemaining: "$140",
        eatingOutBudget: "$100",
        eatingOutSpent: "$130",
        eatingOutRemaining: "−$30",
      },
    },
  },
} as const;
