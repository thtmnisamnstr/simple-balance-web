import { envelopeBudgetingArt } from "@/content/learn-art/envelope-budgeting";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(envelopeBudgetingArt);

/**
 * The logo's circled dollar sign, dark on a mint bill, `size` units across.
 * The same three paths as `LogoBadge` in `glyphs.tsx`: redraw the logo there
 * and these bills have to be redrawn with it.
 */
function BillMark({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}>
      <g className="art-glyph-on-mint">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
      </g>
    </g>
  );
}

type Bill = {
  /** Left edge and height of the part that shows above the pocket. */
  readonly x: number;
  readonly height: number;
  readonly s: number;
};

const BILL_WIDTH = 108;

/**
 * One open envelope, its flap up and its bills standing in it.
 *
 * Drawn about the middle of the pocket's top edge, so a tilt turns the
 * envelope and what is in it together. Only the part of a bill above the
 * pocket is drawn: the pocket is frosted rather than solid, and a whole bill
 * would show through it and stop reading as tucked in. The bills are kept
 * narrower than the flap, because the flap's triangle is what makes this an
 * envelope rather than a folder.
 */
function Envelope({
  x,
  y,
  tilt,
  label,
  bills,
  s,
}: {
  readonly x: number;
  readonly y: number;
  readonly tilt: number;
  readonly label: string;
  readonly bills: readonly Bill[];
  readonly s: number;
}) {
  const front = bills.at(-1);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <g className="mo mo-rise" style={css({ "--s": s })}>
        <path className="art-veil" d="M-112 0 0-112 112 0z" />
        <path className="art-line-muted" d="M-112 0 0-112 112 0" />
      </g>

      {bills.map((bill) => (
        <g key={bill.x} className="mo mo-drop" style={css({ "--s": bill.s })}>
          {/* A sliver of panel around each bill, so a stack reads as bills
              rather than one mint block. */}
          <rect
            className="art-base"
            x={bill.x - 4}
            y={-bill.height - 4}
            width={BILL_WIDTH + 8}
            height={bill.height + 4}
            rx="12"
          />
          <rect
            className="art-mint"
            x={bill.x}
            y={-bill.height}
            width={BILL_WIDTH}
            height={bill.height + 4}
            rx="9"
          />
          {bill === front ? (
            <BillMark x={bill.x + BILL_WIDTH / 2} y={-bill.height / 2 - 2} size={38} />
          ) : null}
        </g>
      ))}

      <g className="mo mo-rise" style={css({ "--s": s })}>
        <rect className="art-veil" x="-115" y="0" width="230" height="156" rx="18" />
        {/* The seam where the back's side flaps meet the bottom one. Without
            it a box under a triangle is a house before it is an envelope. */}
        <path className="art-line-muted" d="M-100 148 0 116 100 148" />
        <rect className="art-line" x="-115" y="0" width="230" height="156" rx="18" />
        <text className="art-text" x="0" y="93" textAnchor="middle">
          {label}
        </text>
      </g>
    </g>
  );
}

/**
 * Three cash envelopes, labeled the way the article labels them, with mint
 * bills tucked into each and one more on its way in.
 *
 * Each holds a different amount, because the method is one pile of money
 * split by what it is for, and the card above them is that same split:
 * three bars for their three, two and one bills. The last bill flutters in
 * above Fun, because filling the envelopes on payday is the one thing a
 * reader does every month.
 */
function Hero() {
  const plan = [
    { id: "groceries", width: 136 },
    { id: "gas", width: 96 },
    { id: "fun", width: 60 },
  ];
  return (
    <>
      <Orbits cx={600} cy={300} />

      {/* The plan, tilted as the app tilts its own ledger card. */}
      <g transform="translate(132 64) rotate(-5)">
        <g className="mo mo-rise">
          <rect className="art-veil" width="226" height="140" rx="22" />
          {plan.map((row, index) => (
            <g key={row.id}>
              <circle className="art-muted" cx="36" cy={36 + index * 34} r="9" />
              <rect
                className="art-mint mo mo-grow-x"
                style={css({ "--s": index + 1 })}
                x="60"
                y={26 + index * 34}
                width={row.width}
                height="20"
                rx="10"
              />
            </g>
          ))}
        </g>
      </g>

      <Envelope
        x={318}
        y={334}
        tilt={-4}
        label={copy.hero.groceries}
        s={1}
        bills={[
          { x: -84, height: 84, s: 4 },
          { x: -56, height: 68, s: 4.6 },
          { x: -24, height: 52, s: 5.2 },
        ]}
      />
      <Envelope
        x={600}
        y={320}
        tilt={2}
        label={copy.hero.gas}
        s={2}
        bills={[
          { x: -38, height: 74, s: 5.8 },
          { x: -74, height: 54, s: 6.4 },
        ]}
      />
      <Envelope
        x={882}
        y={334}
        tilt={-3}
        label={copy.hero.fun}
        s={3}
        bills={[{ x: -54, height: 50, s: 7 }]}
      />

      {/* The next bill, on its way into Fun. It flutters as it lands. */}
      <g transform="translate(900 140) rotate(-14)">
        <g className="mo mo-drop" style={css({ "--s": 8 })}>
          <g className="mo mo-swing" style={css({ "--s": 10, "--dur": "1s" })}>
            <rect className="art-mint" x="-58" y="-30" width="116" height="60" rx="9" />
            <BillMark x={0} y={0} size={40} />
          </g>
        </g>
      </g>
    </>
  );
}

/**
 * The article's grocery envelope over two months: what's left at the end of
 * the first is where the second begins.
 *
 * The leftover sits at the left of both bars, one above the other, so the
 * carry is a short arrow down rather than a line across the spending.
 */
function CarryOver() {
  const l = copy.diagrams["envelope-budgeting-carry-over"].labels;
  // 460 dollars, next month's total, across 476 units.
  const unit = 476 / 460;
  const x0 = 60;
  const left = 60 * unit;
  const spent = 340 * unit;
  const added = 400 * unit;
  const thisEnd = x0 + left + spent;
  const nextEnd = x0 + left + added;

  return (
    <>
      <text className="dg-text dg-strong" x={x0} y="36">
        {l.thisMonth}
      </text>
      <text className="dg-text dg-strong dg-num" x={thisEnd} y="36" textAnchor="end">
        {l.thisTotal}
      </text>
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--c": "var(--green)" })}
        x={x0}
        y="52"
        width={left - 3}
        height="52"
        rx="8"
      />
      {/* Spent is drawn as the emptied part of the envelope, an outline
          with nothing solid in it, so the only solid green is money that
          is still there. */}
      <g
        className="mo mo-grow-x"
        style={css({ "--s": 1, "--c": "var(--red)", "--c-soft": "var(--red-soft)" })}
      >
        <rect className="dg-soft" x={x0 + left} y="52" width={spent} height="52" rx="8" />
        <rect
          className="dg-stroke dg-dash"
          x={x0 + left + 2}
          y="54"
          width={spent - 4}
          height="48"
          rx="7"
        />
      </g>
      <g className="mo mo-fade" style={css({ "--s": 2 })}>
        <text className="dg-label" x={x0} y="134">
          {l.left}
        </text>
        <text className="dg-text dg-num" x={x0} y="162">
          {l.leftAmount}
        </text>
        <text className="dg-label" x={thisEnd} y="134" textAnchor="end">
          {l.spent}
        </text>
        <text className="dg-text dg-num" x={thisEnd} y="162" textAnchor="end">
          {l.spentAmount}
        </text>
      </g>

      {/* The carry: out of this month's leftover, round the left edge and
          into next month's first segment. */}
      <g style={css({ "--c": "var(--green)" })}>
        <path
          className="dg-stroke mo mo-draw"
          style={css({ "--s": 2.5 })}
          pathLength="1"
          d="M52 78H44Q30 78 30 92V264Q30 278 44 278H50"
        />
        <path
          className="dg-stroke mo mo-fade"
          style={css({ "--s": 4.5 })}
          d="M42 268 52 278 42 288"
        />
      </g>

      <text className="dg-text dg-strong" x={x0} y="236">
        {l.nextMonth}
      </text>
      {/* The sum lands last, with the labels of the two parts it adds up. */}
      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 6 })}
        x={nextEnd}
        y="236"
        textAnchor="end"
      >
        {l.nextTotal}
      </text>
      {/* Grows sideways rather than popping, like the bars above: these
          bars measure money along their length, so filling from the left is
          the envelope being filled. */}
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 5, "--c": "var(--green)" })}
        x={x0}
        y="252"
        width={left - 3}
        height="52"
        rx="8"
      />
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 5.5, "--c": "var(--blue)" })}
        x={x0 + left}
        y="252"
        width={added}
        height="52"
        rx="8"
      />
      <g className="mo mo-fade" style={css({ "--s": 6 })}>
        <text className="dg-label" x={x0} y="334">
          {l.carried}
        </text>
        <text className="dg-text dg-num" x={x0} y="362">
          {l.carriedAmount}
        </text>
        <text className="dg-label" x={nextEnd} y="334" textAnchor="end">
          {l.added}
        </text>
        <text className="dg-text dg-num" x={nextEnd} y="362" textAnchor="end">
          {l.addedAmount}
        </text>
      </g>
    </>
  );
}

/**
 * The article's car repair envelope: $50 a month, never touched, for a year.
 *
 * A bar a month rather than one bar, because the point is that nothing big
 * ever went in. Each month's step is the same small one.
 */
function CarRepair() {
  const l = copy.diagrams["envelope-budgeting-car-repair"].labels;
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const base = 322;
  // 600 dollars, the year's total, across 216 units.
  const unit = 216 / 600;
  const slot = 512 / 12;
  const width = 30;
  const barX = (month: number) => 24 + (month - 1) * slot + (slot - width) / 2;
  const top = (month: number) => base - 50 * month * unit;

  return (
    <>
      <text className="dg-text dg-strong" x="24" y="36">
        {l.title}
      </text>
      {months.map((month) => (
        <rect
          key={month}
          className="dg-fill mo mo-grow-y"
          style={css({ "--s": (month - 1) * 0.4, "--c": "var(--green)" })}
          x={barX(month)}
          y={top(month)}
          width={width}
          height={base - top(month)}
          rx="6"
        />
      ))}
      <path className="dg-rule" d={`M24 ${base + 1}H536`} />
      <text
        className="dg-text dg-num mo mo-fade"
        style={css({ "--s": 1 })}
        x={barX(1) + width / 2}
        y={top(1) - 12}
        textAnchor="middle"
      >
        {l.first}
      </text>
      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 6 })}
        x={barX(12) + width}
        y={top(12) - 14}
        textAnchor="end"
      >
        {l.last}
      </text>
      <text className="dg-label" x="24" y={base + 34}>
        {l.start}
      </text>
      <text className="dg-label" x="536" y={base + 34} textAnchor="end">
        {l.end}
      </text>
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "envelope-budgeting-carry-over": {
      viewBox: "0 0 560 380",
      caption: copy.diagrams["envelope-budgeting-carry-over"].caption,
      description: copy.diagrams["envelope-budgeting-carry-over"].description,
      Body: CarryOver,
    },
    "envelope-budgeting-car-repair": {
      viewBox: "0 0 560 372",
      caption: copy.diagrams["envelope-budgeting-car-repair"].caption,
      description: copy.diagrams["envelope-budgeting-car-repair"].description,
      Body: CarRepair,
    },
  },
};
