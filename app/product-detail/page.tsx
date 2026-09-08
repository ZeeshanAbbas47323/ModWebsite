import { redirect, notFound } from "next/navigation";
import ProductDetail from "@/components/product-detail/product-detail";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getProductById } from "@/services/product.server";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

/**
 * Legacy id-based product URL (?id=123) — kept only so old links/menu rows
 * built before slugs were reliable everywhere still work. Redirects
 * server-side to the real, SEO-friendly /products/<slug> page whenever the
 * product has one (nearly always), so a visitor never actually sees or
 * shares a /product-detail?id= URL — falls back to rendering here directly
 * only for the rare product with no slug at all.
 */
export default async function ProductDetailPage({ searchParams }: Props) {
  const { id: idParam } = await searchParams;
  const id = Number(idParam) || 0;
  if (!id) notFound();

  const product = await getProductById(id);
  if (!product) notFound();
  if (product.slug) redirect(`/products/${product.slug}`);

  return (
    <>
      <ProductDetail product={product} />
      <NewsletterSection />
    </>
  );
}
