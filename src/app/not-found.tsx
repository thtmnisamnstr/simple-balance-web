import type { Metadata } from "next";
import { site } from "@/content/home";

export const metadata: Metadata = {
  title: "Page not found",
  // A 404 in a search index is a 404 somebody clicked on from a search index.
  robots: { index: false, follow: true },
};

/**
 * The 404.
 *
 * It offers the two places somebody who mistyped a URL actually wants, and it
 * does not apologise: an error page that says "Oops! Sorry!" spends its words
 * on feelings rather than on the way out.
 */
export default function NotFound() {
  return (
    <section className="section" aria-labelledby="nf-title">
      <div className="page page-narrow stack">
        <p className="eyebrow">404</p>
        <h1 id="nf-title" className="section-title">
          There is nothing at this address.
        </h1>
        <p className="lede">
          The page may have moved, or the link that brought you here may have been wrong.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="/">
            Go to the homepage
          </a>
          <a className="button button-secondary" href={site.sourceUrl}>
            Read the source
          </a>
        </div>
      </div>
    </section>
  );
}
