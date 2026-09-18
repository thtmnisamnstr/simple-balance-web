import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { notFound } from "next/navigation";
import { allEntries, paginate, POSTS_PER_PAGE } from "@/content/collections";
import { section } from "@/content/sections";
import { PostCard } from "@/components/post-card";
import { Pagination } from "@/components/pagination";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
  return {
    title: `${blog.title}, page ${page}`,
    description: blog.description,
    robots: blog.announced ? undefined : { index: false, follow: false },
    // Page one is the same page as `/blog/`, and says so.
    alternates: feedAlternates(Number(page) === 1 ? blog.href : `/blog/page/${page}/`),
  };
}

export default async function BlogPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const number = Number(page);
  if (!Number.isInteger(number) || number < 1) notFound();

  const result = paginate(allEntries("blog"), number);
  if (result.page !== number) notFound();

  return (
    <section className="section" aria-labelledby="blog-title">
      <div className="page page-narrow">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: blog.label, href: blog.href },
            { name: `Page ${number}`, href: `/blog/page/${number}/` },
          ]}
        />
        <h1 id="blog-title" className="section-title">
          {blog.title}
        </h1>
        <ul className="entry-list">
          {result.items.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ul>
        <Pagination
          page={result.page}
          pages={result.pages}
          hrefFor={(n) => (n === 1 ? blog.href : `/blog/page/${n}/`)}
        />
      </div>
    </section>
  );
}
