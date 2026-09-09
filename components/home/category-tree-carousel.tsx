"use client";

import { CategoryCarousel } from "@/components/home/category-carousel";
import { useProductCategories } from "@/hooks/use-product-categories";

interface CategoryTreeCarouselProps {
  categoryId: number;
  title: string;
  description?: string;
  viewAllHref: string;
}

export function CategoryTreeCarousel({
  categoryId,
  title,
  description,
  viewAllHref,
}: CategoryTreeCarouselProps) {
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
