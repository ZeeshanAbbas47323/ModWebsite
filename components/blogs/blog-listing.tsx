"use client";

import { useState } from "react";
import { useBlogs } from "@/hooks/use-blogs";
import { BlogCard } from "./blog-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = ["All", "Business Tips", "Design", "Printing", "Tutorials"];
const TAGS = ["dtf", "custom", "branding", "t-shirt", "sublimation"];

export function BlogListing() {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("");

  const { data, isLoading, isError } = useBlogs({
    page,
    limit: 12,
    filters: {
      ...(activeCategory !== "All" && { category: activeCategory }),
      ...(activeTag && { tags: activeTag }),
    },
  });

  const blogs = data?.payload ?? [];
  const pagination = data?.pagination;

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleTag = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? "" : tag));
    setPage(1);
  };

  return (
    <section className="container pt-10 md:pt-12 lg:pt-16 pb-16">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 tracking-tight text-center">
        Blog
      </h1>
      <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
        Tips, guides, and inspiration for custom printing and apparel.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat
                ? "bg-[#C8E100] border-[#C8E100] text-black"
                : "bg-white border-gray-200 text-gray-600 hover:border-[#C8E100]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              activeTag === tag
                ? "bg-black border-black text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-black"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* States */}
      {isError && (
        <p className="text-center text-red-500 py-20">
          Failed to load blogs. Please try again.
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse">
              <div className="w-full aspect-[1.4] rounded-2xl bg-gray-200" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : !isError && blogs.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No blogs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <Button
            variant="outline"
            size="icon"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
