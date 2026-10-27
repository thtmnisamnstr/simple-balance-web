/**
 * The words in the emergency fund article's pictures.
 *
 * Here rather than in the drawing for the reason every other word on this
 * site is in `src/content/`: `tests/copy.test.ts` reads this module, and it
 * cannot read an SVG. The figures are the article's own, so a change to one
 * is a change to both.
 */
export const emergencyFundArt = {
  hero: {},
  diagrams: {
    "emergency-fund-surprise": {
      caption:
        "Each dot stands for one adult out of 100. More than a third would have to borrow, sell something, or couldn't cover a surprise $400 expense at all.",
      description:
        "A grid of 100 dots, one for each of 100 adults, from the Federal Reserve's survey for 2025. The first 63 dots are solid green: 63% would cover a surprise $400 expense with cash or its equivalent. The rest are amber rings: more than a third would have to borrow, sell something, or couldn't cover it at all.",
      labels: {
        yes: "63% would cover $400",
        yesHow: "with cash or its equivalent",
        no: "More than a third",
        noHow: "would borrow, sell, or couldn't cover it",
      },
    },
    "emergency-fund-ladder": {
      caption:
        "Build it a step at a time: $500, then one month of expenses, then three. Three to six months is the usual goal.",
      description:
        "Four steps rising from left to right, like stairs. Step one is $500, marked start here. Step two is one month of expenses. Step three is three months. Step four is six months. Steps three and four are marked as the usual goal: three to six months of essential expenses. The month steps are drawn to scale: three months is three times as tall as one, and six is twice as tall as three. $500 is drawn as the smallest step.",
      labels: {
        steps: ["$500", "1 month", "3 months", "6 months"],
        start: "Start here",
        goal: "The usual goal",
      },
    },
  },
} as const;
