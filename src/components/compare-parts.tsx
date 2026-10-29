import appFacts from "@/content/app-facts.json";
import { hero, site } from "@/content/home";
import { citations, compareCopy, ours, type Claim, type Source } from "@/content/compare";
import { typeset } from "@/lib/typeset";

/** The contract, in the shape `ours()` takes, read once for every page. */
export const contract = {
  prices: appFacts.facts.declared.prices,
  freeLimit: appFacts.facts.derived.plans.free.accountLimit,
};

export const ourColumn = ours(contract);

/**
 * A fact about another app, with the number of the source it came from.
 *
 * The number is a link to the source in the list at the foot of the page, and
 * its accessible name says which page that is, because "[2]" read aloud tells
 * a screen reader nothing. `page` is where that list is when it isn't this
 * page: the index's table cites each app's list on that app's own page,
 * rather than repeating four lists under one table.
 */
export function ClaimText({
  claim,
  sources,
  page = "",
}: {
  readonly claim: Claim;
  readonly sources: readonly Source[];
  readonly page?: string;
}) {
  return (
    <>
      {typeset(claim.text)}
      {citations(claim).map((number) => (
        <sup className="compare-cite" key={number}>
          <a
            href={`${page}#source-${number}`}
            aria-label={compareCopy.sourceLabel(number, sources[number - 1]?.label ?? "")}
          >
            [{number}]
          </a>
        </sup>
      ))}
    </>
  );
}

/**
 * The box every comparison closes on. Its own class rather than the learn
 * guides' (`web.md` 4.2), though it looks the same today, so the two can
 * differ the day one of them should.
 */
export function CompareCta() {
  return (
    <aside className="compare-cta" aria-labelledby="compare-cta-title">
      <h2 id="compare-cta-title" className="compare-cta-title">
        {compareCopy.ctaTitle}
      </h2>
      <p>{typeset(compareCopy.ctaBody(contract.freeLimit))}</p>
      <p className="compare-cta-actions">
        <a className="button button-primary" href={site.appUrl}>
          {hero.primaryLabel}
        </a>
        <a className="button button-secondary" href={compareCopy.ctaSecondaryHref}>
          {compareCopy.ctaSecondaryLabel}
        </a>
      </p>
    </aside>
  );
}
