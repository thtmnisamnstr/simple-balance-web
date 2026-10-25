import type { Entry } from "@/content/collections";

/**
 * The page before and after this one, in a hand-ordered collection.
 *
 * Shared by the docs and the learn articles, which both read as a sequence
 * somebody chose. The blog has its own, `post-pager.tsx`, because its order is
 * the calendar and its labels say so.
 */
export function DocPager({
  previous,
  next,
  base,
  label,
}: {
  readonly previous: Entry | undefined;
  readonly next: Entry | undefined;
  /** The section's own address, `/docs/` or `/learn/`. */
  readonly base: string;
  /** The navigation landmark's name, which has to differ from the site's own. */
  readonly label: string;
}) {
  if (!previous && !next) return null;

  return (
    <nav className="doc-pager" aria-label={label}>
      {previous ? (
        <a className="doc-pager-link" href={`${base}${previous.slug}/`} rel="prev">
          <span className="doc-pager-label">Previous</span>
          <span className="doc-pager-title">{previous.frontmatter.title}</span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a className="doc-pager-link doc-pager-next" href={`${base}${next.slug}/`} rel="next">
          <span className="doc-pager-label">Next</span>
          <span className="doc-pager-title">{next.frontmatter.title}</span>
        </a>
      ) : null}
    </nav>
  );
}
