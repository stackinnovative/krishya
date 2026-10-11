import type { ComponentType } from "react";
import {
  LayoutGrid,
  Tags,
  Package,
  ShoppingBag,
  TrendingUp,
  Home,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}

/**
 * Single source of truth for the admin sidebar. Adding a module to the
 * template is: build its folder under src/modules/<name>, add its page(s)
 * under app/(admin)/admin/<name>, then add one entry here - nothing else
 * in the shell needs to change.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { key: "categories", label: "Categories", href: "/admin/categories", icon: Tags },
  { key: "products", label: "Products", href: "/admin/products", icon: Package },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { key: "revenue", label: "Revenue", href: "/admin/revenue", icon: TrendingUp },
  { key: "home", label: "Home Management", href: "/admin/home", icon: Home },
  { key: "blog", label: "Blog", href: "/admin/blog", icon: Newspaper },
  { key: "settings", label: "Business Settings", href: "/admin/settings", icon: Settings },
  { key: "users", label: "Users", href: "/admin/users", icon: Users },
];
