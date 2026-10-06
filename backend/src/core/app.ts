import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

const PROD_ORIGINS = [
  "https://artspace-w3xj.onrender.com",
  "https://basic-ecom-1.onrender.com",
  "https://www.artspaces.in",
  "https://artspaces.in",
];

// Matches http(s)://localhost or 127.0.0.1 on any port - dev servers hop
// ports constantly (Vite on 5173, Next falling back to 3001/3002/... when
// 3000 is taken), so pin the allowlist to the host instead of a fixed list
// of ports. Dev-only: production never has a legitimate reason to accept a
// "localhost" origin, so this rule is skipped entirely once deployed.
const isProd = process.env.NODE_ENV === "production";
const isLocalDevOrigin = (origin: string) => !isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cookieParser())
app.use(cors({
  origin: (origin, callback) => {
    // No Origin header (server-to-server calls, curl, the Razorpay webhook) - nothing to check.
    if (!origin) return callback(null, true);
    if (isLocalDevOrigin(origin) || PROD_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" is not allowed`));
  },
  credentials: true,
}));
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      if (req.originalUrl.includes("/webhook/razorpay")) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

export default app;
