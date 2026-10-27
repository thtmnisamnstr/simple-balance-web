import type { Metadata } from "next";
import { hero, site } from "@/content/home";
import { notFound } from "@/content/not-found";
import { openGraph } from "@/app/open-graph";
import { feedAlternates } from "@/lib/feed";
import { typeset } from "@/lib/typeset";

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
 *
 * Its words are typeset where they're rendered (`web.md` 3.3): the heading
 * said "There's" with a straight apostrophe under a header that curls its
 * own.
 */
export default function NotFound() {
  return (
    <section className="section" aria-labelledby="nf-title">
      <div className="page page-narrow">
        <p className="eyebrow">{typeset(notFound.eyebrow)}</p>
        <h1 id="nf-title" className="section-title">
          {typeset(notFound.heading)}
        </h1>
        <p className="lede">{typeset(notFound.lede)}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="/">
            {typeset(notFound.homeLabel)}
          </a>
          <a className="button button-secondary" href={site.sourceUrl}>
            {hero.secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
