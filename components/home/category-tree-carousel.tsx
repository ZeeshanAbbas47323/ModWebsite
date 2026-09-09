"use client";

import { CategoryCarousel } from "@/components/home/category-carousel";
import { useProductCategories } from "@/hooks/use-product-categories";

interface CategoryTreeCarouselProps {
  /** A main (parent) category's real id — e.g. "DTF Transfers". */
  categoryId: number;
  title: string;
  description?: string;
  viewAllHref: string;
}

/**
 * One home-page rail showing every product under a main category — the
 * parent itself plus all of its subcategories, since a main category never
 * holds products directly (they all live on its subcategories, e.g. T-Shirts
 * under Apparel & Accessories).
 */
export function CategoryTreeCarousel({
  categoryId,
  title,
  description,
  viewAllHref,
}: CategoryTreeCarouselProps) {
  // Real subcategories of this main category, fetched live so the rail stays
  // correct if a category is added/removed later.
  const { data: children } = useProductCategories(categoryId);

  const categoryIds = [categoryId, ...(children?.map((c) => c.id) ?? [])];

  return (
    <CategoryCarousel
      categoryId={categoryIds}
      title={title}
      description={description}
      viewAllHref={viewAllHref}
    />
  );
}
