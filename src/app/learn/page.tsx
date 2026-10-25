import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { site } from "@/content/home";
import { bySection, isEmpty, slugify } from "@/content/collections";
import { section } from "@/content/sections";
import { EmptyState } from "@/components/empty-state";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdBanner } from "@/components/ad-banner";

const learn = section("learn");

export const metadata: Metadata = {
  title: learn.title,
  description: learn.description,
  robots: learn.announced ? undefined : { index: false, follow: false },
  alternates: feedAlternates(learn.href),
  openGraph: openGraph({
    title: `${learn.title} — ${site.name}`,
    description: learn.description,
    url: learn.href,
  }),
};

/**
 * The learn index: every article, in the groups `content/learn/_sections.json`
 * orders.
 *
 * Grouped like the docs and laid out like the blog. The groups are a reading
 * order for somebody starting from nothing, which is why they are not dates,
 * and there are few enough articles that a sidebar beside them would be a
 * second copy of this list.
 */
export default function LearnIndex() {
  const groups = bySection("learn");

  return (
    <section className="section" aria-labelledby="learn-title">
      <div className="page page-narrow">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: learn.label, href: learn.href },
          ]}
        />
        <h1 id="learn-title" className="section-title">
          {learn.title}
        </h1>
        <p className="lede">{learn.description}</p>

        {isEmpty("learn") ? (
          <EmptyState title={learn.empty.title} body={learn.empty.body} />
        ) : (
          groups.map((group) => (
            <section key={group.section} aria-labelledby={`g-${slugify(group.section)}`}>
              <h2 id={`g-${slugify(group.section)}`} className="doc-group-title">
                {group.section}
              </h2>
              <ul className="entry-list">
                {group.entries.map((entry) => (
                  <li key={entry.slug}>
                    <article className="entry">
                      <h3 className="entry-title">
                        <a href={`${learn.href}${entry.slug}/`}>{entry.frontmatter.title}</a>
                      </h3>
                      <p className="entry-meta">{entry.readingMinutes} min read</p>
                      <p className="entry-summary">{entry.frontmatter.description}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <AdBanner />
      </div>
    </section>
  );
}
