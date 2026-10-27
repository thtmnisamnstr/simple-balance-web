/**
 * The words in the net worth article's pictures.
 *
 * Here rather than in the drawing for the reason every other word on this
 * site is in `src/content/`: `tests/copy.test.ts` reads this module, and it
 * cannot read an SVG. The figures are the article's own worked example, so a
 * change to one is a change to both.
 */
export const netWorthArt = {
  hero: {
    own: "Own",
    owe: "Owe",
  },
  diagrams: {
    "net-worth-own-owe": {
      caption:
        "Net worth is the gap between the two bars. In the article's example, what you owe is bigger, so it comes out below zero.",
      description:
        "Two bars on the same scale. What you own: $8,000 in checking and savings and a car worth $6,000, $14,000 in all. What you owe: $2,000 on a credit card and $15,000 in student loans, $17,000 in all. The second bar is $3,000 longer, so net worth is minus $3,000.",
      labels: {
        own: "What you own: $14,000",
        owe: "What you owe: $17,000",
        cash: "Checking and savings",
        cashAmount: "$8,000",
        car: "Car",
        carAmount: "$6,000",
        card: "Credit card",
        cardAmount: "$2,000",
        loans: "Student loans",
        loansAmount: "$15,000",
        gap: "−$3,000",
        sumLabel: "Net worth",
        sum: "$14,000 − $17,000 = −$3,000",
      },
    },
    "net-worth-trend": {
      caption:
        "An example: still below zero after six months, but higher every month. The direction is the part to watch.",
      description:
        "An example line chart of net worth over six months, from January to June: minus $3,000, minus $2,600, minus $2,100, minus $1,900, minus $1,300 and minus $800. Every point is below the zero line, and every month is higher than the one before.",
      labels: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        zero: "$0",
        first: "−$3,000",
        last: "−$800",
      },
    },
  },
} as const;
