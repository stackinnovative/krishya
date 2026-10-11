import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/errors";
import {
  createFaqApi,
  createFaqGroupApi,
  deleteFaqApi,
  deleteFaqGroupApi,
  editFaqApi,
  editFaqGroupApi,
  getAdminFaqsApi,
  reorderFaqGroupsApi,
  reorderFaqsApi,
} from "../api/faq.api";
import type { AdminFaqGroup, GetAdminFaqsResponse, SaveFaqGroupPayload, SaveFaqPayload } from "../types/faq.type";
import { faqKeys } from "@/shared/query-keys";

export const useAdminFaqs = () => useQuery({ queryKey: faqKeys.admin, queryFn: getAdminFaqsApi });

type QueryClient = ReturnType<typeof useQueryClient>;

/** The admin page plus both storefront views (FAQ page, home section). */
const invalidateAllFaqViews = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: faqKeys.admin }),
    queryClient.invalidateQueries({ queryKey: faqKeys.list }),
    queryClient.invalidateQueries({ queryKey: faqKeys.home }),
  ]);

/** Field errors are shown under the form inputs by FormModal - only toast the rest. */
const toastUnlessFieldError = (fallback: string) => (err: unknown) => {
  if (!getApiFieldErrors(err)) toast.error(getApiErrorMessage(err, fallback));
};

export const useSaveFaqGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: SaveFaqGroupPayload }) => (id ? editFaqGroupApi(id, data) : createFaqGroupApi(data)),
    onSuccess: (_res, vars) => {
      toast.success(vars.id ? "Group saved" : "Group added");
      return invalidateAllFaqViews(queryClient);
    },
    onError: toastUnlessFieldError("Could not save the group."),
  });
};

export const useDeleteFaqGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFaqGroupApi,
    onSuccess: () => {
      toast.success("Group deleted");
      return invalidateAllFaqViews(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete the group.")),
  });
};

export const useSaveFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: SaveFaqPayload; silent?: boolean }) => (id ? editFaqApi(id, data) : createFaqApi(data)),
    onSuccess: (_res, vars) => {
      // Switch flips (visible / on home) are instant feedback already - no toast for those.
      if (!vars.silent) toast.success(vars.id ? "Question saved" : "Question added");
      return invalidateAllFaqViews(queryClient);
    },
    onError: toastUnlessFieldError("Could not save the question."),
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFaqApi,
    onSuccess: () => {
      toast.success("Question deleted");
      return invalidateAllFaqViews(queryClient);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not delete the question.")),
  });
};

/**
 * Reorders show instantly: the cached list is rearranged before the request,
 * and put back if it fails - so the arrows never feel laggy.
 */
const useOptimisticReorder = <V>(mutationFn: (vars: V) => Promise<unknown>, reorder: (groups: AdminFaqGroup[], vars: V) => AdminFaqGroup[]) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (vars: V) => {
      await queryClient.cancelQueries({ queryKey: faqKeys.admin });
      const previous = queryClient.getQueryData<GetAdminFaqsResponse>(faqKeys.admin);
      if (previous?.data) queryClient.setQueryData<GetAdminFaqsResponse>(faqKeys.admin, { ...previous, data: reorder(previous.data, vars) });
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(faqKeys.admin, ctx.previous);
      toast.error(getApiErrorMessage(err, "Could not change the order."));
    },
    onSettled: () => invalidateAllFaqViews(queryClient),
  });
};

const byIds = <T extends { id: string }>(items: T[], ids: string[]) => ids.map((id) => items.find((i) => i.id === id)).filter((i): i is T => !!i);

export const useReorderFaqGroups = () => useOptimisticReorder((ids: string[]) => reorderFaqGroupsApi(ids), (groups, ids) => byIds(groups, ids));

export const useReorderFaqs = () =>
  useOptimisticReorder(
    ({ groupId, ids }: { groupId: string; ids: string[] }) => reorderFaqsApi(groupId, ids),
    (groups, { groupId, ids }) => groups.map((g) => (g.id === groupId ? { ...g, faqs: byIds(g.faqs, ids) } : g)),
  );
