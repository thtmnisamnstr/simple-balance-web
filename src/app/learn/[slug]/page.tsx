import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { notFound } from "next/navigation";
import {
  allEntries,
  bySection,
  entryBySlug,
  neighbors,
  tableOfContents,
} from "@/content/collections";
import { section } from "@/content/sections";
import { authors } from "@/content/authors";
import { learnCta } from "@/content/learn";
import { Prose } from "@/components/prose";
import { Byline } from "@/components/byline";
import { Contents } from "@/components/contents";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArticleStructuredData, BreadcrumbStructuredData } from "@/components/structured-data";
import { DocPager } from "@/components/doc-pager";
import { ShareLinks } from "@/components/share-links";
import { AdBanner } from "@/components/ad-banner";

const learn = section("learn");

export function generateStaticParams() {
  return allEntries("learn").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = entryBySlug("learn", slug);
  if (!entry) return {};
  const meta = entry.frontmatter;
  const canonical = meta.canonical ?? `${learn.href}${slug}/`;
  return {
    title: meta.title,
    description: meta.description,
    robots: learn.announced ? undefined : { index: false, follow: false },
    alternates: feedAlternates(canonical),
    openGraph: openGraph({
      type: "article",
      title: meta.title,
      description: meta.description,
      url: canonical,
      ...(meta.date ? { publishedTime: meta.date } : {}),
      ...(meta.updated ? { modifiedTime: meta.updated } : {}),
      authors: (meta.authors ?? []).map((key) => authors[key].name),
    }),
  };
}

/**
 * One learn article.
 *
 * The blog's reading layout, a single narrow column with a byline, because
 * these are read start to finish rather than consulted. The docs' order,
 * because they are a sequence somebody chose rather than a calendar.
 */
export default async function LearnArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = entryBySlug("learn", slug);
  if (!entry) notFound();

  const meta = entry.frontmatter;
  const contents = tableOfContents(entry.body);
  const { previous, next } = neighbors("learn", slug);
  const group = bySection("learn").find((g) => g.entries.some((e) => e.slug === slug));
  const path = `${learn.href}${slug}/`;
  const trail = [
    { name: "Home", href: "/" },
    { name: learn.label, href: learn.href },
    { name: meta.title, href: path },
  ];

  return (
    <article className="section">
      <div className="page page-narrow">
        <ArticleStructuredData entry={entry} />
        <BreadcrumbStructuredData trail={trail} />
        <Breadcrumbs trail={trail} />

        {group ? <p className="eyebrow">{group.section}</p> : null}
        <h1 className="entry-heading">{meta.title}</h1>
        <p className="lede">{meta.description}</p>

        <Byline
          keys={meta.authors ?? []}
          {...(meta.date ? { date: meta.date } : {})}
          {...(meta.updated ? { updated: meta.updated } : {})}
          readingMinutes={entry.readingMinutes}
        />

        {contents.length >= 4 ? <Contents items={contents} /> : null}

        <Prose body={entry.body} />

        <aside className="learn-cta" aria-labelledby="learn-cta-title">
          <h2 id="learn-cta-title" className="learn-cta-title">
            {learnCta.title}
          </h2>
          <p>{learnCta.body}</p>
          <p className="learn-cta-actions">
            <a className="button button-primary" href={learnCta.primaryHref}>
              {learnCta.primaryLabel}
            </a>
            <a className="button button-secondary" href={learnCta.secondaryHref}>
              {learnCta.secondaryLabel}
            </a>
          </p>
        </aside>

        <AdBanner />

        <ShareLinks title={meta.title} path={path} />
        <DocPager previous={previous} next={next} base={learn.href} label="More guides" />
      </div>
    </article>
  );
}
