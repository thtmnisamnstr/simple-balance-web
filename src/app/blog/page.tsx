import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { site } from "@/content/home";
import { section } from "@/content/sections";
import { BlogFront } from "@/components/blog-front";
import { sectionRobots } from "@/lib/indexing";

const blog = section("blog");

export const metadata: Metadata = {
  title: blog.title,
  description: blog.description,
  // An unannounced section is not indexed. One flag decides it, and the
  // sitemap reads the same one — `src/content/sections.ts`.
  robots: sectionRobots("blog"),
  alternates: feedAlternates(blog.href),
  openGraph: openGraph({
    title: `${blog.title} — ${site.name}`,
    description: blog.description,
    url: blog.href,
  }),
};

export default function BlogIndex() {
  return <BlogFront />;
}
