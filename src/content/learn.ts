import { hero, site } from "@/content/home";

/**
 * The words around a learn article that are not the article.
 *
 * Here rather than in `src/app/learn/[slug]/page.tsx` for the reason
 * `docs/standards/content.md` 3.1 gives: `tests/copy.test.ts` reads this
 * module, and it cannot read JSX.
 *
 * **The closing box makes no price claim.** Every article already ends on how
 * to do the job in Simple Balance, so what is left to say is where to try it.
 * A sentence naming the plan's limit or a dollar figure here would be one more
 * place `tests/app-facts.test.ts` has to find, on every article at once, and
 * the pricing page is one click away and already held to it.
 */
export const learnCta = {
  title: "Try it with your own money",
  body:
    "Everything these guides do in Simple Balance is on the free plan, with nothing to install " +
    "and no card to start.",
  primaryLabel: hero.primaryLabel,
  primaryHref: site.appUrl,
  secondaryLabel: "See pricing",
  secondaryHref: "/pricing/",
} as const;
