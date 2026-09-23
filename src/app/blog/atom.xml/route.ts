import { authorNames, base, feedPosts, feedUpdated, postUrl, rfc3339, xmlEscape } from "@/lib/feed";
import { section } from "@/content/sections";
import { site } from "@/content/home";

export const dynamic = "force-static";

/** Atom 1.0, for readers that prefer it and validators that insist on it. */
export function GET(): Response {
  const blog = section("blog");
  const posts = feedPosts();

  const entries = posts
    .map(
      (post) => `  <entry>
    <title>${xmlEscape(post.frontmatter.title)}</title>
    <link href="${postUrl(post)}" />
    <id>${postUrl(post)}</id>
    <updated>${rfc3339(post.frontmatter.updated ?? post.frontmatter.date!)}</updated>
    <published>${rfc3339(post.frontmatter.date!)}</published>
    <summary>${xmlEscape(post.frontmatter.description)}</summary>
    <author><name>${xmlEscape(authorNames(post) || site.name)}</name></author>
${(post.frontmatter.tags ?? []).map((tag) => `    <category term="${xmlEscape(tag)}" />`).join("\n")}
  </entry>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
  <title>${xmlEscape(`${site.name} — ${blog.title}`)}</title>
  <subtitle>${xmlEscape(blog.description)}</subtitle>
  <link href="${base}/blog/atom.xml" rel="self" />
  <link href="${base}${blog.href}" />
  <id>${base}${blog.href}</id>
  <updated>${feedUpdated(posts)}</updated>
${entries}
</feed>
`;

  return new Response(xml, { headers: { "content-type": "application/atom+xml; charset=utf-8" } });
}
