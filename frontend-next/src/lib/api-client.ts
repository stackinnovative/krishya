import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { env } from "./env";
import { raw } from "./raw-client";
import { logout } from "./logout";

const api = axios.create({
  // In the browser this is the same-origin /api/proxy rewrite (see
  // next.config.ts). A relative URL can't be resolved during a server render,
  // so server-side prefetches (home page, product pages) call the backend
  // directly instead - otherwise they silently fail and the page renders its
  // loading state until the client refetches.
  baseURL: typeof window === "undefined" ? env.backendApiUrl : env.apiBaseUrl,
  withCredentials: true,
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let failedQueue: { resolve: (v?: unknown) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as RetryableConfig | undefined;
    if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      isRefreshing = true;
      try {
        await raw.post("/auth/refresh", {}, { withCredentials: true });
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        processQueue(refreshErr);
        // A 429 means "slow down", not "session over" - the refresh token is still good, so keep the admin on the page.
        if (isAxiosError(refreshErr) && refreshErr.response?.status === 429) {
          toast.error("Too many requests. Please wait a minute and try again.");
        } else {
          logout();
        }
        return Promise.reject(refreshErr);
      }
    }
    throw err;
  }
);

export default api;
