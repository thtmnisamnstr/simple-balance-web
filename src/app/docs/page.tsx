import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph, pageCard } from "@/app/open-graph";
import { site } from "@/content/home";
import { allEntries, bySection, entryBySlug, isEmpty, slugify } from "@/content/collections";
import { docsIndex, section } from "@/content/sections";
import { EmptyState } from "@/components/empty-state";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DocsSearch } from "@/components/client/docs-search";
import { DocsIntroArt, GroupPicture } from "@/components/docs-art/pictures";
import { DocCard, DocFeature, DocStart } from "@/components/docs-art/cards";
import { typeset } from "@/lib/typeset";
import { sectionRobots } from "@/lib/indexing";

const docs = section("docs");

export const metadata: Metadata = {
  title: docs.metaTitle ?? docs.title,
  description: docs.description,
  robots: sectionRobots("docs"),
  alternates: feedAlternates(docs.href),
  openGraph: openGraph({
    title: `${docs.metaTitle ?? docs.title} — ${site.name}`,
    description: docs.description,
    url: docs.href,
    images: pageCard("docs", docs.metaTitle ?? docs.title),
  }),
};

/** A starting point names a page that exists, or the build says which. */
function startEntry(slug: string) {
  const entry = entryBySlug("docs", slug);
  if (!entry) throw new Error(`docsIndex.starts names "${slug}", which is not a docs page`);
  return entry;
}

/**
 * The documentation index: an introduction on the art panel with search and
 * the three places most people start, then each group of pages as a shelf,
 * its picture and heading beside its pages.
 *
 * It was three headings over three lists of titles, the same weight and the
 * same gray, and a reader could not tell where one group ended. Each group
 * now has its own picture, drawn from the marks of the pages in it, and the
 * last one sits on its own tinted band, because it is for a different reader.
 *
 * No sidebar here, unlike every page under it. The sidebar is a list of these
 * same pages, and beside the index it was the page's own contents printed
 * twice. Search moves into the introduction, where it is the first control
 * on the page rather than the first thing in a narrow column, and works the
 * same way: the page is complete before it hydrates, and it only adds.
 */
export default function DocsIndex() {
  const groups = bySection("docs");
  const pages = allEntries("docs").length;

  return (
    <section className="section" aria-labelledby="docs-title">
      <div className="page">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: docs.label, href: docs.href },
          ]}
        />

        <header className="art-panel docs-intro">
          <div className="docs-intro-text">
            <p className="eyebrow">{docs.label}</p>
            <h1 id="docs-title" className="section-title">
              {docs.title}
            </h1>
            <p className="lede">{typeset(docs.description)}</p>
            <DocsSearch />
            {pages > 0 ? (
              <p className="docs-intro-count">{docsIndex.count(pages, groups.length)}</p>
            ) : null}
          </div>
          <div className="docs-intro-art">
            <DocsIntroArt groups={groups.map((group) => group.section)} />
          </div>
          {pages > 0 ? (
            <nav className="docs-starts" aria-label={docsIndex.startsLabel}>
              <ul>
                {docsIndex.starts.map((start, index) => (
                  <li key={start.slug}>
                    <DocStart
                      entry={startEntry(start.slug)}
                      kicker={start.kicker}
                      order={8 + index}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </header>

        {isEmpty("docs") ? (
          <EmptyState title={docs.empty.title} body={docs.empty.body} />
        ) : (
          groups.map((group, index) => {
            const id = slugify(group.section);
            const words = docsIndex.groups[group.section];
            /*
             * The lead is a feature when it is the group's only page or one
             * with steps, and the rest are cards under it. "Only page" alone
             * dropped Get started's feature the day it gained a second page,
             * and with it the four steps a new reader most needs.
             */
            const [lead, ...rest] = group.entries;
            const featured =
              lead && (group.entries.length === 1 || docsIndex.steps[lead.slug]) ? lead : undefined;
            const cards = featured ? rest : group.entries;
            return (
              <section
                key={group.section}
                id={id}
                className={words?.audience ? "docs-group docs-group-own" : "docs-group"}
                aria-labelledby={`g-${id}`}
              >
                <div className="docs-group-head">
                  <GroupPicture group={group.section} />
                  <div className="docs-group-text">
                    {words?.audience ? (
                      <p className="docs-group-audience">{typeset(words.audience)}</p>
                    ) : null}
                    <h2 id={`g-${id}`} className="docs-group-title">
                      <span className="docs-group-num" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {group.section}
                    </h2>
                    {words ? <p className="docs-group-blurb">{typeset(words.blurb)}</p> : null}
                    <p className="docs-group-count">{docsIndex.pages(group.entries.length)}</p>
                  </div>
                </div>

                {/* One cell of the group's grid, so the cards sit under the
                    feature rather than wrapping under the group's picture. */}
                <div className="docs-group-pages">
                  {featured ? (
                    <DocFeature
                      entry={featured}
                      steps={docsIndex.steps[featured.slug] ?? []}
                      stepsLabel={docsIndex.stepsLabel}
                    />
                  ) : null}
                  {cards.length > 0 ? (
                    <ul className="docs-grid">
                      {cards.map((entry) => (
                        <li key={entry.slug}>
                          <DocCard entry={entry} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            );
          })
        )}
      </div>
    </section>
  );
}
