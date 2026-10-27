import type { Entry } from "@/content/collections";
import { ArtFrame, DiagramFrame, css } from "./frame";
import { Glyph, LogoBadge, isGlyphName } from "./glyphs";
import { learnArt } from "./registry";
import type { ArticleArt, DiagramArt } from "./types";
import { typeset } from "@/lib/typeset";

function artFor(slug: string): ArticleArt {
  const art = learnArt[slug];
  // A missing drawing is a programming error, and failing the build is how it
  // is found before a reader finds an empty panel.
  if (!art) throw new Error(`no learn art for "${slug}" in src/components/learn-art/registry.ts`);
  return art;
}

/** The picture at the top of an article. Plays once when the page opens. */
export function LearnHero({ slug }: { readonly slug: string }) {
  const { Hero } = artFor(slug);
  return (
    <ArtFrame className="learn-hero">
      <Hero />
    </ArtFrame>
  );
}

/** The same picture on a card: played when pointed at, or built by scroll on a touch screen. */
export function LearnThumb({ slug }: { readonly slug: string }) {
  const { Hero } = artFor(slug);
  return (
    <ArtFrame>
      <Hero />
    </ArtFrame>
  );
}

/**
 * Every diagram, by the name an article's Markdown gives it.
 *
 * One flat map, so `<Diagram name="…" />` does not have to say which article
 * drew it, and `tests/learn.test.ts` holds the names unique across all of
 * them.
 */
export const allDiagrams: ReadonlyMap<string, DiagramArt> = new Map(
  Object.values(learnArt).flatMap((art) => Object.entries(art.diagrams)),
);

/** `<Diagram name="net-worth-own-owe" />`, inside an article's Markdown. */
export function Diagram({ name }: { readonly name: string }) {
  const diagram = allDiagrams.get(name);
  if (!diagram) throw new Error(`no diagram named "${name}" in src/components/learn-art`);
  const { viewBox, caption, description, Body } = diagram;
  return (
    <DiagramFrame id={`dg-${name}`} viewBox={viewBox} caption={caption} description={description}>
      <Body />
    </DiagramFrame>
  );
}

/**
 * One article on the index or under "Keep reading": its picture, its title
 * and what it is about.
 *
 * The title is the link a keyboard or a screen reader meets. The picture is a
 * second link to the same place for a pointer, kept out of the tab order and
 * hidden from assistive technology, so the card is one stop and one name
 * rather than two, and its text can still be selected.
 */
export function LearnCard({
  entry,
  rel,
}: {
  readonly entry: Entry;
  /** Under "Keep reading", which side of this article the other one is on. */
  readonly rel?: "prev" | "next";
}) {
  const href = `/learn/${entry.slug}/`;
  return (
    <article className="learn-card">
      <a className="learn-card-art" href={href} tabIndex={-1} aria-hidden="true">
        <LearnThumb slug={entry.slug} />
      </a>
      <div className="learn-card-body">
        <h3 className="learn-card-title">
          <a href={href} rel={rel}>
            {typeset(entry.frontmatter.title)}
          </a>
        </h3>
        <p className="learn-card-meta">{entry.readingMinutes} min read</p>
        <p className="learn-card-summary">{typeset(entry.frontmatter.description)}</p>
      </div>
    </article>
  );
}

/**
 * The index's own picture: the logo at the center of the app's orbits, with
 * every article's glyph around it in reading order, arriving one at a time.
 */
export function LearnIntroArt({ slugs }: { readonly slugs: readonly string[] }) {
  const cx = 320;
  const cy = 300;
  const glyphSlugs = slugs.filter(isGlyphName);
  return (
    <svg className="learn-intro-svg" viewBox="0 0 640 600" aria-hidden="true" focusable="false">
      <circle className="art-orbit" cx={cx} cy={cy} r={250} />
      <circle className="art-orbit" cx={cx} cy={cy} r={160} />
      <g className="mo mo-pop">
        <LogoBadge x={cx} y={cy} size={128} />
      </g>
      {(["outer", "inner"] as const).map((ring) => (
        // Each ring is its own group, centered on the logo, so the homepage
        // can turn the two rings in opposite directions while a pointer
        // rests on its closing panel (`.intro-ring` in site.css). Each token
        // turns back the other way about its own center, so its glyph stays
        // upright as it travels.
        <g
          key={ring}
          className={
            ring === "outer" ? "intro-ring intro-ring-outer" : "intro-ring intro-ring-inner"
          }
          style={css({ transformOrigin: `${cx}px ${cy}px` })}
        >
          {glyphSlugs.map((slug, index) => {
            // Half on each ring, alternating, starting at twelve o'clock and
            // going clockwise, so reading order is the order they arrive in.
            if ((index % 2 === 0 ? "outer" : "inner") !== ring) return null;
            const radius = ring === "outer" ? 250 : 160;
            const angle = (index / glyphSlugs.length) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            return (
              <g
                key={slug}
                className="intro-token"
                style={css({ transformOrigin: `${x}px ${y}px` })}
              >
                <g className="mo mo-pop" style={css({ "--s": index + 2 })}>
                  <circle className="art-veil" cx={x} cy={y} r={38} />
                  <Glyph name={slug} x={x} y={y} size={40} />
                </g>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
