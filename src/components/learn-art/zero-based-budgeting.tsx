import type { ReactNode } from "react";
import { zeroBasedBudgetingArt } from "@/content/learn-art/zero-based-budgeting";
import { typesetAll } from "@/lib/typeset";
import { Orbits, css } from "./frame";
import type { ArticleArt } from "./types";

const copy = typesetAll(zeroBasedBudgetingArt);

const CX = 600;
const CY = 272;

const round = (value: number) => Math.round(value * 10) / 10;

function polar(radius: number, degrees: number, dx = 0, dy = 0): string {
  const angle = (degrees * Math.PI) / 180;
  return `${round(CX + dx + radius * Math.cos(angle))} ${round(CY + dy + radius * Math.sin(angle))}`;
}

/**
 * One piece of the ring: an arc of the logo's circle with round ends, pushed
 * a little out from the middle toward the job it is going to, so each piece
 * points at its own job rather than only being near it.
 */
function bean(
  from: number,
  to: number,
  outer: number,
  inner: number,
  toward: readonly [number, number],
): string {
  const half = (outer - inner) / 2;
  const capDegrees = (half / (inner + half)) * (180 / Math.PI);
  const gap = 5;
  const a0 = from + gap + capDegrees;
  const a1 = to - gap - capDegrees;
  const mid = Math.atan2(toward[1] - CY, toward[0] - CX);
  const dx = 12 * Math.cos(mid);
  const dy = 12 * Math.sin(mid);
  const large = a1 - a0 > 180 ? 1 : 0;
  return [
    `M${polar(outer, a0, dx, dy)}`,
    `A${outer} ${outer} 0 ${large} 1 ${polar(outer, a1, dx, dy)}`,
    `A${half} ${half} 0 0 1 ${polar(inner, a1, dx, dy)}`,
    `A${inner} ${inner} 0 ${large} 0 ${polar(inner, a0, dx, dy)}`,
    `A${half} ${half} 0 0 1 ${polar(outer, a0, dx, dy)}Z`,
  ].join("");
}

/** An icon on the logo's 24-unit grid, at the logo's stroke, scaled up. */
function Icon({
  x,
  y,
  size,
  children,
}: {
  x: number;
  y: number;
  size: number;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}>
      <g className="art-glyph">{children}</g>
    </g>
  );
}

const jobs = [
  {
    key: "rent",
    span: 125,
    at: [867, 136],
    icon: (
      <>
        <path d="M3.5 11 12 4l8.5 7" />
        <path d="M6 9.5V20h12V9.5" />
        <path d="M10 20v-5.5h4V20" />
      </>
    ),
  },
  {
    key: "groceries",
    span: 80,
    at: [867, 408],
    icon: (
      <>
        <path d="M2.5 4.5h2.6l2.3 10.5h10.3l2-7.5H6.2" />
        <circle cx="9" cy="19.2" r="1.5" />
        <circle cx="16.4" cy="19.2" r="1.5" />
      </>
    ),
  },
  {
    key: "car",
    span: 60,
    at: [333, 408],
    icon: (
      <>
        <path d="M5 17H3.5a1 1 0 0 1-1-1v-3a1.5 1.5 0 0 1 1.5-1.5h16a1.5 1.5 0 0 1 1.5 1.5v3a1 1 0 0 1-1 1H19M9 17h6" />
        <path d="M6 11.5 7.8 7h8.4l1.8 4.5" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
  },
  {
    key: "savings",
    span: 95,
    at: [333, 136],
    icon: (
      <>
        <path d="M19 12.5c0 3.6-3.1 6.5-7.3 6.5S4.2 16.1 4.2 12.5 7.5 6.5 11.7 6.5c1.4 0 2.7.3 3.8.9L18 5.5v3.4c.6.9 1 2.3 1 3.6z" />
        <path d="M19 11.5h1.8v3H19" />
        <path d="M8.2 18.2v2.6M15.2 18.2v2.6" />
        <path d="M9.5 9.6h3.5" />
        <path d="M15.8 11.3h.01" />
        <path d="M4.3 11.6C3 11.6 2.3 10.8 2.5 9.8" />
      </>
    ),
  },
] as const;

/**
 * The logo's circled dollar sign, its circle broken into pieces, each piece
 * handed to a job: rent, groceries, the car and savings.
 *
 * The pieces go round the whole circle with nothing over, which is the whole
 * idea: every dollar has a job. The card says so in the app's own words.
 */
function Hero() {
  const pieces = jobs.map((job, index) => {
    const from = jobs.slice(0, index).reduce((angle, before) => angle + before.span, -102.5);
    return { ...job, d: bean(from, from + job.span, 164, 104, job.at) };
  });

  return (
    <>
      <Orbits cx={CX} cy={CY} />

      <g transform={`translate(${CX - 72} ${CY - 72}) scale(6)`}>
        <g className="art-glyph">
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 18V6" />
        </g>
      </g>

      {pieces.map((piece, index) => (
        <g key={piece.key}>
          <path className="art-mint mo mo-pop" style={css({ "--s": index * 2 + 1 })} d={piece.d} />
          <g className="mo mo-pop" style={css({ "--s": index * 2 + 2 })}>
            <circle className="art-veil" cx={piece.at[0]} cy={piece.at[1]} r="64" />
            <Icon x={piece.at[0]} y={piece.at[1]} size={84}>
              {piece.icon}
            </Icon>
          </g>
        </g>
      ))}

      <g transform="translate(394 484) rotate(-3) scale(1.2)">
        <g className="mo mo-drop" style={css({ "--s": 10 })}>
          <rect className="art-veil" width="344" height="64" rx="22" />
          <text className="art-text-muted" x="28" y="42">
            {copy.hero.left}
          </text>
          <text className="art-text" x="222" y="46">
            {copy.hero.zero}
          </text>
          <g className="mo mo-pop" style={css({ "--s": 13 })}>
            <circle className="art-mint" cx="306" cy="32" r="22" />
            <g transform="translate(279.6 5.6) scale(2.2)">
              <path className="art-glyph-on-mint" d="M8 12.3l3 3 5.5-6" />
            </g>
          </g>
        </g>
      </g>
    </>
  );
}

/** Each job's color, the same in both diagrams so fun is fun in each. */
const jobColor = {
  rent: "var(--series-2)",
  groceries: "var(--series-3)",
  car: "var(--series-5)",
  fun: "var(--series-4)",
  savings: "var(--series-0)",
} as const;

/** A job's dollars, read from the copy beside the words that show them. */
function dollarsFor(key: keyof typeof jobColor): number {
  const job = copy.diagrams["zero-based-budgeting-jobs"].labels.jobs.find(
    (each) => each.key === key,
  );
  if (!job) throw new Error(`No job named ${key} in the zero-based budgeting copy`);
  return job.dollars;
}

/**
 * The article's $3,000 in checking, drawn as the account it sits in, filled
 * end to end by its five jobs.
 *
 * The jobs go inside the account's bar rather than in a bar of their own, so
 * the picture says what the article does: the balance is still $3,000, and
 * what reaches zero is only the part without a job.
 */
function Jobs() {
  const l = copy.diagrams["zero-based-budgeting-jobs"].labels;
  const x0 = 36;
  const unit = 488 / 3000;
  const segments = l.jobs.reduce<{ key: keyof typeof jobColor; x: number; width: number }[]>(
    (all, job) => {
      const previous = all.at(-1);
      const x = previous ? previous.x + previous.width + 4 : x0;
      const width = job.dollars * unit - (job.key === "savings" ? 0 : 4);
      return [...all, { key: job.key, x, width }];
    },
    [],
  );

  return (
    <>
      <text className="dg-text dg-strong" x="24" y="32">
        {l.account}
      </text>
      <text className="dg-text dg-strong dg-num" x="536" y="32" textAnchor="end">
        {l.balance}
      </text>
      <g
        className="mo mo-fade"
        style={css({ "--c": "var(--green)", "--c-soft": "var(--green-soft)" })}
      >
        <rect className="dg-soft" x="24" y="48" width="512" height="76" rx="16" />
        <rect className="dg-stroke" x="24" y="48" width="512" height="76" rx="16" />
      </g>
      {segments.map((segment, index) => (
        <rect
          key={segment.key}
          className="dg-fill mo mo-grow-x"
          style={css({ "--s": index, "--c": jobColor[segment.key] })}
          x={segment.x}
          y="60"
          width={segment.width}
          height="52"
          rx="8"
        />
      ))}

      {l.jobs.map((job, index) => (
        <g
          key={job.key}
          className="mo mo-fade"
          style={css({ "--s": index, "--c": jobColor[job.key] })}
        >
          <rect className="dg-fill" x="24" y={150 + index * 36} width="18" height="18" rx="4" />
          <text className="dg-label" x="54" y={166 + index * 36}>
            {job.name}
          </text>
          <text className="dg-text dg-num" x="236" y={166 + index * 36} textAnchor="end">
            {job.amount}
          </text>
        </g>
      ))}

      <g className="mo mo-fade" style={css({ "--s": 5 })}>
        <text className="dg-label" x="290" y="166">
          {l.sumAccount}
        </text>
        <text className="dg-text dg-num" x="536" y="166" textAnchor="end">
          {l.sumAccountAmount}
        </text>
        <text className="dg-label" x="290" y="202">
          {l.sumJobs}
        </text>
        <text className="dg-text dg-num" x="536" y="202" textAnchor="end">
          {l.sumJobsAmount}
        </text>
        <path className="dg-rule" d="M290 222H536" />
      </g>
      <g className="mo mo-pop" style={css({ "--s": 6 })}>
        <text className="dg-text dg-strong" x="290" y="256">
          {l.sumLeft}
        </text>
        <text className="dg-text dg-strong dg-num" x="536" y="256" textAnchor="end">
          {l.sumLeftAmount}
        </text>
      </g>
    </>
  );
}

/**
 * Covering an overspent job from another one: a $60 piece lifted off the top
 * of fun and set on top of groceries.
 *
 * Columns rather than bars, so the move is a piece carried from one stack to
 * the other, which is what the article asks a reader to picture.
 */
function Move() {
  const l = copy.diagrams["zero-based-budgeting-move"].labels;
  const base = 320;
  const k = 0.5;
  const groceries = dollarsFor("groceries") * k;
  const moved = l.movedDollars * k;
  const fun = (dollarsFor("fun") - l.movedDollars) * k;
  const arrowFrom = base - fun - moved - 14;
  const arrowTo = base - groceries - moved / 2 - 4;

  return (
    <>
      <path className="dg-rule" d={`M72 ${base}H488`} />

      <rect
        className="dg-fill mo mo-grow-y"
        style={css({ "--c": jobColor.groceries })}
        x="100"
        y={base - groceries}
        width="120"
        height={groceries}
        rx="8"
      />
      <rect
        className="dg-fill mo mo-grow-y"
        style={css({ "--s": 1, "--c": jobColor.fun })}
        x="340"
        y={base - fun}
        width="120"
        height={fun}
        rx="8"
      />
      <rect
        className="dg-rule dg-dash mo mo-fade"
        style={css({ "--s": 2 })}
        x="342"
        y={base - fun - 4 - moved}
        width="116"
        height={moved}
        rx="8"
      />

      <g style={css({ "--c": jobColor.fun })}>
        <path
          className="dg-stroke mo mo-draw"
          style={css({ "--s": 3 })}
          pathLength="1"
          d={`M400 ${arrowFrom}C400 112 300 ${arrowTo} 234 ${arrowTo}L248 ${arrowTo - 10}L234 ${arrowTo}L248 ${arrowTo + 10}`}
        />
        <g className="mo mo-fade" style={css({ "--s": 5 })}>
          <text className="dg-text dg-strong dg-num" x="414" y="150">
            {l.moved}
          </text>
        </g>
      </g>
      <rect
        className="dg-fill mo mo-drop"
        style={css({ "--s": 6, "--c": jobColor.fun })}
        x="100"
        y={base - groceries - 4 - moved}
        width="120"
        height={moved}
        rx="8"
      />

      <g className="mo mo-fade" style={css({ "--s": 1 })}>
        <text className="dg-text dg-strong" x="160" y="356" textAnchor="middle">
          {l.groceries}
        </text>
        <text className="dg-text dg-strong" x="400" y="356" textAnchor="middle">
          {l.fun}
        </text>
      </g>
      <g className="mo mo-fade" style={css({ "--s": 7 })}>
        <text className="dg-label dg-num" x="160" y="388" textAnchor="middle">
          {l.groceriesSum}
        </text>
        <text className="dg-label dg-num" x="400" y="388" textAnchor="middle">
          {l.funSum}
        </text>
      </g>
      <text
        className="dg-text dg-strong mo mo-fade"
        style={css({ "--s": 8 })}
        x="280"
        y="440"
        textAnchor="middle"
      >
        {l.left}
      </text>
    </>
  );
}

export const art: ArticleArt = {
  Hero,
  diagrams: {
    "zero-based-budgeting-jobs": {
      viewBox: "0 0 560 326",
      caption: copy.diagrams["zero-based-budgeting-jobs"].caption,
      description: copy.diagrams["zero-based-budgeting-jobs"].description,
      Body: Jobs,
    },
    "zero-based-budgeting-move": {
      viewBox: "0 0 560 460",
      caption: copy.diagrams["zero-based-budgeting-move"].caption,
      description: copy.diagrams["zero-based-budgeting-move"].description,
      Body: Move,
    },
  },
};
