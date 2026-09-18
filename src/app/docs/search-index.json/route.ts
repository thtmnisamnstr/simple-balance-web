import { allEntries } from "@/content/collections";
import type { SearchDoc } from "@/components/client/docs-search";

export const dynamic = "force-static";

/**
 * The search index, built at compile time.
 *
 * The body is flattened to lower-case text with Markdown syntax removed, so a
 * reader searching for "advisory lock" matches prose that was written as
 * `` `advisory lock` ``. Fenced code is kept — a docs search that cannot find
 * an environment variable name is missing the thing people search for most,
 * and `tests/docs-features.test.ts` holds exactly that case after the first
 * version stripped the underscores out of every identifier it indexed.
 */
export function GET(): Response {
  const docs: SearchDoc[] = allEntries("docs").map((entry) => ({
    slug: entry.slug,
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    section: entry.frontmatter.section ?? "Guide",
    text: `${entry.frontmatter.title} ${entry.frontmatter.description} ${entry.body}`
      .toLowerCase()
      // Strip Markdown punctuation but KEEP underscores and hyphens: they
      // are identifier characters, and stripping them turned `AUTH_SECRET`
      // into "authsecret" and `pg_restore` into "pgrestore" — unfindable by
      // anyone typing the name they actually saw.
      .replace(/```[a-z]*|[#*>`|]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  }));

  return new Response(JSON.stringify(docs), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
