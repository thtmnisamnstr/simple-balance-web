import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { site } from "@/content/home";
import { allEntries, postsByYear } from "@/content/collections";
import { blogIndex, section } from "@/content/sections";
import { formatDate } from "@/lib/format";
import { typeset } from "@/lib/typeset";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { BlogBanner, BlogBrowse } from "@/components/blog-header";
import { sectionRobots } from "@/lib/indexing";

const blog = section("blog");
const { archive } = blogIndex;

export const metadata: Metadata = {
  title: archive.title,
  description: archive.description,
  robots: sectionRobots("blog"),
  alternates: feedAlternates("/blog/archive/"),
  openGraph: openGraph({
    title: `${archive.title} — ${site.name}`,
    description: archive.description,
    url: "/blog/archive/",
  }),
};

/**
 * Everything, by year, as a dense list.
 *
 * The index is for reading and is paginated; this is for finding, and so it
 * shows titles and dates and nothing else. A blog without one makes its third
 * page of results the only way to reach a two-year-old post.
 *
 * Drawn as a timeline, a rail down the side with a mark at every post, so
 * the gaps between posts are as visible as the posts. No covers: a picture
 * per row would make the list a second front page and the one thing it is
 * for, scanning titles, slower.
 */
export default function ArchivePage() {
  const years = postsByYear();
  const posts = allEntries("blog");

  return (
    <section className="section" aria-labelledby="archive-title">
      <div className="page">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: blog.label, href: blog.href },
            { name: archive.title, href: "/blog/archive/" },
          ]}
        />
        <BlogBanner
          id="archive-title"
          eyebrow={blog.label}
          title={archive.title}
          lede={archive.description}
          kind="archive"
        >
          {years.length > 0 ? (
            <p className="blog-banner-facts">
              {archive.count(posts.length, years.at(-1)?.year ?? "")}
            </p>
          ) : null}
        </BlogBanner>

        {years.length === 0 ? (
          <EmptyState title={blog.empty.title} body={blog.empty.body} />
        ) : (
          <>
            <BlogBrowse current="archive" />
            {years.map((group) => (
              <section key={group.year} className="blog-year" aria-labelledby={`y-${group.year}`}>
                <h2 id={`y-${group.year}`} className="blog-year-title">
                  {group.year}
                </h2>
                <ol className="blog-timeline">
                  {group.posts.map((post) => (
                    <li key={post.slug} className="blog-timeline-item">
                      <time className="blog-timeline-date" dateTime={post.frontmatter.date}>
                        {formatDate(post.frontmatter.date)}
                      </time>
                      <a className="blog-timeline-title" href={`/blog/${post.slug}/`}>
                        {typeset(post.frontmatter.title)}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
