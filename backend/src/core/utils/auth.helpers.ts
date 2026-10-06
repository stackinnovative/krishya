import type { Response } from 'express';
import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from "../constants/auth.constants.js";

const isProd = process.env.NODE_ENV === "production"

export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
};

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("access_token", token, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_TTL_MS,
  });
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refresh_token", token, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
};

