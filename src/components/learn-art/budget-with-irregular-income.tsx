import { budgetWithIrregularIncomeArt } from "@/content/learn-art/budget-with-irregular-income";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(budgetWithIrregularIncomeArt);

/** A smooth line through each point, flat at every peak and trough. */
function wavePath(points: readonly (readonly [number, number])[]) {
  return points
    .map(([x, y], index) => {
      if (index === 0) return `M${x} ${y}`;
      const [px, py] = points[index - 1]!;
      const half = (x - px) / 2;
      return `C${px + half} ${py} ${x - half} ${y} ${x} ${y}`;
    })
    .join("");
}

/**
 * Income as a wave over a floor, and a cushion that catches the extra.
 *
 * The wave touches the floor once, because the floor is the lowest month and
 * not a guess. Everything above it is extra, and the arrow carries it to the
 * cushion card, which bobs once it is full: the whole method is "plan on the
 * floor, save what rises above it".
 */
function Hero() {
  const floorY = 416;
  // x, y and place in the order, bottom coin first.
  const coins = [
    [46, 164, 10],
    [36, 130, 10.7],
    [52, 96, 11.4],
    [40, 62, 12.1],
  ] as const;
  // Starts once the last coin has landed, at the page's 120ms step and the
  // index card's 90ms one alike, and is still by 3.46s.
  const float = css({ "--s": 18, "--dur": "0.65s" });
  // Its lowest point sits on the floor rather than across it: 10 units up is
  // one stroke width, so the mint line rests on the white one.
  const wave = wavePath([
    [170, 300],
    [282, 214],
    [394, floorY - 10],
    [506, 250],
    [618, 324],
    [730, 168],
  ]);
  return (
    <>
      <Orbits cx={600} cy={300} />

      {/* Fades in only once the wave has drawn its top edge. */}
      <path
        className="art-veil mo mo-fade"
        style={css({ "--s": 10 })}
        d={`${wave}L730 ${floorY}L170 ${floorY}Z`}
      />
      <path
        className="art-line mo mo-draw"
        style={css({ "--s": 0, "--dur": "0.7s" })}
        pathLength={1}
        d={`M150 ${floorY}H750`}
      />
      <path
        className="art-line-mint mo mo-draw"
        style={css({ "--s": 2, "--dur": "1.2s" })}
        pathLength={1}
        d={wave}
      />
      {/* The lowest month, where the floor comes from. */}
      <circle
        className="art-ink mo mo-pop"
        style={css({ "--s": 6 })}
        cx="394"
        cy={floorY - 4}
        r="17"
      />
      <text
        className="art-text-muted mo mo-fade"
        style={css({ "--s": 3 })}
        x="394"
        y="460"
        textAnchor="middle"
      >
        {copy.hero.floor}
      </text>

      {/* The extra, carried off the highest month to the cushion. */}
      <path
        className="art-line-muted mo mo-draw"
        style={css({ "--s": 8, "--dur": "0.5s" })}
        pathLength={1}
        d="M748 140Q800 70 852 140"
      />
      <path
        className="art-line-muted mo mo-fade"
        style={css({ "--s": 11 })}
        d="M827 132 852 140 851 114"
      />

      {/* Coins seated tight and a little out of line, so they read as a
          stack of savings rather than the rows of a list. Each shape floats
          on its own, innermost, because `mo-float` sets `--n` and `--dur`
          and every `mo` inside it would inherit both and play twice. */}
      <g transform="translate(796 184) rotate(-4)">
        <g className="mo mo-rise" style={css({ "--s": 7 })}>
          <g className="mo mo-float" style={float}>
            <rect className="art-veil" width="232" height="222" rx="24" />
          </g>
          {coins.map(([x, y, s]) => (
            <g key={y} className="mo mo-drop" style={css({ "--s": s })}>
              <g className="mo mo-float" style={float}>
                <rect className="art-mint" x={x} y={y} width="136" height="30" rx="12" />
              </g>
            </g>
          ))}
        </g>
      </g>
      <text
        className="art-text-muted mo mo-fade"
        style={css({ "--s": 8 })}
        x="927"
        y="460"
        textAnchor="middle"
      >
        {copy.hero.cushion}
      </text>
    </>
  );
}

// The floor diagram's scale: 5,000 dollars, the good month, 200 units tall.
const FLOOR_UNIT = 200 / 5000;
const FLOOR_BASE = 370;
const FLOOR_BAR = 76;
const toY = (dollars: number) => FLOOR_BASE - dollars * FLOOR_UNIT;

function MonthBar({ x, top, s }: { x: number; top: number; s: number }) {
  return (
    <rect
      className="dg-fill mo mo-grow-y"
      style={css({ "--s": s })}
      x={x}
      y={top}
      width={FLOOR_BAR}
      height={FLOOR_BASE - top}
      rx="8"
    />
  );
}

function MonthName({ x, amount, month }: { x: number; amount: string; month: string }) {
  const cx = x + FLOOR_BAR / 2;
  return (
    <>
      <text className="dg-text dg-num" x={cx} y={FLOOR_BASE + 32} textAnchor="middle">
        {amount}
      </text>
      <text className="dg-label" x={cx} y={FLOOR_BASE + 60} textAnchor="middle">
        {month}
      </text>
    </>
  );
}

/** A chart's name, and a sample of its dashed plan line beside the amount. */
function PlanHead({ cx, title, plan }: { cx: number; title: string; plan: string }) {
  return (
    <>
      <text className="dg-text dg-strong" x={cx} y="30" textAnchor="middle">
        {title}
      </text>
      <path
        className="dg-stroke dg-dash"
        style={css({ "--c": "var(--ink)" })}
        d={`M${cx - 94} 53h40`}
      />
      <text className="dg-label dg-num" x={cx - 40} y="61">
        {plan}
      </text>
    </>
  );
}

/** A figure over a bar: what it is, then how much. */
function Callout({
  cx,
  top,
  label,
  amount,
}: {
  cx: number;
  top: number;
  label: string;
  amount: string;
}) {
  return (
    <>
      <text className="dg-label" x={cx} y={top - 46} textAnchor="middle">
        {label}
      </text>
      <text className="dg-text dg-strong dg-num" x={cx} y={top - 18} textAnchor="middle">
        {amount}
      </text>
    </>
  );
}

/**
 * The article's two months, planned two ways.
 *
 * The same pair of bars twice, so the only thing that changes between the
 * two charts is where the plan line sits, and the reader sees the shortfall
 * appear under one line and the cushion appear over the other.
 */
function Floor() {
  const l = copy.diagrams["budget-with-irregular-income-floor"].labels;
  const slowTop = toY(3000);
  const goodTop = toY(5000);
  const averageY = toY(4000);
  const floorY = slowTop;
  const bar = FLOOR_BAR;

  return (
    <>
      {/* Planned at the average. */}
      <PlanHead cx={130} title={l.average} plan={l.averagePlan} />
      <MonthBar x={36} top={slowTop} s={0} />
      <MonthBar x={148} top={goodTop} s={1} />
      <path className="dg-rule" d={`M20 ${FLOOR_BASE}H240`} />
      <MonthName x={36} amount={l.slowAmount} month={l.slow} />
      <MonthName x={148} amount={l.goodAmount} month={l.good} />
      <g
        className="mo mo-pop"
        style={css({ "--s": 3, "--c": "var(--red)", "--c-soft": "var(--red-soft)" })}
      >
        <rect className="dg-soft" x="36" y={averageY} width={bar} height={slowTop - averageY} />
        <rect
          className="dg-stroke dg-dash"
          x="38"
          y={averageY + 2}
          width={bar - 4}
          height={slowTop - averageY - 4}
        />
        <Callout cx={36 + bar / 2} top={averageY} label={l.short} amount={l.shortAmount} />
      </g>
      <path
        className="dg-stroke dg-dash mo mo-slide-l"
        style={css({ "--s": 2, "--c": "var(--ink)" })}
        d={`M20 ${averageY}H240`}
      />

      {/* Planned at the floor. */}
      <PlanHead cx={430} title={l.floor} plan={l.floorPlan} />
      <MonthBar x={336} top={slowTop} s={4} />
      <MonthBar x={448} top={floorY} s={5} />
      <path className="dg-rule" d={`M320 ${FLOOR_BASE}H540`} />
      <MonthName x={336} amount={l.slowAmount} month={l.slow} />
      <MonthName x={448} amount={l.goodAmount} month={l.good} />
      <g className="mo mo-grow-y" style={css({ "--s": 7 })}>
        <rect
          className="dg-soft"
          x="448"
          y={goodTop}
          width={bar}
          height={floorY - goodTop}
          rx="8"
        />
        <rect
          className="dg-stroke"
          x="450"
          y={goodTop + 2}
          width={bar - 4}
          height={floorY - goodTop - 4}
          rx="7"
        />
      </g>
      <g className="mo mo-fade" style={css({ "--s": 8 })}>
        <Callout cx={448 + bar / 2} top={goodTop} label={l.cushion} amount={l.cushionAmount} />
      </g>
      <g className="mo mo-pop" style={css({ "--s": 8 })}>
        <circle className="dg-soft" cx={336 + bar / 2} cy={floorY - 34} r="20" />
        <path className="dg-stroke" d={`M${336 + bar / 2 - 9} ${floorY - 34}l6 6 12-13`} />
      </g>
      <path
        className="dg-stroke dg-dash mo mo-slide-l"
        style={css({ "--s": 6, "--c": "var(--ink)" })}
        d={`M320 ${floorY}H540`}
      />
    </>
  );
}

/**
 * Every payday in an example year, two to a month and a third in two of them.
 *
 * A strip of months rather than a calendar, because the point is the count:
 * two in every column fills the budget line, and what pokes above it is the
 * third paycheck the article says to treat as extra.
 */
function Paydays() {
  const l = copy.diagrams["budget-with-irregular-income-paydays"].labels;
  const third = new Set<string>(l.extraMonths);
  const pitch = 42;
  const left = 34;
  const width = 30;
  const base = 256;
  const pill = 34;
  const line = base - pill * 2 - 6 - 8;
  const extraY = line - 8 - pill;
  const right = left + 11 * pitch + width;

  return (
    <>
      <text className="dg-text dg-strong" x={left} y="32">
        {l.title}
      </text>
      <text className="dg-label" x={left} y="62">
        {l.sum}
      </text>

      {l.months.map((month, index) => {
        const x = left + index * pitch;
        return (
          <g key={month}>
            <g className="mo mo-grow-y" style={css({ "--s": index * 0.4 })}>
              <rect className="dg-fill" x={x} y={base - pill} width={width} height={pill} rx="8" />
              <rect
                className="dg-fill"
                x={x}
                y={base - pill * 2 - 6}
                width={width}
                height={pill}
                rx="8"
              />
            </g>
            <text className="dg-label" x={x + width / 2} y={base + 32} textAnchor="middle">
              {month.slice(0, 1)}
            </text>
            {third.has(month) ? (
              <>
                <g className="mo mo-pop" style={css({ "--s": 6 })}>
                  <rect className="dg-soft" x={x} y={extraY} width={width} height={pill} rx="8" />
                  <rect
                    className="dg-stroke"
                    x={x + 2}
                    y={extraY + 2}
                    width={width - 4}
                    height={pill - 4}
                    rx="7"
                  />
                </g>
                <text
                  className="dg-label mo mo-fade"
                  style={css({ "--s": 7 })}
                  x={x + width / 2}
                  y={extraY - 12}
                  textAnchor="middle"
                >
                  {l.extra}
                </text>
              </>
            ) : null}
          </g>
        );
      })}

      <path
        className="dg-stroke dg-dash mo mo-slide-l"
        style={css({ "--s": 5, "--c": "var(--ink)" })}
        d={`M${left - 14} ${line}H${right + 14}`}
      />
      <text
        className="dg-label mo mo-fade"
        style={css({ "--s": 5 })}
        x={right}
        y={line - 14}
        textAnchor="end"
      >
        {l.budgetOn}
      </text>
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "budget-with-irregular-income-floor": {
      viewBox: "0 0 560 444",
      caption: copy.diagrams["budget-with-irregular-income-floor"].caption,
      description: copy.diagrams["budget-with-irregular-income-floor"].description,
      Body: Floor,
    },
    "budget-with-irregular-income-paydays": {
      viewBox: "0 0 560 304",
      caption: copy.diagrams["budget-with-irregular-income-paydays"].caption,
      description: copy.diagrams["budget-with-irregular-income-paydays"].description,
      Body: Paydays,
    },
  },
};
