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
 *
 * **Every crawler is welcome, the AI ones included, and that is a decision.**
 * One `*` group admits the search crawlers, the answer engines' search and
 * citation crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot), the
 * ones that fetch a page because somebody asked about it (ChatGPT-User,
 * Claude-User), and the training crawlers (GPTBot, ClaudeBot, CCBot,
 * Google-Extended, Applebot-Extended). The site wants to be found and cited,
 * and blocking Google-Extended would also keep it out of the Gemini app's
 * answers. No named groups: a group per bot is a list that goes stale, and a
 * named group replaces `*` for that bot, so one written to add a rule quietly
 * drops every other. `tests/sections.test.tsx` holds the file to one group
 * with no `Disallow`. `docs/roadmap.md` records the decision.
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
