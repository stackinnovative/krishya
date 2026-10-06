import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  blockAdminUserApi,
  createAdminUserApi,
  getAdminUserDetailApi,
  getAdminUserListApi,
  unblockAdminUserApi,
  updateAdminUserApi,
} from "../api/user.api";
import { getApiErrorMessage } from "@/lib/errors";
import type { UpdateUserPayload } from "../types/user.type";

export const useAdminUsers = (query: Record<string, unknown>) =>
  useQuery({
    queryKey: ["admin-users", query],
    queryFn: () => getAdminUserListApi(query),
    placeholderData: (prev) => prev,
  });

export const useAdminUserDetail = (userId: string | null) =>
  useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => getAdminUserDetailApi(userId as string),
    enabled: !!userId,
  });

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUserApi,
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not create user. Try again.")),
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPayload }) => updateAdminUserApi(userId, data),
    onSuccess: (_res, vars) => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", vars.userId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not update user. Try again.")),
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) =>
      isBlocked ? unblockAdminUserApi(userId) : blockAdminUserApi(userId),
    onSuccess: (_res, vars) => {
      toast.success(vars.isBlocked ? "User activated" : "User deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", vars.userId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Could not update status. Try again.")),
  });
};
