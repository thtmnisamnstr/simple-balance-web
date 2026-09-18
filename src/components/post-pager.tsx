import type { Entry } from "@/content/collections";

/** Previous and next post, in publication order. */
export function PostPager({
  previous,
  next,
}: {
  readonly previous: Entry | undefined;
  readonly next: Entry | undefined;
}) {
  if (!previous && !next) return null;

  return (
    <nav className="doc-pager" aria-label="More posts">
      {previous ? (
        <a className="doc-pager-link" href={`/blog/${previous.slug}/`} rel="prev">
          <span className="doc-pager-label">Earlier</span>
          <span className="doc-pager-title">{previous.frontmatter.title}</span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a className="doc-pager-link doc-pager-next" href={`/blog/${next.slug}/`} rel="next">
          <span className="doc-pager-label">Later</span>
          <span className="doc-pager-title">{next.frontmatter.title}</span>
        </a>
      ) : null}
    </nav>
  );
}
