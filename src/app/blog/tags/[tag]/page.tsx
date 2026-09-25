import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { site } from "@/content/home";
import { notFound } from "next/navigation";
import { blogTags, postsByTag, tagLabel, tagSlug } from "@/content/collections";
import { section, tagDescriptions } from "@/content/sections";
import { PostCard } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadcrumbStructuredData } from "@/components/structured-data";

const blog = section("blog");

export function generateStaticParams() {
  return blogTags().map(({ tag }) => ({ tag: tagSlug(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const label = tagLabel(tag);
  if (!label) return {};
  const path = `/blog/tags/${tag}/`;
  const title = `Posts tagged ${label}`;
  const description = tagDescriptions[tag] ?? `Everything on ${label}.`;
  return {
    title,
    description,
    robots: blog.announced ? undefined : { index: false, follow: false },
    alternates: feedAlternates(path),
    openGraph: openGraph({ title: `${title} — ${site.name}`, description, url: path }),
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const label = tagLabel(tag);
  if (!label) notFound();

  const posts = postsByTag(tag);
  const trail = [
    { name: "Home", href: "/" },
    { name: blog.label, href: blog.href },
    { name: label, href: `/blog/tags/${tag}/` },
  ];

  return (
    <section className="section" aria-labelledby="tag-title">
      <div className="page page-narrow">
        <BreadcrumbStructuredData trail={trail} />
        <Breadcrumbs trail={trail} />
        <p className="eyebrow">Tag</p>
        <h1 id="tag-title" className="section-title">
          {label}
        </h1>
        {tagDescriptions[tag] ? <p className="lede">{tagDescriptions[tag]}</p> : null}
        <p className="entry-meta">
          {posts.length} {posts.length === 1 ? "post" : "posts"}.
        </p>
        <ul className="entry-list">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ul>
      </div>
    </section>
  );
}
