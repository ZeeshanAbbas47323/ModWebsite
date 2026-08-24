import type { Metadata } from "next";
import { ContentPageView } from "@/components/content/content-page-view";
import { getContentPage } from "@/services/content-page.server";

const PAGE_FILTERS = { content_type: "privacy", slug: "privacy-policy" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage(PAGE_FILTERS);
  if (!page) return { title: "Privacy Policy | Modfirst Apparel" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_desc,
    keywords: page.meta_keywords,
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getContentPage(PAGE_FILTERS);
  return (
    <ContentPageView
      page={page}
      eyebrow="Legal"
      fallbackTitle="Privacy Policy"
      intro="How we collect, use and protect your personal information."
    />
  );
}
