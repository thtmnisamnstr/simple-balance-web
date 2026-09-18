import type { Metadata } from "next";
import { docsBySection, isEmpty } from "@/content/collections";
import { section } from "@/content/sections";
import { EmptyState } from "@/components/empty-state";

const docs = section("docs");

export const metadata: Metadata = {
  title: docs.title,
  description: docs.description,
  robots: docs.announced ? undefined : { index: false, follow: false },
  alternates: { canonical: docs.href },
};

export default function DocsIndex() {
  const groups = docsBySection();

  return (
    <section className="section" aria-labelledby="docs-title">
      <div className="page page-narrow">
        <p className="eyebrow">{docs.label}</p>
        <h1 id="docs-title" className="section-title">
          {docs.title}
        </h1>
        <p className="lede">{docs.description}</p>

        {isEmpty("docs") ? (
          <EmptyState title={docs.empty.title} body={docs.empty.body} />
        ) : (
          groups.map((group) => (
            <section
              className="doc-group"
              key={group.section}
              aria-labelledby={`g-${group.section}`}
            >
              <h2 id={`g-${group.section}`} className="doc-group-title">
                {group.section}
              </h2>
              <ul className="entry-list">
                {group.entries.map((entry) => (
                  <li key={entry.slug}>
                    <article className="entry">
                      <h3 className="entry-title">
                        <a href={`/docs/${entry.slug}/`}>{entry.frontmatter.title}</a>
                      </h3>
                      <p className="entry-summary">{entry.frontmatter.description}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
