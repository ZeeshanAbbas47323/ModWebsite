import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { CollectionCard } from "@/components/collections/collection-card";
import { CollectionProducts } from "@/components/collections/collection-products";
import { getCollectionBySlug } from "@/services/product-category.server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection" };
  return {
    title: `${collection.name}`,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const children = collection.children ?? [];

  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <section className="container pt-6 md:pt-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/categories">Categories</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{collection.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-3">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-gray-600 text-base md:text-lg max-w-2xl">
              {collection.description}
            </p>
          )}
        </div>

        {/* Sub-collections, when the catalogue is nested */}
        {children.length > 0 && (
          <div className="mb-8 md:mb-10">
            <h2 className="text-2xl font-bold text-black mb-6">Shop by category</h2>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {children.map((child) => (
                <CollectionCard key={child.id} collection={child} compact />
              ))}
            </div>
          </div>
        )}

        <CollectionProducts
          categoryId={collection.id}
          childCategoryIds={children.map((c) => c.id)}
        />
      </section>

      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
    </main>
  );
}
