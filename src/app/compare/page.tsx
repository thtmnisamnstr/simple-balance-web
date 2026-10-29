import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph, pageCard } from "@/app/open-graph";
import {
  compareCopy,
  compareChecked,
  compareIndex,
  rivals,
  rows,
  summaryRows,
} from "@/content/compare";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CompareStructuredData } from "@/components/structured-data";
import { ClaimText, CompareCta, ourColumn } from "@/components/compare-parts";
import { formatDate } from "@/lib/format";
import { indexable } from "@/lib/indexing";
import { typeset } from "@/lib/typeset";

export const metadata: Metadata = {
  title: { absolute: compareIndex.title },
  description: compareIndex.description,
  robots: indexable,
  alternates: feedAlternates("/compare/"),
  openGraph: openGraph({
    title: compareIndex.title,
    description: compareIndex.description,
    url: "/compare/",
    images: pageCard("compare", compareIndex.heading),
  }),
};

const label = (key: (typeof summaryRows)[number]) => rows.find((row) => row.key === key)!.label;

export default function CompareIndexPage() {
  return (
    <>
      <CompareStructuredData
        path="/compare/"
        title={compareIndex.title}
        description={compareIndex.description}
        checked={compareChecked}
        card="compare"
        others={rivals.map((rival) => ({ name: rival.name, url: rival.url }))}
      />

      <section className="section" aria-labelledby="compare-heading">
        <div className="page">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: compareIndex.crumb, href: "/compare/" },
            ]}
          />
          <p className="eyebrow">{compareCopy.eyebrow}</p>
          <h1 id="compare-heading" className="section-title">
            {compareIndex.heading}
          </h1>
          <p className="lede">{typeset(compareIndex.answer)}</p>
          <p className="entry-meta compare-checked">
            {compareCopy.checked}{" "}
            <time dateTime={compareChecked}>{formatDate(compareChecked)}</time>.{" "}
            {typeset(compareIndex.checkedNote)}
          </p>

          <h2 className="compare-table-title">{compareIndex.tableTitle}</h2>
          <div className="table-wrap">
            <table className="compare compare-wide">
              <caption className="visually-hidden">{compareIndex.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{compareCopy.feature}</th>
                  <th scope="col">Simple Balance</th>
                  {rivals.map((rival) => (
                    <th scope="col" key={rival.slug}>
                      <a href={`/compare/${rival.slug}/`}>{rival.name}</a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((key) => (
                  <tr key={key}>
                    <th scope="row">{label(key)}</th>
                    <td>{typeset(ourColumn[key])}</td>
                    {rivals.map((rival) => (
                      <td key={rival.slug}>
                        <ClaimText
                          claim={rival.them[key]}
                          sources={rival.sources}
                          page={`/compare/${rival.slug}/`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="compare-pages">
        <div className="page">
          <div className="prose-body compare-body">
            <h2 id="compare-pages">{compareIndex.pagesTitle}</h2>
            <ul>
              {rivals.map((rival) => (
                <li key={rival.slug}>
                  <a href={`/compare/${rival.slug}/`}>{rival.heading}</a>.{" "}
                  {typeset(rival.description)}
                </li>
              ))}
            </ul>

            <p className="entry-meta">{typeset(compareIndex.sourcesNote)}</p>
            <p className="entry-meta">{typeset(compareCopy.trademarks)}</p>
          </div>

          <CompareCta />
        </div>
      </section>
    </>
  );
}
