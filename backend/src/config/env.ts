import dotenv from "dotenv";

dotenv.config(); 

export const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI as string,
  /** How many proxies sit in front of Express (see TRUST_PROXY in .env.example). 0 = trust none. */
  TRUST_PROXY: Number(process.env.TRUST_PROXY) || 0,
  /** Frontend origins allowed to call the API, from a comma-separated CORS_ORIGINS. */
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
};