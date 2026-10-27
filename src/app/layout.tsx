import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/styles/brand.css";
import "@/styles/site.css";

import { SiteHeader } from "@/components/site-header";
import { feedAlternates } from "@/lib/feed";
import { SiteFooter } from "@/components/site-footer";
import { site, hero } from "@/content/home";
import { openGraph } from "@/app/open-graph";
import { indexable } from "@/lib/indexing";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  /**
   * The tab says the product's name. `template` is what every later page
   * inherits, so a docs page added at `/docs` reads "Importing CSV — Simple
   * Balance" without deciding anything for itself.
   *
   * The domain is deliberately not in the title: it is already in the address
   * bar, and a tab reading "Simple Balance — smpl.money" spends its first
   * twenty characters telling the reader something their browser is showing
   * them. It appears where it is useful instead — the footer, and the
   * `siteName` every page's Open Graph block carries (`src/app/open-graph.ts`),
   * which is what a link preview renders.
   */
  title: {
    default: `${site.name} — ${site.titleTagline}`,
    template: `%s — ${site.name}`,
  },
  /*
   * `site.description`, not `hero.lede`. The two have different jobs and only
   * one of them is this. A lede persuades somebody already on the page and may
   * run as long as it needs to; a description has to make a stranger click,
   * inside the roughly 155 characters a result listing renders. `hero.lede`
   * ran to 233, so a third of it — the whole clause about the assistant — was
   * written for a search result that never showed it.
   */
  description: site.description,
  applicationName: site.name,
  // Large image previews; a section's routes ask for the same thing through
  // `sectionRobots`, because a route's own `robots` replaces this one.
  robots: indexable,
  /*
   * The link preview says something different from the tab, on purpose. A tab
   * is read by somebody who already has the page open and wants to find it
   * among twenty others, so it carries the category: "Simple Balance —
   * Personal finance that's simple". A preview is read by somebody deciding
   * whether to follow a link a friend sent, so it carries the hook.
   *
   * Composed from `hero.title` rather than written out, because a literal here
   * is exactly what left the social card advertising a sentence that appeared
   * nowhere else on the site for four rewrites.
   */
  openGraph: openGraph({
    title: `${hero.title.replace(/\.$/, "")} — ${site.name}`,
    description: site.description,
    url: "/",
  }),
  /*
   * Only the card size. Next fills a page's Twitter title, description and
   * image from that page's own `openGraph` block, but only where this one is
   * silent, so declaring them here gave every page on the site the homepage's
   * card on X while its Open Graph block said something else.
   */
  twitter: { card: "summary_large_image" },
  /*
   * The feeds, on the blog's pages and, once the blog is announced, on every
   * page, which this could not do on its own: Next replaces `alternates`
   * rather than merging it, so every route declaring a canonical used to drop
   * the feeds. `feedAlternates` makes this true — see `src/lib/feed.ts`.
   */
  alternates: feedAlternates("/"),
  /**
   * The same two files the application serves, copied rather than linked so
   * this origin has no cross-origin dependency for its own tab icon. iOS will
   * not take an SVG, which is why the raster exists at all.
   */
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      // A raster fallback for clients that will not take an SVG, and for the
      // crawlers that ask for a PNG by size rather than reading the markup.
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

/**
 * `themeColor` is declared for both schemes so a mobile browser paints its
 * chrome to match the page it is showing rather than guessing from the first
 * pixel. The two values are the `--ground` token from each block in
 * `brand.css`; they are literals here because a meta tag cannot read a custom
 * property, and `tests/brand-tokens.test.ts` holds them to the stylesheet so
 * the duplication cannot drift.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1613" },
  ],
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    // `en-US`, not `en`: a browser choosing a spell-checker, a screen reader
    // choosing a voice and a translator choosing a source are all told only
    // "English" by the bare tag, and the copy is American.
    //
    // `suppressHydrationWarning` because extensions write attributes onto
    // <html> before React arrives: LanguageTool adds `data-lt-installed`, and
    // every visitor running it saw a hydration error in development. It
    // silences attribute differences on this one element and nothing below
    // it, so a real mismatch anywhere in the page is still reported.
    <html lang="en-US" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
