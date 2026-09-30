import type { MetadataRoute } from "next";
import {
  POSTS_PER_PAGE,
  allEntries,
  blogTags,
  postsByAuthor,
  tagSlug,
} from "@/content/collections";
import { announcedSections } from "@/content/sections";
import { authors } from "@/content/authors";
import { site } from "@/content/home";

const base = `https://${site.domain}`;

/**
 * The sitemap lists what is announced, and nothing else.
 *
 * An unannounced section's pages carry `noindex` and are absent here, which
 * are the two halves of the same decision — `src/content/sections.ts` holds
 * the flag both read.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /*
   * The announced pages of the site itself. A list rather than a walk of
   * `src/app`, and `tests/sitemap.test.ts` is what stops it going stale: it
   * compares this against the routes the build actually emitted, so a new
   * page missing from here fails rather than quietly never being indexed.
   */
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/pricing/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/privacy/`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms/`, changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const announced of announcedSections()) {
    entries.push({ url: `${base}${announced.href}`, changeFrequency: "weekly", priority: 0.8 });
    for (const secondary of secondaryIndexes(announced.key)) {
      entries.push({ url: `${base}${secondary}`, changeFrequency: "weekly", priority: 0.4 });
    }
    for (const entry of allEntries(announced.key)) {
      entries.push({
        url: `${base}${announced.href}${entry.slug}/`,
        ...((entry.frontmatter.updated ?? entry.frontmatter.date)
          ? {
              lastModified: new Date(
                `${entry.frontmatter.updated ?? entry.frontmatter.date}T00:00:00Z`,
              ),
            }
          : {}),
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  }

  return entries;
}

/**
 * A section's index pages other than the section root and its entries.
 *
 * The blog builds five kinds of page the docs do not — an archive, a page per
 * tag, a page per author, and numbered pagination — and they are real pages
 * with real content that a reader can reach. Without this the sitemap listed a
 * blog as its front page and its posts and nothing else, which is not a
 * missing optimisation but a missing third of the section.
 *
 * It was invisible because the blog is unannounced: `tests/sitemap.test.ts`
 * excuses a route under an unannounced section, so the omission only surfaces
 * on the day somebody flips the flag, in a test whose message points at this
 * file. That is the shape of defect a list maintained by hand always has, and
 * the reason it is fixed here rather than at the point of announcing.
 *
 * Page one is deliberately absent. `/blog/page/1/` holds the same content as
 * `/blog/` and its `generateMetadata` already points its canonical there, so
 * listing it would ask a crawler to index a duplicate this site has explicitly
 * disclaimed. Pages two and up are their own content and are listed.
 *
 * Docs returns nothing: it has one index and a flat set of pages, and a
 * section that grows these later gets them by adding a case here.
 */
function secondaryIndexes(key: "blog" | "docs"): readonly string[] {
  if (key !== "blog") return [];
  const out: string[] = ["/blog/archive/"];
  for (const { tag } of blogTags()) out.push(`/blog/tags/${tagSlug(tag)}/`);
  for (const author of Object.keys(authors)) {
    if (postsByAuthor(author).length > 0) out.push(`/blog/authors/${author}/`);
  }
  const pages = Math.ceil(allEntries("blog").length / POSTS_PER_PAGE);
  for (let page = 2; page <= pages; page += 1) out.push(`/blog/page/${page}/`);
  return out;
}

/*
 * Required by `output: "export"`: a metadata route is a route handler, and a
 * static export has to be told it will never be revalidated. Without it the
 * build fails on this file rather than silently omitting it, which is the
 * right failure and an opaque message.
 */
export const dynamic = "force-static";
