import type { MetadataRoute } from "next";
import { site } from "@/content/home";

/**
 * Crawling is allowed everywhere. Indexing is controlled per page.
 *
 * The reflex for an unannounced section is `Disallow: /blog`, and it is
 * exactly wrong: a crawler that is not allowed to fetch the page never sees
 * the `noindex` on it, so a URL somebody links to can still end up indexed —
 * as a bare link with no description, which is the worst of both. Allow the
 * fetch, and let the meta tag do the work it is for.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `https://${site.domain}/sitemap.xml`,
  };
}

/*
 * Required by `output: "export"`: a metadata route is a route handler, and a
 * static export has to be told it will never be revalidated. Without it the
 * build fails on this file rather than silently omitting it, which is the
 * right failure and an opaque message.
 */
export const dynamic = "force-static";
