import type { ReactNode } from "react";

/**
 * An image with a caption, for use inside Markdown.
 *
 * Markdown's own `![alt](src)` has nowhere to put a caption, and the
 * convention of following the image with an italic paragraph produces markup
 * where nothing connects the two. `<figure>`/`<figcaption>` does connect them,
 * which is what a screen reader needs to read the caption as belonging to the
 * image.
 *
 * `alt` and `caption` are different things and both are required when an image
 * carries one: the alt describes the picture for somebody who cannot see it,
 * the caption says something to everybody. A caption repeated as alt text is
 * read twice.
 */
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  readonly src: string;
  readonly alt: string;
  readonly caption?: ReactNode;
  readonly width?: number;
  readonly height?: number;
}) {
  return (
    <figure className="md-figure">
      <img src={src} alt={alt} loading="lazy" decoding="async" width={width} height={height} />
      {caption ? <figcaption className="shot-caption">{caption}</figcaption> : null}
    </figure>
  );
}
