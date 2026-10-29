import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph, pageCard } from "@/app/open-graph";
import { notFound } from "next/navigation";
import {
  allEntries,
  bySection,
  entryBySlug,
  faqItems,
  neighbors,
  slugify,
  tableOfContents,
} from "@/content/collections";
import { editUrl, section } from "@/content/sections";
import { Prose } from "@/components/prose";
import { Contents } from "@/components/contents";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DocStructuredData, FaqStructuredData } from "@/components/structured-data";
import { DocsSidebar } from "@/components/docs-sidebar";
import { ActiveContents } from "@/components/client/active-contents";
import { DocPager } from "@/components/doc-pager";
import { formatDate } from "@/lib/format";
import { sectionRobots } from "@/lib/indexing";

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
    robots: sectionRobots("docs"),
    // The page's plain-Markdown copy, which `./index.md/route.ts` writes.
    alternates: feedAlternates(canonical, `/docs/${slug}/index.md`),
    openGraph: openGraph({
      type: "article",
      title: entry.frontmatter.title,
      description: entry.frontmatter.description,
      url: canonical,
      images: pageCard(`docs/${slug}`, entry.frontmatter.title),
      ...(entry.frontmatter.updated ? { modifiedTime: entry.frontmatter.updated } : {}),
    }),
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = entryBySlug("docs", slug);
  if (!entry) notFound();

  const { previous, next } = neighbors("docs", slug);
  const contents = tableOfContents(entry.body);
  const group = bySection("docs").find((g) => g.entries.some((e) => e.slug === slug));
  const trail = [
    { name: "Home", href: "/" },
    { name: docs.label, href: docs.href },
    // The group's own shelf on the index, not the index's top: the same URL
    // as the crumb before it named one page twice in the breadcrumb markup.
    ...(group ? [{ name: group.section, href: `${docs.href}#${slugify(group.section)}` }] : []),
    { name: entry.frontmatter.title, href: `/docs/${slug}/` },
  ];

  return (
    <div className="section docs-layout page">
      <DocsSidebar current={slug} />

      <article className="docs-article">
        <DocStructuredData entry={entry} />
        {/* Opted into per page: a questions page is the one place a docs
            page's headings are the questions somebody types. */}
        {entry.frontmatter.extra?.faq === true ? (
          <FaqStructuredData items={faqItems(entry.body)} />
        ) : null}
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

        <DocPager previous={previous} next={next} base={docs.href} label="More documentation" />
      </article>
    </div>
  );
}
