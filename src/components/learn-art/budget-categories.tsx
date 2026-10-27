import { budgetCategoriesArt } from "@/content/learn-art/budget-categories";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(budgetCategoriesArt);

/** The ring every tag hangs from, and the point the bundle turns about. */
const RING_X = 690;
const RING_Y = 136;
/** How far a tag's hole sits below its top edge. */
const HOLE = 36;
/** How far below the ring the front tag, Food, hangs. */
const FOOD_TOP = 104;

/**
 * A hanging price tag, the article's own mark at hero size: its top corners
 * clipped toward the string, the way the glyph on the index is drawn. `top`
 * is how far below the ring it hangs.
 */
function tagPath(top: number) {
  const y = RING_Y + top;
  return `M${RING_X - 20} ${y}H${RING_X + 20}L${RING_X + 92} ${y + 64}V${y + 212}a20 20 0 0 1-20 20H${RING_X - 72}a20 20 0 0 1-20-20V${y + 64}Z`;
}

type Tag = {
  readonly label: keyof typeof copy.hero;
  readonly angle: number;
  /** How far below the ring the tag's top edge hangs. */
  readonly top: number;
  /** Its word's baseline below the ring, and for a back tag a nudge into
      the part the front tag leaves showing. */
  readonly labelY: number;
  readonly labelX: number;
  readonly s: number;
};

// Back to front, so Food, the tag the purchase gets, is the one on top. It
// hangs lower than the two behind it, which keeps their holes and top
// corners clear of its own rather than crowding all three at one point.
const TAGS: readonly Tag[] = [
  { label: "home", angle: 40, top: 56, labelY: 262, labelX: -10, s: 1 },
  { label: "fun", angle: -40, top: 56, labelY: 262, labelX: 10, s: 3 },
  { label: "food", angle: 0, top: FOOD_TOP, labelY: 272, labelX: 0, s: 2 },
];

/**
 * A bundle of three price tags on one ring, Home, Food and Fun, beside a
 * statement whose rows each take a small tag, and one purchase tied to Food.
 *
 * A tag because that is all a category is: a label you put on money. Three
 * rather than the article's ten so the picture reads on a phone card, and
 * fanned from one ring because they are one set you pick from every time.
 * The coin is the logo's own circled dollar, the purchase being labeled, and
 * its string is drawn last so the picture ends on the article's first
 * sentence: every purchase gets one.
 */
function Hero() {
  const rows = [110, 80, 120, 92];

  return (
    <>
      <Orbits cx={RING_X} cy={300} />

      {/* The statement: purchases in the order they happened, each taking a
          tag in turn. */}
      <g transform="translate(136 70) rotate(-4)">
        <g className="mo mo-rise">
          <rect className="art-veil" width="224" height="196" rx="22" />
          {rows.map((width, index) => {
            const cy = 40 + index * 42;
            return (
              <g key={width}>
                <rect className="art-muted" x="24" y={cy - 10} width={width} height="20" rx="10" />
                <g className="mo mo-pop" style={css({ "--s": index + 1 })}>
                  <path
                    className="art-mint"
                    d={`M152 ${cy}l16-15h32a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6h-32z`}
                  />
                  <circle className="art-base" cx="172" cy={cy} r="6" />
                </g>
              </g>
            );
          })}
        </g>
      </g>

      {/* The bundle fans out from the ring, then swings on it once the
          purchase has arrived and before it is tied on, so the string never
          has to follow a moving hole. */}
      <g
        className="mo mo-swing"
        style={css({
          "--s": 7,
          "--dur": "0.8s",
          transformBox: "view-box",
          transformOrigin: `${RING_X}px ${RING_Y}px`,
        })}
      >
        {TAGS.map((tag) => {
          const hole = RING_Y + tag.top + HOLE;
          return (
            <g key={tag.label} transform={`rotate(${tag.angle} ${RING_X} ${RING_Y})`}>
              <g
                className="mo mo-tilt"
                style={css({
                  "--s": tag.s,
                  transformBox: "view-box",
                  transformOrigin: `${RING_X}px ${RING_Y}px`,
                })}
              >
                {/* The panel's own green under two veils: opaque, so the tag in
                  front hides the outlines behind it, and about as light as
                  one veil is on the glow around it. */}
                <path className="art-base" d={tagPath(tag.top)} />
                <path className="art-veil" d={tagPath(tag.top)} />
                <path className="art-veil" d={tagPath(tag.top)} />
                <path className="art-line" d={tagPath(tag.top)} />
                <path className="art-line-muted" d={`M${RING_X} ${RING_Y + 26}V${hole}`} />
                <circle className="art-base" cx={RING_X} cy={hole} r="14" />
                <circle className="art-line-muted" cx={RING_X} cy={hole} r="14" />
                <text
                  className="art-text"
                  x={RING_X + tag.labelX}
                  y={RING_Y + tag.labelY}
                  textAnchor="middle"
                >
                  {copy.hero[tag.label]}
                </text>
              </g>
            </g>
          );
        })}
        <circle className="art-line mo mo-pop" cx={RING_X} cy={RING_Y} r="26" />
      </g>

      {/* The purchase, tipped as it lands. */}
      <g transform="translate(1010 250) rotate(-16)">
        <g className="mo mo-drop" style={css({ "--s": 6 })}>
          <circle className="art-mint" r="50" />
          <g transform="translate(-54 -54) scale(4.5)">
            <g className="art-glyph-on-mint">
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </g>
          </g>
        </g>
      </g>

      {/* Tied on last, from the coin to Food's hole. Step 21 is 2.52s, just
          after the swing's two plays end at 2.44s. */}
      <path
        className="art-line-muted mo mo-draw"
        style={css({ "--s": 21, "--dur": "0.6s" })}
        pathLength={1}
        d={`M962 252C880 256 790 270 ${RING_X + 14} ${RING_Y + FOOD_TOP + HOLE}`}
      />
    </>
  );
}

/** The three the article names sit in a box with their total under them. */
function rowTop(index: number) {
  return index < 3 ? 58 + index * 40 : 272 + (index - 3) * 40;
}

/**
 * The 2024 spending shares the article quotes, largest first, with the three
 * it names boxed together.
 *
 * Every major category the survey reports rather than only the three,
 * because the long tail of small bars is itself the article's point: a few
 * labels carry most of the money. The rest are drawn in one quiet color so
 * the three the article tells you to set up first are the ones the eye
 * lands on.
 */
function Spending() {
  const l = copy.diagrams["budget-categories-spending"].labels;
  const colors = ["var(--series-2)", "var(--series-5)"] as const;
  // 9 units a percentage point, so housing's bar leaves room for its label.
  const unit = 9;
  const x0 = 24;
  const groceries = Number.parseFloat(l.groceries.share) * unit;
  const eatingOut = Number.parseFloat(l.eatingOut.share) * unit;

  return (
    <>
      <text className="dg-text dg-strong dg-num" x={x0} y="30">
        {l.total}
      </text>
      <rect className="dg-box" x="8" y="46" width="544" height="210" rx="14" />

      {l.rows.map((row, index) => {
        // Read from the printed share, so a bar cannot disagree with its label.
        const width = Number.parseFloat(row.share) * unit;
        const y = rowTop(index);
        // The boxed three build one at a time and their total lands before
        // the tail, which arrives as one beat: "and everything else is small".
        const step = index < 3 ? index : 4;
        return (
          <g key={row.name}>
            {index === 2 ? (
              <>
                <rect
                  className="dg-fill mo mo-grow-x"
                  style={css({ "--s": step, "--c": "var(--series-3)" })}
                  x={x0}
                  y={y}
                  width={groceries - 2}
                  height="24"
                  rx="6"
                />
                <rect
                  className="dg-fill mo mo-grow-x"
                  style={css({ "--s": step + 0.5, "--c": "var(--series-6)" })}
                  x={x0 + groceries + 1}
                  y={y}
                  width={eatingOut - 1}
                  height="24"
                  rx="6"
                />
              </>
            ) : (
              <rect
                className="dg-fill mo mo-grow-x"
                style={css({ "--s": step, "--c": colors[index] ?? "var(--line-strong)" })}
                x={x0}
                y={y}
                width={width}
                height="24"
                rx="6"
              />
            )}
            <text
              className="mo mo-fade"
              style={css({ "--s": step + 1 })}
              x={x0 + width + 10}
              y={y + 19}
            >
              <tspan className="dg-label">{row.name}</tspan>
              <tspan className="dg-text dg-strong dg-num" dx="8">
                {row.share}
              </tspan>
            </text>
          </g>
        );
      })}

      {/* The key for food's two parts, which are too short to carry their
          own names. */}
      <g className="mo mo-fade" style={css({ "--s": 3 })}>
        <rect
          className="dg-fill"
          style={css({ "--c": "var(--series-3)" })}
          x={x0}
          y="177"
          width="16"
          height="16"
          rx="4"
        />
        <text className="dg-label dg-num" x={x0 + 24} y="192">
          {l.groceries.name} {l.groceries.share}
        </text>
        <rect
          className="dg-fill"
          style={css({ "--c": "var(--series-6)" })}
          x="236"
          y="177"
          width="16"
          height="16"
          rx="4"
        />
        <text className="dg-label dg-num" x="260" y="192">
          {l.eatingOut.name} {l.eatingOut.share}
        </text>
      </g>

      <g className="mo mo-fade" style={css({ "--s": 3.5 })}>
        <path className="dg-rule" d={`M${x0} 210H536`} />
        <text className="dg-text dg-strong dg-num" x={x0} y="240">
          {l.together}
        </text>
      </g>
    </>
  );
}

/**
 * The article's own $640 of food, as one category and then as two.
 *
 * The same length both times, so what changes is only what you can see: the
 * eating-out part takes its own color the moment it has its own name.
 */
function Split() {
  const l = copy.diagrams["budget-categories-split"].labels;
  const x0 = 24;
  const unit = 512 / 640;
  const groceries = 380 * unit;
  const cut = x0 + groceries;
  const end = x0 + 512;

  return (
    <>
      <text className="dg-label" x={x0} y="30">
        {l.before}
      </text>
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--c": "var(--series-3)" })}
        x={x0}
        y="44"
        width="512"
        height="52"
        rx="8"
      />
      <text className="dg-text dg-strong" x={x0} y="128">
        {l.food}
      </text>
      <text className="dg-text dg-num" x={x0} y="156">
        {l.foodAmount}
      </text>

      {/* Through the middle of the gap between the two parts, not along
          either one's edge. */}
      <path
        className="dg-rule dg-dash mo mo-fade"
        style={css({ "--s": 2 })}
        d={`M${cut - 0.5} 36V312`}
      />

      <text className="dg-label" x={x0} y="224">
        {l.after}
      </text>
      <rect
        className="dg-fill mo mo-grow-x"
        style={css({ "--s": 3, "--c": "var(--series-3)" })}
        x={x0}
        y="238"
        width={groceries - 2}
        height="52"
        rx="8"
      />
      <rect
        className="dg-fill mo mo-pop"
        style={css({ "--s": 4, "--c": "var(--series-6)" })}
        x={cut + 1}
        y="238"
        width={end - cut - 1}
        height="52"
        rx="8"
      />
      <g className="mo mo-fade" style={css({ "--s": 5 })}>
        <text className="dg-text dg-strong" x={x0} y="322">
          {l.groceries}
        </text>
        <text className="dg-text dg-num" x={x0} y="350">
          {l.groceriesAmount}
        </text>
        <text className="dg-text dg-strong" x={end} y="322" textAnchor="end">
          {l.eatingOut}
        </text>
        <text className="dg-text dg-num" x={end} y="350" textAnchor="end">
          {l.eatingOutAmount}
        </text>
      </g>

      <text
        className="dg-text dg-strong dg-num mo mo-fade"
        style={css({ "--s": 6 })}
        x="280"
        y="406"
        textAnchor="middle"
      >
        {l.sum}
      </text>
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "budget-categories-spending": {
      viewBox: "0 0 560 550",
      caption: copy.diagrams["budget-categories-spending"].caption,
      description: copy.diagrams["budget-categories-spending"].description,
      Body: Spending,
    },
    "budget-categories-split": {
      viewBox: "0 0 560 420",
      caption: copy.diagrams["budget-categories-split"].caption,
      description: copy.diagrams["budget-categories-split"].description,
      Body: Split,
    },
  },
};
