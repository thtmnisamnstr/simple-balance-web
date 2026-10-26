/**
 * The words in the envelope budgeting article's pictures.
 *
 * Here rather than in the drawing for the reason every other word on this
 * site is in `src/content/`: `tests/copy.test.ts` reads this module, and it
 * cannot read an SVG. The figures are the article's own examples, so a change
 * to one is a change to both.
 */
export const envelopeBudgetingArt = {
  hero: {
    groceries: "Groceries",
    gas: "Gas",
    fun: "Fun",
  },
  diagrams: {
    "envelope-budgeting-carry-over": {
      caption:
        "What you don't spend stays in the envelope. Next month starts with that $60, so if you put in $400 again, you have $460 for groceries.",
      description:
        "Two bars for a grocery envelope. This month, $400 went in: $340 was spent and $60 is left. An arrow carries the $60 down to next month, which starts with that $60 and gets $400 more on payday, $460 in all.",
      labels: {
        thisMonth: "This month",
        thisTotal: "$400",
        left: "Left",
        leftAmount: "$60",
        spent: "Spent",
        spentAmount: "$340",
        nextMonth: "Next month",
        nextTotal: "$460",
        carried: "Carried over",
        carriedAmount: "$60",
        added: "Filled on payday",
        addedAmount: "$400",
      },
    },
    "envelope-budgeting-car-repair": {
      caption:
        "An envelope can save up for a cost that doesn't come every month. Put in $50 a month and leave it alone, and after a year it holds $600.",
      description:
        "Twelve bars, one for each month, each taller than the one before. A car repair envelope gets $50 a month and nothing is taken out, so it holds $50 after the first month and $600 after the twelfth, when the brakes go.",
      labels: {
        title: "Car repairs: $50 a month",
        first: "$50",
        last: "$600 when the brakes go",
        start: "Month 1",
        end: "Month 12",
      },
    },
  },
} as const;
