import { authorNames, base, feedPosts, postUrl, rfc822, xmlEscape } from "@/lib/feed";
import { section } from "@/content/sections";
import { site } from "@/content/home";

export const dynamic = "force-static";

/**
 * RSS 2.0.
 *
 * `<description>` carries the summary rather than the full body: a feed that
 * ships the whole post is a second copy of the site to keep correct, and the
 * point of the link is that the post is at the other end of it.
 *
 * `<language>` is `en-us` rather than `en`, because the copy is American and
 * a reader choosing a dictionary or a voice is otherwise told only "English".
 * Lowercase is how the RSS 2.0 specification's list of codes writes it; the
 * JSON and Atom feeds carry `en-US`, the casing theirs use. A language tag is
 * case-insensitive, so the three agree.
 */
export function GET(): Response {
  const blog = section("blog");
  const posts = feedPosts();

  const items = posts
    .map(
      (post) => `    <item>
      <title>${xmlEscape(post.frontmatter.title)}</title>
      <link>${postUrl(post)}</link>
      <guid isPermaLink="true">${postUrl(post)}</guid>
      <description>${xmlEscape(post.frontmatter.description)}</description>
      <pubDate>${rfc822(post.frontmatter.date!)}</pubDate>
${(post.frontmatter.tags ?? []).map((tag) => `      <category>${xmlEscape(tag)}</category>`).join("\n")}
      <author>${xmlEscape(`${site.contactEmail} (${authorNames(post)})`)}</author>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${site.name} — ${blog.title}`)}</title>
    <link>${base}${blog.href}</link>
    <description>${xmlEscape(blog.description)}</description>
    <language>en-us</language>
    <atom:link href="${base}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
