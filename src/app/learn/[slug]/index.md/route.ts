import { allEntries, entryBySlug } from "@/content/collections";
import { entryMarkdown } from "@/lib/markdown";

/**
 * The page above, as plain Markdown, at `/learn/<slug>/index.md`: the
 * llms.txt convention's address for a page whose URL ends in a slash.
 * Linked from the page's head as an alternate and from `/llms.txt`, and
 * served `noindex` (`netlify.toml`) so the HTML stays the page that is
 * indexed and cited. `content.md` 5.15.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return allEntries("learn").map((entry) => ({ slug: entry.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const entry = entryBySlug("learn", slug);
  if (!entry) return new Response("Not found", { status: 404 });
  return new Response(entryMarkdown("learn", entry), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
