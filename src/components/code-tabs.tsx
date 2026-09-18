import type { ReactNode } from "react";

/**
 * Several versions of the same instruction — npm and pnpm, Docker and Compose.
 *
 * Deliberately **not** tabs. A tab strip needs JavaScript, hides content from
 * find-in-page and from anybody who arrives with a link to the hidden half,
 * and needs the selection remembering or it resets on every page. Rendering
 * both, labelled, costs a few lines of vertical space and has none of those
 * problems.
 *
 * Used from Markdown as:
 *
 * ```mdx
 * <CodeTabs>
 *   <CodeTab label="npm">…</CodeTab>
 *   <CodeTab label="pnpm">…</CodeTab>
 * </CodeTabs>
 * ```
 */
export function CodeTabs({ children }: { readonly children: ReactNode }) {
  return <div className="code-tabs">{children}</div>;
}

export function CodeTab({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="code-tab" aria-label={label}>
      <p className="code-tab-label">{label}</p>
      {children}
    </section>
  );
}
