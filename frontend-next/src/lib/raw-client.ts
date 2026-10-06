import axios from "axios";
import { env } from "./env";

/**
 * Plain axios instance with no interceptors - used only for the refresh
 * call itself and for /auth/me, so a 401 there can't recursively trigger
 * another refresh attempt.
 */
export const raw = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});
