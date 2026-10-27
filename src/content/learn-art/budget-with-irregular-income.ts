/**
 * The words in the irregular income article's pictures.
 *
 * Here rather than in the drawing because `tests/copy.test.ts` reads this
 * module and cannot read an SVG. The floor diagram is the article's own
 * example, $3,000 one month and $5,000 the next, so a change to one is a
 * change to both. The payday strip is an example year, and its caption says
 * so: which two months get a third payday depends on the date of the first.
 * Paid every other Friday from January 2, 2026, the third lands in January
 * and July, which is what `extraMonths` and the description both say.
 */
export const budgetWithIrregularIncomeArt = {
  hero: {
    floor: "Floor",
    cushion: "Cushion",
  },
  diagrams: {
    "budget-with-irregular-income-floor": {
      caption:
        "Budget from your average and the slow month comes up $1,000 short. Budget from your floor, your lowest month, and both months are covered, and the good month's extra $2,000 can go to your cushion.",
      description:
        "Two charts of the same two months: a slow month that brings in $3,000 and a good month that brings in $5,000. A dashed line in each shows the plan. In the first, the plan is the average, $4,000 a month, and the slow month's bar stops below it, $1,000 short. In the second, the plan is the floor, $3,000 a month. The slow month's bar reaches it exactly, with a check mark, and the good month's bar rises $2,000 past it, marked as going to the cushion.",
      labels: {
        average: "The average",
        averagePlan: "Plan $4,000",
        floor: "The floor",
        floorPlan: "Plan $3,000",
        slow: "Slow",
        good: "Good",
        slowAmount: "$3,000",
        goodAmount: "$5,000",
        short: "Short",
        shortAmount: "−$1,000",
        cushion: "Cushion",
        cushionAmount: "+$2,000",
      },
    },
    "budget-with-irregular-income-paydays": {
      caption:
        "One example year, paid every other Friday. Budget each month on two paychecks. Two months get a third one, and that one is extra.",
      description:
        "A strip of the twelve months, January to December, with a block for each payday. Every month has two blocks, 24 in all, and a dashed line across the top of the second marks what to budget on. January and July each have a third block above the line, labeled extra, which makes 26 paychecks in the year.",
      labels: {
        title: "26 paychecks a year",
        sum: "Two a month makes 24, so two are extra",
        budgetOn: "Budget on two",
        extra: "Extra",
        extraMonths: ["January", "July"],
        months: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
      },
    },
  },
} as const;
