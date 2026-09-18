/**
 * Who writes here.
 *
 * A post names authors by key, not by spelling their name in its frontmatter.
 * Two posts spelling one person's name differently is the ordinary failure,
 * and it shows up as two author pages and a photo missing from one of them.
 * The key is the contract; everything about the person lives here and can be
 * changed once.
 *
 * `tests/content.test.ts` refuses a post naming a key that is not in this
 * record, so a typo fails the build rather than rendering an empty byline.
 */
export type Author = {
  readonly name: string;
  /** One line under the name on a byline. Optional; most posts do not need it. */
  readonly title?: string;
  /**
   * A square image in `public/authors/`. Optional: a byline without a photo
   * renders initials, which is better than a broken image and better than a
   * generic silhouette that says nothing.
   */
  readonly avatar?: string;
  /** Where "more from this author" points. A personal site, or a profile. */
  readonly url?: string;
};

/*
 * `as const satisfies` fixes the KEYS as literals, which is what makes
 * `AuthorKey` a closed set and a typo in frontmatter a build error. The
 * re-export widens the VALUES back to `Author`, because the narrowed literal
 * type drops every optional field no current author happens to use — with one
 * photoless author, `avatar` stopped existing and reading it was a type error
 * rather than `undefined`.
 */
const registry = {
  gavin: {
    name: "Gavin Johnson",
    title: "Simple Balance",
    url: "https://github.com/thtmnisamnstr",
  },
} as const satisfies Record<string, Author>;

export type AuthorKey = keyof typeof registry;

export const authors: Readonly<Record<AuthorKey, Author>> = registry;

export function isAuthorKey(value: string): value is AuthorKey {
  return Object.hasOwn(registry, value);
}

/** Initials, for a byline with no photo. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
