/**
 * A screenshot of the running application.
 *
 * Two files per shot, one per theme, chosen by the browser through
 * `<picture>` rather than by script. The page has no theme toggle and no
 * client JavaScript deciding anything (`src/styles/brand.css` says why), so a
 * media query is the whole mechanism: the reader in dark mode downloads the
 * dark file and never fetches the light one.
 *
 * `width` and `height` are the real pixel dimensions of the file, and they are
 * required rather than optional. Without them the page reflows as each
 * screenshot arrives, which on a page that is mostly screenshots is the
 * difference between a calm load and a jumping one.
 *
 * `alt` is required and has to describe what the picture *shows*, not what
 * page it is. "Screenshot of the reports page" tells a reader who cannot see
 * it nothing they did not already have from the heading above it.
 * `docs/standards/web.md` 7.3.
 */
export type ShotProps = {
  /** Base name under `public/screenshots`, without the theme or extension. */
  readonly name: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** The hero's shot is the largest contentful paint; everything else waits. */
  readonly priority?: boolean;
  /**
   * How wide this shot renders, so the browser can pick a file.
   *
   * Two layouts and therefore two values, because `sizes` that does not match
   * the CSS is worse than none: the browser trusts it, picks from it, and
   * gets the wrong file with no way for anyone to notice.
   *
   * `full` is a shot that spans the page — 1024 CSS pixels at 1280.
   * `half` is one of a pair, or the hero beside its text — about 530.
   * Below `62rem` both collapse to one column and fill the page.
   */
  readonly span?: "full" | "half";
};

/**
 * The narrow copy `scripts/build-images.mjs` writes beside each original.
 *
 * Two candidates rather than a ladder. The originals are 1600px, which a
 * desktop genuinely uses; 1200 is what stops a 3x phone being handed four and
 * a half times the pixels it can show. A third rung would be twelve more
 * files to buy a saving nothing on this page is waiting for.
 */
const NARROW = 1200;

const SIZES = {
  full: `(max-width: 62rem) 92vw, ${1024}px`,
  half: `(max-width: 62rem) 92vw, ${560}px`,
} as const;

/** `dashboard-light` -> both candidates, widest last. */
function candidates(file: string): string {
  return `/screenshots/${NARROW}/${file}.webp ${NARROW}w, /screenshots/${file}.webp 1600w`;
}

export function Shot({ name, alt, width, height, priority = false, span = "full" }: ShotProps) {
  return (
    <picture className="shot">
      <source
        srcSet={candidates(`${name}-dark`)}
        sizes={SIZES[span]}
        media="(prefers-color-scheme: dark)"
        type="image/webp"
      />
      <img
        src={`/screenshots/${name}-light.webp`}
        srcSet={candidates(`${name}-light`)}
        sizes={SIZES[span]}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        // `fetchPriority` on the hero shot tells the browser this is the LCP
        // before it has laid the page out.
        fetchPriority={priority ? "high" : "auto"}
        className="shot-img"
      />
    </picture>
  );
}
