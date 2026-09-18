import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/styles/brand.css";
import "@/styles/site.css";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site, hero } from "@/content/home";

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
   * them. It appears where it is useful instead — the footer, and `siteName`
   * below, which is what a link preview renders.
   */
  title: {
    default: `${site.name} — ${site.titleTagline}`,
    template: `%s — ${site.name}`,
  },
  description: hero.lede,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: hero.lede,
    url: `https://${site.domain}`,
  },
  twitter: { card: "summary_large_image", title: site.name, description: hero.lede },
  alternates: {
    canonical: "/",
    // Advertised site-wide so a feed reader pointed at any page finds them.
    types: {
      "application/rss+xml": "/blog/feed.xml",
      "application/atom+xml": "/blog/atom.xml",
      "application/feed+json": "/blog/feed.json",
    },
  },
  /**
   * The same two files the application serves, copied rather than linked so
   * this origin has no cross-origin dependency for its own tab icon. iOS will
   * not take an SVG, which is why the raster exists at all.
   */
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
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
    <html lang="en">
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
