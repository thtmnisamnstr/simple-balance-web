import { netWorthArt } from "@/content/learn-art/net-worth";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(netWorthArt);

/**
 * A balance: what you own in one pan, what you owe in the other.
 *
 * The beam rests tipped toward what you owe, because the article's own example
 * comes out at minus $3,000, and swings twice before it settles. The ledger
 * card's bars climb, because the article's point is that the direction
 * matters more than where you start.
 */
function Hero() {
  const bars = [52, 68, 61, 84, 96, 118];
  return (
    <>
      <Orbits cx={600} cy={300} />

      {/* The ledger card, tilted as the app tilts its own. */}
      <g transform="translate(96 92) rotate(-4)">
        <g className="mo mo-rise" style={css({ "--s": 0 })}>
          <rect className="art-veil" width="236" height="168" rx="22" />
          {bars.map((height, index) => (
            <rect
              key={height}
              className="art-mint mo mo-grow-y"
              style={css({ "--s": index + 1 })}
              x={26 + index * 33}
              y={146 - height}
              width="22"
              height={height}
              rx="5"
            />
          ))}
        </g>
      </g>

      {/* The stand. */}
      <g className="mo mo-rise">
        <path className="art-line" d="M600 176V472M516 472h168" />
        <circle className="art-ink" cx="600" cy="172" r="14" />
      </g>

      {/* The beam swings about the pivot with both pans hung from it, and
          rests tipped 4° toward what you owe. */}
      <g className="mo mo-rise">
        <g transform="rotate(4 600 172)">
          <g
            className="mo mo-swing"
            style={css({ "--s": 6, transformBox: "view-box", transformOrigin: "600px 172px" })}
          >
            <path className="art-line" d="M380 172h440" />

            {/* Each pan turns back by the beam's tilt about its own hang
                point, so at rest it hangs plumb and its word reads level. */}
            <g transform="rotate(-4 380 172)">
              <path className="art-line-muted" d="M380 172 322 330M380 172 438 330" />
              <path className="art-veil" d="M300 330h160a80 80 0 0 1-160 0z" />
              <g className="mo mo-drop" style={css({ "--s": 3 })}>
                <rect className="art-mint" x="334" y="302" width="92" height="22" rx="8" />
              </g>
              <g className="mo mo-drop" style={css({ "--s": 4 })}>
                <rect className="art-mint" x="344" y="274" width="72" height="22" rx="8" />
              </g>
              <text className="art-text" x="380" y="462" textAnchor="middle">
                {copy.hero.own}
              </text>
            </g>

            <g transform="rotate(-4 820 172)">
              <path className="art-line-muted" d="M820 172 762 330M820 172 878 330" />
              <path className="art-veil" d="M740 330h160a80 80 0 0 1-160 0z" />
              <g className="mo mo-drop" style={css({ "--s": 3.5 })}>
                <rect className="art-ink" x="774" y="302" width="92" height="22" rx="8" />
              </g>
              <g className="mo mo-drop" style={css({ "--s": 4.5 })}>
                <rect className="art-ink" x="779" y="274" width="82" height="22" rx="8" />
              </g>
              <g className="mo mo-drop" style={css({ "--s": 5.5 })}>
                <rect className="art-ink" x="788" y="246" width="64" height="22" rx="8" />
              </g>
              <text className="art-text" x="820" y="462" textAnchor="middle">
                {copy.hero.owe}
              </text>
            </g>
          </g>
        </g>
      </g>
    </>
  );
}

/**
 * Own against owe, on one scale, with the gap between them marked.
 *
 * Horizontal rather than as two columns, so each part's name can sit under
 * it and still be read on a phone.
 */
function OwnOwe() {
  const l = copy.diagrams["net-worth-own-owe"].labels;
  // 17,000 dollars, the larger of the two totals, across 512 units.
  const unit = 512 / 17000;
  const x0 = 24;
  const cash = 8000 * unit;
  const car = 6000 * unit;
  const card = 2000 * unit;
  const loans = 15000 * unit;
  const ownEnd = x0 + cash + car;
  const oweEnd = x0 + card + loans;

  return (
    <>
      <text className="dg-text dg-strong dg-num" x={x0} y="36">
        {l.own}
      </text>
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--c": "var(--green)" })}
        x={x0}
        y="52"
        width={cash - 3}
        height="52"
        rx="8"
      />
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 1, "--c": "var(--series-5)" })}
        x={x0 + cash}
        y="52"
        width={car}
        height="52"
        rx="8"
      />
      <text className="dg-label" x={x0} y="134">
        {l.cash}
      </text>
      <text className="dg-text dg-num" x={x0} y="162">
        {l.cashAmount}
      </text>
      <text className="dg-label" x={x0 + cash} y="134">
        {l.car}
      </text>
      <text className="dg-text dg-num" x={x0 + cash} y="162">
        {l.carAmount}
      </text>

      <text className="dg-text dg-strong dg-num" x={x0} y="228">
        {l.owe}
      </text>
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 2, "--c": "var(--amber)" })}
        x={x0}
        y="244"
        width={card - 3}
        height="52"
        rx="8"
      />
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 3, "--c": "var(--red)" })}
        x={x0 + card}
        y="244"
        width={loans}
        height="52"
        rx="8"
      />
      <text className="dg-label" x={x0} y="326">
        {l.card}
      </text>
      <text className="dg-text dg-num" x={x0} y="354">
        {l.cardAmount}
      </text>
      <text className="dg-label" x={oweEnd} y="326" textAnchor="end">
        {l.loans}
      </text>
      <text className="dg-text dg-num" x={oweEnd} y="354" textAnchor="end">
        {l.loansAmount}
      </text>

      {/* Where what you own runs out, carried down to the bar it falls
          short of, and the shortfall marked above it. */}
      <path
        className="dg-rule dg-dash mo mo-fade"
        style={css({ "--s": 4 })}
        d={`M${ownEnd} 46V302`}
      />
      <g className="mo mo-pop" style={css({ "--s": 5, "--c": "var(--red)" })}>
        <path className="dg-stroke" d={`M${ownEnd + 4} 212H${oweEnd - 2}`} />
        <path className="dg-stroke" d={`M${ownEnd + 4} 202v20M${oweEnd - 2} 202v20`} />
        <text className="dg-text dg-strong dg-num" x={ownEnd + 8} y="192">
          {l.gap}
        </text>
      </g>

      <g className="mo mo-fade" style={css({ "--s": 6 })}>
        <text className="dg-label" x="280" y="398" textAnchor="middle">
          {l.sumLabel}
        </text>
        <text className="dg-text dg-strong dg-num" x="280" y="428" textAnchor="middle">
          {l.sum}
        </text>
      </g>
    </>
  );
}

/**
 * The same number over six months: below zero the whole time and climbing
 * the whole time, which is the article's point that the direction tells you
 * more than the level. Example figures, and the caption says so.
 */
const trendX = (index: number) => 70 + index * 88;
const trendY = (value: number) => 52 + (-value / 3000) * 170;

function Trend() {
  const l = copy.diagrams["net-worth-trend"].labels;
  const values = [-3000, -2600, -2100, -1900, -1300, -800];
  const x = trendX;
  const y = trendY;
  const line = values.map((value, index) => `${index ? "L" : "M"}${x(index)} ${y(value)}`).join("");

  return (
    <>
      <rect
        className="dg-soft"
        style={css({ "--c-soft": "var(--red-soft)" })}
        x="10"
        y="52"
        width="546"
        height="190"
        rx="10"
      />
      <path className="dg-rule" d="M10 52H556" />
      <text className="dg-label" x="10" y="36">
        {l.zero}
      </text>

      <path
        className="dg-stroke mo mo-draw"
        style={css({ "--c": "var(--green)", "--dur": "1.4s" })}
        pathLength="1"
        d={line}
      />
      {values.map((value, index) => (
        <circle
          key={value}
          className="dg-fill mo mo-pop"
          style={css({ "--s": index + 2, "--c": "var(--green)" })}
          cx={x(index)}
          cy={y(value)}
          r="8"
        />
      ))}
      {/* Each value fades in half a step after its point, so a number never
          shows over an empty band before the dot it labels. */}
      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 2.5 })}
        x={x(0)}
        y={y(values[0]!) - 22}
        textAnchor="middle"
      >
        {l.first}
      </text>
      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 7.5 })}
        x={x(5)}
        y={y(values[5]!) - 16}
        textAnchor="middle"
      >
        {l.last}
      </text>

      {l.months.map((month, index) => (
        <text key={month} className="dg-label" x={x(index)} y="276" textAnchor="middle">
          {month}
        </text>
      ))}
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "net-worth-own-owe": {
      viewBox: "0 0 560 440",
      caption: copy.diagrams["net-worth-own-owe"].caption,
      description: copy.diagrams["net-worth-own-owe"].description,
      Body: OwnOwe,
    },
    "net-worth-trend": {
      viewBox: "0 0 560 290",
      caption: copy.diagrams["net-worth-trend"].caption,
      description: copy.diagrams["net-worth-trend"].description,
      Body: Trend,
    },
  },
};
