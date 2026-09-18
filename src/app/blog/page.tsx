import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { blogIndex, blogTags } from "@/content/collections";
import { section } from "@/content/sections";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";

const blog = section("blog");

export const metadata: Metadata = {
  title: blog.title,
  description: blog.description,
  // An unannounced section is not indexed. One flag decides it, and the
  // sitemap reads the same one — `src/content/sections.ts`.
  robots: blog.announced ? undefined : { index: false, follow: false },
  alternates: feedAlternates(blog.href),
};

export default function BlogIndex() {
  const { featured, rest } = blogIndex();
  const tags = blogTags();

  return (
    <section className="section" aria-labelledby="blog-title">
      <div className="page page-narrow">
        <p className="eyebrow">{blog.label}</p>
        <h1 id="blog-title" className="section-title">
          {blog.title}
        </h1>
        <p className="lede">{blog.description}</p>

        {featured.length === 0 && rest.length === 0 ? (
          <EmptyState title={blog.empty.title} body={blog.empty.body} />
        ) : (
          <>
            {featured.length > 0 ? (
              <section aria-labelledby="featured-title" className="featured">
                <h2 id="featured-title" className="doc-group-title">
                  Featured
                </h2>
                <ul className="entry-list">
                  {featured.map((post) => (
                    <PostCard key={post.slug} post={post} featured />
                  ))}
                </ul>
              </section>
            ) : null}

            {rest.length > 0 ? (
              <section aria-labelledby="all-title">
                {featured.length > 0 ? (
                  <h2 id="all-title" className="doc-group-title">
                    More posts
                  </h2>
                ) : (
                  <h2 id="all-title" className="visually-hidden">
                    All posts
                  </h2>
                )}
                <ul className="entry-list">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </ul>
              </section>
            ) : null}

            {tags.length > 0 ? (
              <p className="entry-meta tag-summary">
                Topics: {tags.map((t) => `${t.tag} (${t.count})`).join(", ")}
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
