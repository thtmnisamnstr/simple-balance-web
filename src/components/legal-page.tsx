import { createElement, Fragment } from "react";
import { legalUpdated, type Section } from "@/content/legal";
import { formatDate } from "@/lib/format";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Contents } from "@/components/contents";
import { slugify } from "@/content/collections";

/**
 * A legal document.
 *
 * One component for both, because a privacy policy and a terms page are the
 * same problem: long, sectioned, read by somebody looking for one paragraph.
 * That is why the contents list is not optional here the way it is on a post —
 * nobody reads these top to bottom, they arrive looking for "deleting your
 * account".
 *
 * `**bold**` is honoured inside a paragraph, because these documents need
 * emphasis on the sentences that matter — "we never see or store your card
 * details" — and running them through the whole MDX pipeline for one
 * inline mark would be heavier than the mark is worth.
 */
function Emphasised({ text }: { readonly text: string }) {
  // Odd indices are what sat between the asterisks.
  const nodes = text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, index) => (index % 2 === 1 ? createElement("strong", null, part) : part));

  /*
   * Passed as variadic children rather than as an array, which is what lets
   * this have no keys at all. An array would need them, and the only honest
   * key here is the index — the parts are positional and two paragraphs can
   * legitimately contain the same word twice. `react/no-array-index-key` is
   * right to refuse that, so the fix is to stop producing an array.
   */
  return createElement(Fragment, null, ...nodes);
}

export function LegalPage({
  title,
  description,
  intro,
  sections,
  href,
}: {
  readonly title: string;
  readonly description: string;
  readonly intro: readonly string[];
  readonly sections: readonly Section[];
  readonly href: string;
}) {
  const contents = sections.map((section) => ({
    depth: 2 as const,
    text: section.heading,
    id: slugify(section.heading),
  }));

  return (
    <article className="section">
      <div className="page page-narrow">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: title, href },
          ]}
        />
        <h1 className="entry-heading">{title}</h1>
        <p className="lede">{description}</p>
        <p className="entry-meta">
          Last updated <time dateTime={legalUpdated}>{formatDate(legalUpdated)}</time>
        </p>

        <div className="prose-body">
          {intro.map((paragraph) => (
            <p key={paragraph}>
              <Emphasised text={paragraph} />
            </p>
          ))}
        </div>

        <Contents items={contents} />

        <div className="prose-body">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 id={slugify(section.heading)}>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>
                  <Emphasised text={paragraph} />
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="entry-meta legal-note">
          This page describes what this service does. It is not legal advice.
        </p>
      </div>
    </article>
  );
}
