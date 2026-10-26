/**
 * The words in the credit card article's pictures.
 *
 * Here rather than in the drawing because `tests/copy.test.ts` reads this
 * module and cannot read an SVG. The $80 of groceries on the 3rd and the
 * three interest rates are the article's own, so a change to one is a change
 * to both.
 */
export const budgetWithACreditCardArt = {
  hero: {},
  diagrams: {
    "budget-with-a-credit-card-timeline": {
      caption:
        "The groceries count as spending on the 3rd. Paying the bill weeks later is a transfer from checking, so it doesn't count again.",
      description:
        "A timeline, top to bottom. On the 3rd, you buy $80 of groceries on the card, and it counts as grocery spending that day. At the end of the billing cycle, the statement closes. In this example the groceries are the only thing on the card, so the statement balance is $80. Then the grace period runs until the due date, and many cards charge no interest on purchases during it. On the due date, you pay the $80 from checking. That's a transfer between your own accounts, not spending.",
      labels: {
        buyWhen: "The 3rd",
        buy: "Buy $80 of groceries",
        buyMeans: "Counts as grocery spending",
        closeWhen: "End of the billing cycle",
        close: "Statement closes",
        closeMeans: "Statement balance: $80",
        grace: "Grace period",
        graceMeans: "Often no interest on purchases",
        dueWhen: "Due date",
        due: "Pay $80 from checking",
        dueMeans: "A transfer, not spending",
      },
    },
    "budget-with-a-credit-card-interest": {
      caption:
        "A card balance costs much more than other common loans. Pay the full statement balance by the due date and you usually pay no interest on purchases.",
      description:
        "Average yearly interest rates in August 2026, from the Federal Reserve, as bars. Card accounts that were charged interest: about 22%. A two-year personal loan: about 12%. A five-year new car loan: about 7.5%. Below a dashed line, set apart because it isn't an average: a card paid in full by the due date usually charges no interest on purchases.",
      labels: {
        heading: "Average yearly interest, August 2026",
        card: "Card with a balance",
        cardRate: "About 22%",
        personal: "Two-year personal loan",
        personalRate: "About 12%",
        car: "Five-year new car loan",
        carRate: "About 7.5%",
        paid: "Card paid in full",
        paidRate: "Usually none",
      },
    },
  },
} as const;
