"use client";

import { useHomeSection } from "@/hooks/use-home-section";
import { useBlogs } from "@/hooks/use-blogs";
import { BlogCard } from "@/components/blogs/blog-card";

export function BlogSection() {
  const { data: section, isLoading: sectionLoading } =
    useHomeSection("home_blog");
  const { data: blogsData, isLoading: blogsLoading } = useBlogs({
    page: 1,
    limit: 3,
  });

  const title = section?.title?.trim() || "Blog";
  const titleColor =
    section?.section_settings?.title_color?.trim() || "#000000";
  const titleAlign =
    section?.section_settings?.title_align?.trim() || "center";
  const blogs = blogsData?.payload ?? [];

  const isLoading = sectionLoading || blogsLoading;

  return (
    <section className="container pt-10 md:pt-12 lg:pt-16">
      <h2
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-10 tracking-tight"
        style={{
          color: titleColor,
          textAlign: titleAlign as "center" | "left" | "right",
        }}
      >
        {title}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse">
              <div className="w-full aspect-[1.4] rounded-2xl bg-gray-200" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No blogs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </section>
  );
}
