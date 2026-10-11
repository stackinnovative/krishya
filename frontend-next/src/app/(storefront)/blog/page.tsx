import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { Eyebrow, SectionDecor } from "@/modules/storefront-shell/components/decor";
import BlogList from "@/modules/storefront-content/components/BlogList";
import { getBlogListApi, getFeaturedBlogApi } from "@/modules/blog/api/blog.api";
import { blogListQuery } from "@/modules/blog/constants";
import { blogKeys } from "@/shared/query-keys";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes on Ayurvedic living - seasonal care, daily routines and the herbs of Kerala.",
};

// Always fresh, so a newly published article shows straight away.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  // Prefetched so the first page of articles is in the initial HTML for search engines.
  const queryClient = new QueryClient();
  const featured = await queryClient.fetchQuery({ queryKey: blogKeys.featured, queryFn: getFeaturedBlogApi }).catch(() => null);
  const query = blogListQuery({ excludeId: featured?.data?.id });
  await queryClient.prefetchQuery({ queryKey: [...blogKeys.userList, query], queryFn: () => getBlogListApi(query) });

  return (
    <section className="relative isolate mx-auto max-w-[1280px] overflow-clip px-[clamp(20px,4vw,56px)] pb-[clamp(56px,7vw,104px)] pt-[clamp(40px,5vw,72px)]">
      <SectionDecor variant="c" />
      <div className="mb-[clamp(28px,3.6vw,48px)] flex flex-col gap-3">
        <Eyebrow>Journal</Eyebrow>
        <h1 className="m-0 font-display text-[clamp(40px,4.6vw,64px)] font-medium leading-[1.05] text-ka-green">Notes on Ayurvedic living</h1>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BlogList />
      </HydrationBoundary>
    </section>
  );
}
