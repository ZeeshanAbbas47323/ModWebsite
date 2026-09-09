"use client";

import { useProductCategories } from "@/hooks/use-product-categories";
import { CategoryCarousel } from "./category-carousel";

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
      viewAllHref={`/categories/${category.slug}`}
      limit={limit}
    />
  );
}
