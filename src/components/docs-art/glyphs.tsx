import { css } from "@/components/learn-art/frame";

/**
 * One mark per documentation page, drawn the way the logo and the learn
 * glyphs are: a 24-unit grid, a 2-unit round stroke, one object each.
 *
 * Not in `learn-art/glyphs.tsx`, because `tests/learn.test.ts` holds that
 * record to the learn articles one for one, and a docs page there would be a
 * learn article with no article.
 *
 * Every mark is a list of separate strokes rather than a fragment of shapes,
 * circles and rectangles written out as paths, so each can carry
 * `pathLength="1"` and draw itself in on a card (`mo-draw`). A `<circle>`
 * cannot be drawn that way in every browser, and a fragment cannot be
 * walked to add the attribute.
 *
 * Keyed by slug, and looked up through `docGlyph`, which throws: a page added
 * under `content/docs/` without a mark here fails the build rather than
 * rendering an empty tile, and `tests/docs-features.test.ts` holds the keys
 * and the pages to one set in both directions.
 */
export const docGlyphs = {
  // A flag, planted: the first thing you do.
  "getting-started": ["M5.5 21.5V3", "M5.5 4h12.5l-2.75 4.25L18 12.5H5.5"],
  // A question, asked out loud: a speech bubble with a question mark in it.
  "frequently-asked-questions": [
    "M3.5 4h17v12.5H11l-4.5 4v-4h-3z",
    "M9.5 7.5a2.5 2.5 0 1 1 3.6 2.25c-.7.35-1.1.85-1.1 1.6",
    "M12 14h.01",
  ],
  // Something coming down into a tray.
  "importing-a-statement": [
    "M12 3v11",
    "M7.5 9.5 12 14l4.5-4.5",
    "M3.5 14.5V18a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-3.5",
  ],
  // A transfer: out of one account and into another, one movement.
  "accounts-and-transactions": [
    "M4 8h15",
    "M15.5 4.5 19 8l-3.5 3.5",
    "M20 16H5",
    "M8.5 12.5 5 16l3.5 3.5",
  ],
  // A gauge: how much of the budget has gone.
  budgets: ["M3 16.5a9 9 0 0 1 18 0", "M12 16.5l4.5-5", "M12 16.5h.01"],
  // A plug: an assistant connects to the ledger, it does not live in it.
  "agents-and-mcp": ["M9 2.5v5", "M15 2.5v5", "M6.5 7.5h11V11a5.5 5.5 0 0 1-11 0z", "M12 16.5v5"],
  "your-account-and-plan": [
    "M15.75 8a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 1 1 7.5 0z",
    "M4.5 20.5c.8-3.9 3.9-6.25 7.5-6.25s6.7 2.35 7.5 6.25",
  ],
  // Your own copy is one you keep at home.
  "self-hosting": ["M3 11.5 12 4l9 7.5", "M5.5 9.5v11h13v-11", "M10 20.5V15h4v5.5"],
  // Boxes stacked on boxes: the containers Compose starts.
  "deploying-with-docker-compose": ["M8 3.5h8v7H8z", "M2.5 13.5h8v7h-8z", "M13.5 13.5h8v7h-8z"],
  // A cloud, drawn here rather than any provider's, which would be a logo.
  "deploying-to-oracle-cloud-or-aws": [
    "M7.5 19A4 4 0 0 1 7 11a5.5 5.5 0 0 1 10.9-.9A4.5 4.5 0 0 1 17 19z",
  ],
  // Two sliders, set.
  configuration: [
    "M4 7h6",
    "M14 7h6",
    "M14 7a2 2 0 1 1-4 0 2 2 0 1 1 4 0z",
    "M4 17h2",
    "M10 17h10",
    "M10 17a2 2 0 1 1-4 0 2 2 0 1 1 4 0z",
  ],
  // The database, which is the thing a backup is of.
  backups: [
    "M19 6c0 1.4-3.1 2.5-7 2.5S5 7.4 5 6s3.1-2.5 7-2.5 7 1.1 7 2.5z",
    "M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6",
    "M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5",
  ],
  // A packed box, for moving house.
  "moving-between-cloud-and-self-hosted": [
    "M12 3l8.5 4.5v9L12 21l-8.5-4.5v-9z",
    "M3.5 7.5 12 12l8.5-4.5",
    "M12 12v9",
  ],
  // A compass: which way everything is.
  "finding-your-way-around": [
    "M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0z",
    "M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5z",
  ],
  // The overview's tiles, one big and three small.
  "the-overview": ["M4 4h7v7H4z", "M13 4h7v4h-7z", "M13 10h7v10h-7z", "M4 13h7v7H4z"],
  // A wallet: somewhere money sits.
  accounts: [
    "M4 7.5h14.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11",
    "M16.5 14h.01",
  ],
  // A list of rows: the record of what happened.
  transactions: ["M9 6h11", "M9 12h11", "M9 18h11", "M4.5 6h.01", "M4.5 12h.01", "M4.5 18h.01"],
  // An inbox: waiting for you to look.
  "staged-transactions": [
    "M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5",
    "M6 5h12l2.5 8.5v5A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-5z",
  ],
  // A price tag: what the money was for.
  "categories-and-payees": [
    "M3 12.6V4a1 1 0 0 1 1-1h8.6l8.7 8.7a1 1 0 0 1 0 1.4l-8.2 8.2a1 1 0 0 1-1.4 0z",
    "M9 8a1 1 0 1 1-2 0 1 1 0 1 1 2 0z",
  ],
  // A copy laid over the original.
  templates: ["M8.5 8.5h11v11.5h-11z", "M5 16.5V5a1 1 0 0 1 1-1h10.5"],
  // Round and round: the same payment again.
  "recurring-transactions": [
    "M4 11.5V10a3 3 0 0 1 3-3h12",
    "M16 4l3 3-3 3",
    "M20 12.5V14a3 3 0 0 1-3 3H5",
    "M8 20l-3-3 3-3",
  ],
  // Layers: one change, many rows.
  "changing-many-transactions": [
    "M12 3.5l8.5 4.25L12 12 3.5 7.75z",
    "M3.5 12 12 16.25 20.5 12",
    "M3.5 16.25 12 20.5l8.5-4.25",
  ],
  // Two coins, overlapping, each its own.
  "multiple-currencies": ["M15 9a6 6 0 1 1-12 0 6 6 0 1 1 12 0z", "M10.5 20.6A6 6 0 1 0 20.6 10.5"],
  // A target: the amount a goal is saving toward.
  "planning-ahead": [
    "M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0z",
    "M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 1 1 9 0z",
    "M12 12h.01",
  ],
  // Bars rising from a baseline.
  reports: ["M4 20.5h16", "M7.5 20.5v-6", "M12 20.5V8", "M16.5 20.5v-9.5"],
  // The moon: light or dark, and how things are shown to you.
  preferences: ["M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"],
  // A clock turning back: what happened, and when.
  "activity-history": ["M3.5 12a8.5 8.5 0 1 0 2.5-6", "M3 3.5v4h4", "M12 7.5V12l3 2"],
  // A line meeting a wall: as far as it goes.
  limits: ["M3.5 12h12", "M11.5 8l4 4-4 4", "M20 5v14"],
} as const satisfies Record<string, readonly string[]>;

/**
 * Two marks that are not a page: the logo, which stands for using the product
 * on the intro's drawing, and a server, which stands for running it.
 */
export const marks = {
  logo: [
    "M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0z",
    "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",
    "M12 18V6",
  ],
  server: [
    "M5 3.5h14A1.5 1.5 0 0 1 20.5 5v4a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 9V5A1.5 1.5 0 0 1 5 3.5z",
    "M5 13.5h14a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19v-4A1.5 1.5 0 0 1 5 13.5z",
    "M7.5 7h.01",
    "M7.5 17h.01",
    "M11 7h5.5",
    "M11 17h5.5",
  ],
} as const satisfies Record<string, readonly string[]>;

/** A page's mark. A page with none is a programming error, and fails the build. */
export function docGlyph(slug: string): readonly string[] {
  const paths = (docGlyphs as Readonly<Record<string, readonly string[]>>)[slug];
  if (!paths) throw new Error(`no docs glyph for "${slug}" in src/components/docs-art/glyphs.tsx`);
  return paths;
}

/**
 * A mark placed on an art panel, scaled to `size` units square and centered on
 * (`x`, `y`), as `Glyph` places a learn article's.
 */
export function DocMark({
  paths,
  x,
  y,
  size,
  className = "art-glyph",
}: {
  readonly paths: readonly string[];
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly className?: string;
}) {
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}>
      <g className={className}>
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  );
}

/**
 * A page's mark on its own tile: the app's art panel in miniature, the way
 * the header puts the logo on a green square.
 *
 * Mint strokes on the dark panel for a card on the page, and the logo's own
 * inversion, dark on mint, for the starting points on the intro's panel,
 * where a dark tile would vanish. Every stroke draws itself in (`mo-draw`):
 * once with the intro, and on a card for a rested pointer or once it's in view on a touch screen.
 */
export function DocTile({
  slug,
  tone = "dark",
  order = 0,
}: {
  readonly slug: string;
  readonly tone?: "dark" | "mint";
  /** Its place in the intro's sequence, as `--s`. */
  readonly order?: number;
}) {
  return (
    <span
      className={tone === "mint" ? "docs-tile docs-tile-mint" : "docs-tile"}
      data-glyph={slug}
      aria-hidden="true"
    >
      <svg className="docs-tile-svg" viewBox="0 0 24 24" focusable="false">
        <g className="docs-glyph mo mo-draw" style={css({ "--s": order })}>
          {docGlyph(slug).map((d) => (
            <path key={d} d={d} pathLength={1} />
          ))}
        </g>
      </svg>
    </span>
  );
}
