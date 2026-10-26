import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph, pageCard } from "@/app/open-graph";
import { site } from "@/content/home";
import { allEntries, bySection, isEmpty, slugify } from "@/content/collections";
import { section } from "@/content/sections";
import { learnIndex } from "@/content/learn";
import { EmptyState } from "@/components/empty-state";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LearnCard, LearnIntroArt } from "@/components/learn-art/pieces";
import { typeset } from "@/lib/typeset";
import { sectionRobots } from "@/lib/indexing";

const learn = section("learn");

export const metadata: Metadata = {
  title: learn.metaTitle ?? learn.title,
  description: learn.description,
  robots: sectionRobots("learn"),
  alternates: feedAlternates(learn.href),
  openGraph: openGraph({
    title: `${learn.metaTitle ?? learn.title} — ${site.name}`,
    description: learn.description,
    url: learn.href,
    images: pageCard("learn", learn.metaTitle ?? learn.title),
  }),
};

/**
 * The learn index: an introduction on the art panel, a strip of the groups
 * in reading order, and each group's articles as cards with their pictures.
 *
 * It was a list of titles, which is the honest minimum and was correctly
 * called boring. A card per article, with the article's own picture, is what
 * lets a reader find "the one about credit cards" by looking rather than by
 * reading twelve headings. The groups stay in the order
 * `content/learn/_sections.json` gives, numbered, because the order is a
 * reading order for somebody starting from nothing.
 */
export default function LearnIndex() {
  const groups = bySection("learn");
  const entries = allEntries("learn");
  const first = entries[0];
  const minutes = entries.reduce((total, entry) => total + entry.readingMinutes, 0);

  return (
    <section className="section learn-index" aria-labelledby="learn-title">
      <div className="page">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: learn.label, href: learn.href },
          ]}
        />

        <header className="art-panel learn-intro">
          <div className="learn-intro-text">
            <p className="eyebrow">{learn.label}</p>
            <h1 id="learn-title" className="section-title">
              {learn.title}
            </h1>
            <p className="lede">{typeset(learn.description)}</p>
            {first ? (
              <p className="learn-intro-actions">
                <a className="button button-primary" href={`${learn.href}${first.slug}/`}>
                  {learnIndex.startLabel}
                </a>
                <span className="learn-intro-count">
                  {learnIndex.count(entries.length, minutes)}
                </span>
              </p>
            ) : null}
          </div>
          <div className="learn-intro-art">
            <LearnIntroArt slugs={entries.map((entry) => entry.slug)} />
          </div>
        </header>

        {isEmpty("learn") ? (
          <EmptyState title={learn.empty.title} body={learn.empty.body} />
        ) : (
          <>
            <nav className="learn-path" aria-label="Topics">
              <ol>
                {groups.map((group, index) => (
                  <li key={group.section}>
                    <a href={`#${slugify(group.section)}`}>
                      <span className="learn-path-num">{String(index + 1).padStart(2, "0")}</span>
                      {group.section}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {groups.map((group, index) => (
              <section
                key={group.section}
                id={slugify(group.section)}
                className="learn-group"
                aria-labelledby={`g-${slugify(group.section)}`}
              >
                <div className="learn-group-head">
                  <span className="learn-group-num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 id={`g-${slugify(group.section)}`} className="learn-group-title">
                    {group.section}
                  </h2>
                  {learnIndex.groups[group.section] === undefined ? null : (
                    <p className="learn-group-blurb">
                      {typeset(learnIndex.groups[group.section] ?? "")}
                    </p>
                  )}
                </div>
                <ul className="learn-grid">
                  {group.entries.map((entry) => (
                    <li key={entry.slug}>
                      <LearnCard entry={entry} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
