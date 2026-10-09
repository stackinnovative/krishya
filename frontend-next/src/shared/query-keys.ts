/**
 * Central React Query key registry.
 *
 * Every admin-writes/storefront-reads pair (products, categories, home
 * content, ...) used to have its query key
 * hardcoded independently in each hook/page - the admin mutation's
 * `invalidateQueries` call only knew about the admin-side key sitting next
 * to it in the same file, so saving/toggling something in admin never
 * invalidated the differently-named storefront key that displayed it,
 * leaving the storefront stale until a manual refresh.
 *
 * Importing the base key from here on both the `useQuery` side and the
 * `invalidateQueries` side keeps them from drifting apart again - a
 * mutation that means to refresh "the storefront product list" imports
 * `productKeys.userList` the same way `useProductList` does, instead of
 * retyping `["user-products"]` and hoping it still matches.
 *
 * Base keys only - call sites append their own variable parts (an id,
 * filters, a guest id, ...) after spreading the base, e.g.
 * `queryKey: [...productKeys.adminDetails, id]`. `invalidateQueries` only
 * needs the base: React Query matches by prefix, so invalidating
 * `productKeys.userDetails` invalidates every `[...userDetails, id]` variant
 * regardless of which id.
 */

export const productKeys = {
  adminList: ["admin-products"] as const,
  adminDetails: ["admin-product-details"] as const,
  featured: ["featured-products"] as const,
  toteBagCollection: ["tote-bag-collection"] as const,
  userList: ["user-products"] as const,
  userDetails: ["user-product-details"] as const,
  related: ["related-products"] as const,
};

export const categoryKeys = {
  adminList: ["admin-categories"] as const,
  active: ["active-categories"] as const,
  signature: ["signature-categories"] as const,
};

export const homeContentKeys = {
  adminHeroes: ["admin-heroes"] as const,
  adminBanners: ["admin-banners"] as const,
  adminTestimonials: ["admin-testimonials"] as const,
  heroUser: ["hero-user"] as const,
  bannerUser: ["banner-user"] as const,
  testimonialsUser: ["testimonials-user"] as const,
};

export const cartKeys = {
  cart: ["cart"] as const,
  count: ["cart-count"] as const,
  checkoutItems: ["checkout-items"] as const,
};

export const aboutKeys = {
  /** About singleton - read by the admin About tab, the landing-page teaser
   * and the About page, so one save refreshes all three. */
  all: ["about"] as const,
};

export const blogKeys = {
  adminList: ["admin-blogs"] as const,
  adminDetails: ["admin-blog-details"] as const,
  /** Journal index pages and the home "From Our Blog" row. */
  userList: ["user-blogs"] as const,
  featured: ["featured-blog"] as const,
};

export const settingsKeys = {
  /** Single settings singleton - used by both the admin form and every
   * storefront consumer (navbar, footer, maintenance gate, checkout), so an
   * admin save invalidates all of them at once. */
  all: ["settings"] as const,
};
