import type { ReactNode } from "react";
import { ArtFrame, Orbits, css } from "@/components/learn-art/frame";
import { LogoBadge } from "@/components/learn-art/glyphs";
import { DocMark, docGlyphs, marks } from "./glyphs";

/**
 * The documentation's pictures: one for the index's intro and one for each
 * group of pages, drawn on the application's art panel in its vocabulary
 * (`docs/standards/web.md` 5.7), the same way the learn heroes are.
 *
 * Each group's picture is built from the marks of the pages in it, so the
 * card a reader is about to open is already in the picture above it.
 */

/** A frosted chip on the panel with a page's mark on it. */
function Chip({
  paths,
  x,
  y,
  order,
}: {
  readonly paths: readonly string[];
  readonly x: number;
  readonly y: number;
  readonly order: number;
}) {
  return (
    <g className="mo mo-pop" style={css({ "--s": order })}>
      <circle className="art-veil" cx={x} cy={y} r={64} />
      <DocMark paths={paths} x={x} y={y} size={72} />
    </g>
  );
}

/**
 * Get started: a ledger with a flag planted on it.
 *
 * The first visit ends with your own spending in front of you, so the card is
 * the app's ledger card with its mint amounts, and the flag is the one bold
 * object, the way the logo is one. The two chips are the steps before it:
 * an account of your own, and a statement coming in.
 */
function GetStarted() {
  const rows = [
    { y: 80, width: 150 },
    { y: 150, width: 96 },
    { y: 220, width: 124 },
  ];
  return (
    <>
      <Orbits cx={600} cy={300} />

      <g transform="translate(330 250) rotate(-4)">
        <g className="mo mo-rise">
          <rect className="art-veil" width="500" height="280" rx="30" />
          {rows.map((row, index) => (
            <g key={row.y}>
              <circle className="art-muted" cx="56" cy={row.y} r="15" />
              <rect className="art-muted" x="90" y={row.y - 11} width="150" height="22" rx="11" />
              <rect
                className="art-mint mo mo-grow-x"
                style={css({ "--s": index + 2, transformOrigin: "right center" })}
                x={460 - row.width}
                y={row.y - 13}
                width={row.width}
                height="26"
                rx="13"
              />
            </g>
          ))}
        </g>
      </g>

      {/* Planted on the card's top edge, which the tilt lifts to y 221 here. */}
      <g className="mo mo-grow-y" style={css({ "--s": 5 })}>
        <path className="art-line" d="M750 226V60" />
        <circle className="art-ink" cx="750" cy="56" r="14" />
      </g>
      <g className="mo mo-tilt" style={css({ "--s": 6, transformOrigin: "left center" })}>
        <path className="art-mint" d="M756 62h214l-44 58 44 58H756z" />
      </g>

      <Chip paths={docGlyphs["your-account-and-plan"]} x={200} y={186} order={1} />
      <Chip paths={docGlyphs["importing-a-statement"]} x={200} y={420} order={3} />
    </>
  );
}

/**
 * Using Simple Balance: the app's window, with what each page explains around
 * it.
 *
 * The window carries a budget gauge and the ledger's rows because those are
 * the two things somebody using it looks at every day. The chips are the
 * other pages: a statement coming in, a transfer, an assistant plugged in,
 * and your own account.
 */
function UsingSimpleBalance() {
  const rows = [
    { y: 220, width: 84 },
    { y: 300, width: 54 },
    { y: 380, width: 110 },
  ];
  return (
    <>
      <Orbits cx={600} cy={300} />

      <g className="mo mo-rise">
        <rect className="art-veil" x="300" y="110" width="600" height="380" rx="30" />
        <circle className="art-muted" cx="344" cy="152" r="9" />
        <circle className="art-muted" cx="374" cy="152" r="9" />
        <circle className="art-muted" cx="404" cy="152" r="9" />
      </g>

      {/* The budget: a track, and how much of it has gone. */}
      <g className="mo mo-fade" style={css({ "--s": 1 })}>
        <rect className="art-ink" x="344" y="196" width="170" height="22" rx="11" />
        <rect className="art-muted" x="344" y="234" width="110" height="16" rx="8" />
        <path className="art-line-muted" d="M348 440a112 112 0 0 1 224 0" />
      </g>
      <path
        className="art-line-mint mo mo-draw"
        style={css({ "--s": 2 })}
        pathLength={1}
        d="M348 440A112 112 0 0 1 525.8 349.4"
      />

      {rows.map((row, index) => (
        <g key={row.y}>
          <circle className="art-ink" cx="652" cy={row.y} r="14" />
          <rect className="art-muted" x="680" y={row.y - 9} width="90" height="18" rx="9" />
          <rect
            className="art-mint mo mo-grow-x"
            style={css({ "--s": index + 2, transformOrigin: "right center" })}
            x={862 - row.width}
            y={row.y - 11}
            width={row.width}
            height="22"
            rx="11"
          />
        </g>
      ))}

      <Chip paths={docGlyphs["importing-a-statement"]} x={196} y={190} order={4} />
      <Chip paths={docGlyphs.transactions} x={196} y={410} order={5} />
      <Chip paths={docGlyphs.templates} x={1004} y={190} order={6} />
      <Chip paths={docGlyphs["recurring-transactions"]} x={1004} y={410} order={7} />
    </>
  );
}

/**
 * Budgets and reports: a budget gauge beside a chart rising, with the
 * section's other page, a goal, as a chip.
 *
 * The gauge is the budget's question (how much has gone) and the bars are a
 * report's answer (where it went, month by month), which is the section in
 * two shapes.
 */
function BudgetsAndReports() {
  const bars = [
    { x: 660, height: 120 },
    { x: 730, height: 190 },
    { x: 800, height: 150 },
    { x: 870, height: 240 },
  ];
  return (
    <>
      <Orbits cx={600} cy={300} />

      <g className="mo mo-rise">
        <rect className="art-veil" x="250" y="150" width="340" height="300" rx="30" />
      </g>
      <path className="art-line-muted" d="M310 390a110 110 0 0 1 220 0" />
      <path
        className="art-line-mint mo mo-draw"
        style={css({ "--s": 1 })}
        pathLength={1}
        d="M310 390A110 110 0 0 1 494.8 312.8"
      />
      <rect className="art-ink" x="320" y="200" width="150" height="20" rx="10" />

      <g className="mo mo-rise" style={css({ "--s": 1 })}>
        <rect className="art-veil" x="620" y="150" width="320" height="300" rx="30" />
      </g>
      {bars.map((bar, index) => (
        <rect
          key={bar.x}
          className="art-mint mo mo-grow-y"
          style={css({ "--s": index + 2, transformOrigin: "center bottom" })}
          x={bar.x}
          y={420 - bar.height}
          width="44"
          height={bar.height}
          rx="10"
        />
      ))}

      <Chip paths={docGlyphs["planning-ahead"]} x={170} y={190} order={6} />
      <Chip paths={docGlyphs.reports} x={1030} y={410} order={7} />
    </>
  );
}

/**
 * Your account: the person, a switch for how things look, and the record of
 * what happened, with the plan and the assistant as chips.
 */
function YourAccount() {
  return (
    <>
      <Orbits cx={600} cy={300} />

      <g className="mo mo-rise">
        <rect className="art-veil" x="370" y="130" width="460" height="340" rx="30" />
      </g>
      <g className="mo mo-pop" style={css({ "--s": 1 })}>
        <circle className="art-ink" cx="470" cy="230" r="44" />
      </g>
      <rect className="art-ink" x="540" y="206" width="200" height="22" rx="11" />
      <rect className="art-muted" x="540" y="242" width="130" height="16" rx="8" />

      {/* A switch, turned on: a preference set. */}
      <g className="mo mo-fade" style={css({ "--s": 2 })}>
        <rect className="art-muted" x="420" y="330" width="96" height="48" rx="24" />
      </g>
      <g className="mo mo-slide-l" style={css({ "--s": 3 })}>
        <rect className="art-mint" x="420" y="330" width="96" height="48" rx="24" />
        <circle className="art-base" cx="492" cy="354" r="17" />
      </g>
      {[340, 380].map((y, index) => (
        <rect
          key={y}
          className="art-muted mo mo-grow-x"
          style={css({ "--s": index + 3 })}
          x="560"
          y={y}
          width={index === 0 ? 210 : 160}
          height="16"
          rx="8"
        />
      ))}

      <Chip paths={docGlyphs["activity-history"]} x={200} y={190} order={5} />
      <Chip paths={docGlyphs["agents-and-mcp"]} x={200} y={410} order={6} />
      <Chip paths={docGlyphs["your-account-and-plan"]} x={1000} y={300} order={7} />
    </>
  );
}

/**
 * Self-hosting: a house with the logo inside, wired to a server.
 *
 * "Your own copy" is the idea the section turns on, and a house is the
 * plainest picture of "yours". The server beside it is where it runs, and the
 * chips are the two ways of getting it there: containers, or a cloud.
 */
function SelfHosting() {
  return (
    <>
      <Orbits cx={560} cy={300} />

      <path
        className="art-line mo mo-draw"
        style={css({ "--s": 0 })}
        pathLength={1}
        d="M352 262V500H688V262"
      />
      <path
        className="art-line mo mo-draw"
        style={css({ "--s": 1 })}
        pathLength={1}
        d="M304 300 520 118 736 300"
      />
      <g className="mo mo-pop" style={css({ "--s": 3 })}>
        <LogoBadge x={520} y={392} size={150} />
      </g>

      {/* The cable first, then the machine it reaches. */}
      <path
        className="art-line-mint mo mo-draw"
        style={css({ "--s": 4 })}
        pathLength={1}
        d="M688 442H800"
      />
      {[300, 400].map((y, index) => (
        <g key={y} className="mo mo-slide-r" style={css({ "--s": index + 4 })}>
          <rect className="art-veil" x="800" y={y} width="240" height="84" rx="20" />
          <circle className="art-mint" cx="842" cy={y + 42} r="12" />
          <rect className="art-muted" x="874" y={y + 34} width="128" height="16" rx="8" />
        </g>
      ))}

      <Chip paths={docGlyphs["deploying-to-oracle-cloud-or-aws"]} x={920} y={170} order={6} />
      <Chip paths={docGlyphs["deploying-with-docker-compose"]} x={190} y={400} order={7} />
    </>
  );
}

/**
 * Each group's picture and the mark that stands for it on the intro, keyed by
 * the group names `content/docs/_sections.json` orders.
 *
 * `tests/docs-features.test.ts` holds these keys and the groups to one set,
 * so a group added there without a picture here fails, rather than showing
 * a heading over an empty panel.
 */
export const groupArt: Readonly<
  Record<string, { readonly mark: readonly string[]; readonly Picture: () => ReactNode }>
> = {
  "Get started": { mark: docGlyphs["getting-started"], Picture: GetStarted },
  "Using Simple Balance": { mark: marks.logo, Picture: UsingSimpleBalance },
  "Budgets and reports": { mark: docGlyphs.reports, Picture: BudgetsAndReports },
  "Your account": { mark: docGlyphs["your-account-and-plan"], Picture: YourAccount },
  "Self-hosting": { mark: marks.server, Picture: SelfHosting },
};

function artFor(group: string) {
  const art = groupArt[group];
  // As `docGlyph`: a group with no picture fails the build, not the reader.
  if (!art) throw new Error(`no docs art for the group "${group}" in src/components/docs-art`);
  return art;
}

/** A group's picture, built as it is scrolled to. */
export function GroupPicture({ group }: { readonly group: string }) {
  const { Picture } = artFor(group);
  return (
    <ArtFrame className="docs-group-art">
      <Picture />
    </ArtFrame>
  );
}

/**
 * The index's own picture: the documentation as a binder, one divider per
 * group, fanned so every tab shows.
 *
 * The front divider is the first group, and its tab is the mint one, because
 * it is where a newcomer starts. The tabs carry the same marks the groups
 * below are drawn around, so the picture is a map of the page under it
 * rather than decoration beside it. Plays once when the page opens and is
 * still within about two seconds.
 */
export function DocsIntroArt({ groups }: { readonly groups: readonly string[] }) {
  // Drawn back to front: the last group is the divider furthest back. The
  // fan and the tabs are spread over however many groups there are, because
  // the first drawing spaced three by fixed steps and a fifth tab landed above
  // the top of the panel. A tab shrinks so every one still fits down a
  // divider's edge, which is 380 tall.
  const steps = Math.max(groups.length - 1, 1);
  const tab = Math.min(96, Math.floor(340 / groups.length) - 6);
  const pages = groups
    .map((group, index) => ({
      group,
      index,
      x: 120 + (index * 68) / steps,
      y: 150 - (index * 60) / steps,
      turn: -6 + (index * 10) / steps,
      tabY: 24 + (groups.length - 1 - index) * (tab + 6),
    }))
    .toReversed();

  return (
    <svg className="docs-intro-svg" viewBox="0 0 640 600" aria-hidden="true" focusable="false">
      <circle className="art-orbit" cx="320" cy="300" r="250" />
      <circle className="art-orbit" cx="320" cy="300" r="160" />

      {pages.map(({ group, index, x, y, turn, tabY }) => {
        const front = index === 0;
        const cx = x + 150;
        const cy = y + 190;
        return (
          <g key={group} transform={`rotate(${turn} ${cx} ${cy})`}>
            <g className="mo mo-rise" style={css({ "--s": groups.length - 1 - index })}>
              {/* The tab, under the page so the page's edge covers its root.
                  An opaque base under each frosted surface, because three
                  translucent dividers stacked show every edge through every
                  other. */}
              <g className="mo mo-slide-l" style={css({ "--s": groups.length + 1 - index })}>
                <rect
                  className="art-base"
                  x={x + 270}
                  y={y + tabY}
                  width={tab}
                  height={tab}
                  rx={tab * 0.23}
                />
                <rect
                  className={front ? "art-mint" : "art-veil"}
                  x={x + 270}
                  y={y + tabY}
                  width={tab}
                  height={tab}
                  rx={tab * 0.23}
                />
                <DocMark
                  paths={artFor(group).mark}
                  x={x + 270 + tab * 0.66}
                  y={y + tabY + tab / 2}
                  size={tab * 0.52}
                  className={front ? "art-glyph-on-mint" : "art-glyph"}
                />
              </g>
              <rect className="art-base" x={x} y={y} width="300" height="380" rx="24" />
              <rect className="art-veil" x={x} y={y} width="300" height="380" rx="24" />
            </g>
          </g>
        );
      })}

      {/* What is written on the front divider: the logo, a heading, lines. */}
      <g transform="rotate(-6 270 340)">
        <g className="mo mo-pop" style={css({ "--s": 4 })}>
          <LogoBadge x={186} y={216} size={76} />
        </g>
        <rect
          className="art-mint mo mo-grow-x"
          style={css({ "--s": 5 })}
          x="240"
          y="196"
          width="132"
          height="20"
          rx="10"
        />
        <rect
          className="art-muted mo mo-grow-x"
          style={css({ "--s": 5.5 })}
          x="240"
          y="228"
          width="84"
          height="14"
          rx="7"
        />
        {[
          { y: 300, width: 220 },
          { y: 340, width: 188 },
          { y: 380, width: 208 },
          { y: 420, width: 132 },
        ].map((line, index) => (
          <rect
            key={line.y}
            className="art-muted mo mo-grow-x"
            style={css({ "--s": 6 + index * 0.5 })}
            x="160"
            y={line.y}
            width={line.width}
            height="14"
            rx="7"
          />
        ))}
        <rect
          className="art-mint mo mo-pop"
          style={css({ "--s": 8 })}
          x="160"
          y="462"
          width="96"
          height="30"
          rx="15"
        />
      </g>
    </svg>
  );
}
