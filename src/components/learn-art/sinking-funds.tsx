import { sinkingFundsArt } from "@/content/learn-art/sinking-funds";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(sinkingFundsArt);

const JAR =
  "M516 172V190C516 214 436 214 436 254V500A44 44 0 0 0 480 544H720A44 44 0 0 0 764 500V254C764 214 684 214 684 190V172";

/**
 * A savings jar filling to a line, with the month it is needed by.
 *
 * Six mint layers drop in, one a month, and stop exactly at the line marked
 * with the bill, because that is the whole method: a known amount, by a known
 * date, in equal pieces. The calendar is checked once the jar is full, and the
 * coin over the slot is the logo's own mark, waiting for next time.
 */
function Hero() {
  // Each layer a little off true, the way a real stack of coins sits.
  const layers = [
    { y: 486, x: 466, w: 268 },
    { y: 440, x: 476, w: 254 },
    { y: 394, x: 462, w: 270 },
    { y: 348, x: 472, w: 260 },
    { y: 302, x: 464, w: 266 },
    { y: 256, x: 474, w: 254 },
  ];
  const dashes = Array.from({ length: 11 }, (_, k) => 396 + k * 38);

  return (
    <>
      <Orbits cx={552} cy={330} />

      {/* Drawn about x 600 and moved left as one, so the jar and the
          calendar beside it balance on the panel rather than the jar alone. */}
      <g transform="translate(-48 0)">
        <g transform="translate(832 196) rotate(-5)">
          <g className="mo mo-tilt" style={css({ "--s": 1 })}>
            <rect className="art-veil" width="232" height="204" rx="22" />
            <path className="art-line" d="M70 -16V18M162 -16V18" />
            <text className="art-text" x="116" y="78" textAnchor="middle">
              {copy.hero.due}
            </text>
            <path className="art-line-muted" d="M30 104H202" />
            <g className="mo mo-pop" style={css({ "--s": 11 })}>
              <path className="art-line-mint" d="M80 152l24 22 50-50" />
            </g>
          </g>
        </g>

        <g className="mo mo-rise">
          <path className="art-veil" d={`${JAR}Z`} />
          <path className="art-line" d={JAR} />
          <rect className="art-ink" x="494" y="128" width="212" height="44" rx="16" />
          <rect className="art-base" x="556" y="144" width="88" height="12" rx="6" />
        </g>

        {layers.map((layer, index) => (
          <g key={layer.y} className="mo mo-drop" style={css({ "--s": index + 2 })}>
            <rect
              className="art-mint"
              x={layer.x}
              y={layer.y}
              width={layer.w}
              height="38"
              rx="12"
            />
          </g>
        ))}

        <g className="mo mo-fade" style={css({ "--s": 1 })}>
          <path className="art-line-muted" d={dashes.map((x) => `M${x} 250h20`).join("")} />
          <text className="art-text" x="380" y="264" textAnchor="end">
            {copy.hero.goal}
          </text>
        </g>

        <g transform="translate(600 84) rotate(-14)">
          <g className="mo mo-drop" style={css({ "--s": 1 })}>
            <g className="mo mo-float" style={css({ "--s": 12, "--dur": "1s" })}>
              <circle className="art-mint" r="38" />
              <g transform="translate(-31.2 -31.2) scale(2.6)">
                <g className="art-glyph-on-mint">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </>
  );
}

// The car insurance stacks' scale: 40 units to every $100, so $600 is 240 tall.
const BASE = 360;
const UNIT = 0.4;
const STACK_WIDTH = 44;

/** One $100 piece of a month's stack, its top at `amount` on the scale. */
function Piece({ x, amount }: { readonly x: number; readonly amount: number }) {
  return (
    <rect
      className="dg-fill"
      x={x}
      y={BASE - amount * UNIT + 4}
      width={STACK_WIDTH}
      height={100 * UNIT - 4}
      rx="6"
    />
  );
}

/**
 * The article's opening example, month by month: $100 pieces stacking from
 * January to the $600 bill in June, and the bill paid from the stack.
 *
 * A stack of pieces rather than one growing bar, so the equal monthly amount
 * is something a reader can count.
 */
function CarInsurance() {
  const l = copy.diagrams["sinking-funds-car-insurance"].labels;
  const pitch = 62;
  const x0 = 24;
  const top = BASE - 600 * UNIT + 4;
  const amounts = [100, 200, 300, 400, 500, 600];
  const billX = 470;
  const juneRight = x0 + 5 * pitch + STACK_WIDTH;

  return (
    <>
      <text className="dg-text dg-strong" x={x0} y="34">
        {l.title}
      </text>
      <text className="dg-label" x={x0} y="64">
        {l.subtitle}
      </text>

      <path className="dg-rule dg-dash mo mo-fade" d={`M${x0} ${top}H536`} />

      {l.months.map((month, index) => {
        const x = x0 + index * pitch;
        const saved = amounts[index] ?? 0;
        return (
          <g key={month}>
            {/* Last month's stack is already there; only this month's $100
                lands, so the build counts pieces instead of stretching them. */}
            <g style={css({ "--c": "var(--green)" })}>
              <g className="mo mo-fade" style={css({ "--s": index + 1 })}>
                {amounts
                  .filter((amount) => amount < saved)
                  .map((amount) => (
                    <Piece key={amount} x={x} amount={amount} />
                  ))}
              </g>
              <g className="mo mo-drop" style={css({ "--s": index + 1.4 })}>
                <Piece x={x} amount={saved} />
              </g>
            </g>
            <text
              className="dg-text dg-num mo mo-fade"
              style={css({ "--s": index + 2 })}
              x={x + STACK_WIDTH / 2}
              y={BASE - saved * UNIT - 8}
              textAnchor="middle"
            >
              {l.totals[index]}
            </text>
            <text className="dg-label" x={x + STACK_WIDTH / 2} y="392" textAnchor="middle">
              {month}
            </text>
          </g>
        );
      })}

      <g style={css({ "--c": "var(--red)" })}>
        <path
          className="dg-stroke mo mo-draw"
          style={css({ "--s": 7.5 })}
          pathLength={1}
          d={`M${juneRight + 10} 242H${billX - 10}`}
        />
        <path
          className="dg-stroke mo mo-fade"
          style={css({ "--s": 8 })}
          d={`M${billX - 22} 230l12 12-12 12`}
        />
        <text
          className="dg-label mo mo-fade"
          style={css({ "--s": 8 })}
          x={(juneRight + billX) / 2}
          y="224"
          textAnchor="middle"
        >
          {l.pay}
        </text>
        <rect
          className="dg-fill mo mo-grow-y"
          style={css({ "--s": 8.5 })}
          x={billX}
          y={top}
          width="60"
          height={BASE - top}
          rx="6"
        />
      </g>
      <text
        className="dg-text dg-num mo mo-fade"
        style={css({ "--s": 9 })}
        x={billX + 30}
        y={top - 12}
        textAnchor="middle"
      >
        {l.billAmount}
      </text>
      <text className="dg-label" x={billX + 30} y="392" textAnchor="middle">
        {l.bill}
      </text>
    </>
  );
}

/**
 * The article's table as three bars on one scale, each cut into its months.
 *
 * The table gives the answer; the pieces show the division that produced it,
 * which is the step a reader has to do for their own bills.
 */
function Pieces() {
  const { funds } = copy.diagrams["sinking-funds-pieces"].labels;
  // The table's bills and months, in the same order as the labels.
  const bills = [
    { total: 600, months: 6 },
    { total: 900, months: 10 },
    { total: 240, months: 12 },
  ];
  // $900, the biggest bill, across 504 units.
  const unit = 504 / 900;
  const x0 = 24;

  return (
    <>
      {funds.map((fund, index) => {
        const bill = bills[index] ?? { total: 0, months: 1 };
        const piece = (bill.total * unit) / bill.months;
        // The gap and the corner shrink with a small piece, so the vet's twelve
        // stay square-cornered tiles like the others rather than a row of pills.
        const gap = Math.min(3, piece * 0.2);
        const w = piece - gap;
        const starts = Array.from({ length: bill.months }, (_, k) => x0 + k * piece);
        const y = 36 + index * 136;
        return (
          <g key={fund.name}>
            <text className="dg-text dg-strong dg-num" x={x0} y={y}>
              {fund.name}
            </text>
            {/* Piece by piece, a month at a time, rather than one bar
                stretching: a stretched bar squashes the pieces on the way and
                briefly shows them the wrong size. */}
            <g style={css({ "--c": "var(--green)" })}>
              {starts.map((start, k) => (
                <rect
                  key={start}
                  className="dg-fill mo mo-fade"
                  style={css({ "--s": index * 2 + (k * 1.6) / bill.months })}
                  x={start}
                  y={y + 16}
                  width={w}
                  height="40"
                  rx={Math.min(6, w / 4)}
                />
              ))}
            </g>
            <text
              className="dg-label dg-num mo mo-fade"
              style={css({ "--s": index * 2 + 1.8 })}
              x={x0}
              y={y + 84}
            >
              {fund.each}
            </text>
          </g>
        );
      })}
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "sinking-funds-car-insurance": {
      viewBox: "0 0 560 410",
      caption: copy.diagrams["sinking-funds-car-insurance"].caption,
      description: copy.diagrams["sinking-funds-car-insurance"].description,
      Body: CarInsurance,
    },
    "sinking-funds-pieces": {
      viewBox: "0 0 560 404",
      caption: copy.diagrams["sinking-funds-pieces"].caption,
      description: copy.diagrams["sinking-funds-pieces"].description,
      Body: Pieces,
    },
  },
};
