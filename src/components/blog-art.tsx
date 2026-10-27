import type { ReactNode } from "react";
import { css } from "@/components/learn-art/frame";
import { LogoBadge } from "@/components/learn-art/glyphs";

/**
 * The blog's pictures, drawn on the application's art panel in the learn
 * section's language (`web.md` 5.7): veil cards, mint accents, the logo's
 * round strokes, and nothing else.
 *
 * A file of its own rather than more entries in the learn glyphs, because
 * those are one mark per article and `tests/learn.test.ts` holds that set to
 * exactly the articles. A blog mark there would be a glyph with no article.
 */

/**
 * Marks on the logo's 24-unit grid at its 2-unit stroke, one per kind of
 * page that lists posts, so the header over each says what it is a list of.
 */
const marks = {
  // A price tag, because a topic is a label a post carries.
  tag: (
    <>
      <path d="M2.5 12.5v-8a2 2 0 0 1 2-2h8l9 9a1.5 1.5 0 0 1 0 2.1l-7.9 7.9a1.5 1.5 0 0 1-2.1 0z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  // A pen: somebody wrote these.
  author: (
    <>
      <path d="M15.5 4.5l4 4L9 19H5v-4z" />
      <path d="M13 7l4 4" />
    </>
  ),
  // A calendar, because the archive is the posts by date.
  archive: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M7.5 14.5h9M7.5 17.5h5" />
    </>
  ),
  // Pages under pages: the older posts are further down the stack.
  older: (
    <>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </>
  ),
} as const satisfies Record<string, ReactNode>;

export type BannerKind = keyof typeof marks;

/**
 * A frosted card from the app's panel, made opaque by the panel's own green
 * underneath, so a card stacked on another hides it rather than showing it
 * through: three translucent cards overlapping read as one bright smear.
 */
function Card({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <>
      <rect className="art-base" x={x} y={y} width={w} height={h} rx={22} />
      <rect className="art-veil" x={x} y={y} width={w} height={h} rx={22} />
    </>
  );
}

/**
 * The front page's picture: a stack of posts, the newest one dropping onto
 * it, with a feed's arcs going out from the corner and the logo stamped
 * below.
 *
 * One object, like every learn hero: a pile of things written, which is what
 * a blog is. The top card is a small drawing of the post cards under it,
 * cover band and all, so the picture is of the page it opens. Plays once and
 * is at rest by about 2.2 seconds (`web.md` 8.2).
 */
export function BlogMastheadArt() {
  // The radii of the feed's arcs, and their center, the feed's dot.
  const arcs = [36, 66, 96];
  const fx = 502;
  const fy = 184;
  return (
    // Framed close on the stack rather than on the orbits, which run on past
    // the frame into the panel (`.blog-masthead-svg`), so the drawing is the
    // size of the column and not a third of it.
    <svg className="blog-masthead-svg" viewBox="60 80 520 440" aria-hidden="true" focusable="false">
      <circle className="art-orbit" cx="320" cy="300" r="250" />
      <circle className="art-orbit" cx="320" cy="300" r="160" />

      <g transform="rotate(-11 282 286)">
        <g className="mo mo-rise">
          <Card x={122} y={168} w={320} h={236} />
        </g>
      </g>
      <g transform="rotate(-4 304 300)">
        <g className="mo mo-rise" style={css({ "--s": 1 })}>
          <Card x={144} y={182} w={320} h={236} />
        </g>
      </g>

      <g transform="rotate(5 334 318)">
        <g className="mo mo-drop" style={css({ "--s": 2 })}>
          <Card x={174} y={200} w={320} h={236} />
          <rect className="art-base" x="194" y="220" width="280" height="112" rx="14" />
          <rect
            className="art-mint mo mo-grow-x"
            style={css({ "--s": 4 })}
            x="216"
            y="242"
            width="72"
            height="12"
            rx="6"
          />
          <rect
            className="art-ink mo mo-grow-x"
            style={css({ "--s": 4.5 })}
            x="216"
            y="266"
            width="184"
            height="18"
            rx="9"
          />
          <rect
            className="art-ink mo mo-grow-x"
            style={css({ "--s": 5 })}
            x="216"
            y="294"
            width="124"
            height="18"
            rx="9"
          />
          <rect
            className="art-ink mo mo-grow-x"
            style={css({ "--s": 5.5 })}
            x="194"
            y="352"
            width="216"
            height="18"
            rx="9"
          />
          <rect
            className="art-muted mo mo-grow-x"
            style={css({ "--s": 6 })}
            x="194"
            y="382"
            width="120"
            height="12"
            rx="6"
          />
          <g className="mo mo-pop" style={css({ "--s": 6.5 })}>
            <rect className="art-mint" x="194" y="404" width="68" height="20" rx="10" />
          </g>
          <g className="mo mo-pop" style={css({ "--s": 7 })}>
            <rect className="art-veil" x="270" y="404" width="80" height="20" rx="10" />
          </g>
        </g>
      </g>

      <g className="mo mo-pop" style={css({ "--s": 7.5 })}>
        <circle className="art-mint" cx={fx} cy={fy} r="13" />
      </g>
      {arcs.map((r, index) => (
        <path
          key={r}
          className="art-line-mint mo mo-draw"
          style={css({ "--s": 8 + index })}
          pathLength={1}
          d={`M${fx} ${fy - r}A${r} ${r} 0 0 1 ${fx + r} ${fy}`}
        />
      ))}

      <g className="mo mo-pop" style={css({ "--s": 11 })}>
        <LogoBadge x={168} y={470} size={84} />
      </g>
    </svg>
  );
}

/**
 * The picture over a tag, an author, the archive or an older page: the
 * page's mark on a mint badge between two of the cards from the front page's
 * stack. Smaller and quieter than the front page's, because these headers sit
 * over a list a reader came for, and done in under a second and a half.
 */
export function BlogBannerArt({ kind }: { readonly kind: BannerKind }) {
  const size = 104;
  const cx = 250;
  const cy = 122;
  return (
    <svg className="blog-banner-svg" viewBox="0 0 480 240" aria-hidden="true" focusable="false">
      <circle className="art-orbit" cx={cx} cy={cy} r="150" />
      <circle className="art-orbit" cx={cx} cy={cy} r="96" />

      <g transform="rotate(-7 140 132)">
        <g className="mo mo-slide-l">
          <Card x={60} y={78} w={160} h={108} />
          <rect
            className="art-mint mo mo-grow-x"
            style={css({ "--s": 3 })}
            x="80"
            y="98"
            width="52"
            height="12"
            rx="6"
          />
          <rect
            className="art-ink mo mo-grow-x"
            style={css({ "--s": 3.5 })}
            x="80"
            y="122"
            width="112"
            height="14"
            rx="7"
          />
          <rect
            className="art-muted mo mo-grow-x"
            style={css({ "--s": 4 })}
            x="80"
            y="148"
            width="72"
            height="10"
            rx="5"
          />
        </g>
      </g>
      <g transform="rotate(6 372 112)">
        <g className="mo mo-slide-r" style={css({ "--s": 1 })}>
          <Card x={300} y={62} w={144} h={100} />
          <rect
            className="art-ink mo mo-grow-x"
            style={css({ "--s": 4 })}
            x="318"
            y="84"
            width="96"
            height="14"
            rx="7"
          />
          <rect
            className="art-muted mo mo-grow-x"
            style={css({ "--s": 4.5 })}
            x="318"
            y="110"
            width="64"
            height="10"
            rx="5"
          />
          <rect
            className="art-mint mo mo-grow-x"
            style={css({ "--s": 5 })}
            x="318"
            y="132"
            width="44"
            height="12"
            rx="6"
          />
        </g>
      </g>

      <g className="mo mo-pop" style={css({ "--s": 2 })}>
        <g transform={`translate(${cx - size / 2} ${cy - size / 2})`}>
          <rect className="art-mint" width={size} height={size} rx={size * 0.28} />
          <g transform={`translate(${size * 0.2} ${size * 0.2}) scale(${(size * 0.6) / 24})`}>
            <g className="art-glyph-on-mint">{marks[kind]}</g>
          </g>
        </g>
      </g>
    </svg>
  );
}
