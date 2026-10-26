/**
 * Which parts of the site are announced, and which merely exist.
 *
 * `/learn` and `/docs` are announced: linked, indexed, and in the sitemap.
 * `/blog` is built, routable and styled, and nothing links to it. That is the
 * state this site ships in. The blog's machinery is finished so that publishing the first post
 * is writing a Markdown file rather than building a blog, and it stays
 * unannounced because what goes in it has not been decided yet.
 *
 * Flipping `announced` does three things at once, which is the reason it is
 * one flag rather than three habits: the section appears in the header and the
 * footer, its pages stop sending `noindex`, and it enters the sitemap. Each
 * reaches its surface differently and all three read this one value.
 * `primaryNav` and `footer.links` in `src/content/home.ts` spread
 * `announcedSections()`, the section's own route files choose their `robots`
 * metadata with `sectionRobots(key)` from `src/lib/indexing.ts`, which reads
 * `section(key).announced`, and `src/app/sitemap.ts` walks the
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
export type SectionKey = "blog" | "docs" | "learn";

export type Section = {
  readonly key: SectionKey;
  readonly href: string;
  readonly label: string;
  readonly title: string;
  /**
   * The index's title in a tab and a search result, where it differs from the
   * heading on the page. "Money basics" is a fine heading under the site's
   * header and says nothing to somebody comparing ten results.
   */
  readonly metaTitle?: string;
  readonly description: string;
  readonly announced: boolean;
  /** Shown where the collection is empty. */
  readonly empty: { readonly title: string; readonly body: string };
};

export const sections: readonly Section[] = [
  /*
   * First, so it leads the header. The docs are for somebody using or running
   * the product and the learn articles are for somebody deciding whether to keep
   * track of their money at all, which is the reader the homepage is written
   * for (`docs/standards/content.md` 1.3) and the one most likely to be
   * looking at the header.
   */
  {
    key: "learn",
    href: "/learn/",
    label: "Learn",
    title: "Money basics",
    metaTitle: "Budgeting and money basics, in plain guides",
    description:
      "Plain guides to tracking your spending, budgeting and saving. Each one says why it " +
      "matters, how to do it with any tool, and how to do it in Simple Balance.",
    announced: true,
    empty: {
      title: "No guides published yet",
      body: "There's nothing here to read, so there's nothing you're missing.",
    },
  },
  {
    key: "docs",
    href: "/docs/",
    label: "Docs",
    title: "Documentation",
    metaTitle: "Docs: using the budget app, and self-hosting it",
    description:
      "How to use Simple Balance: signing up, bringing in your first statement, what each part " +
      "of the app does, and running your own copy.",
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
 * The documentation index's own words: where to start, what each group of
 * pages is for, and the steps of the one page a newcomer opens first.
 *
 * Here rather than in `src/app/docs/page.tsx` because `tests/copy.test.ts`
 * reads every string this module exports, and it cannot read JSX. A page's
 * title and summary are not here: they are the page's own frontmatter, so the
 * index and the page cannot describe it two ways.
 *
 * `groups` is keyed by the names `content/docs/_sections.json` orders, and
 * `starts` and `steps` by slug and heading id. `tests/docs-features.test.ts`
 * holds all three to what exists, so a renamed page or heading fails there
 * rather than leaving a starting point that leads nowhere.
 */
export const docsIndex = {
  count: (pages: number, groups: number) => `${pages} pages in ${groups} sections`,
  pages: (pages: number) => (pages === 1 ? "1 page" : `${pages} pages`),
  startsLabel: "Where to start",
  starts: [
    { slug: "getting-started", kicker: "New here?" },
    { slug: "importing-a-statement", kicker: "Have a statement from your bank?" },
    { slug: "self-hosting", kicker: "Want to run it yourself?" },
  ],
  stepsLabel: "Steps in this guide",
  steps: {
    "getting-started": [
      "sign-up",
      "add-your-first-account",
      "bring-in-your-spending",
      "see-where-it-went",
    ],
  } as Readonly<Record<string, readonly string[]>>,
  groups: {
    "Get started": {
      blurb:
        "Your first visit to app.smpl.money, one step at a time, from signing up to seeing where your money went.",
    },
    "Using Simple Balance": {
      blurb:
        "Your accounts and transactions day to day: bringing in statements, sorting them, and the payments that repeat.",
    },
    "Budgets and reports": {
      blurb:
        "Plan what each month is for, save toward the bills you can see coming, and see where the money went.",
    },
    "Your account": {
      blurb:
        "How things look, what's been changed and when, connecting an AI assistant, your plan, and the limits you can meet.",
    },
    /*
     * Last on purpose, and labeled for who it's for. Most readers use the
     * version at app.smpl.money and never need these pages, and a reader who
     * wandered in should be able to tell from the heading that they can leave.
     */
    "Self-hosting": {
      audience: "For people who run their own copy",
      blurb:
        "Simple Balance also runs on machines you control. Try it on your own computer, run it for real on a server, keep it backed up, and move your transactions between your copy and the cloud app.",
    },
  } as Readonly<Record<string, { readonly blurb: string; readonly audience?: string }>>,
} as const;

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
 * Sections a reader is told about. `/learn` and `/docs` today, and not `/blog`.
 *
 * Three callers, which is the whole of the coupling: `src/app/sitemap.ts` for
 * the sitemap, and `primaryNav` and `footer.links` in `src/content/home.ts`
 * for the two links. The `noindex` reads the flag directly, per section, in
 * the ten route files that own a page.
 */
export function announcedSections(): readonly Section[] {
  return sections.filter((s) => s.announced);
}

/**
 * The blog's own words: its front page, and the header over every other page
 * that lists posts.
 *
 * Here rather than in the route files for the reason `content.md` 3.1 gives:
 * `tests/copy.test.ts` reads this module, and it cannot read JSX. The
 * numbers are functions so a count of one says "post" without each page
 * spelling the plural out again.
 */
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export const blogIndex = {
  eyebrow: "Simple Balance",
  count: (posts: number, newest: string) => `${plural(posts, "post")}, the newest from ${newest}`,
  feedsLabel: "Get new posts in a feed reader",
  browseLabel: "Browse the blog",
  topicsLabel: "Topics",
  archiveLabel: "Archive",
  featured: "Featured",
  newest: "Newest",
  more: "More posts",
  part: (index: number, of: number) => `Part ${index} of ${of}`,
  series: {
    title: "Series",
    blurb: "Posts written to be read in order, starting with part one.",
    parts: (count: number) => plural(count, "part"),
  },
  tag: {
    eyebrow: "Topic",
    count: (posts: number) => plural(posts, "post"),
  },
  author: {
    eyebrow: "Author",
    count: (posts: number) => plural(posts, "post"),
    more: (name: string) => `More about ${name}`,
  },
  archive: {
    title: "Archive",
    description: "Every post, by year.",
    count: (posts: number, since: string) => `${plural(posts, "post")} since ${since}`,
  },
  older: {
    title: "Older posts",
    position: (page: number, pages: number) => `Page ${page} of ${pages}`,
  },
} as const;

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
