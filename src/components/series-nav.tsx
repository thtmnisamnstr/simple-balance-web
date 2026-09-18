import type { Entry } from "@/content/collections";

/**
 * The other parts of a multi-part post.
 *
 * Rendered above the body rather than below it: somebody who has landed on
 * part three needs to know there is a part one *before* they read three,
 * not after.
 */
export function SeriesNav({
  series,
  parts,
  current,
}: {
  readonly series: string;
  readonly parts: readonly Entry[];
  readonly current: string;
}) {
  if (parts.length < 2) return null;

  return (
    <nav className="series" aria-labelledby="series-title">
      <p className="series-title" id="series-title">
        Part {parts.findIndex((p) => p.slug === current) + 1} of {parts.length} in{" "}
        <strong>{series}</strong>
      </p>
      <ol className="series-list">
        {parts.map((part) => (
          <li key={part.slug}>
            {part.slug === current ? (
              <span aria-current="page">{part.frontmatter.title}</span>
            ) : (
              <a href={`/blog/${part.slug}/`}>{part.frontmatter.title}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
