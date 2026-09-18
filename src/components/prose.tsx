import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { Shot } from "@/components/shot";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";
import { CodeTab, CodeTabs } from "@/components/code-tabs";
import { Figure } from "@/components/figure";

/**
 * A rendered Markdown body.
 *
 * `next-mdx-remote/rsc` compiles inside a server component at build time, so
 * none of this reaches the browser as JavaScript. The output is HTML, which is
 * the only shape a static export can serve, and it is why the syntax
 * highlighting below costs the reader nothing: Shiki runs during the build and
 * ships coloured markup, not a highlighter.
 *
 * The plugin set is the conventional one, and each earns its place:
 *
 * - `remark-gfm` — tables, strikethrough, task lists, footnotes and bare URLs.
 *   Without it a Markdown table renders as a line of pipes, which is the most
 *   common "why does my docs page look broken" there is.
 * - `remark-smartypants` — real quotation marks and dashes. Prose typed as
 *   ASCII should not read as ASCII.
 * - `rehype-slug` then `rehype-autolink-headings` — every heading gets a
 *   stable id and a link to itself, so a section can be linked to. Order
 *   matters: the autolinker needs the id that slug just added.
 * - `rehype-pretty-code` — Shiki, with a light and a dark theme emitted
 *   together as CSS custom properties. One highlighted block answers both
 *   colour schemes, which is what lets code follow the page theme without a
 *   second copy of every snippet.
 */
const prettyCode = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  // A blank line in a code block is still a line. Without this it collapses
  // and the block's line numbering stops matching the file it came from.
  keepBackground: false,
} as const;

const components = {
  Shot,
  Callout,
  Figure,
  CodeTabs,
  CodeTab,
  // Every fenced block becomes a CodeBlock, which is a <pre> plus a copy
  // control. Overriding the element rather than asking writers to use a
  // component means an ordinary ``` fence gets the control for free.
  pre: CodeBlock,
};

export function Prose({ body }: { readonly body: string }) {
  return (
    <div className="prose-body">
      <MDXRemote
        source={body}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkSmartypants],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "append",
                  properties: { className: "heading-anchor", ariaHidden: "true", tabIndex: -1 },
                  // A bare "#" is what everyone uses and it is read aloud as
                  // "number sign" by a screen reader that ignores aria-hidden
                  // on a focusable element. The link is hidden and unfocusable
                  // above, so the glyph is decoration only.
                  content: { type: "text", value: "#" },
                },
              ],
              [rehypePrettyCode, prettyCode],
            ],
          },
        }}
      />
    </div>
  );
}
