import type { ReactNode } from "react";

/**
 * One small mark per article, drawn the way the logo is drawn.
 *
 * The logo is a circled dollar sign on a 24-unit grid with a 2-unit round
 * stroke. Each glyph here is on the same grid at the same stroke, so the
 * twelve read as one family with the logo rather than as clip art, and each
 * one is the single object its article is about. They appear on the index,
 * where a reader scanning for "the one about credit cards" finds the card.
 *
 * Original paths, drawn for this site. An icon library would have been
 * faster and would have looked like every other site that uses it.
 */
export const glyphs = {
  // A receipt, torn edge at the bottom.
  "track-your-spending": (
    <>
      <path d="M6 2.5h12v19l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z" />
      <path d="M9.5 8h5M9.5 12h5M9.5 16h3" />
    </>
  ),
  // A price tag: a category is a label you put on money.
  "budget-categories": (
    <>
      <path d="M3 12.6V4a1 1 0 0 1 1-1h8.6l8.7 8.7a1 1 0 0 1 0 1.4l-8.2 8.2a1 1 0 0 1-1.4 0z" />
      <circle cx="8" cy="8" r="1.6" />
    </>
  ),
  // A clipboard with a check.
  "make-a-budget": (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2.5h6V4" />
      <path d="M9 13l2.2 2.2L15.5 11" />
    </>
  ),
  // A whole split into its parts, with nothing left over.
  "zero-based-budgeting": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l6.4 6.4M12 12H3" />
    </>
  ),
  "envelope-budgeting": (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3.5 7.5 12 13.5l8.5-6" />
    </>
  ),
  // A jar, filling to a line.
  "sinking-funds": (
    <>
      <path d="M7 3.5h10" />
      <path d="M8.5 3.5v2.3C6.6 7 5.5 8.8 5.5 11v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-7c0-2.2-1.1-4-3-5.2V3.5" />
      <path d="M8.5 14.5h7" />
    </>
  ),
  // Pay that rises and falls, over a floor that does not.
  "budget-with-irregular-income": (
    <>
      <path d="M3 10.5c1.7-4 3.3-4 5 0s3.3 4 5 0 3.3-4 5 0" />
      <path d="M3 18h18" />
    </>
  ),
  // A statement, checked.
  "balance-your-checking-account": (
    <>
      <path d="M6 2.5h8l4 4v15H6z" />
      <path d="M14 2.5v4h4" />
      <path d="M9 14l2.2 2.2L15 12.4" />
    </>
  ),
  "budget-with-a-credit-card": (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19M6.5 14.5h4" />
    </>
  ),
  // Renewal: the arrows go round.
  "find-your-subscriptions": (
    <>
      <path d="M4.5 11A7.5 7.5 0 0 1 17.6 6.4" />
      <path d="M18 3v4h-4" />
      <path d="M19.5 13a7.5 7.5 0 0 1-13.1 4.6" />
      <path d="M6 21v-4h4" />
    </>
  ),
  // A balance: what you own on one side, what you owe on the other.
  "net-worth": (
    <>
      <path d="M12 4v16M8.5 20h7M5 7.5h14" />
      <path d="M5 7.5 2.5 13M5 7.5 7.5 13M19 7.5 16.5 13M19 7.5 21.5 13" />
      <path d="M2 13h6a3 3 0 0 1-6 0zM16 13h6a3 3 0 0 1-6 0z" />
    </>
  ),
  "emergency-fund": (
    <>
      <path d="M3 12a9 9 0 0 1 18 0z" />
      <path d="M12 12v6.5a2 2 0 0 1-4 0" />
    </>
  ),
} as const satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof glyphs;

export function isGlyphName(name: string): name is GlyphName {
  return name in glyphs;
}

/**
 * A glyph placed on an art panel: drawn on its 24-unit grid, scaled to
 * `size` units square and centered on (`x`, `y`).
 */
export function Glyph({
  name,
  x,
  y,
  size,
}: {
  readonly name: GlyphName;
  readonly x: number;
  readonly y: number;
  readonly size: number;
}) {
  const scale = size / 24;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${scale})`}>
      <g className="art-glyph">{glyphs[name]}</g>
    </g>
  );
}

/**
 * The logo itself, for the index's picture: the circled dollar sign on its
 * badge, in mint on the art panel the way the app puts white on green.
 */
export function LogoBadge({ x, y, size }: { x: number; y: number; size: number }) {
  const scale = size / 24;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2})`}>
      <rect className="art-mint" width={size} height={size} rx={size * 0.28} />
      <g transform={`translate(${size * 0.18} ${size * 0.18}) scale(${scale * 0.64})`}>
        <g className="art-glyph-on-mint">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 18V6" />
        </g>
      </g>
    </g>
  );
}
