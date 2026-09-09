import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShopCollectionWrapper, type ShopCollectionType } from "@/components/product/shop-collection-wrapper";

interface Props {
  params: Promise<{ type: string }>;
}

const COLLECTIONS: Record<
  string,
  { type: ShopCollectionType; title: string; description: string; emptyDescription?: string }
> = {
  "best-sellers": {
    type: "BEST_SELLERS",
    title: "Best Sellers",
    description: "Our most-ordered products, ranked by real sales.",
    emptyDescription: "Check back once a few orders are in.",
  },
  "most-popular": {
    type: "MOST_POPULAR",
    title: "Most Popular",
    description: "What everyone's ordering right now.",
  },
  "newest": {
    type: "NEWEST",
    title: "New Arrivals",
    description: "Just added to the catalog.",
  },
  "featured": {
    type: "FEATURED",
    title: "Featured",
    description: "Hand-picked by the Modfirst team.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const collection = COLLECTIONS[type];
  return { title: collection?.title ?? "Shop" };
}

export default async function ShopCollectionPage({ params }: Props) {
  const { type } = await params;
  const collection = COLLECTIONS[type];
  if (!collection) notFound();

  return (
    <ShopCollectionWrapper
      type={collection.type}
      title={collection.title}
      description={collection.description}
      emptyDescription={collection.emptyDescription}
    />
  );
}
