/**
 * The words in the checking account article's pictures.
 *
 * Here rather than in the drawing because `tests/copy.test.ts` reads this
 * module and cannot read an SVG. The swapped-digit figures are the article's
 * own, from step 5. The balances in the math are not in the article, so the
 * caption calls them an example.
 */
export const balanceYourCheckingAccountArt = {
  hero: {
    statement: "Statement",
    record: "Your record",
  },
  diagrams: {
    "balance-your-checking-account-math": {
      caption:
        "In this example, the bank says $1,200, but a $250 check hasn't been cashed and a $100 deposit hasn't arrived. Allow for both, and $1,050 is what your record should say.",
      description:
        "An example in four bars on one scale. The statement's ending balance is $1,200. Take away $250 that's still on its way out, which brings it to $950. Add $100 that's still on its way in. That leaves $1,050, which should match the balance in your own record. Written out: $1,200 − $250 + $100 = $1,050.",
      labels: {
        statement: "Statement's ending balance",
        statementAmount: "$1,200",
        out: "Still on its way out",
        outAmount: "−$250",
        in: "Still on its way in",
        inAmount: "+$100",
        record: "Should match your record",
        recordAmount: "$1,050",
        sum: "$1,200 − $250 + $100 = $1,050",
      },
    },
    "balance-your-checking-account-gap": {
      caption: "When two digits trade places, the gap always divides evenly by 9.",
      description:
        "Two examples of swapped digits. First, the bank says $54 and you wrote $45: the 5 and the 4 traded places, and the gap is $9, which is 9 times 1. Second, the bank says $820 and you wrote $280: the 8 and the 2 traded places, the 0 stayed put, and the gap is $540, which is 9 times 60.",
      labels: {
        bank: "Bank says",
        you: "You wrote",
        gap: "Gap",
        firstGap: "$9",
        firstNines: "= 9 × 1",
        secondGap: "$540",
        secondNines: "= 9 × 60",
      },
    },
  },
} as const;
