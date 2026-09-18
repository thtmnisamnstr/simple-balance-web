import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { privacy } from "@/content/legal";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.description,
  alternates: feedAlternates("/privacy/"),
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
