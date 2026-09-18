import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { notFound } from "next/navigation";
import { postsByAuthor } from "@/content/collections";
import { authors, initialsOf, isAuthorKey } from "@/content/authors";
import { section } from "@/content/sections";
import { PostCard } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
  return {
    title: `Posts by ${person.name}`,
    description: `Everything ${person.name} has written here.`,
    robots: blog.announced ? undefined : { index: false, follow: false },
    alternates: feedAlternates(`/blog/authors/${author}/`),
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ author: string }> }) {
  const { author } = await params;
  if (!isAuthorKey(author)) notFound();

  const person = authors[author];
  const posts = postsByAuthor(author);

  return (
    <section className="section" aria-labelledby="author-title">
      <div className="page page-narrow">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: blog.label, href: blog.href },
            { name: person.name, href: `/blog/authors/${author}/` },
          ]}
        />

        <div className="author-header">
          {person.avatar ? (
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
          )}
          <div>
            <h1 id="author-title" className="section-title">
              {person.name}
            </h1>
            {person.title ? <p className="byline-title">{person.title}</p> : null}
            {person.url ? (
              <p className="entry-meta">
                <a href={person.url}>More about {person.name}</a>
              </p>
            ) : null}
          </div>
        </div>

        <ul className="entry-list">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ul>
      </div>
    </section>
  );
}
