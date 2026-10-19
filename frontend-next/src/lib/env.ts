export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4005/api/v1",
  /** Server-only - the real backend URL, for server-side fetches (RSC,
   * generateMetadata) that talk to it directly instead of going through the
   * /api/proxy rewrite (see next.config.ts). No browser/cookie concern for
   * a Node-to-Node call, so there's no reason to add the proxy hop here. */
  backendApiUrl: process.env.BACKEND_API_URL ?? "http://localhost:4005/api/v1",
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
  paymentMode: process.env.NEXT_PUBLIC_PAYMENT_MODE ?? "test",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  razorpayTestKeyId: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID ?? "",
  /** Shows the "Fill sample data" button on checkout - only ever honoured while paymentMode is "test". */
  checkoutSampleData: process.env.NEXT_PUBLIC_CHECKOUT_SAMPLE_DATA === "true",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  ayushLicenseNo: process.env.NEXT_PUBLIC_AYUSH_LICENSE_NO ?? "",
  storeAddress: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
