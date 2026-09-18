import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { notFound } from "next/navigation";
import {
  allEntries,
  blogNeighbours,
  entryBySlug,
  relatedPosts,
  seriesOf,
  tableOfContents,
} from "@/content/collections";
import { section } from "@/content/sections";
import { authors } from "@/content/authors";
import { Prose } from "@/components/prose";
import { Cover } from "@/components/cover";
import { Byline } from "@/components/byline";
import { TagList } from "@/components/tag-list";
import { Contents } from "@/components/contents";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SeriesNav } from "@/components/series-nav";
import { RelatedPosts } from "@/components/related-posts";
import { PostPager } from "@/components/post-pager";
import { ShareLinks } from "@/components/share-links";
import { BreadcrumbStructuredData, PostStructuredData } from "@/components/structured-data";

const blog = section("blog");

/**
 * Every post that exists at build time. A static export has no server, so a
 * slug absent from this list is a URL that does not exist; `notFound()` below
 * covers the development server and nothing else.
 */
export function generateStaticParams() {
  return allEntries("blog").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = entryBySlug("blog", slug);
  if (!post) return {};
  const meta = post.frontmatter;
  return {
    title: meta.title,
    description: meta.description,
    robots: blog.announced ? undefined : { index: false, follow: false },
    // A post published elsewhere first says so, so the two copies do not
    // compete with each other in a search index.
    alternates: feedAlternates(meta.canonical ?? `/blog/${slug}/`),
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      ...(meta.date ? { publishedTime: meta.date } : {}),
      ...(meta.updated ? { modifiedTime: meta.updated } : {}),
      authors: (meta.authors ?? []).map((key) => authors[key].name),
      ...(meta.tags ? { tags: [...meta.tags] } : {}),
      ...(meta.image ? { images: [{ url: meta.image, alt: meta.imageAlt ?? "" }] } : {}),
    },
    twitter: { card: meta.image ? "summary_large_image" : "summary", title: meta.title },
    ...(meta.tags ? { keywords: [...meta.tags] } : {}),
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = entryBySlug("blog", slug);
  if (!post) notFound();

  const meta = post.frontmatter;
  const contents = tableOfContents(post.body);
  const { previous, next } = blogNeighbours(slug);
  const series = seriesOf(post);
  const related = relatedPosts(post);
  const trail = [
    { name: "Home", href: "/" },
    { name: blog.label, href: blog.href },
    { name: meta.title, href: `/blog/${slug}/` },
  ];

  return (
    <article className="section">
      <div className="page page-narrow">
        <PostStructuredData post={post} />
        <BreadcrumbStructuredData trail={trail} />
        <Breadcrumbs trail={trail} />

        <h1 className="entry-heading">{meta.title}</h1>
        <p className="lede">{meta.description}</p>

        <Byline
          keys={meta.authors ?? []}
          {...(meta.date ? { date: meta.date } : {})}
          {...(meta.updated ? { updated: meta.updated } : {})}
          readingMinutes={post.readingMinutes}
        />

        {meta.image ? <Cover src={meta.image} alt={meta.imageAlt ?? ""} priority /> : null}

        {meta.series ? <SeriesNav series={meta.series} parts={series} current={slug} /> : null}

        {/* Only long posts get a contents list. On a short one it is a second
            copy of the page above the page. */}
        {contents.length >= 4 ? <Contents items={contents} /> : null}

        <Prose body={post.body} />

        <TagList tags={meta.tags ?? []} />
        <ShareLinks title={meta.title} path={`/blog/${slug}/`} />
        <PostPager previous={previous} next={next} />
        <RelatedPosts posts={related} />
      </div>
    </article>
  );
}
