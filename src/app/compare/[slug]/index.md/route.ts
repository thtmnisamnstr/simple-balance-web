import { rivals } from "@/content/compare";
import { contract, ourColumn } from "@/components/compare-parts";
import { compareMarkdown } from "@/lib/compare-markdown";

/*
 * The plain-Markdown copy of a comparison page, beside it as `index.md`, the
 * way every docs page and learn guide has one (`content.md` 5.15). Served
 * `noindex` by the header in `netlify.toml` for every `index.md` two
 * segments down, which this path already is.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return rivals.map((rival) => ({ slug: rival.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const rival = rivals.find((entry) => entry.slug === slug);
  if (!rival) return new Response("Not found", { status: 404 });
  return new Response(compareMarkdown(rival, contract, ourColumn), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
