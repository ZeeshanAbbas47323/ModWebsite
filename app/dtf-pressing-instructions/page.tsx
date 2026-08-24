import type { Metadata } from "next";
import { ContentPageView } from "@/components/content/content-page-view";
import { getContentPage } from "@/services/content-page.server";

const PAGE_FILTERS = {
  content_type: "page",
  slug: "dtf-pressing-instructions",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage(PAGE_FILTERS);
  if (!page) return { title: "DTF Pressing Instructions | Modfirst Apparel" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_desc,
    keywords: page.meta_keywords,
  };
}

export default async function DtfPressingInstructionsPage() {
  const page = await getContentPage(PAGE_FILTERS);
  return (
    <ContentPageView
      page={page}
      eyebrow="How-to"
      fallbackTitle="DTF Pressing Instructions"
      intro="Heat, time and pressure settings for a press that lasts wash after wash."
    />
  );
}
