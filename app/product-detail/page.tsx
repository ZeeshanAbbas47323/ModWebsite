import { redirect, notFound } from "next/navigation";
import ProductDetail from "@/components/product-detail/product-detail";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getProductById } from "@/services/product.server";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

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
