import { budgetWithACreditCardArt } from "@/content/learn-art/budget-with-a-credit-card";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(budgetWithACreditCardArt);

/**
 * Where a day sits on the calendar, seven across and four down. Only the two
 * days that matter are drawn: a full grid of dots was noise at thumbnail size.
 */
function dayX(col: number) {
  return 34 + col * 35.3;
}

function dayY(row: number) {
  return 118 + row * 48;
}

/**
 * A card and a calendar: the purchase marked on the 3rd, the due date checked.
 *
 * The article's one idea is that a card splits a purchase into two moments,
 * and a calendar with both of them on it says that without a word. The check
 * lands last because paying in full by the due date is what the article asks.
 */
function Hero() {
  const buy = { x: dayX(1), y: dayY(0) };
  const due = { x: dayX(5), y: dayY(3) };
  const hop = [
    { x: buy.x + 30, y: buy.y },
    { x: buy.x + 112, y: buy.y - 10 },
    { x: due.x + 12, y: due.y - 110 },
    { x: due.x + 2, y: due.y - 42 },
  ] as const;

  return (
    <>
      <Orbits cx={600} cy={300} />

      {/* A size up and centered, so the pair still reads as a card thumbnail. */}
      <g transform="translate(586 300) scale(1.08) translate(-610 -300)">
        {/* The card, tilted as the app tilts its own ledger card. */}
        <g transform="translate(450 330) rotate(-6)">
          <g className="mo mo-tilt" style={css({ "--dur": "0.9s" })}>
            <rect className="art-veil" x="-230" y="-145" width="460" height="290" rx="32" />
            <rect className="art-line" x="-225" y="-140" width="450" height="280" rx="28" />
            <g className="mo mo-pop" style={css({ "--s": 2 })}>
              <rect className="art-ink" x="-186" y="-96" width="76" height="58" rx="14" />
            </g>
            <path
              className="art-line-muted mo mo-fade"
              style={css({ "--s": 3 })}
              d="M-76 -84a30 30 0 0 1 0 34M-56 -96a48 48 0 0 1 0 58"
            />
            {[0, 1, 2, 3].map((group) => (
              <rect
                key={group}
                className="art-muted mo mo-grow-x"
                style={css({ "--s": 3 + group * 0.5 })}
                x={-186 + group * 98}
                y="8"
                width="76"
                height="20"
                rx="10"
              />
            ))}
            <g className="mo mo-fade" style={css({ "--s": 5 })}>
              <rect className="art-muted" x="-186" y="72" width="160" height="18" rx="9" />
              <rect className="art-muted" x="114" y="72" width="70" height="18" rx="9" />
            </g>
          </g>
        </g>

        {/* The calendar, with the day you buy and the day you pay. */}
        <g transform="translate(760 104) rotate(4 140 162)">
          <g className="mo mo-rise" style={css({ "--s": 3 })}>
            <rect className="art-veil" width="280" height="324" rx="26" />
            <rect className="art-line" x="5" y="5" width="270" height="314" rx="22" />
            <path className="art-line" d="M84 -18v34M196 -18v34" />
            <rect className="art-muted" x="34" y="48" width="104" height="20" rx="10" />
          </g>
          {/* The day you buy, marked with the card that bought it. */}
          <g className="mo mo-pop" style={css({ "--s": 5.5 })}>
            <rect className="art-ink" x={buy.x - 25} y={buy.y - 17} width="50" height="34" rx="8" />
            <rect className="art-base" x={buy.x - 25} y={buy.y - 8} width="50" height="8" />
          </g>
          <path
            className="art-line-mint mo mo-draw"
            style={css({ "--s": 6.5 })}
            pathLength={1}
            d={`M${hop[0].x} ${hop[0].y}C${hop[1].x} ${hop[1].y} ${hop[2].x} ${hop[2].y} ${hop[3].x} ${hop[3].y}`}
          />
          <g className="mo mo-pop" style={css({ "--s": 10 })}>
            <g className="mo mo-float" style={css({ "--s": 14.5, "--dur": "0.8s" })}>
              <circle className="art-mint" cx={due.x} cy={due.y} r="34" />
              <g transform={`translate(${due.x - 31.2} ${due.y - 31.2}) scale(2.6)`}>
                <path className="art-glyph-on-mint" d="M6.5 12.5l3.5 3.5L17.5 8.5" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </>
  );
}

/**
 * One purchase, top to bottom: the day it's spending, the day the statement
 * closes, the grace period, and the day the cash leaves.
 *
 * Down the page rather than across, so each moment can say what it means in a
 * full sentence and still be read on a phone.
 */
function Timeline() {
  const l = copy.diagrams["budget-with-a-credit-card-timeline"].labels;
  // Centered as a block: the longest label ends near x 450.
  const rail = 120;
  const text = 164;
  const cycleY = 20;
  const buyY = 64;
  const dueY = 396;
  // The four blocks of text sit an equal 39 units apart. Centering the grace
  // period in its band instead left a hole under the purchase.
  const closeY = 184;
  const graceY = 286;

  return (
    <>
      {/* The two stretches of time: the billing cycle the purchase falls in,
          then the grace period. */}
      <rect
        className="dg-soft mo mo-fade"
        style={css({ "--c-soft": "var(--blue-soft)" })}
        x={rail - 22}
        y={cycleY}
        width="44"
        height={closeY - cycleY}
        rx="22"
      />
      <rect
        className="dg-soft mo mo-fade"
        style={css({ "--s": 3, "--c-soft": "var(--green-soft)" })}
        x={rail - 22}
        y={closeY}
        width="44"
        height={dueY - closeY + 22}
        rx="22"
      />
      <path
        className="dg-stroke mo mo-draw"
        style={css({ "--s": 1, "--c": "var(--line-strong)" })}
        pathLength={1}
        d={`M${rail} ${cycleY + 22}V${dueY}`}
      />

      <g className="mo mo-pop" style={css({ "--s": 1, "--c": "var(--red)" })}>
        <circle className="dg-fill" cx={rail} cy={buyY} r="14" />
      </g>
      <g className="mo mo-slide-r" style={css({ "--s": 1 })}>
        <text className="dg-label" x={text} y={buyY - 14}>
          {l.buyWhen}
        </text>
        <text className="dg-text dg-strong dg-num" x={text} y={buyY + 16}>
          {l.buy}
        </text>
        <text className="dg-label" x={text} y={buyY + 46}>
          {l.buyMeans}
        </text>
      </g>

      <g className="mo mo-pop" style={css({ "--s": 2, "--c": "var(--ink)" })}>
        <circle className="dg-box" cx={rail} cy={closeY} r="14" />
        <circle className="dg-stroke" cx={rail} cy={closeY} r="12" />
      </g>
      <g className="mo mo-slide-r" style={css({ "--s": 2 })}>
        <text className="dg-label" x={text} y={closeY - 14}>
          {l.closeWhen}
        </text>
        <text className="dg-text dg-strong" x={text} y={closeY + 16}>
          {l.close}
        </text>
        <text className="dg-label dg-num" x={text} y={closeY + 46}>
          {l.closeMeans}
        </text>
      </g>

      <g className="mo mo-slide-r" style={css({ "--s": 3 })}>
        <text className="dg-text dg-strong" x={text} y={graceY + 6}>
          {l.grace}
        </text>
        <text className="dg-label" x={text} y={graceY + 36}>
          {l.graceMeans}
        </text>
      </g>

      <g className="mo mo-pop" style={css({ "--s": 4, "--c": "var(--green)" })}>
        <Checked x={rail} y={dueY} />
      </g>
      <g className="mo mo-slide-r" style={css({ "--s": 4 })}>
        <text className="dg-label" x={text} y={dueY - 14}>
          {l.dueWhen}
        </text>
        <text className="dg-text dg-strong dg-num" x={text} y={dueY + 16}>
          {l.due}
        </text>
        <text className="dg-label" x={text} y={dueY + 46}>
          {l.dueMeans}
        </text>
      </g>
    </>
  );
}

/** A ringed check in `--c`, on the page's own surface so a rail can pass behind it. */
function Checked({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <>
      <circle className="dg-box" cx={x} cy={y} r="17" />
      <circle className="dg-stroke" cx={x} cy={y} r="15" />
      <path className="dg-stroke" d={`M${x - 7} ${y + 1}l4.5 4.5 9-9`} />
    </>
  );
}

/**
 * The three rates the article quotes, as bars on one scale, and the card paid
 * in full under them at nothing.
 *
 * Bars rather than the three numbers in a row, because "about twice a
 * personal loan and three times a car loan" is a length a reader sees and a
 * ratio they would otherwise have to work out.
 */
function Interest() {
  const l = copy.diagrams["budget-with-a-credit-card-interest"].labels;
  const x0 = 24;
  const full = 512;
  // 22%, the largest rate, across the full width.
  const unit = full / 22;
  const rows = [
    { key: "card", label: l.card, rate: l.cardRate, value: 22, c: "var(--amber)" },
    { key: "personal", label: l.personal, rate: l.personalRate, value: 12, c: "var(--blue)" },
    { key: "car", label: l.car, rate: l.carRate, value: 7.5, c: "var(--blue)" },
  ] as const;
  const top = 76;
  const step = 82;
  // Below a dashed line, because it's the grace period's rule and not one of
  // the Federal Reserve's averages the heading names.
  const paidY = top + rows.length * step + 18;

  return (
    <>
      <text className="dg-text dg-strong" x={x0} y="30">
        {l.heading}
      </text>
      {rows.map((row, index) => {
        const y = top + index * step;
        return (
          <g key={row.key}>
            <text className="dg-text" x={x0} y={y}>
              {row.label}
            </text>
            <text className="dg-text dg-strong dg-num" x={x0 + full} y={y} textAnchor="end">
              {row.rate}
            </text>
            <rect className="dg-track" x={x0} y={y + 14} width={full} height="26" rx="6" />
            <rect
              className="dg-fill mo mo-grow-x"
              style={css({ "--s": index, "--c": row.c })}
              x={x0}
              y={y + 14}
              width={row.value * unit}
              height="26"
              rx="6"
            />
          </g>
        );
      })}

      <g className="mo mo-fade" style={css({ "--s": 4, "--c": "var(--green)" })}>
        {/* 504 units is 32 dashes and the 31 gaps between them, so it starts
            and ends on a dash. */}
        <path className="dg-rule dg-dash" d={`M${x0 + 4} ${paidY - 44}H${x0 + full - 4}`} />
        <text className="dg-text" x={x0} y={paidY}>
          {l.paid}
        </text>
        <text className="dg-text dg-strong" x={x0 + full} y={paidY} textAnchor="end">
          {l.paidRate}
        </text>
        <rect className="dg-track" x={x0} y={paidY + 14} width={full} height="26" rx="6" />
        <Checked x={x0 + 17} y={paidY + 27} />
      </g>
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "budget-with-a-credit-card-timeline": {
      viewBox: "0 0 560 460",
      caption: copy.diagrams["budget-with-a-credit-card-timeline"].caption,
      description: copy.diagrams["budget-with-a-credit-card-timeline"].description,
      Body: Timeline,
    },
    "budget-with-a-credit-card-interest": {
      viewBox: "0 0 560 400",
      caption: copy.diagrams["budget-with-a-credit-card-interest"].caption,
      description: copy.diagrams["budget-with-a-credit-card-interest"].description,
      Body: Interest,
    },
  },
};
