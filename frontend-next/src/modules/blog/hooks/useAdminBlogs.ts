import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage, getApiFieldErrors, getApiStatus } from "@/lib/errors";
import { createBlogApi, deleteBlogApi, editBlogApi, getAdminBlogApi, getAdminBlogsApi, publishBlogApi, unpublishBlogApi } from "../api/blog.api";
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
const invalidateAllBlogViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: blogKeys.adminList });
  queryClient.invalidateQueries({ queryKey: blogKeys.adminDetails });
  queryClient.invalidateQueries({ queryKey: blogKeys.userList });
  queryClient.invalidateQueries({ queryKey: blogKeys.featured });
};

export const useSaveBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: SaveBlogPayload }) => (id ? editBlogApi(id, data) : createBlogApi(data)),
    onSuccess: (res, vars) => {
      toast.success(vars.data.status === "published" ? "Article saved and live" : "Draft saved");
      if (res.data) queryClient.setQueryData([...blogKeys.adminDetails, res.data.id], res);
      invalidateAllBlogViews(queryClient);
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
    onSuccess: (_res, vars) => {
      toast.success(vars.status === "published" ? "Moved back to drafts" : "Article is live");
      invalidateAllBlogViews(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not change the article's status.")),
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlogApi(id),
    onSuccess: () => {
      toast.success("Article deleted");
      invalidateAllBlogViews(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete the article.")),
  });
};
