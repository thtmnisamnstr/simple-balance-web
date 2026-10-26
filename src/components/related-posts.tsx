import type { Entry } from "@/content/collections";
import { PostGrid } from "@/components/post-card";

/**
 * Posts a reader of this one might want next. Ranked in the content layer.
 *
 * The front page's cards rather than a list of titles of its own, so a post
 * that a reader met as a card on the index is the same card here. The grid
 * counts its columns from the column it is given, which under a post is two.
 */
export function RelatedPosts({ posts }: { readonly posts: readonly Entry[] }) {
  if (posts.length === 0) return null;

  return (
    <aside className="related" aria-labelledby="related-title">
      <h2 id="related-title" className="blog-part-title">
        Related
      </h2>
      <PostGrid posts={posts} />
    </aside>
  );
}
