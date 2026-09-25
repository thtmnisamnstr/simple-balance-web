import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { terms } from "@/content/legal";
import { site } from "@/content/home";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: terms.title,
  description: terms.description,
  alternates: feedAlternates("/terms/"),
  openGraph: openGraph({
    title: `${terms.title} — ${site.name}`,
    description: terms.description,
    url: "/terms/",
  }),
};

export default function TermsPage() {
  return (
    <LegalPage
      title={terms.title}
      description={terms.description}
      intro={terms.intro}
      sections={terms.sections}
      href="/terms/"
    />
  );
}
