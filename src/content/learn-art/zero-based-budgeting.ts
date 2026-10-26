/**
 * The words in the zero-based budgeting article's pictures.
 *
 * Here rather than in the drawing so `tests/copy.test.ts` can read them. The
 * figures are the article's own example, $3,000 in checking given five jobs,
 * so a change to one is a change to both. Each amount sits beside the number
 * its bar is drawn from, so the words and the drawing cannot drift apart.
 */
export const zeroBasedBudgetingArt = {
  hero: {
    left: "Left to assign",
    zero: "$0",
  },
  diagrams: {
    "zero-based-budgeting-jobs": {
      caption:
        "Every dollar of the $3,000 gets a job, so nothing is left to assign. The money is still in checking. It's just spoken for.",
      description:
        "A bar for the $3,000 in checking, filled from end to end by five jobs: rent $1,400, groceries $500, car $300, fun $200 and savings $600. Below it, the sum: in checking $3,000, minus $3,000 given a job, leaves $0 to assign. The checking balance is still $3,000.",
      labels: {
        account: "In checking",
        balance: "$3,000",
        jobs: [
          { key: "rent", name: "Rent", amount: "$1,400", dollars: 1400 },
          { key: "groceries", name: "Groceries", amount: "$500", dollars: 500 },
          { key: "car", name: "Car", amount: "$300", dollars: 300 },
          { key: "fun", name: "Fun", amount: "$200", dollars: 200 },
          { key: "savings", name: "Savings", amount: "$600", dollars: 600 },
        ],
        sumAccount: "In checking",
        sumAccountAmount: "$3,000",
        sumJobs: "Given a job",
        sumJobsAmount: "−$3,000",
        sumLeft: "Left to assign",
        sumLeftAmount: "$0",
      },
    },
    "zero-based-budgeting-move": {
      caption:
        "When groceries run $60 over, the $60 comes from another job, here fun. The money only moved between jobs, so left to assign stays at $0.",
      description:
        "Two columns, groceries and fun. Groceries ran $60 over its $500. An arrow carries a $60 piece from the top of fun's column, where a dashed outline marks the gap it left, to the top of groceries' column. Groceries becomes $500 plus $60, which is $560. Fun becomes $200 minus $60, which is $140. Left to assign stays at $0.",
      labels: {
        groceries: "Groceries",
        groceriesSum: "$500 + $60 = $560",
        fun: "Fun",
        funSum: "$200 − $60 = $140",
        moved: "$60",
        movedDollars: 60,
        left: "Left to assign stays $0",
      },
    },
  },
} as const;
