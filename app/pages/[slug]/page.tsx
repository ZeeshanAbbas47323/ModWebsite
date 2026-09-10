import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentPageView } from "@/components/content/content-page-view";
import { getContentPage } from "@/services/content-page.server";

/**
 * Serves any content page created in the dashboard, with no code change and no
 * deploy. `menu-nav.ts` already builds `/pages/{slug}` links for menu items of
 * type "page", so this is the route those have always pointed at.
 *
 * `getContentPage` filters on is_active, so deactivating a page in the
 * dashboard makes this 404 — which is what the toggle is supposed to mean.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getContentPage({ slug });

  if (!page) return { title: "Page not found" };

  return {
    title: page.meta_title || page.title,
    description: page.meta_desc,
    keywords: page.meta_keywords,
    ...(page.canonical_url ? { alternates: { canonical: page.canonical_url } } : {}),
  };
}

export default async function ContentPageBySlug({ params }: PageProps) {
  const { slug } = await params;
  const page = await getContentPage({ slug });

  if (!page) notFound();

  return (
    <ContentPageView
      page={page}
      eyebrow={eyebrowFor(page.content_type)}
      fallbackTitle={page.title}
      intro={page.meta_desc}
    />
  );
}

/** The small label above the title, so a policy does not read as a guide. */
function eyebrowFor(contentType?: string): string {
  switch (contentType) {
    case "privacy":
    case "terms":
    case "policy":
      return "Legal";
    case "faq":
      return "Help";
    default:
      return "Information";
  }
}
