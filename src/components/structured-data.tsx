import type { Entry } from "@/content/collections";
import { authors } from "@/content/authors";
import { site } from "@/content/home";

const base = `https://${site.domain}`;

/**
 * JSON-LD, emitted as a script tag in the page.
 *
 * Search engines and the answer engines that have replaced part of their job
 * read this to know what a page *is* rather than inferring it from markup.
 * `BlogPosting` with a real `author` is the difference between a post
 * attributed to a person and one attributed to nobody.
 *
 * **Every field here must be true of something visible on the page.** Google's
 * structured-data policy treats markup describing content a reader cannot see
 * as spam, and it is also just lying. So there is no `aggregateRating`, no
 * invented `wordCount`, and no author whose name is not in the byline.
 *
 * `dangerouslySetInnerHTML` is the documented way to emit JSON-LD and is safe
 * here for a specific reason: the payload is `JSON.stringify` output, and the
 * one escape that matters inside a script element — a literal `</script>` in a
 * string — is neutralised below.
 */
function Ld({ data }: { readonly data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** The site and the organisation behind it. Rendered once, on the homepage. */
export function SiteStructuredData() {
  return (
    <>
      <Ld
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: `${base}/`,
          description: site.tagline,
        }}
      />
      <Ld
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: site.name,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Linux, macOS, Windows — via Docker",
          description: site.tagline,
          url: `${base}/`,
          license: "https://www.gnu.org/licenses/agpl-3.0.html",
          codeRepository: site.sourceUrl,
        }}
      />
    </>
  );
}

export function PostStructuredData({ post }: { readonly post: Entry }) {
  const meta = post.frontmatter;
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: meta.title,
        description: meta.description,
        url: `${base}/blog/${post.slug}/`,
        datePublished: meta.date,
        ...(meta.updated ? { dateModified: meta.updated } : {}),
        author: (meta.authors ?? []).map((key) => ({
          "@type": "Person",
          name: authors[key].name,
          ...(authors[key].url ? { url: authors[key].url } : {}),
        })),
        ...(meta.image ? { image: `${base}${meta.image}` } : {}),
        ...(meta.tags ? { keywords: [...meta.tags].join(", ") } : {}),
        publisher: { "@type": "Organization", name: site.name, url: `${base}/` },
      }}
    />
  );
}

export function DocStructuredData({ entry }: { readonly entry: Entry }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: entry.frontmatter.title,
        description: entry.frontmatter.description,
        url: `${base}/docs/${entry.slug}/`,
        ...(entry.frontmatter.updated ? { dateModified: entry.frontmatter.updated } : {}),
        publisher: { "@type": "Organization", name: site.name, url: `${base}/` },
      }}
    />
  );
}

export type Crumb = { readonly name: string; readonly href: string };

export function BreadcrumbStructuredData({ trail }: { readonly trail: readonly Crumb[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${base}${crumb.href}`,
        })),
      }}
    />
  );
}
