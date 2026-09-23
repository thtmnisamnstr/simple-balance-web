import { authorNames, base, feedPosts, postUrl, rfc3339 } from "@/lib/feed";
import { section } from "@/content/sections";
import { site } from "@/content/home";

export const dynamic = "force-static";

/** JSON Feed 1.1 — https://jsonfeed.org/version/1.1 */
export function GET(): Response {
  const blog = section("blog");

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${site.name} — ${blog.title}`,
    description: blog.description,
    home_page_url: `${base}${blog.href}`,
    feed_url: `${base}/blog/feed.json`,
    language: "en-US",
    items: feedPosts().map((post) => ({
      id: postUrl(post),
      url: postUrl(post),
      title: post.frontmatter.title,
      summary: post.frontmatter.description,
      date_published: rfc3339(post.frontmatter.date!),
      ...(post.frontmatter.updated ? { date_modified: rfc3339(post.frontmatter.updated) } : {}),
      ...(post.frontmatter.tags ? { tags: [...post.frontmatter.tags] } : {}),
      authors: [{ name: authorNames(post) || site.name }],
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "content-type": "application/feed+json; charset=utf-8" },
  });
}
