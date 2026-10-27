import type { ReactNode } from "react";
import { blogTags, tagSlug } from "@/content/collections";
import { blogIndex } from "@/content/sections";
import { typeset } from "@/lib/typeset";
import { BlogBannerArt, type BannerKind } from "@/components/blog-art";

/**
 * The header over a page that lists posts but is not the front page: a tag,
 * an author, the archive, or an older page.
 *
 * The front page's art panel at a third of its height, so every list of
 * posts opens the same way and a reader who followed a topic from the front
 * page can tell they are still in the blog. The words sit on the panel's dark
 * base, and the light goes behind the picture, for the reason the learn
 * index found: on the brightest glow the lede measured 3.6:1.
 */
export function BlogBanner({
  id,
  eyebrow,
  title,
  lede,
  kind,
  media,
  children,
}: {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lede?: string | undefined;
  readonly kind: BannerKind;
  /** Something to show before the words: an author's photo or initials. */
  readonly media?: ReactNode;
  /** The facts under the lede: a count, a page number, a link. */
  readonly children?: ReactNode;
}) {
  return (
    <header className="art-panel blog-banner">
      <div className="blog-banner-text">
        {media}
        <p className="eyebrow">{eyebrow}</p>
        <h1 id={id} className="section-title">
          {typeset(title)}
        </h1>
        {lede ? <p className="lede">{typeset(lede)}</p> : null}
        {children}
      </div>
      <div className="blog-banner-art">
        <BlogBannerArt kind={kind} />
      </div>
    </header>
  );
}

/**
 * Every topic, with how many posts carry it, and the archive: the ways into
 * the blog other than its newest page.
 *
 * On the front page and over every list, with the one being looked at
 * marked, so changing topic is one step from anywhere rather than a trip
 * back to the front. The count is drawn as a badge and said as words, because
 * "bookkeeping 2" read aloud is a topic with a number in its name.
 */
export function BlogBrowse({ current }: { readonly current?: string }) {
  const tags = blogTags();
  if (tags.length === 0) return null;
  return (
    <nav className="blog-browse" aria-label={blogIndex.browseLabel}>
      <p className="blog-browse-label" aria-hidden="true">
        {blogIndex.topicsLabel}
      </p>
      <ul className="blog-browse-list">
        {tags.map(({ tag, count }) => {
          const slug = tagSlug(tag);
          return (
            <li key={slug}>
              <a
                className="blog-browse-link"
                href={`/blog/tags/${slug}/`}
                aria-current={current === slug ? "page" : undefined}
              >
                {tag}
                <span className="blog-browse-count" aria-hidden="true">
                  {count}
                </span>
                <span className="visually-hidden">, {blogIndex.tag.count(count)}</span>
              </a>
            </li>
          );
        })}
        <li className="blog-browse-archive">
          <a
            className="blog-browse-link"
            href="/blog/archive/"
            aria-current={current === "archive" ? "page" : undefined}
          >
            {blogIndex.archiveLabel}
          </a>
        </li>
      </ul>
    </nav>
  );
}
