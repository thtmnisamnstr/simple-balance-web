import type { CSSProperties, ReactNode } from "react";

/**
 * The two surfaces a learn article draws on, and nothing about what is drawn.
 *
 * An article's own module (`./<slug>.tsx`) supplies the drawing; these supply
 * the panel, the coordinate system and the accessibility wiring, so twelve
 * drawings made by twelve hands agree on all three.
 */

/** Every hero and thumbnail is drawn on this grid, two units wide to one high. */
const ART_WIDTH = 1200;
const ART_HEIGHT = 600;

/**
 * The art panel: the application's sign-in art, with a drawing on it.
 *
 * Hidden from assistive technology on purpose. A hero says nothing the title
 * under it does not, and a picture described as "a balance scale" next to a
 * heading reading "What is net worth" is the same thing said twice, aloud.
 * What a picture explains belongs in a diagram, which has a caption and a
 * description (`DiagramFrame`, below).
 */
export function ArtFrame({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={className ? `art-panel ${className}` : "art-panel"} aria-hidden="true">
      <svg
        className="art-svg"
        viewBox={`0 0 ${ART_WIDTH} ${ART_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
  );
}

/**
 * The app panel's two orbit rings, the 620 and 410 pixel circles behind its
 * ledger card, centered on whatever a drawing is centered on.
 */
export function Orbits({ cx = ART_WIDTH / 2, cy = ART_HEIGHT / 2 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle className="art-orbit" cx={cx} cy={cy} r={310} />
      <circle className="art-orbit" cx={cx} cy={cy} r={205} />
    </g>
  );
}

/**
 * A diagram: something a reader is meant to understand, drawn in the page's
 * own colors and described in words for anybody who cannot see it.
 *
 * The description is the diagram's accessible name, given as the SVG's own
 * `<title>` and pointed at by `aria-labelledby`, which is the pairing every
 * current screen reader announces. The caption is what everybody reads under
 * it. They differ: the caption says what to notice, the description says
 * what is drawn.
 */
export function DiagramFrame({
  id,
  viewBox,
  caption,
  description,
  children,
}: {
  readonly id: string;
  readonly viewBox: string;
  readonly caption: string;
  readonly description: string;
  readonly children: ReactNode;
}) {
  return (
    <figure className="diagram">
      {/* An `<img>` of the same drawing could not take the page's colors,
          so it would be a light picture in a dark page. Inline SVG with
          `role="img"` is the pattern for a drawing that has to re-theme. */}
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <svg className="dg-svg" viewBox={viewBox} role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{description}</title>
        {children}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/**
 * Inline style for a drawn element: its place in the motion order (`--s`),
 * its color (`--c`, `--c-soft`, always a `var()` from the contract) and, for
 * the odd element that turns about a point it does not surround, its origin.
 * Typed, so a misspelled custom property is a compile error rather than a
 * picture that silently never moves.
 */
export function css(
  style: {
    readonly "--s"?: number;
    readonly "--c"?: `var(--${string})`;
    readonly "--c-soft"?: `var(--${string})`;
    readonly "--dur"?: `${number}s`;
  } & Pick<CSSProperties, "transformOrigin" | "transformBox">,
): CSSProperties {
  return style as CSSProperties;
}
