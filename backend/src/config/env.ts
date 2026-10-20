import dotenv from "dotenv";

dotenv.config(); 

export const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI as string,
  /** How many proxies sit in front of Express (see TRUST_PROXY in .env.example). 0 = trust none. */
  TRUST_PROXY: Number(process.env.TRUST_PROXY) || 0,
};