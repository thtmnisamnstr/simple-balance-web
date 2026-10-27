import { trackYourSpendingArt } from "@/content/learn-art/track-your-spending";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(trackYourSpendingArt);

const RECEIPT =
  "M20 0H240a20 20 0 0 1 20 20V420l-26 22-26-22-26 22-26-22-26 22-26-22-26 22-26-22-26 22-26-22V20A20 20 0 0 1 20 0z";

/**
 * A receipt turning into totals: an arc carries one of its amounts across to
 * a tilted card with a bar for each category, and leaves it in the air just
 * past the biggest bar, the next amount that bar takes.
 *
 * The card finishes as the overview's spending by category, biggest first,
 * because that is what tracking is for: seeing where it went. Bars rather
 * than bins, so this picture ends where the article does and leaves the bins
 * to the budget categories article, which sits next to it on the index.
 */
function Hero() {
  const rows = [
    { y: 146, w: 92 },
    { y: 196, w: 64 },
    { y: 246, w: 104 },
    { y: 296, w: 78 },
  ];
  // Biggest first, as the overview lists them, each growing in turn. The
  // stubs differ in length because the category names they stand for do.
  const totals = [
    { y: 294, w: 216, label: 52, s: 7 },
    { y: 362, w: 144, label: 40, s: 9 },
    { y: 430, w: 76, label: 58, s: 11 },
  ];

  return (
    <>
      <Orbits cx={620} cy={300} />

      <g transform="translate(196 70) rotate(-4 130 225)">
        <g className="mo mo-rise" style={css({ "--s": 0 })}>
          <path className="art-veil" d={RECEIPT} />
          <path className="art-line" d={RECEIPT} />
          <path className="art-line" d="M84 52h92" />
          <path className="art-line-muted" d="M104 84h52" />
          {rows.map((row) => (
            <g key={row.y}>
              <path className="art-line-muted" d={`M38 ${row.y}h${row.w}`} />
              <rect className="art-mint" x="168" y={row.y - 13} width="56" height="26" rx="9" />
            </g>
          ))}
          <path className="art-line-muted" d="M38 340h40M110 340h40M182 340h40" />
          <path className="art-line" d="M38 386h76" />
          <rect className="art-mint" x="150" y="371" width="74" height="30" rx="10" />
        </g>
      </g>

      {/* Where it went, tilted as the app tilts its own card. */}
      <g transform="rotate(-4 830 382)">
        <g className="mo mo-rise" style={css({ "--s": 1 })}>
          <rect className="art-veil" x="600" y="262" width="460" height="240" rx="28" />
          {totals.map((total) => (
            <g key={total.y}>
              <path className="art-line-muted" d={`M644 ${total.y + 20}h${total.label}`} />
              <rect
                className="art-mint mo mo-grow-x"
                style={css({ "--s": total.s })}
                x="724"
                y={total.y}
                width={total.w}
                height="40"
                rx="14"
              />
            </g>
          ))}
        </g>
      </g>

      {/* An arc ending in a piece mid-air rather than an arrowhead, because
          adding up is something happening, not a direction to go. */}
      <path
        className="art-line-muted mo mo-draw"
        style={css({ "--s": 2, "--dur": "0.6s" })}
        pathLength={1}
        d="M490 190C640 50 922 50 960 254"
      />

      <g transform="rotate(-14 991 303)">
        <g className="mo mo-pop" style={css({ "--s": 6 })}>
          <g className="mo mo-float" style={css({ "--s": 14, "--dur": "0.8s" })}>
            <rect className="art-mint" x="953" y="286" width="76" height="34" rx="12" />
          </g>
        </g>
      </g>
    </>
  );
}

/**
 * Two of your own accounts inside one line, and a store outside it.
 *
 * Drawn as a boundary rather than as two lists of rows, because the rule the
 * reader needs is spatial: spending is money crossing the line, and a card
 * payment never does.
 */
function CountOnce() {
  const l = copy.diagrams["track-your-spending-count-once"].labels;
  return (
    <>
      <g className="mo mo-fade" style={css({ "--s": 0 })}>
        <text className="dg-label" x="28" y="32">
          {l.yours}
        </text>
        <rect className="dg-rule dg-dash" x="12" y="46" width="268" height="254" rx="18" />
      </g>

      <g className="mo mo-fade" style={css({ "--s": 1 })}>
        <rect className="dg-box" x="36" y="70" width="208" height="60" rx="12" />
        <text className="dg-text" x="140" y="108" textAnchor="middle">
          {l.checking}
        </text>
        <rect className="dg-box" x="36" y="216" width="208" height="60" rx="12" />
        <text className="dg-text" x="140" y="254" textAnchor="middle">
          {l.card}
        </text>
        <rect className="dg-box" x="412" y="216" width="128" height="60" rx="12" />
        <text className="dg-text" x="476" y="254" textAnchor="middle">
          {l.store}
        </text>
      </g>

      {/* The purchase first, because it happens first. */}
      <g style={css({ "--c": "var(--red)" })}>
        <path
          className="dg-stroke mo mo-draw"
          style={css({ "--s": 2 })}
          pathLength={1}
          d="M254 246H400"
        />
        <path className="dg-stroke mo mo-fade" style={css({ "--s": 3 })} d="M388 234l12 12-12 12" />
        <g className="mo mo-fade" style={css({ "--s": 3 })}>
          <text className="dg-text dg-num" x="346" y="230" textAnchor="middle">
            {l.amount}
          </text>
          <text className="dg-label dg-strong dg-fill" x="346" y="280" textAnchor="middle">
            {l.spending}
          </text>
        </g>
      </g>

      <g style={css({ "--c": "var(--blue)" })}>
        <path
          className="dg-stroke mo mo-draw"
          style={css({ "--s": 4 })}
          pathLength={1}
          d="M140 138V206"
        />
        <path className="dg-stroke mo mo-fade" style={css({ "--s": 5 })} d="M128 194l12 12 12-12" />
        <g className="mo mo-fade" style={css({ "--s": 5 })}>
          <text className="dg-text dg-num" x="160" y="168">
            {l.amount}
          </text>
          <text className="dg-label dg-strong dg-fill" x="160" y="196">
            {l.transfer}
          </text>
        </g>
      </g>

      <g className="mo mo-fade" style={css({ "--s": 6 })}>
        <text className="dg-label" x="540" y="88" textAnchor="end">
          {l.countedLabel}
        </text>
        <text className="dg-text dg-strong dg-num" x="540" y="122" textAnchor="end">
          {l.counted}
        </text>
      </g>
    </>
  );
}

const KIND_COLOR = {
  spend: "var(--red)",
  transfer: "var(--blue)",
  refund: "var(--green)",
} as const;

/**
 * A statement's rows, each given a category, and the totals they add up to.
 *
 * The two rows the article warns about are colored apart from the spending:
 * the card payment goes nowhere, and the refund is drawn as the dashed part
 * of the clothes bar it takes away.
 */
function Sort() {
  const l = copy.diagrams["track-your-spending-sort"].labels;
  // $125, the largest total, across 200 units.
  const unit = 200 / 125;
  const x0 = 162;
  return (
    <>
      <g className="mo mo-fade" style={css({ "--s": 0 })}>
        <text className="dg-label" x="24" y="30">
          {l.statements}
        </text>
        <text className="dg-label" x="378" y="30">
          {l.category}
        </text>
      </g>

      {l.rows.map((row, index) => {
        const y = 76 + index * 42;
        const color = css({ "--c": KIND_COLOR[row.kind] });
        return (
          <g key={`${row.payee}-${row.amount}`} style={color}>
            <g className="mo mo-fade" style={css({ "--s": index })}>
              <rect className="dg-fill" x="24" y={y - 19} width="8" height="24" rx="4" />
              <text className="dg-text" x="44" y={y}>
                {row.payee}
              </text>
              <text
                className={row.kind === "refund" ? "dg-text dg-num dg-fill" : "dg-text dg-num"}
                x="318"
                y={y}
                textAnchor="end"
              >
                {row.amount}
              </text>
            </g>
            <path
              className="dg-rule mo mo-fade"
              style={css({ "--s": index + 1 })}
              d={`M334 ${y - 8}H362M355 ${y - 15}l7 7-7 7`}
            />
            <g className="mo mo-pop" style={css({ "--s": index + 1 })}>
              <text
                className={row.kind === "transfer" ? "dg-text dg-fill" : "dg-text"}
                x="378"
                y={y}
              >
                {row.category}
              </text>
            </g>
          </g>
        );
      })}

      <path className="dg-rule mo mo-fade" style={css({ "--s": 6 })} d="M24 316H536" />
      <text className="dg-label mo mo-fade" style={css({ "--s": 6 })} x="24" y="354">
        {l.totals}
      </text>

      <g style={css({ "--c": "var(--red)" })}>
        <text className="dg-text mo mo-fade" style={css({ "--s": 7 })} x="24" y="396">
          {l.groceries}
        </text>
        {/* Both purchases grow as one bar, so the gap between them reads as
            a seam in the total rather than a second bar arriving late. */}
        <g className="mo mo-grow-x" style={css({ "--s": 7 })}>
          <rect className="dg-fill" x={x0} y="374" width={80 * unit - 3} height="28" rx="6" />
          <rect
            className="dg-fill"
            x={x0 + 80 * unit}
            y="374"
            width={45 * unit}
            height="28"
            rx="6"
          />
        </g>
        <text
          className="dg-text dg-strong dg-num mo mo-fade"
          style={css({ "--s": 9 })}
          x={x0 + 125 * unit + 14}
          y="396"
        >
          {l.groceriesTotal}
        </text>

        <text className="dg-text mo mo-fade" style={css({ "--s": 8 })} x="24" y="448">
          {l.eatingOut}
        </text>
        <rect
          className="dg-fill mo mo-grow-x"
          style={css({ "--s": 8 })}
          x={x0}
          y="426"
          width={35 * unit}
          height="28"
          rx="6"
        />
        <text
          className="dg-text dg-strong dg-num mo mo-fade"
          style={css({ "--s": 9 })}
          x={x0 + 35 * unit + 14}
          y="448"
        >
          {l.eatingOutTotal}
        </text>

        <text className="dg-text mo mo-fade" style={css({ "--s": 9 })} x="24" y="500">
          {l.clothes}
        </text>
        <rect
          className="dg-fill mo mo-grow-x"
          style={css({ "--s": 9 })}
          x={x0}
          y="478"
          width={20 * unit}
          height="28"
          rx="6"
        />
      </g>
      {/* Dashed rather than left out, so the $40 the refund cancels is still
          there to see. */}
      <rect
        className="dg-stroke dg-dash mo mo-fade"
        style={css({ "--s": 10, "--c": "var(--green)" })}
        x={x0 + 20 * unit + 4}
        y="480"
        width={40 * unit - 6}
        height="24"
        rx="5"
      />
      <text
        className="dg-text dg-num mo mo-fade"
        style={css({ "--s": 11 })}
        x={x0 + 60 * unit + 14}
        y="500"
      >
        <tspan className="dg-label">{l.clothesMath}</tspan>
        <tspan className="dg-strong">{l.clothesTotal}</tspan>
      </text>
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "track-your-spending-count-once": {
      viewBox: "0 0 560 316",
      caption: copy.diagrams["track-your-spending-count-once"].caption,
      description: copy.diagrams["track-your-spending-count-once"].description,
      Body: CountOnce,
    },
    "track-your-spending-sort": {
      viewBox: "0 0 560 520",
      caption: copy.diagrams["track-your-spending-sort"].caption,
      description: copy.diagrams["track-your-spending-sort"].description,
      Body: Sort,
    },
  },
};
