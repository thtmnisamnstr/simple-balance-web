import { allEntries, bySection } from "@/content/collections";
import { announcedSections } from "@/content/sections";
import { site } from "@/content/home";
import { llms } from "@/content/llms";

/**
 * `/llms.txt`, by the llmstxt.org format: an H1, a blockquote, a few notes,
 * then H2 lists of links, with `Optional` last for what an agent can skip.
 *
 * Built from what the site already keeps true, so it can't drift from the
 * pages: the announced sections in their sidebar order, each page's own title
 * and description, and prices from the application's snapshot. An unannounced
 * section is absent here for the reason it is absent from the nav and the
 * sitemap (`src/content/sections.ts`): this is one more surface of the same
 * flag.
 *
 * Small in value and smaller in cost. Google says Search ignores the file;
 * the readers that do fetch it are mostly coding agents and assistants told
 * about the site, and Lighthouse audits its shape. `content.md` 5.15 has the
 * evidence and the decision not to publish `llms-full.txt`.
 */
export const dynamic = "force-static";

const base = `https://${site.domain}`;

export function GET(): Response {
  const lines: string[] = [`# ${site.name}`, "", `> ${llms.summary}`, ""];
  for (const note of llms.notes) lines.push(`- ${note}`);

  const titles: Record<string, string> = { docs: llms.docsTitle, learn: llms.learnTitle };
  // The docs first: what somebody asks an assistant about Simple Balance is
  // usually how to do something in it, and the guides come after.
  const order = ["docs", "learn", "blog"];
  const sections = announcedSections().toSorted(
    (a, b) => order.indexOf(a.key) - order.indexOf(b.key),
  );
  for (const section of sections) {
    lines.push("", `## ${titles[section.key] ?? section.label}`, "");
    const entries =
      section.key === "blog"
        ? allEntries("blog")
        : bySection(section.key).flatMap((group) => group.entries);
    for (const entry of entries) {
      // The blog has no Markdown copies yet, so once it is announced its
      // posts are listed by their pages; docs and learn by their copies.
      const page = `${base}${section.href}${entry.slug}/`;
      const url = section.key === "blog" ? page : `${page}index.md`;
      lines.push(`- [${entry.frontmatter.title}](${url}): ${entry.frontmatter.description}`);
    }
  }

  lines.push("", `## ${llms.plansTitle}`, "", `- [Pricing](${base}/pricing/): ${llms.pricing}`);
  lines.push(
    "",
    `## ${llms.optionalTitle}`,
    "",
    `- [Privacy policy](${base}/privacy/)`,
    `- [Terms of use](${base}/terms/)`,
    `- [Source code](${site.sourceUrl})`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
