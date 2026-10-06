import { useQuery } from "@tanstack/react-query";
import { getCurrentUserApi } from "../api/auth.api";

export const AUTH_USER_QUERY_KEY = ["auth-user"] as const;

export const useAuthUser = () =>
  useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: getCurrentUserApi,
    retry: false,
    staleTime: Infinity,
  });
