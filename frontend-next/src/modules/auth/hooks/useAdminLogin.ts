import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginApi } from "../api/auth.api";
import { AUTH_USER_QUERY_KEY } from "./useAuthUser";
import type { LoginPayload } from "../types/auth.type";

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => loginApi({ data, role: "admin" }),
    onSuccess: (res) => {
      const user = res.data?.user;
      if (user) queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
      router.replace("/admin/dashboard");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { logoutUserApi } = await import("../api/auth.api");
      return logoutUserApi();
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/admin/login");
    },
  });
};
