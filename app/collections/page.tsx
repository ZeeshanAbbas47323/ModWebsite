import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { CollectionCard } from "@/components/collections/collection-card";
import { getCollections } from "@/services/product-category.server";

export const metadata: Metadata = {
  title: "Collections | Modfirst Apparel",
  description:
    "Browse Modfirst collections — DTF transfers, glitter DTF, blank apparel and printing supplies.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();
  // Sub-collections belong on their parent's page, not in the top-level grid.
  const roots = collections.filter((c) => c.parent_id == null);

  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <section className="container pt-10 md:pt-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-4">
          Collections
        </h1>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mb-10">
          From small business advertising to big event displays, Modfirst delivers bold.
        </p>

        {roots.length === 0 ? (
          <div className="bg-[#F4F4F5] rounded-[24px] p-10 md:p-16 text-center">
            <h2 className="text-2xl font-bold text-black mb-3">No collections yet</h2>
            <p className="text-gray-600 mb-8">Browse everything we print instead.</p>
            <Link href="/products"><Button size="xl">All products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {roots.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </section>

      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
    </main>
  );
}
