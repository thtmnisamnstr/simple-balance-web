import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  allEntries,
  docsBySection,
  docsNeighbours,
  entryBySlug,
  tableOfContents,
} from "@/content/collections";
import { section } from "@/content/sections";
import { Prose } from "@/components/prose";
import { Contents } from "@/components/contents";
import { formatDate } from "@/lib/format";

const docs = section("docs");

export function generateStaticParams() {
  return allEntries("docs").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = entryBySlug("docs", slug);
  if (!entry) return {};
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    robots: docs.announced ? undefined : { index: false, follow: false },
    alternates: { canonical: entry.frontmatter.canonical ?? `/docs/${slug}/` },
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = entryBySlug("docs", slug);
  if (!entry) notFound();

  const { previous, next } = docsNeighbours(slug);
  const contents = tableOfContents(entry.body);

  return (
    <div className="section docs-layout page">
      {/* Rendered from the same grouping the index uses, so a new page appears
          in both without being listed twice. Order comes from
          `content/docs/_sections.json` plus each page's `order`. */}
      <nav className="docs-nav" aria-label="Documentation">
        <a className="docs-nav-home" href={docs.href}>
          {docs.title}
        </a>
        {docsBySection().map((group) => (
          <div className="docs-nav-group" key={group.section}>
            <p className="docs-nav-heading">{group.section}</p>
            <ul>
              {group.entries.map((item) => (
                <li key={item.slug}>
                  <a
                    href={`/docs/${item.slug}/`}
                    aria-current={item.slug === slug ? "page" : undefined}
                  >
                    {item.frontmatter.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <article className="docs-article">
        <h1 className="entry-heading">{entry.frontmatter.title}</h1>
        <p className="lede">{entry.frontmatter.description}</p>
        {entry.frontmatter.updated ? (
          <p className="entry-meta">
            Updated{" "}
            <time dateTime={entry.frontmatter.updated}>
              {formatDate(entry.frontmatter.updated)}
            </time>
          </p>
        ) : null}

        {contents.length >= 3 ? <Contents items={contents} /> : null}

        <Prose body={entry.body} />

        {/* Sequential navigation, because reference documentation is also read
            front to back the first time. */}
        {previous || next ? (
          <nav className="doc-pager" aria-label="More documentation">
            {previous ? (
              <a className="doc-pager-link" href={`/docs/${previous.slug}/`} rel="prev">
                <span className="doc-pager-label">Previous</span>
                <span className="doc-pager-title">{previous.frontmatter.title}</span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="doc-pager-link doc-pager-next" href={`/docs/${next.slug}/`} rel="next">
                <span className="doc-pager-label">Next</span>
                <span className="doc-pager-title">{next.frontmatter.title}</span>
              </a>
            ) : null}
          </nav>
        ) : null}
      </article>
    </div>
  );
}
