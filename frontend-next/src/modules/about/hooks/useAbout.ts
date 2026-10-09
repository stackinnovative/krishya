import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/errors";
import { getAboutApi, updateAboutApi } from "../api/about.api";
import { aboutKeys } from "@/shared/query-keys";

export const useAbout = () => useQuery({ queryKey: aboutKeys.all, queryFn: getAboutApi });

export const useUpdateAbout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAboutApi,
    onSuccess: (res) => {
      toast.success("About content saved");
      // The response is the saved record - drop it straight into the cache.
      queryClient.setQueryData(aboutKeys.all, res);
      queryClient.invalidateQueries({ queryKey: aboutKeys.all });
    },
    // Field-level errors are shown under the inputs by the editor - only toast the rest.
    onError: (err) => !getApiFieldErrors(err) && toast.error(getApiErrorMessage(err, "Could not save the About content. Try again.")),
  });
};
