import type { ReactNode } from "react";
import { findYourSubscriptionsArt } from "@/content/learn-art/find-your-subscriptions";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(findYourSubscriptionsArt);

const CX = 545;
const CY = 300;
const RING = 234;
const TILE = 128;
const PITCH = 78;

const round = (value: number) => Math.round(value * 10) / 10;

function onRing(degrees: number) {
  const a = (degrees * Math.PI) / 180;
  return { x: CX + RING * Math.cos(a), y: CY + RING * Math.sin(a), a };
}

/** A clockwise arc of the renewal ring, from one angle to another. */
function arc(from: number, to: number) {
  const start = onRing(from);
  const end = onRing(to);
  return `M${round(start.x)} ${round(start.y)}A${RING} ${RING} 0 0 1 ${round(end.x)} ${round(end.y)}`;
}

/** The chevron at an arc's leading end, pointing the way the ring turns. */
function head(degrees: number) {
  const { x, y, a } = onRing(degrees);
  const back = { x: Math.sin(a), y: -Math.cos(a) };
  const wing = (turn: number) => {
    const b = (turn * Math.PI) / 180;
    return {
      x: x + 46 * (back.x * Math.cos(b) - back.y * Math.sin(b)),
      y: y + 46 * (back.x * Math.sin(b) + back.y * Math.cos(b)),
    };
  };
  const left = wing(-42);
  const right = wing(42);
  return `M${round(left.x)} ${round(left.y)}L${round(x)} ${round(y)}L${round(right.x)} ${round(right.y)}`;
}

function Tile({
  x,
  y,
  s,
  children,
}: {
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly children: ReactNode;
}) {
  return (
    <g className="mo mo-pop" style={css({ "--s": s })}>
      <rect
        className="art-veil"
        x={x - TILE / 2}
        y={y - TILE / 2}
        width={TILE}
        height={TILE}
        rx="30"
      />
      {children}
    </g>
  );
}

/**
 * The renewal ring from the article's glyph, drawn around four app tiles:
 * the subscriptions it is about, going round once and renewing on their own.
 * Then the two decisions the article asks for, one tile kept with a mint
 * check and one crossed out, and a reminder card whose bell rings last,
 * because a reminder before the trial ends is how the list stays short.
 */
function Hero() {
  const left = CX - PITCH;
  const right = CX + PITCH;
  const top = CY - PITCH;
  const bottom = CY + PITCH;
  const play = `M${right - 16} ${top - 26}L${right + 28} ${top}L${right - 16} ${top + 26}z`;

  return (
    <>
      <Orbits cx={CX} cy={CY} />

      {/* The two gaps sit on the diagonals: the top-right one leaves room for
          the kept tile's badge, and the bottom-left one mirrors it so the
          ring stays symmetric. */}
      <g
        className="mo mo-spin"
        style={css({
          "--s": 1,
          "--dur": "1.6s",
          transformBox: "view-box",
          transformOrigin: `${CX}px ${CY}px`,
        })}
      >
        <path className="art-line" d={arc(335, 475)} />
        <path className="art-line" d={head(115)} />
        <path className="art-line" d={arc(155, 295)} />
        <path className="art-line" d={head(295)} />
      </g>

      {/* Music. */}
      <Tile x={left} y={top} s={2}>
        <circle className="art-ink" cx={left - 12} cy={top + 20} r="15" />
        <path className="art-line" d={`M${left + 1} ${top + 20}V${top - 30}c4 16 24 14 22 36`} />
      </Tile>

      {/* Video, the one kept. Filled and stroked, so its corners round. */}
      <Tile x={right} y={top} s={3}>
        <path className="art-ink" d={play} />
        <path className="art-line" d={play} />
      </Tile>

      {/* A gym membership, the one nobody uses. */}
      <Tile x={left} y={bottom} s={4}>
        <path
          className="art-line"
          d={`M${left - 24} ${bottom}h48M${left - 24} ${bottom - 22}v44M${left + 24} ${bottom - 22}v44M${left - 38} ${bottom - 11}v22M${left + 38} ${bottom - 11}v22`}
        />
      </Tile>

      {/* Cloud storage. */}
      <Tile x={right} y={bottom} s={5}>
        <path
          className="art-line"
          d={`M${right - 28} ${bottom + 22}h54a19 19 0 0 0 0-38a26 26 0 0 0-49-4a19 19 0 0 0-5 42z`}
        />
      </Tile>

      {/* Kept: a mint check where an app's badge would be. */}
      <g className="mo mo-pop" style={css({ "--s": 11 })}>
        <circle className="art-mint" cx={right + TILE / 2 - 8} cy={top - TILE / 2 + 8} r="30" />
        <g transform={`translate(${right + TILE / 2 - 8} ${top - TILE / 2 + 8}) scale(2.6)`}>
          <path className="art-glyph-on-mint" d="M-5.2 0.4l3.4 3.4 6.8-7" />
        </g>
      </g>

      {/* Canceled: the tile is struck through, then dims. */}
      <rect
        className="art-base mo mo-fade"
        style={css({ "--s": 15 })}
        x={left - TILE / 2}
        y={bottom - TILE / 2}
        width={TILE}
        height={TILE}
        rx="30"
        opacity="0.5"
      />
      <path
        className="art-line mo mo-draw"
        style={css({ "--s": 13, "--dur": "0.5s" })}
        pathLength="1"
        d={`M${left - 58} ${bottom - 58}L${left + 58} ${bottom + 58}`}
      />

      {/* The reminder arrives the way a notification does, and wiggles once
          the rest has settled. The whole card turns, not just the bell,
          because a bell this small barely moves at thumbnail size. */}
      <g transform="translate(806 100) rotate(-4)">
        <g className="mo mo-slide-r" style={css({ "--s": 7 })}>
          <g className="mo mo-swing" style={css({ "--s": 17, "--dur": "0.7s" })}>
            <rect className="art-veil" width="260" height="128" rx="26" />
            <path className="art-ink" d="M40 82c5-6 6-12 6-24a18 18 0 0 1 36 0c0 12 1 18 6 24z" />
            <circle className="art-ink" cx="64" cy="92" r="9" />
            <circle className="art-mint" cx="92" cy="36" r="13" />
            <rect className="art-ink" x="118" y="44" width="112" height="16" rx="8" />
            <rect className="art-muted" x="118" y="72" width="76" height="16" rx="8" />
          </g>
        </g>
      </g>
    </>
  );
}

/**
 * The survey's two numbers as two bars on one scale, with the second split
 * where the first one ends, so the part people forgot is a piece of a bar
 * rather than a subtraction somebody has to do.
 */
function Guess() {
  const l = copy.diagrams["find-your-subscriptions-guess"].labels;
  // 219 dollars, the larger of the two, across 448 units.
  const unit = 448 / 219;
  const x0 = 24;
  const guessEnd = x0 + 86 * unit;
  const countedEnd = x0 + 219 * unit;

  return (
    <>
      <text className="dg-text dg-strong" x={x0} y="28">
        {l.heading}
      </text>

      <text className="dg-text dg-strong" x={x0} y="94">
        {l.guess}
      </text>
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--c": "var(--blue)" })}
        x={x0}
        y="110"
        width={guessEnd - x0 - 3}
        height="48"
        rx="8"
      />
      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 1 })}
        x={guessEnd + 12}
        y="142"
      >
        {l.guessAmount}
      </text>

      <text className="dg-text dg-strong" x={x0} y="212">
        {l.counted}
      </text>
      {/* One grow for both pieces. Grown apart, the red one floats past a gap
          until the blue one arrives, and a scroll-driven timeline starts a
          row's pieces almost together, so no ordering of steps prevents it. */}
      <g className="mo mo-grow-x" style={css({ "--s": 2 })}>
        <rect
          className="dg-fill"
          style={css({ "--c": "var(--blue)" })}
          x={x0}
          y="228"
          width={guessEnd - x0 - 3}
          height="48"
          rx="8"
        />
        <rect
          className="dg-fill"
          style={css({ "--c": "var(--red)" })}
          x={guessEnd}
          y="228"
          width={countedEnd - guessEnd}
          height="48"
          rx="8"
        />
      </g>
      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 5 })}
        x={countedEnd + 12}
        y="260"
      >
        {l.countedAmount}
      </text>

      <g className="mo mo-pop" style={css({ "--s": 6, "--c": "var(--red)" })}>
        <path className="dg-stroke" d={`M${guessEnd + 4} 302H${countedEnd - 2}`} />
        <path className="dg-stroke" d={`M${guessEnd + 4} 292v20M${countedEnd - 2} 292v20`} />
        <text
          className="dg-text dg-strong dg-num"
          x={(guessEnd + countedEnd) / 2}
          y="344"
          textAnchor="middle"
        >
          {l.gap}
        </text>
      </g>
    </>
  );
}

const colX = (index: number) => 38 + index * 44;

/**
 * A year of months with a charge that comes every month and one that comes
 * once, and the last three months shaded: what a short look at statements
 * sees, and what it misses. No amounts, because the article gives none and
 * the point is where the charges fall, not their size.
 */
function Statements() {
  const l = copy.diagrams["find-your-subscriptions-statements"].labels;
  const yearlyMonth = 4;
  const recentFrom = 9;

  return (
    <>
      <rect
        className="dg-soft mo mo-fade"
        style={css({ "--s": 5, "--c-soft": "var(--blue-soft)" })}
        x={colX(recentFrom) - 22}
        y="40"
        width={44 * 3}
        height="194"
        rx="12"
      />

      <text className="dg-text dg-strong" x="22" y="28">
        {l.monthly}
      </text>
      {l.months.map((month, index) => (
        <rect
          key={month}
          className="dg-fill mo mo-pop"
          style={css({ "--s": index * 0.3, "--c": "var(--red)" })}
          x={colX(index) - 16}
          y="52"
          width="32"
          height="40"
          rx="7"
        />
      ))}

      <text className="dg-text dg-strong" x="22" y="134">
        {l.yearly}
      </text>
      {l.months.map((month, index) => (
        <rect
          key={month}
          className="dg-box"
          x={colX(index) - 16}
          y="150"
          width="32"
          height="40"
          rx="7"
        />
      ))}
      <rect
        className="dg-fill mo mo-drop"
        style={css({ "--s": 4, "--c": "var(--red)" })}
        x={colX(yearlyMonth) - 16}
        y="150"
        width="32"
        height="40"
        rx="7"
      />

      {l.months.map((month, index) => (
        <text key={month} className="dg-label" x={colX(index)} y="220" textAnchor="middle">
          {month.slice(0, 1)}
        </text>
      ))}

      <text
        className="dg-text dg-strong mo mo-fade"
        style={css({ "--s": 5 })}
        x={colX(recentFrom + 1)}
        y="28"
        textAnchor="middle"
      >
        {l.recent}
      </text>

      <g className="mo mo-fade" style={css({ "--s": 6 })}>
        <path className="dg-rule" d="M22 244v14H538v-14" />
        <text className="dg-text dg-strong" x="280" y="294" textAnchor="middle">
          {l.year}
        </text>
      </g>
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "find-your-subscriptions-guess": {
      viewBox: "0 0 560 358",
      caption: copy.diagrams["find-your-subscriptions-guess"].caption,
      description: copy.diagrams["find-your-subscriptions-guess"].description,
      Body: Guess,
    },
    "find-your-subscriptions-statements": {
      viewBox: "0 0 560 308",
      caption: copy.diagrams["find-your-subscriptions-statements"].caption,
      description: copy.diagrams["find-your-subscriptions-statements"].description,
      Body: Statements,
    },
  },
};
