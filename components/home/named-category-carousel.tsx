"use client";

import { useProductCategories } from "@/hooks/use-product-categories";
import { CategoryCarousel } from "./category-carousel";

/**
 * A category rail addressed by name instead of id — category ids differ
 * between environments (local/live), but the name is stable and set by
 * whoever manages the catalogue.
 */
export function NamedCategoryCarousel({ name, limit }: { name: string; limit?: number }) {
  const { data: categories } = useProductCategories(null);
  const category = categories?.find(
    (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

  if (!category) return null;

  return (
    <CategoryCarousel
      categoryId={category.id}
      title={category.name}
      viewAllHref={`/collections/${category.slug}`}
      limit={limit}
    />
  );
}
