import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/services/blog.server";
import { BlogDetail } from "@/components/blogs/blog-detail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await getBlogBySlug(slug);
    return {
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt,
    };
  } catch {
    return {};
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  let blog;
  try {
    blog = await getBlogBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <BlogDetail blog={blog!} />
    </main>
  );
}
