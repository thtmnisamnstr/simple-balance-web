import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { notFound } from "next/navigation";
import {
  allEntries,
  docsBySection,
  docsNeighbors,
  entryBySlug,
  tableOfContents,
} from "@/content/collections";
import { editUrl, section } from "@/content/sections";
import { Prose } from "@/components/prose";
import { Contents } from "@/components/contents";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadcrumbStructuredData, DocStructuredData } from "@/components/structured-data";
import { DocsSidebar } from "@/components/docs-sidebar";
import { ActiveContents } from "@/components/client/active-contents";
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
  const canonical = entry.frontmatter.canonical ?? `/docs/${slug}/`;
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    robots: docs.announced ? undefined : { index: false, follow: false },
    alternates: feedAlternates(canonical),
    openGraph: openGraph({
      type: "article",
      title: entry.frontmatter.title,
      description: entry.frontmatter.description,
      url: canonical,
      ...(entry.frontmatter.updated ? { modifiedTime: entry.frontmatter.updated } : {}),
    }),
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = entryBySlug("docs", slug);
  if (!entry) notFound();

  const { previous, next } = docsNeighbors(slug);
  const contents = tableOfContents(entry.body);
  const group = docsBySection().find((g) => g.entries.some((e) => e.slug === slug));
  const trail = [
    { name: "Home", href: "/" },
    { name: docs.label, href: docs.href },
    ...(group ? [{ name: group.section, href: docs.href }] : []),
    { name: entry.frontmatter.title, href: `/docs/${slug}/` },
  ];

  return (
    <div className="section docs-layout page">
      <DocsSidebar current={slug} />

      <article className="docs-article">
        <DocStructuredData entry={entry} />
        <BreadcrumbStructuredData trail={trail} />
        <Breadcrumbs trail={trail} />

        <h1 className="entry-heading">{entry.frontmatter.title}</h1>
        <p className="lede">{entry.frontmatter.description}</p>

        <div className="docs-meta">
          {entry.frontmatter.updated ? (
            <p className="entry-meta">
              Updated{" "}
              <time dateTime={entry.frontmatter.updated}>
                {formatDate(entry.frontmatter.updated)}
              </time>
            </p>
          ) : (
            <span />
          )}
          <a className="edit-link" href={editUrl("docs", entry.slug)}>
            Edit this page
          </a>
        </div>

        {contents.length >= 3 ? (
          <>
            <Contents items={contents} />
            {/* Enhancement only: the list above works without this. */}
            <ActiveContents ids={contents.map((item) => item.id)} />
          </>
        ) : null}

        <Prose body={entry.body} />

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
