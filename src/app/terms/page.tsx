import type { Metadata } from "next";
import { feedAlternates } from "@/lib/feed";
import { terms } from "@/content/legal";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: terms.title,
  description: terms.description,
  alternates: feedAlternates("/terms/"),
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
