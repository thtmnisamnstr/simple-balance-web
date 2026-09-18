import { tagSlug } from "@/content/collections";

/**
 * A post's tags, each linking to its archive.
 *
 * They were plain text until tag pages existed, because a link to a page that
 * does not exist is worse than a label. Now that the pages are generated from
 * the tags actually in use, every one of these resolves by construction.
 */
export function TagList({ tags }: { readonly tags: readonly string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="tag-list" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>
          <a className="tag" href={`/blog/tags/${tagSlug(tag)}/`}>
            {tag}
          </a>
        </li>
      ))}
    </ul>
  );
}
