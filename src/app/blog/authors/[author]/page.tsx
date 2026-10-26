import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { site } from "@/content/home";
import { notFound } from "next/navigation";
import { postsByAuthor } from "@/content/collections";
import { authors, initialsOf, isAuthorKey } from "@/content/authors";
import { blogIndex, section } from "@/content/sections";
import { PostGrid } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BlogBanner, BlogBrowse } from "@/components/blog-header";
import { sectionRobots } from "@/lib/indexing";

const blog = section("blog");

/**
 * A page per author who has actually written something.
 *
 * Not one per entry in the registry: an author page with no posts is a dead
 * end, and the registry is allowed to hold somebody before their first post
 * lands.
 */
export function generateStaticParams() {
  return Object.keys(authors)
    .filter((key) => postsByAuthor(key).length > 0)
    .map((author) => ({ author }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  const { author } = await params;
  if (!isAuthorKey(author)) return {};
  const person = authors[author];
  const path = `/blog/authors/${author}/`;
  const title = `Posts by ${person.name}`;
  const description = `Everything ${person.name} has written here.`;
  return {
    title,
    description,
    robots: sectionRobots("blog"),
    alternates: feedAlternates(path),
    openGraph: openGraph({ title: `${title} — ${site.name}`, description, url: path }),
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ author: string }> }) {
  const { author } = await params;
  if (!isAuthorKey(author)) notFound();

  const person = authors[author];
  const posts = postsByAuthor(author);

  return (
    <section className="section" aria-labelledby="author-title">
      <div className="page">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: blog.label, href: blog.href },
            { name: person.name, href: `/blog/authors/${author}/` },
          ]}
        />

        <BlogBanner
          id="author-title"
          eyebrow={blogIndex.author.eyebrow}
          title={person.name}
          lede={person.title}
          kind="author"
          media={
            person.avatar ? (
              <img
                className="avatar avatar-large"
                src={person.avatar}
                alt=""
                width={72}
                height={72}
              />
            ) : (
              <span className="avatar avatar-large avatar-initials" aria-hidden="true">
                {initialsOf(person.name)}
              </span>
            )
          }
        >
          <p className="blog-banner-facts">
            {blogIndex.author.count(posts.length)}
            {person.url ? (
              <>
                <span aria-hidden="true"> · </span>
                <a href={person.url}>{blogIndex.author.more(person.name)}</a>
              </>
            ) : null}
          </p>
        </BlogBanner>
        <BlogBrowse />
        <PostGrid posts={posts} level={2} />
      </div>
    </section>
  );
}
