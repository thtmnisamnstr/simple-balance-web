import { correctionArt, heroArt } from "@/content/home";
import { css } from "@/components/learn-art/frame";
import { LogoBadge } from "@/components/learn-art/glyphs";
import { typesetAll } from "@/lib/typeset";

const hero = typesetAll(heroArt);
const correction = typesetAll(correctionArt);

/**
 * The homepage's two drawings, in the learn pictures' two languages: the
 * hero on the application's art panel, and the correction in the page's own
 * colors, the way a learn diagram is.
 *
 * Both are hidden from assistive technology, and on this page that is a rule
 * rather than a choice: `tests/home-page.test.tsx` holds every <svg> here to
 * `aria-hidden`, because each drawing sits beside a sentence that already
 * says what it shows. A screen reader hearing the hero's four rows read out
 * would be hearing the lede again, as arithmetic.
 */

/**
 * Where the four rows sit, top to bottom. Module scope, not per render.
 *
 * Each row is two lines, the name over the amount. The first version put
 * them side by side and "Started at" ran into "$3,000.00" at every width,
 * because a row narrow enough to leave room for the total is too narrow for
 * a label and a five-figure amount on one line.
 */
const ROW_Y = [40, 134, 228, 322];
const ROW_X = 24;
const ROW_W = 264;
const ROW_H = 78;
const TOTAL = { x: 352, y: 156, w: 264, h: 204 } as const;

/**
 * Three payments arriving in an account, and the balance they come to.
 *
 * Fun the way the logo is: a few bold shapes on the sign-in panel, in its
 * mint. The rows slide in, the lines draw to the total, the total arrives and
 * the check lands last, then it holds about five seconds and builds again:
 * the page wraps it in a `.mo-loop` and a stop control, which is `web.md` 8.2.
 */
export function HeroArt() {
  const rows = [
    { label: hero.start.label, amount: hero.start.amount, sign: "start" as const },
    ...hero.payments.map((payment) => ({
      ...payment,
      sign: payment.amount.startsWith("+") ? ("in" as const) : ("out" as const),
    })),
  ];
  const into = { x: TOTAL.x, y: TOTAL.y + TOTAL.h / 2 };

  return (
    <div className="art-panel home-hero-art" aria-hidden="true">
      <svg
        className="art-svg"
        viewBox="0 0 640 440"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        aria-hidden="true"
      >
        <circle className="art-orbit" cx={TOTAL.x + TOTAL.w / 2} cy={into.y} r={200} />
        <circle className="art-orbit" cx={TOTAL.x + TOTAL.w / 2} cy={into.y} r={132} />

        {rows.map((row, index) => {
          const y = ROW_Y[index]!;
          const mid = y + ROW_H / 2;
          return (
            <g key={row.label}>
              {/* The line first, so the row sits on top of where it starts. */}
              <path
                className="home-art-wire mo mo-draw"
                style={css({ "--s": 4 + index * 0.5 })}
                pathLength={1}
                d={`M${ROW_X + ROW_W} ${mid} C${ROW_X + ROW_W + 28} ${mid} ${into.x - 28} ${into.y} ${into.x} ${into.y}`}
              />
              <g className="mo mo-slide-l" style={css({ "--s": index })}>
                <rect className="art-veil" x={ROW_X} y={y} width={ROW_W} height={ROW_H} rx={18} />
                <circle
                  className={row.sign === "in" ? "art-mint" : "home-art-chip"}
                  cx={ROW_X + 38}
                  cy={mid}
                  r={17}
                />
                {row.sign === "start" ? null : (
                  <path
                    className={row.sign === "in" ? "art-glyph-on-mint" : "art-glyph"}
                    d={
                      row.sign === "in"
                        ? `M${ROW_X + 38} ${mid - 8}v16M${ROW_X + 30} ${mid}h16`
                        : `M${ROW_X + 30} ${mid}h16`
                    }
                  />
                )}
                <text className="home-art-label" x={ROW_X + 68} y={y + 31}>
                  {row.label}
                </text>
                <text
                  className={row.sign === "start" ? "home-art-amount-muted" : "home-art-amount"}
                  x={ROW_X + 68}
                  y={y + 62}
                >
                  {row.amount}
                </text>
              </g>
            </g>
          );
        })}

        <g className="mo mo-pop" style={css({ "--s": 7 })}>
          <rect
            className="art-veil home-art-total-card"
            x={TOTAL.x}
            y={TOTAL.y}
            width={TOTAL.w}
            height={TOTAL.h}
            rx={26}
          />
          <text className="home-art-label" x={TOTAL.x + 28} y={TOTAL.y + 54}>
            {hero.account}
          </text>
          <text className="home-art-total" x={TOTAL.x + 28} y={TOTAL.y + 110}>
            {hero.total}
          </text>
        </g>
        <g className="mo mo-pop" style={css({ "--s": 10 })}>
          <rect
            className="art-mint"
            x={TOTAL.x + 28}
            y={TOTAL.y + 138}
            width={156}
            height={40}
            rx={20}
          />
          <path className="art-glyph-on-mint" d={`M${TOTAL.x + 46} ${TOTAL.y + 158}l6 6 12-13`} />
          <text className="home-art-pill" x={TOTAL.x + 76} y={TOTAL.y + 166}>
            {hero.check}
          </text>
        </g>
        <g className="mo mo-pop" style={css({ "--s": 8 })}>
          <LogoBadge x={TOTAL.x + TOTAL.w - 34} y={TOTAL.y - 4} size={52} />
        </g>
      </svg>
    </div>
  );
}

/**
 * A payment fixed, with what it used to say kept beside it.
 *
 * Drawn in the page's colors on a learn diagram's surface, which is all the
 * wrapper's `.diagram` gives it now: the `.mo-loop` rule follows the scroll
 * rule in `site.css` and wins, so the strike draws through the old figure,
 * the new one arrives and the history line lands, then it holds and repeats.
 */
export function CorrectionArt() {
  return (
    <div className="diagram home-correction" aria-hidden="true">
      <svg
        className="dg-svg"
        viewBox="0 0 520 250"
        focusable="false"
        aria-hidden="true"
        style={css({ "--c": "var(--green)", "--c-soft": "var(--green-soft)" })}
      >
        <rect className="dg-box" x={10} y={20} width={500} height={110} rx={18} />
        <text className="dg-text dg-strong" x={36} y={66}>
          {correction.payee}
        </text>
        <text className="dg-label" x={36} y={102}>
          {correction.category}
        </text>
        <text className="dg-label dg-num" x={484} y={66} textAnchor="end">
          {correction.was}
        </text>
        <path
          className="dg-stroke mo mo-draw"
          style={css({ "--s": 1, "--c": "var(--red)" })}
          pathLength={1}
          d="M398 59h90"
        />
        <text
          className="dg-text dg-strong dg-num mo mo-pop"
          style={css({ "--s": 3 })}
          x={484}
          y={104}
          textAnchor="end"
        >
          {correction.now}
        </text>

        <g className="mo mo-rise" style={css({ "--s": 5 })}>
          <rect className="dg-soft" x={10} y={156} width={500} height={64} rx={32} />
          <circle className="dg-fill" cx={46} cy={188} r={16} />
          <path className="home-correction-clock" d="M46 180v8l5 4" />
          <text className="dg-text" x={76} y={196}>
            {correction.history}
          </text>
        </g>
      </svg>
    </div>
  );
}
