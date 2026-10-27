import { balanceYourCheckingAccountArt } from "@/content/learn-art/balance-your-checking-account";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(balanceYourCheckingAccountArt);

/** The three rows both cards share: where each sits, and how wide its amount is. */
const rows = [
  { y: 184, width: 92 },
  { y: 246, width: 64 },
  { y: 308, width: 116 },
] as const;

/**
 * The bank's statement and your own record, side by side, checked off a row
 * at a time until the two agree.
 *
 * Two cards rather than one because the job is a comparison: the statement
 * is paper with a folded corner, the record is the app's own card, and they
 * lean apart like an open book. Each row's amount turns mint as a check
 * draws between them, and when every row is ticked the totals earn the
 * badge, which is the logo's mint tile with a check where the dollar sign
 * goes.
 */
function Hero() {
  const left = "rotate(-4 315 280)";
  const right = "rotate(4 885 280)";
  return (
    <>
      <Orbits cx={600} cy={290} />

      <g className="mo mo-slide-l">
        <g transform={left}>
          <path
            className="art-veil"
            d="M172 90H424L480 146V448a22 22 0 0 1-22 22H172a22 22 0 0 1-22-22V112a22 22 0 0 1 22-22z"
          />
          <path className="art-veil" d="M424 90V128a18 18 0 0 0 18 18H480z" />
          <path className="art-line" d="M190 136H290" />
          {rows.map((row) => (
            <g key={row.y}>
              <path className="art-line-muted" d={`M190 ${row.y}H300`} />
              <rect
                className="art-ink"
                x={444 - row.width}
                y={row.y - 13}
                width={row.width}
                height="26"
                rx="9"
              />
            </g>
          ))}
          <path className="art-orbit" d="M190 356H444" />
          <path className="art-line-muted" d="M190 410H250" />
          <rect className="art-ink" x="294" y="392" width="150" height="36" rx="12" />
        </g>
        <text className="art-text-muted" x="328" y="530" textAnchor="middle">
          {copy.hero.statement}
        </text>
      </g>

      <g className="mo mo-slide-r" style={css({ "--s": 1 })}>
        <g transform={right}>
          <rect className="art-veil" x="720" y="90" width="330" height="380" rx="22" />
          <path className="art-line" d="M760 136H860" />
          {rows.map((row) => (
            <g key={row.y}>
              <path className="art-line-muted" d={`M760 ${row.y}H870`} />
              <rect
                className="art-ink"
                x={1014 - row.width}
                y={row.y - 13}
                width={row.width}
                height="26"
                rx="9"
              />
            </g>
          ))}
          <path className="art-orbit" d="M760 356H1014" />
          <path className="art-line-muted" d="M760 410H820" />
          <rect className="art-ink" x="864" y="392" width="150" height="36" rx="12" />
        </g>
        <text className="art-text-muted" x="872" y="530" textAnchor="middle">
          {copy.hero.record}
        </text>
      </g>

      {/* A row is matched: its amount turns mint on both cards and a check
          draws between them. The inner ends of the rows sit 9 units higher
          than the rows themselves, because both cards lean away. */}
      {rows.map((row, index) => (
        <g key={row.y}>
          <g className="mo mo-fade" style={css({ "--s": 6 + index * 2 })}>
            <rect
              className="art-mint"
              transform={left}
              x={444 - row.width}
              y={row.y - 13}
              width={row.width}
              height="26"
              rx="9"
            />
            <rect
              className="art-mint"
              transform={right}
              x={1014 - row.width}
              y={row.y - 13}
              width={row.width}
              height="26"
              rx="9"
            />
          </g>
          <path
            className="art-line-mint mo mo-draw"
            style={css({ "--s": 6 + index * 2, "--dur": "0.5s" })}
            pathLength="1"
            d={`M574 ${row.y - 9}l18 18 34-36`}
          />
        </g>
      ))}

      <g className="mo mo-pop" style={css({ "--s": 13 })}>
        <g className="mo mo-swing" style={css({ "--s": 17, "--dur": "0.7s" })}>
          <rect className="art-mint" x="546" y="348" width="108" height="108" rx="30" />
          <g transform="translate(546 348) scale(4.5)">
            <path className="art-glyph-on-mint" d="M7 12.4l3.4 3.4L17 9.2" />
          </g>
        </g>
      </g>
    </>
  );
}

/**
 * Step 4's arithmetic as a running balance: the statement's number, what is
 * still on its way out taken off the end, what is still on its way in put
 * back, and the bar that is left, which is your own record's number.
 *
 * Horizontal, with the amount leading each row, so the labels can be whole
 * phrases and the dashed guides down the right never cross a word.
 */
function TheMath() {
  const l = copy.diagrams["balance-your-checking-account-math"].labels;
  // $1,200, the statement's balance and the longest bar, across 512 units.
  const unit = 512 / 1200;
  const x0 = 24;
  const statementEnd = x0 + 1200 * unit;
  const afterOut = statementEnd - 250 * unit;
  const afterIn = afterOut + 100 * unit;
  const blue = css({ "--c": "var(--blue)" });

  const rowsOfText = [
    { y: 32, amount: l.statementAmount, label: l.statement, s: 0 },
    { y: 120, amount: l.outAmount, label: l.out, s: 2 },
    { y: 208, amount: l.inAmount, label: l.in, s: 5 },
    { y: 296, amount: l.recordAmount, label: l.record, s: 8 },
  ];

  return (
    <>
      {rowsOfText.map((row) => (
        <g key={row.label} className="mo mo-fade" style={css({ "--s": row.s })}>
          <text className="dg-text dg-strong dg-num" x="100" y={row.y} textAnchor="end">
            {row.amount}
          </text>
          <text className="dg-label" x="116" y={row.y}>
            {row.label}
          </text>
        </g>
      ))}

      <rect
        className="dg-fill mo mo-grow-x"
        style={blue}
        x={x0}
        y="46"
        width={statementEnd - x0}
        height="36"
        rx="8"
      />

      <path
        className="dg-rule dg-dash mo mo-fade"
        style={css({ "--s": 3 })}
        d={`M${statementEnd - 1} 86V130`}
      />
      <rect
        className="dg-soft mo mo-fade"
        style={css({ "--s": 2, "--c-soft": "var(--blue-soft)" })}
        x={x0}
        y="134"
        width={afterOut - x0}
        height="36"
        rx="8"
      />
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 3, "--c": "var(--red)", transformOrigin: "right center" })}
        x={afterOut + 3}
        y="134"
        width={statementEnd - afterOut - 3}
        height="36"
        rx="8"
      />

      <path
        className="dg-rule dg-dash mo mo-fade"
        style={css({ "--s": 6 })}
        d={`M${afterOut + 1} 174V218`}
      />
      <rect
        className="dg-soft mo mo-fade"
        style={css({ "--s": 5, "--c-soft": "var(--blue-soft)" })}
        x={x0}
        y="222"
        width={afterOut - x0}
        height="36"
        rx="8"
      />
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 6, "--c": "var(--green)" })}
        x={afterOut + 3}
        y="222"
        width={afterIn - afterOut - 3}
        height="36"
        rx="8"
      />

      <path
        className="dg-rule dg-dash mo mo-fade"
        style={css({ "--s": 8 })}
        d={`M${afterIn - 1} 262V306`}
      />
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 8, "--c": "var(--blue)" })}
        x={x0}
        y="310"
        width={afterIn - x0}
        height="36"
        rx="8"
      />

      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 9 })}
        x="280"
        y="404"
        textAnchor="middle"
      >
        {l.sum}
      </text>
    </>
  );
}

/** A straight line from one point to another with a small arrowhead at the end. */
function arrow(x1: number, y1: number, x2: number, y2: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 10;
  const spread = 0.5;
  const a = (turn: number) =>
    `${(x2 - head * Math.cos(angle + turn)).toFixed(1)} ${(y2 - head * Math.sin(angle + turn)).toFixed(1)}`;
  return `M${x1} ${y1}L${x2} ${y2}M${a(spread)}L${x2} ${y2}L${a(-spread)}`;
}

/** Where the digit tile at `index` starts, in the gap diagram. */
function tile(index: number): number {
  return 166 + index * 54;
}

/**
 * In both of the article's examples it's the first two digits that trade
 * places, and any digit after them stays where it was.
 */
function swapped(index: number): boolean {
  return index < 2;
}

/**
 * Step 5's clue: two digits that trade places, and a gap that always
 * divides by 9.
 *
 * Each figure is a row of digit tiles over the row that was written down,
 * with arrows showing where each swapped digit went, so the mistake is
 * something a reader can see rather than a rule to take on trust.
 */
function TheGap() {
  const l = copy.diagrams["balance-your-checking-account-gap"].labels;
  const examples = [
    { top: 20, bank: ["5", "4"], you: ["4", "5"], gap: l.firstGap, nines: l.firstNines, s: 0 },
    {
      top: 236,
      bank: ["8", "2", "0"],
      you: ["2", "8", "0"],
      gap: l.secondGap,
      nines: l.secondNines,
      s: 4,
    },
  ];
  const amber = css({ "--c": "var(--amber)", "--c-soft": "var(--amber-soft)" });

  return (
    <>
      <path className="dg-rule" d="M24 204H536" />
      {examples.map((example) => {
        const bottom = example.top + 100;
        const tiles = (digits: readonly string[], y: number) =>
          digits.map((digit, index) => (
            <g key={`${y}-${digit}`}>
              <rect
                className={swapped(index) ? "dg-soft" : "dg-box"}
                style={amber}
                x={tile(index)}
                y={y}
                width="44"
                height="52"
                rx="8"
              />
              {swapped(index) ? (
                <rect
                  className="dg-stroke"
                  style={amber}
                  x={tile(index)}
                  y={y}
                  width="44"
                  height="52"
                  rx="8"
                />
              ) : null}
              <text
                className="dg-text dg-strong dg-num"
                x={tile(index) + 22}
                y={y + 35}
                textAnchor="middle"
              >
                {digit}
              </text>
            </g>
          ));

        return (
          <g key={example.top}>
            <g className="mo mo-fade" style={css({ "--s": example.s })}>
              <text className="dg-label" x="24" y={example.top + 34}>
                {l.bank}
              </text>
              <text className="dg-text dg-strong" x="146" y={example.top + 35}>
                $
              </text>
              {tiles(example.bank, example.top)}
            </g>

            <g style={amber}>
              <path
                className="dg-stroke mo mo-draw"
                style={css({ "--s": example.s + 1 })}
                pathLength="1"
                d={arrow(tile(0) + 22, example.top + 62, tile(1) + 22, bottom - 10)}
              />
              <path
                className="dg-stroke mo mo-draw"
                style={css({ "--s": example.s + 1 })}
                pathLength="1"
                d={arrow(tile(1) + 22, example.top + 62, tile(0) + 22, bottom - 10)}
              />
            </g>
            {example.bank.slice(2).map((digit, offset) => (
              <path
                key={digit}
                className="dg-rule mo mo-fade"
                style={css({ "--s": example.s + 1 })}
                d={arrow(
                  tile(offset + 2) + 22,
                  example.top + 62,
                  tile(offset + 2) + 22,
                  bottom - 10,
                )}
              />
            ))}

            <g className="mo mo-fade" style={css({ "--s": example.s + 2 })}>
              <text className="dg-label" x="24" y={bottom + 34}>
                {l.you}
              </text>
              <text className="dg-text dg-strong" x="146" y={bottom + 35}>
                $
              </text>
              {tiles(example.you, bottom)}
            </g>

            <g className="mo mo-pop" style={css({ "--s": example.s + 3 })}>
              <rect
                className="dg-box"
                x="364"
                y={example.top + 16}
                width="172"
                height="126"
                rx="12"
              />
              <text className="dg-label" x="388" y={example.top + 54}>
                {l.gap}
              </text>
              <text className="dg-text dg-strong dg-num" x="388" y={example.top + 88}>
                {example.gap}
              </text>
              <text className="dg-label dg-num" x="388" y={example.top + 120}>
                {example.nines}
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
    "balance-your-checking-account-math": {
      viewBox: "0 0 560 424",
      caption: copy.diagrams["balance-your-checking-account-math"].caption,
      description: copy.diagrams["balance-your-checking-account-math"].description,
      Body: TheMath,
    },
    "balance-your-checking-account-gap": {
      viewBox: "0 0 560 410",
      caption: copy.diagrams["balance-your-checking-account-gap"].caption,
      description: copy.diagrams["balance-your-checking-account-gap"].description,
      Body: TheGap,
    },
  },
};
