import {
  citations,
  compareCopy,
  rows,
  type Claim,
  type Contract,
  type Rival,
  type RowKey,
} from "@/content/compare";
import { site } from "@/content/home";

const base = `https://${site.domain}`;

/**
 * A comparison page as plain Markdown, for the agent `/llms.txt` sends here
 * (`content.md` 5.15).
 *
 * Generated from the same module as the page, like the docs' copies, so the
 * two can't disagree. A source is a link in the cell itself rather than a
 * number pointing at a list: a copy is often read a table at a time, and a
 * "[2]" lifted away from its list is a citation to nothing.
 */
export function compareMarkdown(
  rival: Rival,
  contract: Contract,
  ourColumn: Readonly<Record<RowKey, string>>,
): string {
  const url = `${base}/compare/${rival.slug}/`;
  const cite = (claim: Claim) => {
    const links = citations(claim).map((number) => `[source](${rival.sources[number - 1]!.url})`);
    return links.length ? `${claim.text} (${links.join(", ")})` : claim.text;
  };
  return [
    `# ${rival.title}`,
    "",
    `> ${rival.description}`,
    "",
    `From ${site.name}: ${url}. Checked ${rival.checked}.`,
    "",
    rival.answer(contract),
    "",
    compareCopy.checkedNote,
    "",
    `## ${trim(compareCopy.tableTitle)}`,
    "",
    `| ${compareCopy.feature} | Simple Balance | ${rival.name} |`,
    "| --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${row.label} | ${cell(ourColumn[row.key])} | ${cell(cite(rival.them[row.key]))} |`,
    ),
    "",
    `## ${trim(compareCopy.chooseThemTitle(rival.name))}`,
    "",
    ...rival.chooseThem.map((point) => `- ${cite(point)}`),
    "",
    `## ${trim(compareCopy.chooseUsTitle)}`,
    "",
    ...rival.chooseUs.map((point) => `- ${cite(point)}`),
    "",
    `## ${trim(compareCopy.movingTitle(rival.name))}`,
    "",
    ...rival.moving.flatMap((paragraph) => [cite(paragraph), ""]),
    ...compareCopy.movingOurs.flatMap((paragraph) => [paragraph, ""]),
    `[${compareCopy.movingLink}](${base}/docs/importing-a-statement/)`,
    "",
    `## ${trim(compareCopy.sourcesTitle)}`,
    "",
    ...rival.sources.map((source, index) => `${index + 1}. [${source.label}](${source.url})`),
    "",
    compareCopy.trademarks,
    "",
  ].join("\n");
}

/** A table cell can't hold a bare pipe, which would end the cell. */
const cell = (text: string) => text.replaceAll("|", "\\|");

/** A heading on the page is a sentence with its period; in Markdown it's a heading. */
const trim = (heading: string) => heading.replace(/\.$/, "");
