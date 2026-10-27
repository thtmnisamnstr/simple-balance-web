import { hero, site } from "@/content/home";

/**
 * The words around a learn article that are not the article.
 *
 * Here rather than in `src/app/learn/[slug]/page.tsx` for the reason
 * `docs/standards/content.md` 3.1 gives: `tests/copy.test.ts` reads this
 * module, and it cannot read JSX.
 *
 * **The closing box names no price, and does name the limit.** Every article
 * already ends on how to do the job in Simple Balance, so what is left to say
 * is where to try it, and a dollar figure here would be one more copy of what
 * the pricing page, one click away, is already held to.
 *
 * It said "everything these guides do … is on the free plan" and stopped,
 * which is true of every feature and not of every account: the net worth
 * guide says to add each account you have, debts included, and its own
 * screenshot shows four, where the free plan keeps three in use. The homepage
 * and the pricing page never say "everything" for free without the three,
 * and this was the one place that did. So it says it in the homepage's words,
 * and `tests/app-facts.test.ts` holds "three" to the application's limit the
 * way it holds the pricing FAQ's.
 */
export const learnCta = {
  title: "Try it with your own money",
  body:
    "Everything these guides do in Simple Balance is on the free plan, for three accounts you " +
    "can use at once. There's nothing to install and no card to start.",
  primaryLabel: hero.primaryLabel,
  primaryHref: site.appUrl,
  secondaryLabel: "See pricing",
  secondaryHref: "/pricing/",
} as const;

/**
 * The index's own words: what each group of articles is for, and the button
 * that starts at the beginning.
 *
 * Keyed by the group names `content/learn/_sections.json` orders, and
 * `tests/learn.test.ts` holds the two to one set, so a group added there
 * without a line here fails rather than showing a heading with nothing
 * under it.
 */
export const learnIndex = {
  startLabel: "Start at the beginning",
  count: (guides: number, minutes: number) =>
    `${guides} guides, about ${minutes} minutes of reading in all`,
  keepReading: "Keep reading",
  groups: {
    "Start here": "See where your money goes, sort it into categories, and make your first budget.",
    Budgeting:
      "Different ways to plan your money, from giving every dollar a purpose to saving ahead for big bills.",
    "Keeping it accurate":
      "Habits that keep your numbers right: checking your account, handling a credit card, and finding charges you forgot.",
    "The bigger picture":
      "How to tell whether you're getting ahead, and how to get ready for the things you can't plan for.",
  } as Readonly<Record<string, string>>,
} as const;
