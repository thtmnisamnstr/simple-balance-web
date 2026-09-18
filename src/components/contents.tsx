/**
 * A table of contents, built from the Markdown's own headings.
 *
 * It is a `<nav>` with a name, because that is what it is: a reader using
 * landmarks should be able to reach it and skip it. The ids come from the
 * same slug function `rehype-slug` uses, which is the coupling that makes the
 * anchors work and the thing `tests/content.test.ts` pins.
 */
export function Contents({
  items,
}: {
  readonly items: readonly { depth: 2 | 3; text: string; id: string }[];
}) {
  return (
    <nav className="contents" aria-labelledby="contents-title">
      <p className="contents-title" id="contents-title">
        On this page
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "contents-sub" : undefined}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
