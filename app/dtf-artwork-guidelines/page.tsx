import type { Metadata } from "next";
import { ContentPageView } from "@/components/content/content-page-view";
import { getContentPage } from "@/services/content-page.server";

const PAGE_FILTERS = {
  content_type: "page",
  slug: "dtf-artwork-guidelines",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage(PAGE_FILTERS);
  if (!page) return { title: "DTF Artwork Guidelines | Modfirst Apparel" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_desc,
    keywords: page.meta_keywords,
  };
}

export default async function DtfArtworkGuidelinesPage() {
  const page = await getContentPage(PAGE_FILTERS);
  return (
    <ContentPageView
      page={page}
      eyebrow="Artwork"
      fallbackTitle="DTF Artwork Guidelines"
      intro="File formats, resolution and colour setup for print-ready designs."
    />
  );
}
