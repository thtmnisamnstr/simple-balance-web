import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { site } from "@/content/home";
import { notFound } from "next/navigation";
import { allEntries, paginate, POSTS_PER_PAGE } from "@/content/collections";
import { blogIndex, section } from "@/content/sections";
import { PostGrid } from "@/components/post-card";
import { Pagination } from "@/components/pagination";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BlogBanner, BlogBrowse } from "@/components/blog-header";
import { BlogFront } from "@/components/blog-front";
import { sectionRobots } from "@/lib/indexing";

const blog = section("blog");

/**
 * Every page, page one included.
 *
 * Generating only pages two and up is the tidier design — one canonical URL
 * for the first page, which lives at `/blog/` — and `output: "export"`
 * refuses it: a dynamic route whose `generateStaticParams` returns an empty
 * array fails the build, and with fewer posts than fit on one page that is
 * exactly what "pages two and up" returns.
 *
 * So page one is generated and `generateMetadata` points its canonical at
 * `/blog/`, which is the standard remedy for two URLs holding one page. The
 * alternative — lowering the posts-per-page until a second page exists — is
 * choosing the reader's experience to satisfy the build.
 */
export function generateStaticParams() {
  const pages = Math.max(1, Math.ceil(allEntries("blog").length / POSTS_PER_PAGE));
  return Array.from({ length: pages }, (_, i) => ({ page: String(i + 1) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  // Page one is the same page as `/blog/`, and says so.
  const canonical = Number(page) === 1 ? blog.href : `/blog/page/${page}/`;
  const title = `${blog.title}, page ${page}`;
  return {
    title,
    description: blog.description,
    robots: sectionRobots("blog"),
    alternates: feedAlternates(canonical),
    openGraph: openGraph({
      title: `${title} — ${site.name}`,
      description: blog.description,
      url: canonical,
    }),
  };
}

export default async function BlogPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const number = Number(page);
  if (!Number.isInteger(number) || number < 1) notFound();

  const result = paginate(allEntries("blog"), number);
  if (result.page !== number) notFound();

  // Page one is the front page at a second address, and its canonical says
  // so, so it shows the front page. A plainer list here was a second design
  // of one page that only a reader who typed the URL would ever see.
  if (number === 1) return <BlogFront />;

  return (
    <section className="section" aria-labelledby="blog-title">
      <div className="page">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: blog.label, href: blog.href },
            { name: `Page ${number}`, href: `/blog/page/${number}/` },
          ]}
        />
        <BlogBanner id="blog-title" eyebrow={blog.label} title={blogIndex.older.title} kind="older">
          <p className="blog-banner-facts">{blogIndex.older.position(result.page, result.pages)}</p>
        </BlogBanner>
        <BlogBrowse />
        <PostGrid posts={result.items} level={2} />
        <Pagination
          page={result.page}
          pages={result.pages}
          hrefFor={(n) => (n === 1 ? blog.href : `/blog/page/${n}/`)}
        />
      </div>
    </section>
  );
}
