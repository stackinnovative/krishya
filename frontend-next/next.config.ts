import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  /**
   * Proxies every browser-facing API call through this app's own origin
   * instead of hitting the backend's domain directly. On Render (and
   * similar PaaS hosts on the public suffix list) the frontend and backend
   * live on different registrable domains, which makes the auth cookie
   * third-party from the browser's point of view - Safari (and thus every
   * browser on iOS, all of which run on WebKit) blocks third-party cookies
   * by default regardless of SameSite=None; Secure being set correctly, so
   * login/checkout silently fail there while working fine on Chrome/Firefox.
   * Routing through this rewrite makes the cookie first-party everywhere.
   * BACKEND_API_URL is server-only (no NEXT_PUBLIC_ prefix) since it's only
   * ever read here, on the server, to know where to forward to.
   * To retire this once a custom domain puts frontend + backend on the same
   * registrable domain: delete this rewrite and point
   * NEXT_PUBLIC_API_BASE_URL straight at the backend's URL again - nothing
   * else in the app needs to change.
   */
  async rewrites() {
    const backend = process.env.BACKEND_API_URL ?? "http://localhost:4005/api/v1";
    return [{ source: "/api/proxy/:path*", destination: `${backend}/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
