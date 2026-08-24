import type { Metadata } from "next";
import { ContentPageView } from "@/components/content/content-page-view";
import { getContentPage } from "@/services/content-page.server";

const PAGE_FILTERS = { content_type: "policy", slug: "refund-policy" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage(PAGE_FILTERS);
  if (!page) return { title: "Refund Policy | Modfirst Apparel" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_desc,
    keywords: page.meta_keywords,
  };
}

export default async function RefundPolicyPage() {
  const page = await getContentPage(PAGE_FILTERS);
  return (
    <ContentPageView
      page={page}
      eyebrow="Returns"
      fallbackTitle="Refund Policy"
      intro="Returns, exchanges and refunds — what to expect and how to start one."
    />
  );
}
