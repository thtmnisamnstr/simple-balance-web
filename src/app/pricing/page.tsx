import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { comparison, faq, pricing, pricingMeta, tiers } from "@/content/pricing";
import { site } from "@/content/home";
import { CheckIcon } from "@/components/icons";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadcrumbStructuredData, FaqStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Pricing",
  description: pricingMeta.description,
  alternates: feedAlternates("/pricing/"),
  openGraph: openGraph({
    title: `Pricing — ${site.name}`,
    description: pricingMeta.socialDescription,
    url: "/pricing/",
  }),
};

const trail = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing/" },
];

/** A cell in the comparison table: a tick, a dash, or a word. */
function Cell({ value }: { readonly value: string | boolean }) {
  if (value === true) {
    return (
      <td className="compare-yes">
        <CheckIcon size={18} />
        {/* The tick is an icon, so the word is what a screen reader gets. */}
        <span className="visually-hidden">Included</span>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className="compare-no">
        <span aria-hidden="true">—</span>
        <span className="visually-hidden">Not included</span>
      </td>
    );
  }
  return <td>{value}</td>;
}

export default function PricingPage() {
  return (
    <>
      <FaqStructuredData items={faq} />
      <BreadcrumbStructuredData trail={trail} />

      <section className="section" aria-labelledby="pricing-title">
        <div className="page">
          <Breadcrumbs trail={trail} />
          <p className="eyebrow">{pricing.eyebrow}</p>
          <h1 id="pricing-title" className="section-title">
            {pricing.title}
          </h1>
          <p className="lede">{pricing.lede}</p>

          <div className="tiers">
            {tiers.map((tier) => (
              <article
                className={tier.featured ? "tier tier-featured" : "tier"}
                key={tier.key}
                aria-labelledby={`tier-${tier.key}`}
              >
                {/*
                 * The flag is rendered on every card and painted on one.
                 *
                 * It used to exist only on the featured card, positioned out
                 * of the flow over top padding reserved on all three so the
                 * headings stayed level. That reserve was one line tall, and
                 * this label is not one line at every width: at three columns
                 * of roughly 240px the label wraps to two, and the second line
                 * crossed the tier name. An unpainted copy on the other cards
                 * reserves whatever the label actually needs, at every width,
                 * because it is the same string wrapping in a box of the same
                 * width.
                 */}
                <p
                  className={tier.featured ? "tier-flag" : "tier-flag tier-flag-ghost"}
                  aria-hidden={tier.featured ? undefined : true}
                >
                  {pricing.featuredFlag}
                </p>
                <h2 className="tier-name" id={`tier-${tier.key}`}>
                  {tier.name}
                </h2>
                <p className="tier-price">
                  <strong>{tier.price}</strong> <span>{tier.priceNote}</span>
                </p>
                <p className="tier-summary">{tier.summary}</p>
                <p className="tier-who">{tier.who}</p>
                {tier.cta.href ? (
                  <a
                    className={tier.featured ? "button button-primary" : "button button-secondary"}
                    href={tier.cta.href}
                  >
                    {tier.cta.label}
                  </a>
                ) : (
                  // The application is not deployed, so this states the
                  // situation rather than pretending to be pressable.
                  // `web.md` 6.1.
                  <span className="button button-pending">{tier.cta.label}</span>
                )}
              </article>
            ))}
          </div>

          {/* The strip every competitor closes its price block with and this
              page had none of: what the reader is risking, answered beside the
              number rather than eight questions into the FAQ. */}
          <ul className="checklist">
            {pricing.reassurances.map((point) => (
              <li key={point}>
                <span className="check" aria-hidden="true">
                  <CheckIcon size={18} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="entry-meta tier-note">{pricing.note}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="compare-title">
        <div className="page">
          <h2 id="compare-title" className="section-title">
            {pricing.compareTitle}
          </h2>
          <p className="lede">{pricing.compareLede}</p>
          {/* The table scrolls inside its own container rather than widening
              the page, which is what stops a phone scrolling horizontally. */}
          <div className="table-wrap">
            <table className="compare">
              <caption className="visually-hidden">{pricing.compareCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  {pricing.columns.map((column) => (
                    <th scope="col" key={column}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">
                      {row.feature}
                      {row.note ? <span className="compare-note">{row.note}</span> : null}
                    </th>
                    <Cell value={row.free} />
                    <Cell value={row.premium} />
                    <Cell value={row.self} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="page page-narrow">
          <h2 id="faq-title" className="section-title">
            {pricing.faqTitle}
          </h2>
          <div className="faq">
            {faq.map((item) => (
              // <details> rather than a scripted accordion: it works before
              // hydration, find-in-page can open it, and it needs no state.
              <details className="faq-item" key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
