import { bySection } from "@/content/collections";
import { section } from "@/content/sections";
import { DocsSearch } from "@/components/client/docs-search";

const docs = section("docs");

/**
 * The documentation sidebar.
 *
 * Rendered from the same grouping the index uses, so a new page appears in
 * both without being listed twice. Order comes from
 * `content/docs/_sections.json` plus each page's `order`.
 *
 * On a narrow screen it becomes a `<details>` that starts closed, rather than
 * a drawer behind a button: `<details>` is the browser's own disclosure, it
 * works before hydration, find-in-page can open it, and it needs no
 * JavaScript, no focus trap and no escape handler.
 *
 * It was rendered `open`, so it didn't start closed anywhere, which cost
 * nothing at twelve pages and put twenty-seven links between a phone reader
 * and every docs page's first line. Closed in the markup, it's shown on a
 * wide screen by CSS whatever its state (`site.css`, under docs chrome).
 */
export function DocsSidebar({ current }: { readonly current?: string }) {
  const groups = bySection("docs");

  return (
    <div className="docs-nav-wrap">
      <DocsSearch />

      <details className="docs-nav-details">
        <summary>Documentation</summary>
        <nav className="docs-nav" aria-label="Documentation">
          <a className="docs-nav-home" href={docs.href}>
            All pages
          </a>
          {groups.map((group) => (
            <div key={group.section}>
              <p className="docs-nav-heading">{group.section}</p>
              <ul>
                {group.entries.map((item) => (
                  <li key={item.slug}>
                    <a
                      href={`/docs/${item.slug}/`}
                      aria-current={item.slug === current ? "page" : undefined}
                    >
                      {item.frontmatter.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </details>
    </div>
  );
}
