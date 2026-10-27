import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { site } from "@/content/home";
import { notFound } from "next/navigation";
import { blogTags, postsByTag, tagLabel, tagSlug } from "@/content/collections";
import { blogIndex, section, tagDescriptions } from "@/content/sections";
import { PostGrid } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BlogBanner, BlogBrowse } from "@/components/blog-header";
import { sectionRobots } from "@/lib/indexing";

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
    robots: sectionRobots("blog"),
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
      <div className="page">
        <Breadcrumbs trail={trail} />
        <BlogBanner
          id="tag-title"
          eyebrow={blogIndex.tag.eyebrow}
          title={label}
          lede={tagDescriptions[tag]}
          kind="tag"
        >
          <p className="blog-banner-facts">{blogIndex.tag.count(posts.length)}</p>
        </BlogBanner>
        <BlogBrowse current={tag} />
        <PostGrid posts={posts} level={2} />
      </div>
    </section>
  );
}
