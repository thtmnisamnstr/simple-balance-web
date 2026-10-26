import { emergencyFundArt } from "@/content/learn-art/emergency-fund";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(emergencyFundArt);

/** Short rain streaks, slanted a little, as if the wind were behind them. */
function Rain({ drops, step }: { drops: readonly (readonly [number, number])[]; step: number }) {
  return (
    <g className="mo mo-drop" style={css({ "--s": step })}>
      {drops.map(([x, y]) => (
        <path key={`${x} ${y}`} className="art-line-muted" d={`M${x} ${y}l-10 44`} />
      ))}
    </g>
  );
}

const canopy =
  "M330 272A250 176 0 0 1 830 272A62.5 26 0 0 0 705 272A62.5 26 0 0 0 580 272A62.5 26 0 0 0 455 272A62.5 26 0 0 0 330 272Z";

const monthColumns = [0, 1, 2];

/* The canopy opens out of the top of its shaft rather than appearing in the
   air above it. */
const opens = css({
  "--s": 4.6,
  transformBox: "view-box",
  transformOrigin: "580px 272px",
});

const swing = css({
  "--s": 9,
  "--dur": "1.2s",
  transformBox: "view-box",
  transformOrigin: "548px 486px",
});

/**
 * An umbrella open over the money, in the rain.
 *
 * The rain stops at the umbrella's edge, which is the whole article: the fund
 * is what keeps a bad month from soaking everything else. The coin under it
 * is the logo's own circled dollar, and the card is six months with three of
 * them saved: the low end of the usual goal, with room left to grow.
 */
function Hero() {
  return (
    <>
      <Orbits cx={580} cy={300} />

      <Rain
        step={3}
        drops={[
          [214, 92],
          [452, 40],
          [944, 120],
          [268, 330],
        ]}
      />
      <Rain
        step={5.5}
        drops={[
          [312, 176],
          [718, 46],
          [1040, 196],
          [196, 430],
        ]}
      />
      <Rain
        step={7}
        drops={[
          [168, 236],
          [1000, 70],
          [920, 268],
          [300, 470],
        ]}
      />

      {/* The card, tilted as the app tilts its own: six months, three saved. */}
      <g transform="translate(852 366) rotate(-4)">
        <g className="mo mo-rise" style={css({ "--s": 0 })}>
          <rect className="art-veil" width="214" height="146" rx="22" />
          {monthColumns.map((column) => (
            <rect
              key={`saved ${column}`}
              className="art-mint mo mo-pop"
              style={css({ "--s": column + 1 })}
              x={24 + column * 60}
              y="22"
              width="48"
              height="44"
              rx="10"
            />
          ))}
          {monthColumns.map((column) => (
            <rect
              key={`to go ${column}`}
              className="art-veil"
              x={24 + column * 60}
              y="78"
              width="48"
              height="44"
              rx="10"
            />
          ))}
        </g>
      </g>

      {/* The money under it: a short stack, and the logo's circled dollar. */}
      {[
        [356, 470],
        [368, 438],
        [350, 406],
        [362, 374],
      ].map(([x, y], index) => (
        <g key={y} className="mo mo-drop" style={css({ "--s": 0.5 + index * 0.5 })}>
          <rect className="art-mint" x={x} y={y} width="124" height="28" rx="14" />
        </g>
      ))}
      <g className="mo mo-pop" style={css({ "--s": 2.5 })}>
        <circle className="art-mint" cx="704" cy="424" r="78" />
        <g transform="translate(641.6 361.6) scale(5.2)">
          <g className="art-glyph-on-mint">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6" />
          </g>
        </g>
      </g>

      {/* The umbrella, leaning into the wind, opens over both, then rocks on
          its handle and settles. Each part rocks in its own group, because a
          swing's repeat count is inherited and would replay anything inside
          it. */}
      <g transform="rotate(4 548 486)">
        <g className="mo mo-rise" style={css({ "--s": 4 })}>
          <g className="mo mo-swing" style={swing}>
            <path className="art-line" d="M580 272V452a32 32 0 0 1-64 0" />
          </g>
        </g>
        <g className="mo mo-pop" style={opens}>
          <g className="mo mo-swing" style={swing}>
            <path className="art-veil" d={canopy} />
            <path className="art-veil" d="M580 98Q470 150 455 272A62.5 26 0 0 1 580 272Z" />
            <path
              className="art-veil"
              d="M705 272A62.5 26 0 0 1 830 272A250 176 0 0 0 580 96Q690 150 705 272Z"
            />
            <path
              className="art-line-muted"
              d="M580 98Q470 150 455 272M580 98Q690 150 705 272M580 98V272"
            />
            <path className="art-line" d={canopy} />
            <path className="art-line" d="M580 96V68" />
          </g>
        </g>
      </g>
    </>
  );
}

const wouldCover = 63;
const dotColumns = Array.from({ length: 20 }, (_, column) => column);
const dotRows = [0, 1, 2, 3, 4];
const dotX = (column: number) => 33 + column * 26;
const dotY = (row: number) => 89 + row * 26;

/**
 * One hundred adults as one hundred dots, in the order a reader counts: the
 * share who could cover the expense first, then the rest.
 *
 * Dots rather than a bar, because "more than a third" is easier to see as
 * people left over than as a length. The rest are rings as well as amber,
 * because green and amber are nearly the same darkness and a reader who
 * can't tell them apart would see one grid.
 */
function Surprise() {
  const l = copy.diagrams["emergency-fund-surprise"].labels;

  return (
    <>
      <text className="dg-text dg-strong dg-num" x="24" y="30">
        {l.yes}
      </text>
      <text className="dg-label" x="24" y="58">
        {l.yesHow}
      </text>

      {dotColumns.map((column) => (
        <g key={column} className="mo mo-pop" style={css({ "--s": column * 0.3 })}>
          {dotRows.map((row) =>
            column * dotRows.length + row < wouldCover ? (
              <circle
                key={row}
                className="dg-fill"
                style={css({ "--c": "var(--green)" })}
                cx={dotX(column)}
                cy={dotY(row)}
                r="10"
              />
            ) : (
              <circle
                key={row}
                className="dg-stroke"
                style={css({ "--c": "var(--amber)" })}
                cx={dotX(column)}
                cy={dotY(row)}
                r="8"
              />
            ),
          )}
        </g>
      ))}

      <g className="mo mo-fade" style={css({ "--s": 7 })}>
        <text className="dg-text dg-strong" x="536" y="244" textAnchor="end">
          {l.no}
        </text>
        <text className="dg-label" x="536" y="272" textAnchor="end">
          {l.noHow}
        </text>
      </g>
    </>
  );
}

const stepBase = 262;
const stepWidth = 115;
const stepLeft = (index: number) => 20 + index * 135;
const stepHeights = [16, 35, 105, 210] as const;
const stepTop = (index: number) => stepBase - stepHeights[index]!;

/* The steps wait until the baseline is on screen. The build runs on the
   figure's view timeline, which starts as its top edge enters, and at desktop
   width the baseline is two-thirds of the way down: steps starting at 0
   finished growing below the fold, and the reader arrived at a finished
   staircase with nothing left to watch rise. */
const rises = (index: number) => 5.5 + index * 0.5;

/**
 * The fund as stairs: each step higher than the one before, the first one
 * marked as the place to start and the last two as the usual goal.
 *
 * The month steps are to scale, because one, three and six months are
 * multiples of the same number whatever a reader's month costs, and the jump
 * from three to six is the article's point that the goal is a lot of money.
 * $500 is the one step that can't be, so it's drawn as the smallest.
 */
function Ladder() {
  const l = copy.diagrams["emergency-fund-ladder"].labels;

  return (
    <>
      {l.steps.map((amount, index) => {
        const goal = index >= 2;
        return (
          <g key={amount}>
            <rect
              className={`${goal ? "dg-fill" : "dg-soft"} mo mo-grow-y`}
              style={css({
                "--s": rises(index),
                "--c": "var(--green)",
                "--c-soft": "var(--green-soft)",
              })}
              x={stepLeft(index)}
              y={stepTop(index)}
              width={stepWidth}
              height={stepBase - stepTop(index)}
              rx="8"
            />
            {goal ? null : (
              <rect
                className="dg-stroke mo mo-grow-y"
                style={css({ "--s": rises(index), "--c": "var(--green-line-strong)" })}
                x={stepLeft(index) + 2}
                y={stepTop(index) + 2}
                width={stepWidth - 4}
                height={stepBase - stepTop(index) - 4}
                rx="7"
              />
            )}
            <text
              className="dg-text dg-strong dg-num mo mo-fade"
              style={css({ "--s": rises(index) + 1 })}
              x={stepLeft(index) + stepWidth / 2}
              y={stepTop(index) - 14}
              textAnchor="middle"
            >
              {amount}
            </text>
          </g>
        );
      })}

      <path className="dg-rule" d={`M12 ${stepBase}H548`} />

      <g className="mo mo-pop" style={css({ "--s": 7, "--c": "var(--green-line-strong)" })}>
        <path
          className="dg-stroke"
          d={`M${stepLeft(0)} ${stepBase + 14}v10H${stepLeft(0) + stepWidth}v-10`}
        />
        <text
          className="dg-text dg-strong"
          x={stepLeft(0) + stepWidth / 2}
          y={stepBase + 54}
          textAnchor="middle"
        >
          {l.start}
        </text>
      </g>

      <g className="mo mo-pop" style={css({ "--s": 8, "--c": "var(--green)" })}>
        <path
          className="dg-stroke"
          d={`M${stepLeft(2)} ${stepBase + 14}v10H${stepLeft(3) + stepWidth}v-10`}
        />
        <text
          className="dg-text dg-strong"
          x={(stepLeft(2) + stepLeft(3) + stepWidth) / 2}
          y={stepBase + 54}
          textAnchor="middle"
        >
          {l.goal}
        </text>
      </g>
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "emergency-fund-surprise": {
      viewBox: "0 0 560 290",
      caption: copy.diagrams["emergency-fund-surprise"].caption,
      description: copy.diagrams["emergency-fund-surprise"].description,
      Body: Surprise,
    },
    "emergency-fund-ladder": {
      viewBox: "0 0 560 330",
      caption: copy.diagrams["emergency-fund-ladder"].caption,
      description: copy.diagrams["emergency-fund-ladder"].description,
      Body: Ladder,
    },
  },
};
