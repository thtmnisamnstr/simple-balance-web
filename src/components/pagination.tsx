/**
 * Page N of M, with the neighbors.
 *
 * `rel="prev"` and `rel="next"` are on the links because that is what a
 * crawler reads to understand a paginated series, and it costs two attributes.
 *
 * Page one lives at the collection root (`/blog/`) rather than at
 * `/blog/page/1/`, so there is one canonical URL for it. `/blog/page/1/` is
 * not generated at all — two addresses for one page is the thing canonical
 * tags exist to clean up after, and not creating the second is cheaper.
 */
export function Pagination({
  page,
  pages,
  hrefFor,
}: {
  readonly page: number;
  readonly pages: number;
  readonly hrefFor: (page: number) => string;
}) {
  if (pages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <a className="button button-secondary" href={hrefFor(page - 1)} rel="prev">
          Newer posts
        </a>
      ) : (
        <span />
      )}

      <p className="pagination-position" aria-current="page">
        Page {page} of {pages}
      </p>

      {page < pages ? (
        <a className="button button-secondary" href={hrefFor(page + 1)} rel="next">
          Older posts
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}
