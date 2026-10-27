import { allEntries, blogFront, blogSeries } from "@/content/collections";
import { blogIndex, section } from "@/content/sections";
import { FEED_LINKS } from "@/lib/feed";
import { formatDate } from "@/lib/format";
import { typeset } from "@/lib/typeset";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { PostGrid, PostLead } from "@/components/post-card";
import { BlogBrowse } from "@/components/blog-header";
import { BlogMastheadArt } from "@/components/blog-art";

const blog = section("blog");

/**
 * The blog's front page: a masthead on the art panel, the ways in by topic,
 * one post leading, the rest of page one as cards, and every series laid out
 * in reading order.
 *
 * It was a title, one featured card and a list, which with two posts is the
 * honest minimum and read as a page nobody had designed. A front page with a
 * lead story and a grid has a shape at two posts and at two hundred, which a
 * list does not: the lead is always one post, the grid fills to the page
 * size, and pagination takes the rest.
 *
 * A component rather than the route's own body because two addresses render
 * it. `/blog/page/1/` exists only because a static export refuses a dynamic
 * route with no pages, and its canonical says it is this page, so it shows
 * this page rather than a plainer one.
 */
export function BlogFront() {
  const posts = allEntries("blog");
  const { lead, rest, pages } = blogFront(posts);
  const series = blogSeries(posts);
  const newest = posts[0];

  return (
    <section className="section" aria-labelledby="blog-title">
      <div className="page">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: blog.label, href: blog.href },
          ]}
        />

        <header className="art-panel blog-masthead">
          <div className="blog-masthead-text">
            <p className="eyebrow">{blogIndex.eyebrow}</p>
            <h1 id="blog-title" className="section-title">
              {blog.title}
            </h1>
            <p className="lede">{typeset(blog.description)}</p>
            {newest ? (
              <p className="blog-masthead-count">
                {blogIndex.count(posts.length, formatDate(newest.frontmatter.date))}
              </p>
            ) : null}
            {/* Under the same guard as the count: an empty blog's own words
                say there is nothing to subscribe to, and offering three
                feeds directly above that sentence was a control leading
                nowhere (`web.md` 6.1). */}
            {newest ? (
              <div className="blog-feeds">
                <p className="blog-feeds-label" id="blog-feeds-label">
                  {blogIndex.feedsLabel}
                </p>
                <ul className="blog-feeds-list" aria-labelledby="blog-feeds-label">
                  {FEED_LINKS.map((feed) => (
                    <li key={feed.href}>
                      <a className="blog-feed" href={feed.href}>
                        {feed.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="blog-masthead-art">
            <BlogMastheadArt />
          </div>
        </header>

        {lead === undefined ? (
          <EmptyState title={blog.empty.title} body={blog.empty.body} />
        ) : (
          <>
            <BlogBrowse />

            <PostLead
              post={lead}
              flag={lead.frontmatter.featured ? blogIndex.featured : blogIndex.newest}
            />

            {rest.length > 0 ? (
              <section className="blog-part" aria-labelledby="blog-more-title">
                <h2 id="blog-more-title" className="blog-part-title">
                  {blogIndex.more}
                </h2>
                <PostGrid posts={rest} />
              </section>
            ) : null}

            <Pagination
              page={1}
              pages={pages}
              hrefFor={(n) => (n === 1 ? blog.href : `/blog/page/${n}/`)}
            />

            {series.length > 0 ? (
              <section className="blog-part" aria-labelledby="blog-series-title">
                <h2 id="blog-series-title" className="blog-part-title">
                  {blogIndex.series.title}
                </h2>
                <p className="blog-part-blurb">{blogIndex.series.blurb}</p>
                <ul className="blog-series-list">
                  {series.map(({ name, parts }) => (
                    <li key={name} className="blog-series">
                      <div className="blog-series-head">
                        <h3 className="blog-series-name">{typeset(name)}</h3>
                        <p className="blog-series-count">{blogIndex.series.parts(parts.length)}</p>
                      </div>
                      <ol className="blog-series-parts">
                        {parts.map((part, index) => (
                          <li key={part.slug} className="blog-series-part">
                            <span className="blog-series-num" aria-hidden="true">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <a href={`/blog/${part.slug}/`}>{typeset(part.frontmatter.title)}</a>
                            <time dateTime={part.frontmatter.date}>
                              {formatDate(part.frontmatter.date)}
                            </time>
                          </li>
                        ))}
                      </ol>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
