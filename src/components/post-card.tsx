import type { Entry } from "@/content/collections";
import { authors } from "@/content/authors";
import { formatDate } from "@/lib/format";
import { TagList } from "@/components/tag-list";

/**
 * One post in a list.
 *
 * A featured card shows its cover image; an ordinary one does not, so the
 * index has a shape rather than being a wall of pictures. The title is the
 * only link — a card where the whole surface is clickable swallows text
 * selection and gives a screen reader one enormous link name.
 */
export function PostCard({
  post,
  featured = false,
}: {
  readonly post: Entry;
  readonly featured?: boolean;
}) {
  const { frontmatter: meta } = post;
  const names = (meta.authors ?? []).map((key) => authors[key].name).join(", ");

  return (
    <li>
      <article className={featured ? "entry entry-featured" : "entry"}>
        {featured && meta.image ? (
          <img className="entry-cover" src={meta.image} alt={meta.imageAlt ?? ""} loading="lazy" />
        ) : null}
        <h3 className="entry-title">
          <a href={`/blog/${post.slug}/`}>{meta.title}</a>
        </h3>
        <p className="entry-meta">
          {meta.date ? <time dateTime={meta.date}>{formatDate(meta.date)}</time> : null}
          <span aria-hidden="true"> · </span>
          {post.readingMinutes} min read
          {names ? (
            <>
              <span aria-hidden="true"> · </span>
              {names}
            </>
          ) : null}
        </p>
        <p className="entry-summary">{meta.description}</p>
        <TagList tags={meta.tags ?? []} />
      </article>
    </li>
  );
}
