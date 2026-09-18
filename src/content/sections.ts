/**
 * Which parts of the site are announced, and which merely exist.
 *
 * `/blog` and `/docs` are built, routable and styled, and nothing links to
 * them. That is the state this site ships in: the machinery is finished so
 * that publishing the first post is writing a Markdown file rather than
 * building a blog, but an empty blog advertised in the header is worse than
 * no blog at all.
 *
 * Flipping `announced` to true does three things at once, which is the reason
 * it is one flag rather than three habits: the section appears in the header
 * and the footer, its pages stop sending `noindex`, and it enters the
 * sitemap. `tests/sections.test.ts` holds all three to this value, so an
 * unannounced section cannot be half-launched by someone linking to it.
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
    announced: false,
    empty: {
      title: "No pages published yet",
      body: "The documentation is being written. Until it lands, the repository's own docs directory is the reference.",
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
      body: "The first post is not written. There is nothing to subscribe to and nothing you are missing.",
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

/** Sections a reader is told about. Empty today, by design. */
export function announcedSections(): readonly Section[] {
  return sections.filter((s) => s.announced);
}
