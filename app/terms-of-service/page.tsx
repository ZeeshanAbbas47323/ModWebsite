import type { Metadata } from "next";
import { ContentPageView } from "@/components/content/content-page-view";
import { getContentPage } from "@/services/content-page.server";

const PAGE_FILTERS = { content_type: "terms", slug: "terms-of-service" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage(PAGE_FILTERS);
  if (!page) return { title: "Terms of Service | Modfirst Apparel" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_desc,
    keywords: page.meta_keywords,
  };
}

export default async function TermsOfServicePage() {
  const page = await getContentPage(PAGE_FILTERS);
  return (
    <ContentPageView
      page={page}
      eyebrow="Legal"
      fallbackTitle="Terms of Service"
      intro="The conditions that apply when you shop with Modfirst."
    />
  );
}
