import type { ReactNode } from "react";

/**
 * An aside inside a doc or a post — a note, a warning, a tip.
 *
 * Available to Markdown as `<Callout kind="warning">…</Callout>`, which is the
 * one thing MDX buys over plain Markdown that a docs writer reaches for daily.
 *
 * The kind carries a visible word as well as a colour, because colour alone
 * does not survive a greyscale print, a colour-blind reader, or a forced-colours
 * mode. That is the same rule the application follows for its charts.
 */
const LABELS = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  danger: "Careful",
} as const;

export type CalloutKind = keyof typeof LABELS;

export function Callout({
  kind = "note",
  title,
  children,
}: {
  readonly kind?: CalloutKind;
  readonly title?: string;
  readonly children: ReactNode;
}) {
  return (
    <aside className={`callout callout-${kind}`}>
      <p className="callout-label">{title ?? LABELS[kind]}</p>
      <div className="callout-body">{children}</div>
    </aside>
  );
}
