import type { ReactNode } from "react";

/**
 * What an article's art module exports. One module per article, named for its
 * slug, so the twelve can be drawn independently and none can break another.
 */

/** A diagram: its drawing, its grid, and the words that go with it. */
export type DiagramArt = {
  /** Never wider than 560 units, so its text survives a phone (`.dg-svg`). */
  readonly viewBox: string;
  /** From the article's copy module in `src/content/learn-art/`. */
  readonly caption: string;
  readonly description: string;
  readonly Body: () => ReactNode;
};

export type ArticleArt = {
  /** The drawing on the article's art panel, on the 1200 by 600 grid. */
  readonly Hero: () => ReactNode;
  /** Keyed by the name an article's Markdown uses: `<Diagram name="…" />`. */
  readonly diagrams: Readonly<Record<string, DiagramArt>>;
};
