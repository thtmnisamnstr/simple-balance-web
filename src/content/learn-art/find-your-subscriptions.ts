/**
 * The words in the subscriptions article's pictures.
 *
 * Here rather than in the drawing for the reason every other word on this
 * site is in `src/content/`: `tests/copy.test.ts` reads this module, and it
 * cannot read an SVG. The survey figures are the article's own, quoted from
 * C+R Research, so a change to one is a change to both.
 */
export const findYourSubscriptionsArt = {
  hero: {},
  diagrams: {
    "find-your-subscriptions-guess": {
      caption:
        "On average, people first guessed they spent $86 a month on subscriptions. When they went through them one kind at a time, the average came to $219.",
      description:
        "Two bars on the same scale, from a 2022 survey by C+R Research of what people spend on subscriptions each month, on average. The first bar is the average first guess: $86. The second bar is the average they came to when they went through them one kind at a time: $219. The first $86 of the second bar lines up with the guess, and the rest of it, $133, is marked as the part they missed.",
      labels: {
        heading: "Average spent each month",
        guess: "First guess",
        guessAmount: "$86",
        counted: "Went through one kind at a time",
        countedAmount: "$219",
        gap: "$133 more",
      },
    },
    "find-your-subscriptions-statements": {
      caption:
        "A few months of statements will catch every monthly charge. Only a full year catches the one that comes once a year.",
      description:
        "A year laid out as twelve months, January to December. A monthly charge shows up in every month. A yearly charge shows up once, in May. The last 3 months, October to December, are shaded: they hold three of the monthly charges and none of the yearly one. A bracket under all twelve months marks a full year, which holds both.",
      labels: {
        monthly: "Monthly charge",
        yearly: "Yearly charge",
        months: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        recent: "3 months",
        year: "A full year",
      },
    },
  },
} as const;
