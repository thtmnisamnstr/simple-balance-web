/**
 * Curly quotes and apostrophes for words that never pass through Markdown.
 *
 * The prose gets them from `remark-smartypants` (`components/prose.tsx`), and
 * everything else on the same page printed what was typed: the contents list
 * said "aren't" directly above a heading saying "aren’t", and a diagram's
 * caption said "doesn't" under a paragraph saying "doesn’t". Every reviewer
 * of the learn pages found it, on every page.
 *
 * Applied where a string is rendered, never where it is written. The source
 * stays ASCII, which is what a person types and what `tests/copy.test.ts`
 * reads, and the ids the contents list links to are slugged from the source,
 * so the anchors cannot move.
 *
 * This is not smartypants, and does not try to be: it covers the cases this
 * site's copy has, which are apostrophes inside or at the end of a word and
 * double quotes around one. `tests/typeset.test.ts` holds it to the prose
 * pipeline's own output for every string it is given, so a case it gets
 * wrong fails there rather than shipping a quote facing the wrong way.
 */
export function typeset(text: string): string {
  return text
    .replace(/(^|[\s([])"/g, "$1“")
    .replace(/"/g, "”")
    .replace(/'/g, "’");
}

/**
 * Every string in a copy module, typeset, with its shape and its type kept.
 *
 * For the learn pictures, whose words are read in a dozen places in each
 * drawing. Typesetting each `<text>` by hand is a dozen chances to miss one.
 */
export function typesetAll<T>(value: T): T {
  if (typeof value === "string") return typeset(value) as T;
  if (Array.isArray(value)) return value.map((item: unknown) => typesetAll(item)) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, typesetAll(item)]),
    ) as T;
  }
  return value;
}
