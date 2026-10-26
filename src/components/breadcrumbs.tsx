import { BreadcrumbStructuredData, type Crumb } from "@/components/structured-data";

/**
 * Where this page sits.
 *
 * A `<nav>` with a name and an ordered list, because the order is the meaning.
 * The current page is the last crumb and is not a link — a link to the page
 * you are on is a control that does nothing, and `aria-current` says which one
 * it is.
 *
 * The separator is a CSS pseudo-element rather than a character in the markup,
 * so a screen reader reads "Docs, Install, Getting started" and not "Docs
 * slash Install slash Getting started".
 *
 * **It carries its own `BreadcrumbList`.** Pages emitted the structured data
 * separately, and the learn and docs indexes, the legal pages and four blog
 * listings showed a trail and told a search engine nothing about it. Drawing
 * the trail and describing it in one place means a page can't have one
 * without the other.
 */
export function Breadcrumbs({ trail }: { readonly trail: readonly Crumb[] }) {
  return (
    <>
      <BreadcrumbStructuredData trail={trail} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={crumb.href}>
                {last ? (
                  <span aria-current="page">{crumb.name}</span>
                ) : (
                  <a href={crumb.href}>{crumb.name}</a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
