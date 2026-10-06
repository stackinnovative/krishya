import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/errors";
import {
  blockCategoryApi,
  createCategoryApi,
  editCategoryApi,
  getAllCategoriesForAdminApi,
  unblockCategoryApi,
} from "../api/category.api";
import type { CreateCategoryPayload } from "../types/category.type";
import { categoryKeys } from "@/shared/query-keys";

export const useAdminCategories = (query: Record<string, unknown>) =>
  useQuery({
    queryKey: [...categoryKeys.adminList, query],
    queryFn: () => getAllCategoriesForAdminApi(query),
    placeholderData: (prev) => prev,
  });

/** Every place a category's admin edit needs to be reflected: its admin list, plus the storefront's filter dropdown and homepage "shop by category" section. */
const invalidateAllCategoryViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminList });
  queryClient.invalidateQueries({ queryKey: categoryKeys.active });
  queryClient.invalidateQueries({ queryKey: categoryKeys.signature });
};

export const useSaveCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: CreateCategoryPayload }) =>
      id ? editCategoryApi(id, data) : createCategoryApi(data),
    onSuccess: (_res, vars) => {
      toast.success(vars.id ? "Category updated" : "Category added");
      invalidateAllCategoryViews(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not save the category.")),
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? blockCategoryApi(id) : unblockCategoryApi(id),
    // Blocking/unblocking changes whether it's visible on the storefront, not just its admin row.
    onSuccess: () => invalidateAllCategoryViews(queryClient),
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not update status.")),
  });
};
