import type { Metadata } from "next";
import { hero, site } from "@/content/home";
import { notFound } from "@/content/not-found";
import { openGraph } from "@/app/open-graph";
import { feedAlternates } from "@/lib/feed";

export const metadata: Metadata = {
  title: notFound.title,
  // A 404 in a search index is a 404 somebody clicked on from a search index.
  robots: { index: false, follow: true },
  // Served at every address that does not exist, so there is no canonical and
  // no `og:url` to give. Inheriting the root's would point a mistyped link at
  // the homepage, in the search index and in the preview alike.
  alternates: feedAlternates(null),
  openGraph: openGraph({
    title: `${notFound.title} — ${site.name}`,
    description: notFound.lede,
    url: null,
  }),
};

/**
 * The 404.
 *
 * It offers the two places somebody who mistyped a URL actually wants: the
 * homepage, and the same way to run it yourself the homepage offers, in the
 * homepage's words and to the same address as `src/app/page.tsx`.
 */
export default function NotFound() {
  return (
    <section className="section" aria-labelledby="nf-title">
      <div className="page page-narrow stack">
        <p className="eyebrow">{notFound.eyebrow}</p>
        <h1 id="nf-title" className="section-title">
          {notFound.heading}
        </h1>
        <p className="lede">{notFound.lede}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="/">
            {notFound.homeLabel}
          </a>
          <a className="button button-secondary" href={site.sourceUrl}>
            {hero.secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
