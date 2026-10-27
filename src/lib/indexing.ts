import type { Metadata } from "next";
import { section, type SectionKey } from "@/content/sections";

/**
 * What every indexable page asks of a search engine: large image previews,
 * for Discover and the picture beside a result.
 *
 * In the root layout alone it reached four pages of forty-five. Next treats a
 * route's `robots: undefined` as a value rather than an absence, and every
 * announced section's route wrote exactly that for "no `noindex`", so the
 * docs, the guides and both indexes sent no robots meta at all. A route asks
 * for its value here instead, and `tests/sitemap.test.ts` holds every page in
 * the sitemap to it.
 */
export const indexable = { "max-image-preview": "large" } satisfies Metadata["robots"];

/** A section's pages: indexable when it's announced, `noindex` until then. */
export function sectionRobots(key: SectionKey): Metadata["robots"] {
  return section(key).announced ? indexable : { index: false, follow: false };
}
