"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchDoc = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly section: string;
  /** Lower-cased title + description + body, for matching. */
  readonly text: string;
};

/**
 * Search across the documentation.
 *
 * The index is a JSON file built at compile time and fetched on first use —
 * not on page load. A docs site with ten pages has an index of a few
 * kilobytes, and fetching it eagerly would make every reader pay for a feature
 * most of them will not open.
 *
 * **No search service.** Algolia and its equivalents are what a large docs
 * site uses and they are the right answer at a scale this is nowhere near:
 * they cost a vendor, an API key in the client, and a crawl that can be stale.
 * Matching substrings over a few kilobytes in the browser is exact, instant,
 * private, and works offline. `docs/standards/content.md` 5.9 records the
 * point at which that stops being true.
 *
 * Ranking is deliberately crude and explainable: a title match outranks a
 * description match outranks a body match. Nobody should have to guess why a
 * result is where it is.
 */
/**
 * The words around a match, with the match marked.
 *
 * A result list of titles alone makes somebody open three pages to find
 * which one meant it. Showing the sentence the match is in answers that in
 * the list, and it is why the index carries the flattened body at all.
 *
 * Module scope rather than inside the component: it captures nothing, so
 * defining it per render would rebuild it for no reason and make it a
 * dependency of the memo below.
 */
function snippet(text: string, needle: string): readonly { text: string; hit: boolean }[] | null {
  const at = text.indexOf(needle);
  if (at === -1) return null;
  const start = Math.max(0, at - 45);
  const end = Math.min(text.length, at + needle.length + 75);
  return [
    { text: (start > 0 ? "…" : "") + text.slice(start, at), hit: false },
    { text: text.slice(at, at + needle.length), hit: true },
    { text: text.slice(at + needle.length, end) + (end < text.length ? "…" : ""), hit: false },
  ];
}

export function DocsSearch() {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<readonly SearchDoc[] | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Fetch the index the first time somebody types, and only once.
  useEffect(() => {
    if (query === "" || docs || failed) return;
    let canceled = false;
    fetch("/docs/search-index.json")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("no index"))))
      .then((data: SearchDoc[]) => {
        if (!canceled) setDocs(data);
      })
      .catch(() => {
        if (!canceled) setFailed(true);
      });
    return () => {
      canceled = true;
    };
  }, [query, docs, failed]);

  // "/" focuses the box, which is the shortcut every docs site has. Ignored
  // while the reader is already typing somewhere, or the shortcut eats the
  // character.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable === true;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        input.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === input.current) {
        setQuery("");
        input.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2 || !docs) return [];
    return docs
      .map((doc) => {
        const title = doc.title.toLowerCase().includes(needle) ? 3 : 0;
        const description = doc.description.toLowerCase().includes(needle) ? 2 : 0;
        const body = doc.text.includes(needle) ? 1 : 0;
        return { doc, score: title + description + body };
      })
      .filter((scored) => scored.score > 0)
      .toSorted((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((scored) => ({ ...scored, snippet: snippet(scored.doc.text, needle) }));
  }, [query, docs]);

  const open = query.trim().length >= 2;

  return (
    <div className="docs-search">
      <label className="visually-hidden" htmlFor="docs-search-input">
        Search the documentation
      </label>
      <input
        id="docs-search-input"
        ref={input}
        type="search"
        className="docs-search-input"
        placeholder="Search…  /"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        aria-describedby="docs-search-count"
      />

      {/*
        A search field and a list of links, not an ARIA combobox.
        `role="combobox"` with `listbox` and `option` is the pattern this
        started as, and declaring it obliges the whole contract: arrow keys
        moving a virtual cursor, `aria-activedescendant`, Home and End, Enter
        selecting the focused option. Half of it — the roles without the
        keyboard — tells a screen reader to expect behavior that is not
        there, which is worse than not claiming the pattern. As plain links
        they are reachable by Tab and announced correctly by every reader.
        The live region below is what makes the count audible.
      */}
      <output className="visually-hidden" id="docs-search-count">
        {open && docs ? `${results.length} result${results.length === 1 ? "" : "s"}` : ""}
      </output>

      {open ? (
        <div className="docs-search-results" id="docs-search-results">
          {failed ? (
            <p className="docs-search-empty">Search is unavailable.</p>
          ) : !docs ? (
            <p className="docs-search-empty">Loading…</p>
          ) : results.length === 0 ? (
            // Says what to do next rather than only that there is nothing.
            <p className="docs-search-empty">
              Nothing matches “{query.trim()}”. Try a shorter word.
            </p>
          ) : (
            <ul>
              {results.map(({ doc, snippet: parts }) => (
                <li key={doc.slug}>
                  <a href={`/docs/${doc.slug}/`}>
                    <span className="docs-search-title">{doc.title}</span>
                    <span className="docs-search-section">{doc.section}</span>
                    {parts ? (
                      <span className="docs-search-snippet">
                        {parts.map((part) =>
                          part.hit ? (
                            // <mark> rather than a span with a class: the
                            // element means "relevant in this context", which
                            // is exactly what a search hit is, and a screen
                            // reader can announce it.
                            <mark key={part.text}>{part.text}</mark>
                          ) : (
                            part.text
                          ),
                        )}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
