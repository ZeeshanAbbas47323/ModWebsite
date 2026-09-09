import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/image-url";
import type { ProductCategory } from "@/services/product-category.service";

const PLACEHOLDER = "/images/banners-compositions/booklet.png";

export function CollectionCard({ collection }: { collection: ProductCategory }) {
  const image = resolveImageUrl(collection.image_url, PLACEHOLDER);
  const isExternal = image.startsWith("http");
  const count = collection._count?.products;

  return (
    <Link
      href={`/categories/${collection.slug}`}
      className="flex flex-col items-center group cursor-pointer"
    >
      <div className="w-full bg-[#F4F4F5] h-[280px] md:h-[350px] rounded-[24px] mb-5 relative overflow-hidden">
        <Image
          src={image}
          alt={collection.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          {...(isExternal ? { unoptimized: true } : {})}
        />
      </div>
      <h3 className="text-xl md:text-[22px] font-bold text-black text-center mb-0.5 group-hover:text-primary transition-colors duration-300">
        {collection.name}
      </h3>
      {count != null && (
        <p className="text-[#464545] text-center">
          {count} {count === 1 ? "Product" : "Products"}
        </p>
      )}
    </Link>
  );
}
