import { useQuery } from "@tanstack/react-query";
import { getBlogListApi, getFeaturedBlogApi } from "../api/blog.api";
import { blogKeys } from "@/shared/query-keys";

/** Published articles, newest first - `query` takes page, limit, category and excludeId. */
export const useBlogList = (query: Record<string, unknown>, enabled = true) =>
  useQuery({
    queryKey: [...blogKeys.userList, query],
    queryFn: () => getBlogListApi(query),
    placeholderData: (prev) => prev,
    enabled,
  });

/** The article for the big card on the Journal index (the newest one if none is marked featured). */
export const useFeaturedBlog = () => useQuery({ queryKey: blogKeys.featured, queryFn: getFeaturedBlogApi });
