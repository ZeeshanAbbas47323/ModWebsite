import Link from "next/link";
import { SafeImage } from "@/components/shared/safe-image";
import { resolveImageUrl } from "@/lib/image-url";
import type { ProductCategory } from "@/services/product-category.service";

const PLACEHOLDER = "/images/banners-compositions/booklet.png";

export function CollectionCard({
  collection,
  compact = false,
}: {
  collection: ProductCategory;
  /** Smaller card — used for the "Shop by category" sub-list on a category's
   * own page, where these are a secondary aid, not the page's main content. */
  compact?: boolean;
}) {
  const image = resolveImageUrl(collection.image_url, PLACEHOLDER);
  const count = collection._count?.products;

  return (
    <Link
      href={`/categories/${collection.slug}`}
      className="flex flex-col items-center group cursor-pointer"
    >
      <div
        className={`w-full bg-[#F4F4F5] rounded-[24px] mb-5 relative overflow-hidden ${
          compact ? "h-[160px] md:h-[190px]" : "h-[280px] md:h-[350px]"
        }`}
      >
        <SafeImage
          src={image}
          alt={collection.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          placeholderClassName="!object-contain p-10 bg-white"
        />
      </div>
      <h3
        className={`font-bold text-black text-center mb-0.5 group-hover:text-primary transition-colors duration-300 ${
          compact ? "text-base md:text-lg" : "text-xl md:text-[22px]"
        }`}
      >
        {collection.name}
      </h3>
      {count != null && (
        <p className={`text-[#464545] text-center ${compact ? "text-sm" : ""}`}>
          {count} {count === 1 ? "Product" : "Products"}
        </p>
      )}
    </Link>
  );
}
