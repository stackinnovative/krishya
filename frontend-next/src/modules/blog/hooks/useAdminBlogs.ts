import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage, getApiFieldErrors, getApiStatus } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { createBlogApi, deleteBlogApi, editBlogApi, getAdminBlogApi, getAdminBlogsApi, publishBlogApi, restoreBlogApi, unpublishBlogApi } from "../api/blog.api";
import type { BlogStatus, SaveBlogPayload } from "../types/blog.type";
import { blogKeys } from "@/shared/query-keys";

export const useAdminBlogs = (query: Record<string, unknown>) =>
  useQuery({
    queryKey: [...blogKeys.adminList, query],
    queryFn: () => getAdminBlogsApi(query),
    placeholderData: (prev) => prev,
  });

export const useAdminBlog = (id: string | null) =>
  useQuery({ queryKey: [...blogKeys.adminDetails, id], queryFn: () => getAdminBlogApi(id!), enabled: !!id });

/** Every place an article shows up: the admin list and editor, the Journal index, its featured card and the home page row. */
const invalidateAllBlogViews = (queryClient: ReturnType<typeof useQueryClient>) => Promise.all([
  // The list is inactive while editing. Refresh it before navigating back to it.
  queryClient.invalidateQueries({ queryKey: blogKeys.adminList, refetchType: "all" }),
  queryClient.invalidateQueries({ queryKey: blogKeys.adminDetails }),
  queryClient.invalidateQueries({ queryKey: blogKeys.userList }),
  queryClient.invalidateQueries({ queryKey: blogKeys.featured }),
]);

export const useSaveBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: SaveBlogPayload }) => (id ? editBlogApi(id, data) : createBlogApi(data)),
    onSuccess: async (res, vars) => {
      const publishedAt = res.data?.publishedAt;
      const scheduled = vars.data.status === "published" && !!publishedAt && new Date(publishedAt).getTime() > Date.now();
      toast.success(
        vars.data.status === "draft" ? "Draft saved" : scheduled ? `Article scheduled for ${formatDate(publishedAt)}` : "Article saved and live",
      );
      if (res.data) queryClient.setQueryData([...blogKeys.adminDetails, res.data.id], res);
      await invalidateAllBlogViews(queryClient);
    },
    // Field errors and a taken URL (409) are shown under the inputs by the editor - only toast the rest.
    onError: (err) => {
      if (getApiFieldErrors(err) || getApiStatus(err) === 409) return;
      toast.error(getApiErrorMessage(err, "Could not save the article. Try again."));
    },
  });
};

export const useToggleBlogStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BlogStatus }) => (status === "published" ? unpublishBlogApi(id) : publishBlogApi(id)),
    onSuccess: async (_res, vars) => {
      toast.success(vars.status === "published" ? "Moved back to drafts" : "Article is live");
      await invalidateAllBlogViews(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not change the article's status.")),
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permanent = false }: { id: string; permanent?: boolean }) => deleteBlogApi(id, permanent),
    onSuccess: async (_res, vars) => {
      toast.success(vars.permanent ? "Article permanently deleted" : "Article blocked");
      await invalidateAllBlogViews(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete the article.")),
  });
};

export const useRestoreBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreBlogApi,
    onSuccess: async () => {
      toast.success("Article unblocked");
      await invalidateAllBlogViews(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not restore the article.")),
  });
};
