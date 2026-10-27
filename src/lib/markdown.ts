import type { Entry } from "@/content/collections";
import { allDiagrams } from "@/components/learn-art/pieces";
import { site } from "@/content/home";

const base = `https://${site.domain}`;

/**
 * A docs page or a learn guide as plain Markdown, for the copy served beside
 * it at `<page>/index.md` and listed in `/llms.txt` (`content.md` 5.15).
 *
 * The pages are written in Markdown already, so this is the source with the
 * site's components turned back into Markdown a reader that isn't a browser
 * can use, and its links made absolute so they still work out of context:
 *
 * - `<Shot>` becomes an image with its alt text. The line under it saying the
 *   money is made up is already the next paragraph in the source, and stays.
 * - `<Diagram>` becomes its caption and its full description, the same words
 *   a screen reader hears, because the drawing itself can't travel.
 * - `<Callout>` becomes a blockquote led by its title.
 * - `<CodeTabs>` and `<CodeTab>` become a labelled fenced block per tab.
 *
 * `<Figure>` is the sixth and has no conversion: it is the blog's, and a post
 * has no copy. A component this doesn't know is left as written rather than
 * dropped, and `tests/markdown.test.ts` fails on any `<Capitalized` tag left
 * in a copy, so one reaches a doc or guide with its conversion or not at all.
 */
export function entryMarkdown(collection: "docs" | "learn", entry: Entry): string {
  const meta = entry.frontmatter;
  const url = `${base}/${collection}/${entry.slug}/`;
  const date = meta.updated ?? meta.date;
  const header = [
    `# ${meta.title}`,
    "",
    `> ${meta.description}`,
    "",
    `From ${site.name}: ${url}${date ? `. Updated ${date}.` : ""}`,
    "",
  ].join("\n");
  return `${header}\n${flatten(entry.body, url)}\n`;
}

/**
 * The body, with each component replaced and every site link made absolute.
 *
 * `page` is the HTML page the copy stands for, because a link to a heading on
 * the same page, `](#carry-over)`, leads nowhere in a `text/markdown` file and
 * is a dead link in a quote lifted out of it. It goes to the heading on that
 * page, which is where the anchor is; the copy itself has no anchors.
 */
function flatten(body: string, page: string): string {
  return body
    .replace(/<Shot\s+([\s\S]*?)\/>/g, (_, attrs: string) => {
      const name = attribute(attrs, "name");
      const alt = attribute(attrs, "alt");
      return `![${alt}](${base}/screenshots/${name}-light.webp)`;
    })
    .replace(/<Diagram\s+name="([^"]+)"\s*\/>/g, (_, name: string) => {
      const diagram = allDiagrams.get(name);
      if (!diagram) throw new Error(`a Markdown copy names a diagram that doesn't exist: ${name}`);
      return `**Diagram: ${diagram.caption}** ${diagram.description}`;
    })
    .replace(/<Callout([^>]*)>([\s\S]*?)<\/Callout>/g, (_, attrs: string, inner: string) => {
      const title = attribute(attrs, "title");
      const lines = inner.trim().split("\n");
      const lead = title ? `**${title}.** ` : "";
      return lines.map((line, index) => `> ${index === 0 ? lead : ""}${line}`).join("\n");
    })
    .replace(/<CodeTabs>\s*([\s\S]*?)\s*<\/CodeTabs>/g, (_, tabs: string) =>
      tabs.replace(
        /<CodeTab\s+label="([^"]+)">\s*([\s\S]*?)\s*<\/CodeTab>/g,
        (__, label: string, code: string) => `${label}:\n\n${code.trim()}\n`,
      ),
    )
    .replace(/\]\(\//g, `](${base}/`)
    .replace(/\]\(#/g, `](${page}#`);
}

function attribute(attrs: string, name: string): string {
  return new RegExp(`${name}="([^"]*)"`).exec(attrs)?.[1] ?? "";
}
