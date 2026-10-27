/**
 * The words in the track-your-spending article's pictures.
 *
 * Here rather than in the drawing so the copy rules can be checked against
 * plain strings instead of an SVG. The $40 refund is the article's own; every
 * other figure is an example, and both captions open by saying so. The hero
 * has no words, because a label small enough to fit a phone's card is too
 * small to read on one.
 */
export const trackYourSpendingArt = {
  hero: {},
  diagrams: {
    "track-your-spending-count-once": {
      caption:
        "An example: money leaves your accounts once, at the store. Paying the card from checking is a transfer, so the $80 counts once, not twice.",
      description:
        "Checking and a credit card sit inside a dashed line marked Your accounts, and a store sits outside it. An arrow marked $80, Spending, goes from the credit card out to the store. An arrow marked $80, Transfer, goes from checking to the credit card and stays inside the line. Counted as spending: $80, not $160.",
      labels: {
        yours: "Your accounts",
        checking: "Checking",
        card: "Credit card",
        store: "Store",
        amount: "$80",
        transfer: "Transfer",
        spending: "Spending",
        countedLabel: "Counted as spending",
        counted: "$80, not $160",
      },
    },
    "track-your-spending-sort": {
      caption:
        "An example month: every row gets a category, then each category is added up. The card payment isn't spending, and the refund comes off Clothes.",
      description:
        "Six rows from your statements, each with its category. Grocery store, $80, Groceries. Pizza place, $35, Eating out. Clothing store, $60, Clothes. Card payment, $200, not spending. Grocery store, $45, Groceries. Clothes refund, plus $40, Clothes. Below them, the month's totals as bars: Groceries $125, made of $80 and $45. Eating out $35. Clothes $60 minus the $40 refund, which is $20. The card payment isn't in any total.",
      labels: {
        statements: "Your statements",
        category: "Category",
        totals: "Totals for the month",
        rows: [
          { payee: "Grocery store", amount: "$80", category: "Groceries", kind: "spend" },
          { payee: "Pizza place", amount: "$35", category: "Eating out", kind: "spend" },
          { payee: "Clothing store", amount: "$60", category: "Clothes", kind: "spend" },
          { payee: "Card payment", amount: "$200", category: "Not spending", kind: "transfer" },
          { payee: "Grocery store", amount: "$45", category: "Groceries", kind: "spend" },
          { payee: "Clothes refund", amount: "+$40", category: "Clothes", kind: "refund" },
        ],
        groceries: "Groceries",
        groceriesTotal: "$125",
        eatingOut: "Eating out",
        eatingOutTotal: "$35",
        clothes: "Clothes",
        clothesMath: "$60 − $40 = ",
        clothesTotal: "$20",
      },
    },
  },
} as const;
