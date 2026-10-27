/**
 * The words in the sinking funds article's pictures.
 *
 * Here rather than in the drawing for the reason every other word on this
 * site is in `src/content/`: `tests/copy.test.ts` reads this module, and it
 * cannot read an SVG. The figures are the article's own car insurance example
 * and its table, so a change to one is a change to both.
 */
export const sinkingFundsArt = {
  hero: {
    goal: "$600",
    due: "June",
  },
  diagrams: {
    "sinking-funds-car-insurance": {
      caption:
        "Put away $100 a month from January, and the fund reaches $600 in June, the month the bill is due. Then the fund pays the bill.",
      description:
        "A bar for each month from January to June, each one a stack of $100 pieces: $100 in January, $200 in February, $300 in March, $400 in April, $500 in May and $600 in June. A dashed line marks the $600 car insurance bill, and the June bar reaches it exactly. An arrow from the June bar pays the bill, drawn as a $600 bar of its own.",
      labels: {
        title: "Car insurance: $600, due in June",
        subtitle: "Save $100 a month from January",
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        totals: ["$100", "$200", "$300", "$400", "$500", "$600"],
        pay: "Pay",
        bill: "Bill",
        billAmount: "$600",
      },
    },
    "sinking-funds-pieces": {
      caption:
        "Each bill is cut into one equal piece for every month until it's due. The holidays cost the most, but with 10 months to save, each piece is smaller than car insurance's.",
      description:
        "Three bars on the same scale, each cut into equal monthly pieces. Car insurance, $600 due in 6 months: 6 pieces of $100. Holidays, $900 due in 10 months: 10 pieces of $90. Vet checkup, $240 due in 12 months: 12 pieces of $20.",
      labels: {
        funds: [
          { name: "Car insurance: $600", each: "$100 a month for 6 months" },
          { name: "Holidays: $900", each: "$90 a month for 10 months" },
          { name: "Vet checkup: $240", each: "$20 a month for 12 months" },
        ],
      },
    },
  },
} as const;
