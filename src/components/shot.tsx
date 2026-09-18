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
};

export function Shot({ name, alt, width, height, priority = false }: ShotProps) {
  return (
    <picture className="shot">
      <source
        srcSet={`/screenshots/${name}-dark.webp`}
        media="(prefers-color-scheme: dark)"
        type="image/webp"
      />
      <img
        src={`/screenshots/${name}-light.webp`}
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
