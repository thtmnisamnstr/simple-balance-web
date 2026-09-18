import type { Entry } from "@/content/collections";
import { formatDate } from "@/lib/format";

/** Posts a reader of this one might want next. Ranked in the content layer. */
export function RelatedPosts({ posts }: { readonly posts: readonly Entry[] }) {
  if (posts.length === 0) return null;

  return (
    <aside className="related" aria-labelledby="related-title">
      <h2 id="related-title" className="doc-group-title">
        Related
      </h2>
      <ul className="entry-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="entry">
              <h3 className="entry-title">
                <a href={`/blog/${post.slug}/`}>{post.frontmatter.title}</a>
              </h3>
              <p className="entry-meta">
                <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
              </p>
              <p className="entry-summary">{post.frontmatter.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </aside>
  );
}
