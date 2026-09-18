import type { MetadataRoute } from "next";
import { allEntries } from "@/content/collections";
import { announcedSections } from "@/content/sections";
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
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
  ];

  for (const announced of announcedSections()) {
    entries.push({ url: `${base}${announced.href}`, changeFrequency: "weekly", priority: 0.8 });
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

/*
 * Required by `output: "export"`: a metadata route is a route handler, and a
 * static export has to be told it will never be revalidated. Without it the
 * build fails on this file rather than silently omitting it, which is the
 * right failure and an opaque message.
 */
export const dynamic = "force-static";
