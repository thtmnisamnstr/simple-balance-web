import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { isAuthorKey, type AuthorKey } from "@/content/authors";

/**
 * The content pipeline for `/blog` and `/docs`.
 *
 * Both are Markdown on disk, read at build time and rendered by this site's
 * own layouts. No CMS and no docs framework, and that is a decision rather
 * than an omission.
 *
 * WHY NOT A DOCS FRAMEWORK. Fumadocs, Starlight and Docusaurus all do this
 * better than a few hundred lines can — generated sidebars, search,
 * versioning. Each also brings its own theme system, and this site's whole
 * design argument is that one token set (`src/styles/brand.css`) is shared
 * with the application. Adopting one means overriding its theme until nothing
 * of it is left, or letting the docs look like a different product from the
 * page linking to them. The escape hatch is deliberate: these files are plain
 * Markdown with conventional frontmatter, which is exactly what all three of
 * those frameworks read. `docs/standards/content.md` 5 records the trigger to
 * revisit it.
 *
 * WHY BUILD TIME. `output: "export"` means there is no server, so every page
 * exists because `generateStaticParams` named it.
 */

export type Collection = "blog" | "docs";

/**
 * The frontmatter a file may carry.
 *
 * The set is deliberately the conventional one — the keys somebody arriving
 * from Jekyll, Hugo or Astro already expects — so that a writer does not have
 * to learn a vocabulary invented here. Unknown keys are kept rather than
 * rejected (`extra` below), because a key this site does not use yet is not an
 * error, and failing a build over one would make adding a feature a two-step
 * change.
 */
type Frontmatter = {
  readonly title: string;
  readonly description: string;

  /** Blog: required. Docs: ignored. A calendar day, not an instant. */
  readonly date?: string;
  /** When the content last changed materially. Shown on docs, and on posts that have one. */
  readonly updated?: string;

  /** Blog. Keys into `src/content/authors.ts`; the first is the primary byline. */
  readonly authors?: readonly AuthorKey[];
  readonly tags?: readonly string[];

  /** Blog. A multi-part post: the series name, and this part's position. */
  readonly series?: string;
  readonly seriesOrder?: number;

  /**
   * Blog. A featured post is pulled to the top of the index in its own block.
   * More than one may be featured; they keep their date order among
   * themselves.
   */
  readonly featured?: boolean;

  /** A cover image in `public/`, with the alt text it needs to be shown at all. */
  readonly image?: string;
  readonly imageAlt?: string;

  /** Docs. The sidebar group, and the position within it. */
  readonly section?: string;
  readonly order?: number;

  /** Kept out of a production build entirely. */
  readonly draft?: boolean;

  /** Override the URL slug, when the filename is not what the URL should be. */
  readonly slug?: string;
  /** Where this was first published, if it was published somewhere else first. */
  readonly canonical?: string;

  /** Anything else the file carries. Kept, unused, never an error. */
  readonly extra?: Readonly<Record<string, unknown>>;
};

export type Entry = {
  readonly slug: string;
  readonly collection: Collection;
  readonly frontmatter: Frontmatter;
  readonly body: string;
  /** Minutes, at 220 words a minute. */
  readonly readingMinutes: number;
};

const ROOT = join(process.cwd(), "content");
const KNOWN_KEYS = new Set([
  "title",
  "description",
  "date",
  "updated",
  "authors",
  "tags",
  "featured",
  "image",
  "imageAlt",
  "section",
  "order",
  "draft",
  "slug",
  "canonical",
]);

/**
 * A calendar day as `YYYY-MM-DD`, whatever YAML made of it.
 *
 * `gray-matter` hands back a `Date` for an unquoted `2026-09-17`, because
 * that is what YAML says an unquoted date is. Interpolating that object into
 * a string produced "Wed Sep 17 2026 …T00:00:00Z" and an Invalid Date, which
 * failed the build rather than rendering wrongly — but only because something
 * downstream happened to parse it. Normalizing here means every consumer gets
 * one shape no matter how the file was written.
 */
function asDay(value: unknown, where: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`${where}: "${text}" is not a YYYY-MM-DD date`);
  }
  return text;
}

function filesIn(collection: Collection): readonly string[] {
  let names: readonly string[];
  try {
    names = readdirSync(join(ROOT, collection));
  } catch {
    // An empty collection is a legitimate state — this site ships with the
    // sections unannounced — so a missing directory reads as "nothing
    // published" rather than failing the build.
    return [];
  }
  return names.filter((name) => /\.mdx?$/.test(name) && !name.startsWith("_"));
}

function parse(collection: Collection, file: string): Entry {
  const where = `content/${collection}/${file}`;
  const { data, content } = matter(readFileSync(join(ROOT, collection, file), "utf8"));

  for (const required of ["title", "description"] as const) {
    if (!data[required]) throw new Error(`${where} is missing "${required}" in its frontmatter`);
  }

  const date = asDay(data.date, `${where} date`);
  if (collection === "blog" && !date) {
    throw new Error(`${where} is missing "date" — a post without one cannot be ordered`);
  }

  const authorKeys: AuthorKey[] = [];
  for (const raw of (data.authors ?? []) as unknown[]) {
    const key = String(raw);
    // A typo here would render a byline with no name and no photo. Failing
    // the build is the only way that gets noticed before a reader sees it.
    if (!isAuthorKey(key)) {
      throw new Error(`${where} names author "${key}", which is not in src/content/authors.ts`);
    }
    authorKeys.push(key);
  }

  if (data.image && !data.imageAlt) {
    throw new Error(`${where} has an "image" with no "imageAlt" — see docs/standards/web.md 7.3`);
  }

  const extra = Object.fromEntries(Object.entries(data).filter(([key]) => !KNOWN_KEYS.has(key)));

  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    slug: String(data.slug ?? file.replace(/\.mdx?$/, "")),
    collection,
    frontmatter: {
      title: String(data.title),
      description: String(data.description),
      ...(date ? { date } : {}),
      ...(asDay(data.updated, `${where} updated`) ? { updated: asDay(data.updated, where)! } : {}),
      ...(authorKeys.length ? { authors: authorKeys } : {}),
      ...(data.tags ? { tags: (data.tags as unknown[]).map(String) } : {}),
      ...(data.featured === true ? { featured: true } : {}),
      ...(data.series ? { series: String(data.series) } : {}),
      ...(data.seriesOrder !== undefined ? { seriesOrder: Number(data.seriesOrder) } : {}),
      ...(data.image ? { image: String(data.image), imageAlt: String(data.imageAlt) } : {}),
      ...(data.section ? { section: String(data.section) } : {}),
      ...(data.order !== undefined ? { order: Number(data.order) } : {}),
      ...(data.draft === true ? { draft: true } : {}),
      ...(data.canonical ? { canonical: String(data.canonical) } : {}),
      ...(Object.keys(extra).length ? { extra } : {}),
    },
    body: content,
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

/** Drafts are kept out of a production build, and only that build. */
function published(entry: Entry): boolean {
  return process.env.NODE_ENV !== "production" || entry.frontmatter.draft !== true;
}

export function allEntries(collection: Collection): readonly Entry[] {
  const entries = filesIn(collection)
    .map((file) => parse(collection, file))
    .filter(published);

  if (collection === "blog") {
    // Newest first, falling back to the slug so two posts on one day keep a
    // stable order between builds rather than inheriting directory order.
    return entries.toSorted((a, b) => {
      const byDate = (b.frontmatter.date ?? "").localeCompare(a.frontmatter.date ?? "");
      return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
    });
  }
  return entries.toSorted(compareDocs);
}

/**
 * Docs order: the section's position, then the page's `order`, then its title.
 *
 * A page with no `order` sorts after every page that has one rather than
 * alphabetically among them, which is what makes adding `order: 2` to one
 * page do the obvious thing without renumbering its neighbors.
 */
function compareDocs(a: Entry, b: Entry): number {
  const bySection = sectionRank(a.frontmatter.section) - sectionRank(b.frontmatter.section);
  if (bySection !== 0) return bySection;
  const byOrder =
    (a.frontmatter.order ?? Number.MAX_SAFE_INTEGER) -
    (b.frontmatter.order ?? Number.MAX_SAFE_INTEGER);
  if (byOrder !== 0) return byOrder;
  return a.frontmatter.title.localeCompare(b.frontmatter.title);
}

/**
 * Section order, from `content/docs/_sections.json`.
 *
 * Sidebar groups need an order that is not alphabetical — "Install" belongs
 * above "Reference" — and there is nowhere in a per-page frontmatter to say
 * so without repeating it on every page in the group and letting two pages
 * disagree. One file names the order; a section missing from it sorts last,
 * so adding a group is not a two-file change.
 */
let sectionOrderCache: readonly string[] | undefined;
function sectionOrder(): readonly string[] {
  if (sectionOrderCache) return sectionOrderCache;
  try {
    const raw = readFileSync(join(ROOT, "docs", "_sections.json"), "utf8");
    sectionOrderCache = (JSON.parse(raw) as { order?: string[] }).order ?? [];
  } catch {
    sectionOrderCache = [];
  }
  return sectionOrderCache;
}

function sectionRank(name: string | undefined): number {
  const index = sectionOrder().indexOf(name ?? "Guide");
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function entryBySlug(collection: Collection, slug: string): Entry | undefined {
  return allEntries(collection).find((entry) => entry.slug === slug);
}

/** Docs grouped for the sidebar, in the order `_sections.json` gives. */
export function docsBySection(): readonly { section: string; entries: readonly Entry[] }[] {
  const groups = new Map<string, Entry[]>();
  for (const entry of allEntries("docs")) {
    const name = entry.frontmatter.section ?? "Guide";
    const bucket = groups.get(name);
    if (bucket) bucket.push(entry);
    else groups.set(name, [entry]);
  }
  return [...groups.entries()].map(([section, entries]) => ({ section, entries }));
}

/** The page before and after this one, in sidebar order. */
export function docsNeighbors(slug: string): {
  previous: Entry | undefined;
  next: Entry | undefined;
} {
  const all = allEntries("docs");
  const index = all.findIndex((entry) => entry.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return { previous: all[index - 1], next: all[index + 1] };
}

/** Featured posts, then the rest. Both newest first. */
export function blogIndex(): { featured: readonly Entry[]; rest: readonly Entry[] } {
  const posts = allEntries("blog");
  return {
    featured: posts.filter((post) => post.frontmatter.featured === true),
    rest: posts.filter((post) => post.frontmatter.featured !== true),
  };
}

/** Every tag in use, with how many posts carry it, most-used first. */
export function blogTags(): readonly { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of allEntries("blog")) {
    for (const tag of post.frontmatter.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .toSorted((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function isEmpty(collection: Collection): boolean {
  return allEntries(collection).length === 0;
}

/**
 * Headings for a table of contents, read from the Markdown rather than the
 * rendered HTML.
 *
 * Only `##` and `###`: a contents list that includes every level is a second
 * copy of the page. The slug matches what `rehype-slug` generates, so the
 * anchors line up — that coupling is the fragile part and
 * `tests/content.test.ts` pins it with a case carrying punctuation.
 */
export function tableOfContents(
  body: string,
): readonly { depth: 2 | 3; text: string; id: string }[] {
  const out: { depth: 2 | 3; text: string; id: string }[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    // A `## ` inside a fenced block is a shell comment, not a heading. This
    // is the bug every hand-rolled contents list has.
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const text = match[2]!.replace(/[*_`]/g, "");
    out.push({ depth: match[1]!.length as 2 | 3, text, id: slugify(text) });
  }
  return out;
}

/** The same algorithm `rehype-slug` uses (github-slugger), for the cases we hit. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

/* ------------------------------------------------------------------ *
 * Blog queries: tags, authors, series, neighbors, related, paging.
 * ------------------------------------------------------------------ */

/** A tag as it appears in a URL. Two tags differing only by case are one tag. */
export function tagSlug(tag: string): string {
  return slugify(tag);
}

export function postsByTag(tagOrSlug: string): readonly Entry[] {
  const wanted = tagSlug(tagOrSlug);
  return allEntries("blog").filter((post) =>
    (post.frontmatter.tags ?? []).some((tag) => tagSlug(tag) === wanted),
  );
}

/** The display spelling of a tag, taken from the first post that uses it. */
export function tagLabel(slug: string): string | undefined {
  for (const post of allEntries("blog")) {
    for (const tag of post.frontmatter.tags ?? []) if (tagSlug(tag) === slug) return tag;
  }
  return undefined;
}

export function postsByAuthor(key: string): readonly Entry[] {
  return allEntries("blog").filter((post) =>
    (post.frontmatter.authors ?? []).includes(key as never),
  );
}

/** The post before and after this one, in publication order. */
export function blogNeighbors(slug: string): {
  previous: Entry | undefined;
  next: Entry | undefined;
} {
  const all = allEntries("blog");
  const index = all.findIndex((post) => post.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  // `allEntries` is newest first, so the *earlier* post is the later index.
  return { previous: all[index + 1], next: all[index - 1] };
}

/**
 * Posts in the same series, in reading order.
 *
 * A series is `series: "Name"` plus `seriesOrder: 2` in frontmatter. Reading
 * order is the opposite of the index's: part one comes first.
 */
export function seriesOf(entry: Entry): readonly Entry[] {
  const name = entry.frontmatter.series;
  if (!name) return [];
  return allEntries("blog")
    .filter((post) => post.frontmatter.series === name)
    .toSorted(
      (a, b) =>
        (a.frontmatter.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.frontmatter.seriesOrder ?? Number.MAX_SAFE_INTEGER) ||
        (a.frontmatter.date ?? "").localeCompare(b.frontmatter.date ?? ""),
    );
}

/**
 * Posts a reader of this one might want next.
 *
 * Ranked by shared tags, then by series, then by recency. Deliberately not a
 * content-similarity model: on a blog with a dozen posts, "shares two tags"
 * is a better signal than anything derived from the prose, and it is one a
 * writer can control by tagging.
 */
export function relatedPosts(entry: Entry, limit = 3): readonly Entry[] {
  const tags = new Set((entry.frontmatter.tags ?? []).map(tagSlug));
  return allEntries("blog")
    .filter((post) => post.slug !== entry.slug)
    .map((post) => {
      const shared = (post.frontmatter.tags ?? []).filter((tag) => tags.has(tagSlug(tag))).length;
      const sameSeries =
        post.frontmatter.series && post.frontmatter.series === entry.frontmatter.series;
      return { post, score: shared * 2 + (sameSeries ? 3 : 0) };
    })
    .filter((scored) => scored.score > 0)
    .toSorted(
      (a, b) =>
        b.score - a.score ||
        (b.post.frontmatter.date ?? "").localeCompare(a.post.frontmatter.date ?? ""),
    )
    .slice(0, limit)
    .map((scored) => scored.post);
}

/** How many posts fit on one index page before it is paginated. */
export const POSTS_PER_PAGE = 10;

export type Page<T> = {
  readonly items: readonly T[];
  readonly page: number;
  readonly pages: number;
};

export function paginate<T>(items: readonly T[], page: number, perPage = POSTS_PER_PAGE): Page<T> {
  // At least one page, even with nothing in it: an index that renders "page 1
  // of 0" is worse than an empty page 1.
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const clamped = Math.min(Math.max(1, page), pages);
  return {
    items: items.slice((clamped - 1) * perPage, clamped * perPage),
    page: clamped,
    pages,
  };
}

/** Posts grouped by year, newest first, for an archive listing. */
export function postsByYear(): readonly { year: string; posts: readonly Entry[] }[] {
  const groups = new Map<string, Entry[]>();
  for (const post of allEntries("blog")) {
    const year = (post.frontmatter.date ?? "").slice(0, 4);
    const bucket = groups.get(year);
    if (bucket) bucket.push(post);
    else groups.set(year, [post]);
  }
  return [...groups.entries()].map(([year, posts]) => ({ year, posts }));
}
