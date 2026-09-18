import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { postsByYear } from "@/content/collections";
import { section } from "@/content/sections";
import { formatDate } from "@/lib/format";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";

const blog = section("blog");

export const metadata: Metadata = {
  title: "Archive",
  description: "Every post, by year.",
  robots: blog.announced ? undefined : { index: false, follow: false },
  alternates: feedAlternates("/blog/archive/"),
};

/**
 * Everything, by year, as a dense list.
 *
 * The index is for reading and is paginated; this is for finding, and so it
 * shows titles and dates and nothing else. A blog without one makes its third
 * page of results the only way to reach a two-year-old post.
 */
export default function ArchivePage() {
  const years = postsByYear();

  return (
    <section className="section" aria-labelledby="archive-title">
      <div className="page page-narrow">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: blog.label, href: blog.href },
            { name: "Archive", href: "/blog/archive/" },
          ]}
        />
        <h1 id="archive-title" className="section-title">
          Archive
        </h1>

        {years.length === 0 ? (
          <EmptyState title={blog.empty.title} body={blog.empty.body} />
        ) : (
          years.map((group) => (
            <section key={group.year} aria-labelledby={`y-${group.year}`}>
              <h2 id={`y-${group.year}`} className="doc-group-title">
                {group.year}
              </h2>
              <ul className="archive-list">
                {group.posts.map((post) => (
                  <li key={post.slug}>
                    <time className="archive-date" dateTime={post.frontmatter.date}>
                      {formatDate(post.frontmatter.date)}
                    </time>
                    <a href={`/blog/${post.slug}/`}>{post.frontmatter.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
