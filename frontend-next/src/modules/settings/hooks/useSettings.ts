import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getSettingsApi, updateSettingsApi } from "../api/settings.api";
import { settingsKeys } from "@/shared/query-keys";

export const useSettings = () =>
  useQuery({
    queryKey: settingsKeys.all,
    queryFn: getSettingsApi,
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettingsApi,
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
    onError: () => toast.error("Could not save settings. Try again."),
  });
};
