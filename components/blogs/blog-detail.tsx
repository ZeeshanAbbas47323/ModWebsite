import Image from "next/image";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Blog } from "@/services/blog.service";

export function BlogDetail({ blog }: { blog: Blog }) {
  const date = new Date(blog.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tagList = blog.tags
    ? blog.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <article className="container pt-10 md:pt-12 lg:pt-16 pb-16 max-w-4xl">
      <Breadcrumb className="mb-8">
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/blogs">Blog</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium line-clamp-1">
              {blog.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {blog.category && (
        <span className="inline-block bg-[#C8E100] text-black text-xs font-semibold px-3 py-1 rounded-full mb-4">
          {blog.category}
        </span>
      )}

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight tracking-tight">
        {blog.title}
      </h1>

      <div className="flex items-center gap-4 text-gray-400 text-sm mb-8">
        <span>{date}</span>
        {blog.view_count > 0 && <span>{blog.view_count} views</span>}
      </div>

      {blog.featured_image && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 bg-gray-100">
          <Image
            src={blog.featured_image}
            alt={blog.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {tagList.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
          {tagList.map((tag) => (
            <Link
              key={tag}
              href={`/blogs?tag=${tag}`}
              className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10">
        <Link
          href="/blogs"
          className="text-black font-semibold text-sm flex items-center gap-1 hover:underline w-fit"
        >
          ← Back to Blog
        </Link>
      </div>
    </article>
  );
}
