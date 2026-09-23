/**
 * The 404's words.
 *
 * Here rather than in `src/app/not-found.tsx` for the reason every page's
 * copy is in this directory (`docs/standards/content.md` 3.1): written into
 * the markup, it was the one page no copy test could read, and its second
 * button said "Get the source" long after the homepage had retired that label
 * as meaningless to a general reader. That button now takes the homepage's
 * own label, `hero.secondaryLabel`, rather than a copy of it here, so the
 * two cannot drift apart again.
 *
 * It does not apologize: an error page that says "Oops! Sorry!" spends its
 * words on feelings rather than on the way out.
 */
export const notFound = {
  /** The tab and the link preview. */
  title: "Page not found",
  eyebrow: "404",
  heading: "There's nothing at this address.",
  lede: "The page may have moved, or the link that brought you here may have been wrong.",
  homeLabel: "Go to the homepage",
} as const;
