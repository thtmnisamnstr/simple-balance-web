import { makeABudgetArt } from "@/content/learn-art/make-a-budget";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(makeABudgetArt);

/**
 * A clipboard plan beside a calendar open at the first of the month, and the
 * money the plan is for.
 *
 * The article's whole definition in three objects: a plan, made before the
 * month starts, for your money. Each row on the board is a category with its
 * number, and the checks tick themselves once the numbers are in. The last
 * row is mint because the article's point about saving is that it becomes a
 * line of the plan rather than whatever is left over. The coin is the logo's
 * circled dollar sign, rolled in last.
 */
function Hero() {
  const rows = [
    { y: 232, width: 176, mint: false },
    { y: 328, width: 128, mint: false },
    { y: 424, width: 152, mint: true },
  ];
  return (
    <>
      <Orbits cx={670} cy={322} />

      {/* The calendar card, tilted as the app tilts its own ledger card. */}
      <g transform="translate(214 128) rotate(-5)">
        <g className="mo mo-tilt" style={css({ "--s": 1 })}>
          <rect className="art-veil" width="224" height="216" rx="24" />
          <path className="art-mint" d="M0 24a24 24 0 0 1 24-24h176a24 24 0 0 1 24 24v40H0z" />
          <rect className="art-ink" x="52" y="-18" width="18" height="44" rx="9" />
          <rect className="art-ink" x="154" y="-18" width="18" height="44" rx="9" />
          {/* The first of the month, written at the logo's stroke rather
              than set in type, so it has the board's weight. */}
          <path
            className="art-line mo mo-draw"
            style={css({ "--s": 3 })}
            pathLength="1"
            d="M90 116 118 96V180"
          />
        </g>
      </g>

      {/* The board and its rows rise as one, so nothing on it arrives
          before the thing it sits on. */}
      <g className="mo mo-rise" style={css({ "--s": 0 })}>
        <rect className="art-veil" x="500" y="112" width="340" height="420" rx="36" />
        <rect className="art-line" x="500" y="112" width="340" height="420" rx="36" />
        {rows.map((row, index) => (
          <g key={row.y}>
            <rect
              className="art-line-muted"
              x="540"
              y={row.y - 28}
              width="56"
              height="56"
              rx="14"
            />
            <rect
              className={`${row.mint ? "art-mint" : "art-muted"} mo mo-grow-x`}
              style={css({ "--s": index + 3 })}
              x="628"
              y={row.y - 14}
              width={row.width}
              height="28"
              rx="14"
            />
            <path
              className="art-line-mint mo mo-draw"
              style={css({ "--s": index * 1.5 + 6, "--dur": "0.5s" })}
              pathLength="1"
              d={`M550 ${row.y - 2}l14 15 30-36`}
            />
          </g>
        ))}
      </g>

      {/* The clip drops onto the board once it has landed. */}
      <g className="mo mo-drop" style={css({ "--s": 2 })}>
        <rect className="art-ink" x="600" y="82" width="140" height="58" rx="20" />
        <circle className="art-base" cx="670" cy="104" r="12" />
      </g>

      {/* The last beat: the coin rolls in from the open side and stops
          against the board's corner, so it never fades in over the board.
          The shared spin turns the way a coin rolling right turns; the two
          mirrors reverse it for one rolling left, and cancel at rest. */}
      <g className="mo mo-slide-r" style={css({ "--s": 9, "--dur": "0.8s" })}>
        <g transform="translate(1744 0) scale(-1 1)">
          <g className="mo mo-spin" style={css({ "--s": 9, "--dur": "0.8s" })}>
            <g transform="translate(1744 0) scale(-1 1)">
              <circle className="art-mint" cx="872" cy="468" r="68" />
              <g transform="translate(804 400) scale(5.667)">
                <g className="art-glyph-on-mint">
                  <circle cx="12" cy="12" r="8.4" />
                  <path d="M15 8.8h-4.2a1.6 1.6 0 1 0 0 3.2h2.4a1.6 1.6 0 1 1 0 3.2H9" />
                  <path d="M12 16.8V7.2" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </>
  );
}

/**
 * Two budgets before and after a weekly check-in: one ran over, and the
 * difference comes out of another.
 *
 * Before and after, stacked, because the thing to see is that both budget
 * lines moved and the total did not, and that is a comparison. On one shared
 * dollar scale, so a longer bar is more money, and each row names its budget
 * so the sum can be checked rather than judged by eye. Spending is green and
 * turns red past the budget, as the Budgets page draws it and as the next
 * diagram does, so the overspend turning green reads as it being covered.
 * The moved $30 is blue, the one thing here that is budget rather than
 * spending. The after half arrives with the arrow, so the result never shows
 * before the move that makes it.
 */
function Move() {
  const l = copy.diagrams["make-a-budget-move"].labels;
  // 3 units to the dollar: eating out's $130, the longest bar, is 390.
  const unit = 3;
  const x0 = 24;
  const at = (dollars: number) => x0 + dollars * unit;
  const spent = css({ "--c": "var(--green)" });
  const ink = css({ "--c": "var(--ink)" });
  // The budget's end, drawn as a line across its bar.
  const limit = (dollars: number, y: number) => `M${at(dollars)} ${y - 6}V${y + 38}`;

  return (
    <>
      <text className="dg-text dg-strong" x={x0} y="28">
        {l.before}
      </text>
      <rect className="dg-fill" style={spent} x="236" y="11" width="22" height="22" rx="5" />
      <text className="dg-label" x="266" y="29">
        {l.spent}
      </text>
      <rect
        className="dg-fill"
        style={css({ "--c": "var(--red)" })}
        x="350"
        y="11"
        width="22"
        height="22"
        rx="5"
      />
      <text className="dg-label" x="380" y="29">
        {l.overLegend}
      </text>
      <path className="dg-stroke" style={ink} d="M456 8V36" />
      <text className="dg-label" x="468" y="29">
        {l.budget}
      </text>

      <text className="dg-text" x={x0} y="74">
        {l.eatingOut} <tspan className="dg-label">{l.eatingOutBudgetBefore}</tspan>
      </text>
      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 1 })}
        x="536"
        y="74"
        textAnchor="end"
      >
        {l.over}
      </text>
      <rect className="dg-fill" style={spent} x={x0} y="88" width={100 * unit} height="32" rx="8" />
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 1, "--c": "var(--red)" })}
        x={at(100) + 3}
        y="88"
        width={30 * unit - 3}
        height="32"
        rx="8"
      />
      <path className="dg-stroke" style={ink} d={limit(100, 88)} />

      <text className="dg-text" x={x0} y="164">
        {l.fun} <tspan className="dg-label">{l.funBudgetBefore}</tspan>
      </text>
      <text className="dg-text dg-strong dg-num" x="536" y="164" textAnchor="end">
        {l.funLeftBefore}
      </text>
      <rect className="dg-track" x={x0} y="178" width={80 * unit} height="32" rx="8" />
      <rect className="dg-fill" style={spent} x={x0} y="178" width={20 * unit} height="32" rx="8" />
      <rect
        className="dg-stroke dg-dash mo mo-fade"
        style={css({ "--s": 2, "--c": "var(--blue)" })}
        x={at(50) + 2}
        y="180"
        width={30 * unit - 6}
        height="28"
        rx="6"
      />
      <path className="dg-stroke" style={ink} d={limit(80, 178)} />

      {/* The $30 travels from fun's unspent end down and across, landing on
          the end of eating out's new, longer bar. */}
      <g style={css({ "--c": "var(--blue)" })}>
        <path
          className="dg-stroke mo mo-draw"
          style={css({ "--s": 3 })}
          pathLength="1"
          d={`M${at(65)} 220C${at(65)} 268 ${at(115)} 300 ${at(115)} 364`}
        />
        <g className="mo mo-fade" style={css({ "--s": 4 })}>
          <path className="dg-stroke" d={`M${at(115) - 9} 354l9 11 9-11`} />
          <text className="dg-text dg-strong dg-num" x={at(115) + 24} y="276">
            {l.move}
          </text>
        </g>
      </g>

      <g className="mo mo-fade" style={css({ "--s": 4 })}>
        <text className="dg-text dg-strong" x={x0} y="308">
          {l.after}
        </text>

        <text className="dg-text" x={x0} y="362">
          {l.eatingOut} <tspan className="dg-label">{l.eatingOutBudgetAfter}</tspan>
        </text>
        <text
          className="dg-text dg-strong dg-num mo mo-fade"
          style={css({ "--s": 6 })}
          x="536"
          y="362"
          textAnchor="end"
        >
          {l.eatingOutLeftAfter}
        </text>
        <rect
          className="dg-fill"
          style={spent}
          x={x0}
          y="376"
          width={100 * unit}
          height="32"
          rx="8"
        />
        <rect
          className="dg-fill mo mo-grow-x"
          style={css({ "--s": 5, "--c": "var(--green)" })}
          x={at(100) + 3}
          y="376"
          width={30 * unit - 3}
          height="32"
          rx="8"
        />
        {/* Each budget line slides to its new place: eating out's out to
            $130, fun's back to $50. */}
        <path
          className="dg-stroke mo mo-slide-l"
          style={css({ "--s": 5, "--c": "var(--ink)" })}
          d={limit(130, 376)}
        />

        <text className="dg-text" x={x0} y="452">
          {l.fun} <tspan className="dg-label">{l.funBudgetAfter}</tspan>
        </text>
        <text
          className="dg-text dg-strong dg-num mo mo-fade"
          style={css({ "--s": 6 })}
          x="536"
          y="452"
          textAnchor="end"
        >
          {l.funLeftAfter}
        </text>
        <rect className="dg-track" x={x0} y="466" width={50 * unit} height="32" rx="8" />
        <rect
          className="dg-fill"
          style={spent}
          x={x0}
          y="466"
          width={20 * unit}
          height="32"
          rx="8"
        />
        <rect
          className="dg-rule dg-dash mo mo-fade"
          style={css({ "--s": 6 })}
          x={at(50) + 6}
          y="468"
          width={30 * unit - 8}
          height="28"
          rx="6"
        />
        <path
          className="dg-stroke mo mo-slide-r"
          style={css({ "--s": 5, "--c": "var(--ink)" })}
          d={limit(50, 466)}
        />
      </g>
    </>
  );
}

/**
 * Two budget rows read the way the app's Budgets page reads them, with each
 * of its words pointed at the part of the row it means.
 *
 * Drawn as the app draws them: the state's badge, then a bar that fills
 * green with spending, turns red once it's over, and stops full at the
 * budget, so the bar is the glance and the Remaining figure says how far
 * over. The strip on top is the month, filled to today, because "so far" is
 * a statement about time and the bars are about money.
 */
function Row() {
  const l = copy.diagrams["make-a-budget-row"].labels;
  const x0 = 24;
  // Every row's bar is the same length, as the app's are, so the two read
  // alike although one budget is four times the other.
  const barX = 136;
  const barEnd = 536;
  const blue = css({ "--c": "var(--blue)", "--c-soft": "var(--blue-soft)" });
  const rows = [
    {
      key: "groceries",
      top: 150,
      name: l.groceries,
      badge: l.soFar,
      badgeWidth: 96,
      tone: blue,
      budget: l.groceriesBudget,
      spent: l.groceriesSpent,
      remaining: l.groceriesRemaining,
      ratio: 260 / 400,
    },
    {
      key: "eating-out",
      top: 310,
      name: l.eatingOut,
      badge: l.over,
      badgeWidth: 76,
      tone: css({ "--c": "var(--red)", "--c-soft": "var(--red-soft)" }),
      budget: l.eatingOutBudget,
      spent: l.eatingOutSpent,
      remaining: l.eatingOutRemaining,
      ratio: 130 / 100,
    },
  ];

  return (
    <>
      <text className="dg-text dg-strong" x={x0} y="30">
        {l.month}
      </text>
      <rect className="dg-track" x={x0} y="48" width="512" height="12" rx="6" />
      <rect
        className="dg-fill mo mo-grow-x"
        style={blue}
        x={x0}
        y="48"
        width="256"
        height="12"
        rx="6"
      />
      <g className="mo mo-pop" style={css({ "--s": 1, "--c": "var(--blue)" })}>
        <circle className="dg-fill" cx={x0 + 256} cy="54" r="12" />
        <text className="dg-label" x={x0 + 256} y="94" textAnchor="middle">
          {l.today}
        </text>
      </g>

      {rows.map((row, index) => {
        const s = 2 + index * 3;
        const over = row.ratio > 1;
        const spentEnd = barX + (barEnd - barX) * Math.min(row.ratio, 1);
        return (
          <g key={row.key}>
            <text className="dg-text dg-strong" x={x0} y={row.top}>
              {row.name}
            </text>
            <text className="dg-text dg-num" x={barEnd} y={row.top} textAnchor="end">
              <tspan className="dg-label">{l.budget}</tspan> <tspan>{row.budget}</tspan>
            </text>

            {/* The badge comes last, since its word is the verdict on the
                bar beside it. In its own tone, as the app sets its badges. */}
            <g className="mo mo-pop" style={{ ...row.tone, ...css({ "--s": s + 3 }) }}>
              <rect
                className="dg-soft"
                x={x0}
                y={row.top + 20}
                width={row.badgeWidth}
                height="32"
                rx="16"
              />
              <text
                className="dg-label dg-strong dg-fill"
                x={x0 + row.badgeWidth / 2}
                y={row.top + 43}
                textAnchor="middle"
              >
                {row.badge}
              </text>
            </g>

            <rect
              className="dg-track"
              x={barX}
              y={row.top + 16}
              width={barEnd - barX}
              height="40"
              rx="10"
            />
            <rect
              className="dg-fill mo mo-grow-x"
              style={css({ "--s": s, "--c": over ? "var(--red)" : "var(--green)" })}
              x={barX}
              y={row.top + 16}
              width={spentEnd - barX}
              height="40"
              rx="10"
            />
            <path
              className="dg-stroke"
              style={css({ "--c": "var(--ink)" })}
              d={`M${barEnd} ${row.top + 8}V${row.top + 64}`}
            />

            <text
              className="dg-text dg-num mo mo-fade"
              style={css({ "--s": s })}
              x={barX}
              y={row.top + 104}
            >
              <tspan className="dg-label">{l.spent}</tspan>{" "}
              <tspan className="dg-strong">{row.spent}</tspan>
            </text>
            <g className="mo mo-fade" style={css({ "--s": s + 2, "--c": "var(--muted)" })}>
              {/* A bracket over the empty part of the bar, which is what is
                  left. An overspent bar has no empty part to point at, so
                  its figure stands alone, red as the app sets it. */}
              {over ? null : (
                <path
                  className="dg-stroke"
                  d={`M${spentEnd + 3} ${row.top + 68}v8H${barEnd - 3}v-8`}
                />
              )}
              <text className="dg-text dg-num" x={barEnd} y={row.top + 104} textAnchor="end">
                <tspan className="dg-label">{l.remaining}</tspan>{" "}
                <tspan
                  className={over ? "dg-strong dg-fill" : "dg-strong"}
                  style={over ? css({ "--c": "var(--red)" }) : undefined}
                >
                  {row.remaining}
                </tspan>
              </text>
            </g>
          </g>
        );
      })}
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "make-a-budget-move": {
      viewBox: "0 0 560 512",
      caption: copy.diagrams["make-a-budget-move"].caption,
      description: copy.diagrams["make-a-budget-move"].description,
      Body: Move,
    },
    "make-a-budget-row": {
      viewBox: "0 0 560 430",
      caption: copy.diagrams["make-a-budget-row"].caption,
      description: copy.diagrams["make-a-budget-row"].description,
      Body: Row,
    },
  },
};
