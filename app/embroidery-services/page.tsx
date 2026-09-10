import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageView } from "@/components/content/content-page-view";
import { getContentPage } from "@/services/content-page.server";

const PAGE_FILTERS = {
  content_type: "page",
  slug: "embroidery-services",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage(PAGE_FILTERS);
  if (!page) return { title: "Custom Embroidery Services" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_desc,
    keywords: page.meta_keywords,
  };
}

export default async function EmbroideryServicesPage() {
  const page = await getContentPage(PAGE_FILTERS);

  // Inactive or missing in the dashboard means the page is gone, not
  // broken - without this it rendered a "could not load" panel on a live URL.
  if (!page) notFound();
  return (
    <ContentPageView
      page={page}
      eyebrow="Embroidery"
      fallbackTitle="Custom Embroidery Services"
      intro="Precision embroidery on hats, tees, hoodies and more — bring your designs to life."
    />
  );
}
