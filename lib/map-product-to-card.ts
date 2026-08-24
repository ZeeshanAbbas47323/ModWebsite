import type { Product } from "@/services/product.service";
import type { ProductCardData } from "@/components/product/product-card";
import { resolveImageUrl } from "@/lib/image-url";

export function mapProductToCard(product: Product): ProductCardData {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const imgPath = resolveImageUrl(primaryImage?.image_url, "/images/products/dtf-gang-sheet.svg");

  const rawPrice = product.sale_price ?? product.base_price;
  const price = rawPrice != null ? Number(rawPrice) : null;
  const count = price ? `$${price.toFixed(2)}` : "";

  return {
    id: product.id,
    title: product.name,
    count,
    img_path: imgPath,
    slug: product.slug,
    product,
  };
}
