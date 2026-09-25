import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { openGraph } from "@/app/open-graph";
import { privacy } from "@/content/legal";
import { site } from "@/content/home";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.description,
  alternates: feedAlternates("/privacy/"),
  openGraph: openGraph({
    title: `${privacy.title} — ${site.name}`,
    description: privacy.description,
    url: "/privacy/",
  }),
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={privacy.title}
      description={privacy.description}
      intro={privacy.intro}
      sections={privacy.sections}
      href="/privacy/"
    />
  );
}
