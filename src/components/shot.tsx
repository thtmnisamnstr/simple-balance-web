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
 * `docs/standards/web.md` 5.4.
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
   * One value per layout, because `sizes` that does not match the CSS is
   * worse than none: the browser trusts it, picks from it, and gets the wrong
   * file with no way for anyone to notice. Each value is the CSS's own
   * arithmetic, the page's 1140px less its gutters, the frame around a shot
   * and a column's share, and `tests/a11y.test.ts` holds each to the
   * rendered page across eleven widths.
   *
   * `full` spans the page, as the hero's does: 1092 from 1140 up.
   * `half` sits beside the claim it proves, in a column from `62rem`: 548.
   * `pair` is one of the two screens under the feature grid: 528.
   * `prose` is one inside an article or a doc, as wide as the text: 746.
   *
   * All of them said "92% of the window below `62rem`", and the pair is side
   * by side from 912px, because its grid fits two 26rem columns wherever
   * there's room rather than at a breakpoint. So a 2x screen between the two
   * fetched the 1600px files for pictures 414px wide.
   */
  readonly span?: "full" | "half" | "pair" | "prose";
};

/**
 * The narrow copy `scripts/build-images.mjs` writes beside each original.
 *
 * Two candidates rather than a ladder. The originals are 1600px, which a
 * desktop genuinely uses; 1200 is what stops a 3x phone being handed four and
 * a half times the pixels it can show. A third rung would be another file
 * for every screenshot, to buy a saving nothing on this page is waiting for.
 */
const NARROW = 1200;

const SIZES = {
  full: "(max-width: 1140px) calc(100vw - 2rem), 1092px",
  half: "(max-width: 62rem) calc(100vw - 3.75rem), (max-width: 1140px) calc(57.5vw - 6.75rem), 548px",
  // 56.99, not 57: at 57rem exactly the two already sit side by side.
  pair: "(max-width: 56.99rem) calc(100vw - 2rem), (max-width: 1140px) calc(50vw - 2.5rem), 528px",
  prose: "(max-width: 48rem) calc(100vw - 2rem), 746px",
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

const OPEN_LABEL = "Open this screenshot full size";

/**
 * A screenshot inside an article or a doc, which opens full size.
 *
 * On a phone a 1600px capture is drawn about 360px wide, the application's
 * own words in it are three pixels tall, and the guides point at details in
 * them: "the $600 one here", a checkbox by name. A reader there can now tap
 * the picture and pinch the file itself.
 *
 * Two links, one per theme, because the page has no script to choose and a
 * reader in dark mode tapping a dark picture should not be handed the light
 * file. The one for the other scheme is `display: none`, so a keyboard or a
 * screen reader meets exactly one. The link is laid over the picture rather
 * than wrapped around it, because `<picture>` may hold only its sources and
 * its image, and an `<a>` around it would be a second picture element's worth
 * of markup to keep in step with this one.
 */
export function ProseShot(props: Omit<ShotProps, "span" | "priority">) {
  return (
    <div className="shot-open">
      <Shot {...props} span="prose" />
      <a className="shot-open-link shot-open-light" href={`/screenshots/${props.name}-light.webp`}>
        <span className="visually-hidden">{OPEN_LABEL}</span>
      </a>
      <a className="shot-open-link shot-open-dark" href={`/screenshots/${props.name}-dark.webp`}>
        <span className="visually-hidden">{OPEN_LABEL}</span>
      </a>
    </div>
  );
}
