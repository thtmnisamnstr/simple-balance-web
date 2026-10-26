import { tableOfContents, type Entry } from "@/content/collections";
import { DocTile } from "./glyphs";
import { typeset } from "@/lib/typeset";

const href = (slug: string) => `/docs/${slug}/`;

/**
 * One documentation page on the index: its mark, its title and what it covers.
 *
 * The title is the link a keyboard or a screen reader meets. The tile is a
 * second link to the same place for a pointer, out of the tab order and
 * hidden, as `LearnCard` does it, so the card is one stop with one name and
 * its summary can still be selected.
 */
export function DocCard({ entry }: { readonly entry: Entry }) {
  return (
    <article className="docs-card">
      <a className="docs-card-mark" href={href(entry.slug)} tabIndex={-1} aria-hidden="true">
        <DocTile slug={entry.slug} />
      </a>
      <h3 className="docs-card-title">
        <a href={href(entry.slug)}>{typeset(entry.frontmatter.title)}</a>
      </h3>
      <p className="docs-card-summary">{typeset(entry.frontmatter.description)}</p>
    </article>
  );
}

/**
 * A group's lead page, given the room the group has: a group's only page, or
 * one with steps, with the steps it walks through as links straight to each.
 *
 * The steps are named by heading id in `docsIndex.steps` and their words come
 * from the page itself, so a renamed heading changes here too and a removed
 * one fails the build rather than linking to nowhere.
 */
export function DocFeature({
  entry,
  steps,
  stepsLabel,
}: {
  readonly entry: Entry;
  readonly steps: readonly string[];
  readonly stepsLabel: string;
}) {
  const headings = tableOfContents(entry.body);
  const named = steps.map((id) => {
    const heading = headings.find((candidate) => candidate.id === id);
    if (!heading) throw new Error(`no heading "#${id}" in content/docs/${entry.slug}.md`);
    return heading;
  });

  return (
    <article className="docs-feature">
      <a className="docs-card-mark" href={href(entry.slug)} tabIndex={-1} aria-hidden="true">
        <DocTile slug={entry.slug} />
      </a>
      <h3 className="docs-feature-title">
        <a href={href(entry.slug)}>{typeset(entry.frontmatter.title)}</a>
      </h3>
      <p className="docs-feature-summary">{typeset(entry.frontmatter.description)}</p>
      {named.length > 0 ? (
        <ol className="docs-steps" aria-label={stepsLabel}>
          {named.map((heading, index) => (
            <li key={heading.id}>
              <a href={`${href(entry.slug)}#${heading.id}`}>
                <span className="docs-step-num" aria-hidden="true">
                  {index + 1}
                </span>
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

/**
 * A starting point on the intro's panel: who it is for, then the page.
 *
 * The whole tile answers a pointer through the title link's own box, stretched
 * over it, rather than by wrapping the tile in the link: the link's name stays
 * the page's title instead of the question and the title read together.
 */
export function DocStart({
  entry,
  kicker,
  order,
}: {
  readonly entry: Entry;
  readonly kicker: string;
  readonly order: number;
}) {
  return (
    <div className="docs-start">
      <DocTile slug={entry.slug} tone="mint" order={order} />
      <p className="docs-start-kicker">{typeset(kicker)}</p>
      <p className="docs-start-title">
        <a href={href(entry.slug)}>{typeset(entry.frontmatter.title)}</a>
      </p>
    </div>
  );
}
