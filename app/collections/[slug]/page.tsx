import Image from "next/image";
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
import { resolveImageUrl } from "@/lib/image-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection | Modfirst Apparel" };
  return {
    title: `${collection.name} | Modfirst Apparel`,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const image = collection.image_url ? resolveImageUrl(collection.image_url) : null;
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
              <BreadcrumbLink asChild><Link href="/collections">Collections</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{collection.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Banner */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-[#F4F4F5] rounded-[24px] p-8 md:p-10 mb-10 md:mb-14">
          {image && (
            <div className="relative w-40 h-40 md:w-52 md:h-52 shrink-0 rounded-[20px] overflow-hidden bg-white">
              <Image
                src={image}
                alt={collection.name}
                fill
                className="object-contain p-4"
                priority
                {...(image.startsWith("http") ? { unoptimized: true } : {})}
              />
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-3">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-gray-600 text-base md:text-lg max-w-2xl">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {/* Sub-collections, when the catalogue is nested */}
        {children.length > 0 && (
          <div className="mb-12 md:mb-16">
            <h2 className="text-2xl font-bold text-black mb-6">Shop by category</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {children.map((child) => (
                <CollectionCard key={child.id} collection={child} />
              ))}
            </div>
          </div>
        )}

        <CollectionProducts categoryId={collection.id} />
      </section>

      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
    </main>
  );
}
