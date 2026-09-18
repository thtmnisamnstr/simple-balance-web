/**
 * A post's cover image.
 *
 * Two files per cover, one per theme, chosen by the browser through
 * `<picture>` — the same mechanism `src/components/shot.tsx` uses for the
 * screenshots, and for the same reason `docs/standards/web.md` 5.2 gives: one
 * image, usually the light one, puts a white rectangle in the middle of a dark
 * page. That is exactly what a post used to open with, because the cover was
 * the one picture on this site the site draws itself and the rule had only
 * ever been applied to the ones it photographs.
 *
 * The dark file's name is derived rather than stored. Frontmatter carries one
 * `image`, and a second key naming its dark twin would be a second thing to
 * get wrong in every post — `scripts/build-images.mjs` writes the pair, so the
 * convention is the contract.
 */
export type CoverProps = {
  /** The light file, as frontmatter gives it: `/covers/<slug>.webp`. */
  readonly src: string;
  readonly alt: string;
  /** Covers below the fold wait; the one at the top of a post does not. */
  readonly priority?: boolean;
};

/** `/covers/a.webp` -> `/covers/a-dark.webp`. */
export function darkVariant(src: string): string {
  const dot = src.lastIndexOf(".");
  // No extension is not a path this site produces, but returning the input
  // unchanged degrades to "one image in both themes" rather than to a 404.
  return dot < 0 ? src : `${src.slice(0, dot)}-dark${src.slice(dot)}`;
}

export function Cover({ src, alt, priority = false }: CoverProps) {
  return (
    <picture className="cover">
      <source srcSet={darkVariant(src)} media="(prefers-color-scheme: dark)" type="image/webp" />
      <img
        className="entry-cover"
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
      />
    </picture>
  );
}
