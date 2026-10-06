/** Falls back to the current 30m/1d behaviour when the env vars are unset,
 * so only opting in (e.g. in a local .env for testing) changes anything. */
export const ACCESS_TOKEN_TTL_MS = Number(process.env.ACCESS_TOKEN_TTL_MS) || 30 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = Number(process.env.REFRESH_TOKEN_TTL_MS) || 1 * 24 * 60 * 60 * 1000;
