import type { MetadataRoute } from "next";
import { site } from "@/content/home";

export const dynamic = "force-static";

/**
 * The web app manifest.
 *
 * Not because this is an installable application — it is a marketing page —
 * but because it is what supplies the name and icon when somebody adds the
 * site to a phone's home screen, and the default without it is the bare
 * domain and a screenshot of the page.
 *
 * `theme_color` and `background_color` are the `--ground` tokens, the same two
 * literals `layout.tsx` carries and `tests/brand-tokens.test.ts` holds to the
 * stylesheet.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.titleTagline}`,
    short_name: site.name,
    description: site.tagline,
    start_url: "/",
    display: "browser",
    theme_color: "#f5f7f3",
    background_color: "#f5f7f3",
    icons: [
      { src: "/favicon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
