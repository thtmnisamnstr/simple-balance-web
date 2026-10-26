import { seriesOf, type Entry } from "@/content/collections";
import { Cover } from "@/components/cover";
import { authors, initialsOf } from "@/content/authors";
import { blogIndex } from "@/content/sections";
import { formatDate } from "@/lib/format";
import { typeset } from "@/lib/typeset";
import { TagList } from "@/components/tag-list";

type Level = 2 | 3;

/**
 * Where a post sits in its series, as "Part 2 of 2", or nothing.
 *
 * On the card rather than only on the post, because a reader choosing from a
 * grid should not open part two and find out at the top of it that there is
 * a part one.
 */
function seriesLine(post: Entry): { readonly name: string; readonly part: string } | undefined {
  const name = post.frontmatter.series;
  if (!name) return undefined;
  const parts = seriesOf(post);
  if (parts.length < 2) return undefined;
  const index = parts.findIndex((part) => part.slug === post.slug);
  return { name, part: blogIndex.part(index + 1, parts.length) };
}

/** When, how long, and by whom: the line every list of posts gives each one. */
function Meta({ post, className }: { readonly post: Entry; readonly className: string }) {
  const { frontmatter: meta } = post;
  const names = (meta.authors ?? []).map((key) => authors[key].name).join(", ");
  return (
    <p className={className}>
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
  );
}

/**
 * One post in a grid: its cover, its series, its title, what it is about,
 * when and by whom, and its topics.
 *
 * The title is the link a keyboard or a screen reader meets. The cover is a
 * second link to the same place for a pointer, kept out of the tab order and
 * hidden from assistive technology, as the learn cards do it, so the card is
 * one stop with one name and its text can still be selected. A card whose
 * whole surface is a link swallows both.
 *
 * `level` is the heading level the page around it needs. Under a section's
 * own `h2` a card is an `h3`; on a tag or an author page the cards sit
 * straight under the `h1`, and an `h3` there skipped a level (`web.md` 7.1).
 */
function PostCard({ post, level = 3 }: { readonly post: Entry; readonly level?: Level }) {
  const { frontmatter: meta } = post;
  const href = `/blog/${post.slug}/`;
  const series = seriesLine(post);
  const Heading = level === 2 ? "h2" : "h3";

  return (
    <li className="post-card-item">
      <article className="post-card">
        {meta.image ? (
          <a className="post-card-cover" href={href} tabIndex={-1} aria-hidden="true">
            <Cover src={meta.image} alt={meta.imageAlt ?? ""} />
          </a>
        ) : null}
        <div className="post-card-body">
          {series ? (
            <p className="post-card-series">
              {typeset(series.name)}
              <span aria-hidden="true"> · </span>
              {series.part}
            </p>
          ) : null}
          <Heading className="post-card-title">
            <a href={href}>{typeset(meta.title)}</a>
          </Heading>
          <p className="post-card-summary">{typeset(meta.description)}</p>
          <TagList tags={meta.tags ?? []} />
          <Meta post={post} className="post-card-meta" />
        </div>
      </article>
    </li>
  );
}

/**
 * Posts as a grid of cards.
 *
 * The wrapper is a size container, so the grid decides its columns by the
 * width it has rather than the window's: the same cards sit three across on
 * the front page, two across under a post, and one on a phone, and the rules
 * that keep a short last row from leaving holes count in the right number of
 * columns in each.
 */
export function PostGrid({
  posts,
  level = 3,
}: {
  readonly posts: readonly Entry[];
  readonly level?: Level;
}) {
  return (
    <div className="post-grid-wrap">
      <ul className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} level={level} />
        ))}
      </ul>
    </div>
  );
}

/**
 * The front page's lead story: the cover large, beside the title, the
 * summary, a byline and the topics.
 *
 * `flag` says why this post is the one in front, featured or simply the
 * newest, because a reader who sees an older post leading a newer one is
 * owed the reason.
 */
export function PostLead({ post, flag }: { readonly post: Entry; readonly flag: string }) {
  const { frontmatter: meta } = post;
  const href = `/blog/${post.slug}/`;
  const series = seriesLine(post);
  const first = meta.authors?.[0];

  return (
    <article className="blog-lead" aria-labelledby="blog-lead-title">
      {meta.image ? (
        <a className="blog-lead-cover" href={href} tabIndex={-1} aria-hidden="true">
          <Cover src={meta.image} alt={meta.imageAlt ?? ""} priority />
        </a>
      ) : null}
      <div className="blog-lead-body">
        <p className="blog-lead-kicker">
          <span className="blog-lead-flag">{flag}</span>
          {series ? (
            <span className="blog-lead-series">
              {typeset(series.name)}
              <span aria-hidden="true"> · </span>
              {series.part}
            </span>
          ) : null}
        </p>
        <h2 id="blog-lead-title" className="blog-lead-title">
          <a href={href}>{typeset(meta.title)}</a>
        </h2>
        <p className="blog-lead-summary">{typeset(meta.description)}</p>
        <div className="blog-lead-byline">
          {first && authors[first].avatar ? (
            <img className="avatar" src={authors[first].avatar} alt="" width={36} height={36} />
          ) : null}
          {first && !authors[first].avatar ? (
            <span className="avatar avatar-initials" aria-hidden="true">
              {initialsOf(authors[first].name)}
            </span>
          ) : null}
          <Meta post={post} className="blog-lead-meta" />
        </div>
        <TagList tags={meta.tags ?? []} />
      </div>
    </article>
  );
}
