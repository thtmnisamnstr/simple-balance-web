import type { Entry } from "@/content/collections";
import { authors } from "@/content/authors";
import { features, site } from "@/content/home";
import appFacts from "@/content/app-facts.json";

const base = `https://${site.domain}`;

/**
 * The site's own nodes, named once so every page's markup points at the same
 * organization and the same application rather than describing them again.
 * Answer engines build an entity out of these: one name, one description, one
 * repository, every time.
 */
const ORG = `${base}/#org`;
const APP = `${base}/#app`;

/** The publisher on every article: the organization, by reference and by name. */
const publisher = { "@type": "Organization", "@id": ORG, name: site.name, url: `${base}/` };

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
 * string — is neutralized below.
 */
function Ld({ data }: { readonly data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/**
 * The organization, the site, the application and its source, as one graph.
 * Rendered once, on the homepage, which shows every fact in it: the name, the
 * features, the prices in the plans panel, the screenshot, and the links to
 * the code and its license in the footer.
 *
 * It was two loose nodes, and the `SoftwareApplication` one carried
 * `codeRepository`, which that type doesn't have: it belongs to
 * `SoftwareSourceCode`, which is now its own node pointing at the app.
 *
 * **The prices are the application's**, read from `src/content/app-facts.json`
 * like every other price on the site, so the markup can't quote a plan the
 * product doesn't sell. There is still no rating: Google shows its software
 * rich result only with one, and this site has none to give honestly, so the
 * result is ineligible on purpose (`content.md` 5.13).
 */
export function SiteStructuredData() {
  const { prices } = appFacts.facts.declared;
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": ORG,
            name: site.name,
            url: `${base}/`,
            logo: `${base}/apple-touch-icon.png`,
            email: site.contactEmail,
            sameAs: [site.sourceUrl],
          },
          {
            "@type": "WebSite",
            "@id": `${base}/#website`,
            name: site.name,
            // The domain as the fallback name, because Google's site-name
            // guidance asks for one where a brand reads like other things,
            // and "Simple Balance" does.
            alternateName: site.domain,
            url: `${base}/`,
            description: site.description,
            inLanguage: "en-US",
            publisher: { "@id": ORG },
          },
          {
            "@type": "WebApplication",
            "@id": APP,
            name: site.name,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any web browser",
            url: site.appUrl,
            description: site.description,
            screenshot: `${base}/screenshots/dashboard-light.webp`,
            featureList: features.map((feature) => feature.title),
            isAccessibleForFree: true,
            offers: [
              {
                "@type": "Offer",
                name: "Free",
                price: "0",
                priceCurrency: prices.currency,
              },
              {
                "@type": "Offer",
                name: "Premium, monthly",
                price: prices.monthly,
                priceCurrency: prices.currency,
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: prices.monthly,
                  priceCurrency: prices.currency,
                  unitCode: "MON",
                },
              },
              {
                "@type": "Offer",
                name: "Premium, yearly",
                price: prices.yearly,
                priceCurrency: prices.currency,
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: prices.yearly,
                  priceCurrency: prices.currency,
                  unitCode: "ANN",
                },
              },
            ],
            publisher: { "@id": ORG },
          },
          {
            "@type": "SoftwareSourceCode",
            "@id": `${base}/#source`,
            name: site.name,
            codeRepository: site.sourceUrl,
            license: "https://www.gnu.org/licenses/agpl-3.0.html",
            targetProduct: { "@id": APP },
          },
        ],
      }}
    />
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
        inLanguage: "en-US",
        publisher,
      }}
    />
  );
}

/**
 * A learn article. `Article` rather than `BlogPosting`, because it is not
 * news and the date is when it was written rather than what it is about, and
 * rather than `TechArticle`, because it is written for somebody who has never
 * read one.
 */
export function ArticleStructuredData({ entry }: { readonly entry: Entry }) {
  const meta = entry.frontmatter;
  // No `author`: the articles credit nobody (content.md 5.14), and an empty
  // list is still a claim that the field was considered and filled. The
  // publisher is the site, which is who stands behind the words.
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: meta.title,
        description: meta.description,
        url: `${base}/learn/${entry.slug}/`,
        // The page's own card, which Google can use as the result's
        // thumbnail; the build draws one per guide.
        image: `${base}/og/learn/${entry.slug}.png`,
        datePublished: meta.date,
        ...(meta.updated ? { dateModified: meta.updated } : {}),
        inLanguage: "en-US",
        publisher,
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
        image: `${base}/og/docs/${entry.slug}.png`,
        ...(entry.frontmatter.updated ? { dateModified: entry.frontmatter.updated } : {}),
        inLanguage: "en-US",
        // What the page documents, by reference, so a docs page is tied to
        // the application the homepage describes rather than floating free.
        about: { "@id": APP },
        publisher,
      }}
    />
  );
}

/**
 * A comparison page. An `Article`, like a learn guide, dated by the day its
 * facts were checked, because that is when what it says was last true.
 *
 * `about` names the two things a reader sees compared: the application, by
 * reference, and the other app by its name and its own address. The other
 * app is a `Thing` rather than a `SoftwareApplication` on purpose: Google
 * reads any `SoftwareApplication` as a candidate for its software result and
 * reports it as broken without a rating and an offer, and this page has
 * neither to give for somebody else's product.
 */
export function CompareStructuredData({
  path,
  title,
  description,
  checked,
  card,
  others,
}: {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly checked: string;
  readonly card: string;
  readonly others: readonly { readonly name: string; readonly url: string }[];
}) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: `${base}${path}`,
        image: `${base}/og/${card}.png`,
        dateModified: checked,
        inLanguage: "en-US",
        about: [{ "@id": APP }, ...others.map((other) => ({ "@type": "Thing", ...other }))],
        publisher,
      }}
    />
  );
}

/**
 * The pricing page's questions, and the docs' questions page's, as an
 * `FAQPage`.
 *
 * Google used to render these as expandable results and has since stopped
 * showing FAQ rich results for sites like this one, so the markup earns no
 * snippet there. It stays because it is true and cheap, and because Bing and
 * the answer engines read question-and-answer content directly. The policy
 * condition is the same one 2.1 states: the question and the answer must both
 * be visible on the page. They are — the `<details>` elements carry exactly
 * this text — which is what makes the markup a description rather than a
 * claim.
 */
export function FaqStructuredData({
  items,
}: {
  readonly items: readonly { readonly q: string; readonly a: string }[];
}) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
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
