/**
 * A post's tags.
 *
 * Rendered as plain text rather than links, because there are no tag pages
 * yet. A link to a page that does not exist is worse than a label, and adding
 * the pages later changes this component and nothing else.
 */
export function TagList({ tags }: { readonly tags: readonly string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="tag-list" aria-label="Tags">
      {tags.map((tag) => (
        <li className="tag" key={tag}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
