import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { feedAlternates } from "@/lib/feed";
import { openGraph, pageCard } from "@/app/open-graph";
import { compareCopy, compareIndex, rivals, rows } from "@/content/compare";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CompareStructuredData } from "@/components/structured-data";
import { ClaimText, CompareCta, contract, ourColumn } from "@/components/compare-parts";
import { formatDate } from "@/lib/format";
import { indexable } from "@/lib/indexing";
import { typeset } from "@/lib/typeset";

export const dynamicParams = false;

export function generateStaticParams() {
  return rivals.map((rival) => ({ slug: rival.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rival = rivals.find((entry) => entry.slug === slug);
  if (!rival) return {};
  const path = `/compare/${slug}/`;
  return {
    // Absolute, because the title is "Simple Balance vs YNAB": the search
    // itself already names the site, and the layout's template would say it
    // a second time.
    title: { absolute: rival.title },
    description: rival.description,
    robots: indexable,
    alternates: feedAlternates(path, `${path}index.md`),
    openGraph: openGraph({
      type: "article",
      title: rival.title,
      description: rival.description,
      url: path,
      images: pageCard(`compare/${slug}`, rival.heading),
      modifiedTime: rival.checked,
    }),
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rival = rivals.find((entry) => entry.slug === slug);
  if (!rival) notFound();
  const path = `/compare/${slug}/`;
  const others = rivals.filter((entry) => entry.slug !== slug);

  return (
    <>
      <CompareStructuredData
        path={path}
        title={rival.title}
        description={rival.description}
        checked={rival.checked}
        card={`compare/${slug}`}
        others={[{ name: rival.name, url: rival.url }]}
      />

      <section className="section" aria-labelledby="compare-heading">
        <div className="page">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: compareIndex.crumb, href: "/compare/" },
              { name: rival.heading, href: path },
            ]}
          />
          <p className="eyebrow">{compareCopy.eyebrow}</p>
          <h1 id="compare-heading" className="section-title">
            {rival.heading}
          </h1>
          <p className="lede">{typeset(rival.answer(contract))}</p>
          <p className="entry-meta compare-checked">
            {compareCopy.checked} <time dateTime={rival.checked}>{formatDate(rival.checked)}</time>.{" "}
            {typeset(compareCopy.checkedNote)}
          </p>

          <h2 className="compare-table-title">{compareCopy.tableTitle}</h2>
          {/* The table scrolls inside its own container rather than widening
              the page, as the pricing page's does. */}
          <div className="table-wrap">
            <table className="compare compare-pair">
              <caption className="visually-hidden">{compareCopy.tableCaption(rival.name)}</caption>
              <thead>
                <tr>
                  <th scope="col">{compareCopy.feature}</th>
                  <th scope="col">Simple Balance</th>
                  <th scope="col">{rival.name}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    <td>{typeset(ourColumn[row.key])}</td>
                    <td>
                      <ClaimText claim={rival.them[row.key]} sources={rival.sources} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="compare-choose">
        <div className="page">
          <div className="prose-body compare-body">
            <h2 id="compare-choose">{compareCopy.chooseThemTitle(rival.name)}</h2>
            <ul>
              {rival.chooseThem.map((point) => (
                <li key={point.text}>
                  <ClaimText claim={point} sources={rival.sources} />
                </li>
              ))}
            </ul>
            <h2>{compareCopy.chooseUsTitle}</h2>
            <ul>
              {rival.chooseUs.map((point) => (
                <li key={point.text}>
                  <ClaimText claim={point} sources={rival.sources} />
                </li>
              ))}
            </ul>
            <h2>{compareCopy.movingTitle(rival.name)}</h2>
            {rival.moving.map((paragraph) => (
              <p key={paragraph.text}>
                <ClaimText claim={paragraph} sources={rival.sources} />
              </p>
            ))}
            {compareCopy.movingOurs.map((paragraph) => (
              <p key={paragraph}>{typeset(paragraph)}</p>
            ))}
            <p>
              <a href="/docs/importing-a-statement/">{compareCopy.movingLink}</a>
            </p>

            <h2>{compareCopy.sourcesTitle}</h2>
            <ol className="compare-sources">
              {rival.sources.map((source, index) => (
                <li id={`source-${index + 1}`} key={source.url}>
                  <a href={source.url}>{source.label}</a>
                </li>
              ))}
            </ol>
            <p className="entry-meta">{typeset(compareCopy.trademarks)}</p>
          </div>

          <CompareCta />

          <nav className="compare-others" aria-labelledby="compare-others-title">
            <h2 id="compare-others-title" className="compare-others-title">
              {compareCopy.otherTitle}
            </h2>
            <ul>
              {others.map((other) => (
                <li key={other.slug}>
                  <a href={`/compare/${other.slug}/`}>{other.heading}</a>
                </li>
              ))}
              <li>
                <a href="/compare/">{compareIndex.allLink}</a>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
