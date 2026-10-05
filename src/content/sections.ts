/**
 * Which parts of the site are announced, and which merely exist.
 *
 * `/docs` is announced: linked, indexed, and in the sitemap. `/blog` is built,
 * routable and styled, and nothing links to it. That is the state this site
 * ships in. The blog's machinery is finished so that publishing the first post
 * is writing a Markdown file rather than building a blog, and it stays
 * unannounced because what goes in it has not been decided yet.
 *
 * Flipping `announced` does three things at once, which is the reason it is
 * one flag rather than three habits: the section appears in the header and the
 * footer, its pages stop sending `noindex`, and it enters the sitemap. Each
 * reaches its surface differently and all three read this one value.
 * `primaryNav` and `footer.links` in `src/content/home.ts` spread
 * `announcedSections()`, the section's own route files choose their `robots`
 * metadata from `section(key).announced`, and `src/app/sitemap.ts` walks the
 * announced sections and the entries under each.
 *
 * **Two of those three were true and the link was not**, until `/docs` was
 * announced and somebody checked. `announcedSections()` had exactly one
 * caller, the sitemap, and the two nav lists were written out by hand — so
 * this docstring described a mechanism that was really a habit, and announcing
 * a section would have stopped its `noindex`, entered it in the sitemap, and
 * linked it from nowhere. That is the same half-launch as a link added ahead
 * of the flag, arriving from the other side, and it is why
 * `tests/sections.test.tsx` now asserts all three in both directions rather
 * than asserting the absences alone.
 */
export type SectionKey = "blog" | "docs";

export type Section = {
  readonly key: SectionKey;
  readonly href: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly announced: boolean;
  /** Shown where the collection is empty. */
  readonly empty: { readonly title: string; readonly body: string };
};

export const sections: readonly Section[] = [
  {
    key: "docs",
    href: "/docs/",
    label: "Docs",
    title: "Documentation",
    description:
      "How to run Simple Balance: installing it, importing your first statement, and what each " +
      "part of the ledger does.",
    announced: true,
    empty: {
      title: "No pages published yet",
      /*
       * What the reader is looking at, not what month it is. An empty state
       * saying the documentation "is being written" was written when none of
       * it was, and it survived seven published pages because it renders only
       * when the collection is empty and the collection never is.
       */
      body: "Nothing is here to read. The repository's own docs directory is the reference until something is.",
    },
  },
  {
    key: "blog",
    href: "/blog/",
    label: "Blog",
    title: "Blog",
    description:
      "Notes on building Simple Balance, and on double-entry bookkeeping for one person.",
    announced: false,
    empty: {
      title: "Nothing posted yet",
      // Same trap as the docs empty state above: this one said the first post
      // was not written while two were published, because nothing renders it.
      body: "No posts are published. There is nothing to subscribe to and nothing you are missing.",
    },
  },
];

/**
 * Where a documentation page can be edited.
 *
 * An "edit this page" link is the cheapest contribution path a docs site has,
 * and it only works if it points at the file rather than at the repository —
 * somebody who has noticed a typo will not go hunting for it.
 */
export function editUrl(collection: "docs" | "blog", slug: string): string {
  return `https://github.com/thtmnisamnstr/simple-balance-web/edit/main/content/${collection}/${slug}.md`;
}

export function section(key: SectionKey): Section {
  const found = sections.find((s) => s.key === key);
  // A missing section is a programming error, not a content state: the array
  // above is the closed set the type already names.
  if (!found) throw new Error(`no section named ${key}`);
  return found;
}

/**
 * Sections a reader is told about. `/docs` today, and not `/blog`.
 *
 * Three callers, which is the whole of the coupling: `src/app/sitemap.ts` for
 * the sitemap, and `primaryNav` and `footer.links` in `src/content/home.ts`
 * for the two links. The `noindex` reads the flag directly, per section, in
 * the eight route files that own a page.
 */
export function announcedSections(): readonly Section[] {
  return sections.filter((s) => s.announced);
}

/**
 * What a tag is about, where saying so adds something.
 *
 * Optional by design: a tag page without one shows the tag and a count, which
 * is honest. A description that restates the tag ("Posts about bookkeeping")
 * is worse than none, so this holds only the ones that earn a sentence, and
 * `tests/blog-features.test.ts` refuses a description that merely repeats its
 * own tag.
 */
export const tagDescriptions: Readonly<Record<string, string>> = {
  bookkeeping:
    "Why double-entry is worth the second entry when the only person you answer to is yourself.",
  design: "Decisions about how the product works, and the ones that were wrong first.",
};
