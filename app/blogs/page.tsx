import { BlogListing } from "@/components/blogs/blog-listing";

export const metadata = {
  title: "Blog",
  description: "Tips, guides, and inspiration for custom printing and apparel.",
};

export default function BlogsPage() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <BlogListing />
    </main>
  );
}
