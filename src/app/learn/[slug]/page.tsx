import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph, pageCard } from "@/app/open-graph";
import { notFound } from "next/navigation";
import {
  allEntries,
  bySection,
  entryBySlug,
  neighbors,
  tableOfContents,
} from "@/content/collections";
import { section } from "@/content/sections";
import { learnCta, learnIndex } from "@/content/learn";
import { Prose } from "@/components/prose";
import { Byline } from "@/components/byline";
import { Contents } from "@/components/contents";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArticleStructuredData } from "@/components/structured-data";
import { LearnCard, LearnHero } from "@/components/learn-art/pieces";
import { ShareLinks } from "@/components/share-links";
import { typeset } from "@/lib/typeset";
import { sectionRobots } from "@/lib/indexing";

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
    robots: sectionRobots("learn"),
    // The page's plain-Markdown copy, which `./index.md/route.ts` writes.
    alternates: feedAlternates(canonical, `/learn/${slug}/index.md`),
    openGraph: openGraph({
      type: "article",
      title: meta.title,
      description: meta.description,
      url: canonical,
      images: pageCard(`learn/${slug}`, meta.title),
      ...(meta.date ? { publishedTime: meta.date } : {}),
      ...(meta.updated ? { modifiedTime: meta.updated } : {}),
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
    <article className="section learn-article">
      <div className="page page-narrow">
        <ArticleStructuredData entry={entry} />
        <Breadcrumbs trail={trail} />

        <LearnHero slug={slug} />

        {group ? <p className="eyebrow">{group.section}</p> : null}
        <h1 className="entry-heading">{typeset(meta.title)}</h1>
        <p className="lede">{typeset(meta.description)}</p>

        {/* Date and reading time only: the articles credit nobody
            (content.md 5.14). */}
        <Byline
          keys={[]}
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
          <p>{typeset(learnCta.body)}</p>
          <p className="learn-cta-actions">
            <a className="button button-primary" href={learnCta.primaryHref}>
              {learnCta.primaryLabel}
            </a>
            <a className="button button-secondary" href={learnCta.secondaryHref}>
              {learnCta.secondaryLabel}
            </a>
          </p>
        </aside>

        <ShareLinks title={meta.title} path={path} />

        {previous || next ? (
          <nav className="learn-next" aria-labelledby="learn-next-title">
            <h2 id="learn-next-title" className="learn-next-title">
              {learnIndex.keepReading}
            </h2>
            <ul className="learn-grid">
              {previous ? (
                <li>
                  <LearnCard entry={previous} rel="prev" />
                </li>
              ) : null}
              {next ? (
                <li>
                  <LearnCard entry={next} rel="next" />
                </li>
              ) : null}
            </ul>
          </nav>
        ) : null}
      </div>
    </article>
  );
}
