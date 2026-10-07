/** Primary storefront navigation - header, mobile drawer and footer "Quick links" all render this list. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const POLICY_LINKS = [
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/returns", label: "Returns & Refunds" },
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
] as const;

/** A nav entry stays highlighted on its child routes (a product under Shop, an article under Blog). */
export const isNavActive = (href: string, pathname: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** Where the mobile header's back arrow goes from a nested page. */
export const getBackHref = (pathname: string) => {
  if (pathname.startsWith("/products/")) return "/products";
  if (pathname.startsWith("/blog/")) return "/blog";
  if (pathname === "/checkout") return "/cart";
  return "/";
};

/** Top-level pages reached from the mobile tab bar - no back arrow on these. */
export const MOBILE_ROOT_PATHS = ["/", "/products", "/wishlist", "/cart"];
