import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allEntries, entryBySlug, tableOfContents } from "@/content/collections";
import { section } from "@/content/sections";
import { authors } from "@/content/authors";
import { Prose } from "@/components/prose";
import { Byline } from "@/components/byline";
import { TagList } from "@/components/tag-list";
import { Contents } from "@/components/contents";

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
    // A post published elsewhere first says so, so neither copy competes with
    // the other in a search index.
    alternates: { canonical: meta.canonical ?? `/blog/${slug}/` },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      ...(meta.date ? { publishedTime: meta.date } : {}),
      ...(meta.updated ? { modifiedTime: meta.updated } : {}),
      authors: (meta.authors ?? []).map((key) => authors[key].name),
      ...(meta.image ? { images: [{ url: meta.image, alt: meta.imageAlt ?? "" }] } : {}),
    },
    ...(meta.tags ? { keywords: [...meta.tags] } : {}),
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = entryBySlug("blog", slug);
  if (!post) notFound();

  const meta = post.frontmatter;
  const contents = tableOfContents(post.body);

  return (
    <article className="section">
      <div className="page page-narrow">
        <p className="eyebrow">
          <a href={blog.href}>{blog.label}</a>
        </p>
        <h1 className="entry-heading">{meta.title}</h1>
        <p className="lede">{meta.description}</p>

        <Byline
          keys={meta.authors ?? []}
          {...(meta.date ? { date: meta.date } : {})}
          {...(meta.updated ? { updated: meta.updated } : {})}
          readingMinutes={post.readingMinutes}
        />

        {meta.image ? (
          <img className="entry-cover" src={meta.image} alt={meta.imageAlt ?? ""} />
        ) : null}

        {/* Only long posts get a contents list. On a short one it is a second
            copy of the page above the page. */}
        {contents.length >= 4 ? <Contents items={contents} /> : null}

        <Prose body={post.body} />

        <TagList tags={meta.tags ?? []} />
      </div>
    </article>
  );
}
