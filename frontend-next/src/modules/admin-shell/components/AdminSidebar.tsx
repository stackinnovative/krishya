"use client";

import { useState } from "react";
import Link, { useLinkStatus } from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { ADMIN_NAV } from "../registry";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { useLogout } from "@/modules/auth/hooks/useAdminLogin";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { DEFAULT_STORE_NAME } from "@/lib/contact";
import ConfirmModal from "./ConfirmModal";

/**
 * Small spinner on the nav item being opened. There's no route-level
 * loading.tsx (it blanked the whole screen on every tab change), so the
 * current page stays up until the next one is ready - this shows the click
 * registered meanwhile. Must render inside the Link (useLinkStatus).
 */
function NavPendingSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span className="ml-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />;
}

export default function AdminSidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const { data: user } = useAuthUser();
  const { mutateAsync: logout } = useLogout();
  const { data: settingsRes } = useSettings();
  const settings = settingsRes?.data;
  const storeName = settings?.storeName || DEFAULT_STORE_NAME;
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error("Could not log out. Try again.");
    }
  };

  return (
    <aside
      // `h-dvh` (not `h-screen`/100vh) so the sidebar's real height matches
      // what's actually visible on mobile - 100vh ignores the browser's
      // address bar / bottom toolbar, which pushed this logout block below
      // the visible fold with no way to scroll to it (only the middle `nav`
      // scrolls, not the whole aside). Safe-area padding keeps it clear of
      // the home-indicator bar on notched phones too.
      className={`fixed left-0 top-0 z-[60] flex h-dvh w-[224px] flex-none flex-col bg-[#1d1d1f] px-4 pt-[26px] transition-transform duration-[250ms] ease-out om:sticky om:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-[105%]"
      }`}
      style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2.5 px-2.5 pb-6">
        {settings?.logo?.url ? (
          <span className="relative block h-[30px] w-[30px] flex-none overflow-hidden rounded-[9px] bg-white">
            <Image src={getOptimizedImageUrl(settings.logo.url, 60, 60)} alt={storeName} fill sizes="30px" className="object-cover" />
          </span>
        ) : (
          <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#f7a072,#f8d77a_55%,#b5e36e)] text-sm font-extrabold text-[#1d1d1f]">
            {storeName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="truncate text-[15px] font-bold tracking-[.02em] text-white">{storeName}</div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors"
              style={{
                color: active ? "#141414" : "#c6c6ca",
                background: active ? "#fff" : "transparent",
                boxShadow: active ? "0 4px 14px rgba(0,0,0,.25)" : "none",
              }}
            >
              <Icon size={17} strokeWidth={1.7} />
              <span>{item.label}</span>
              <NavPendingSpinner />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 rounded-[14px] bg-[#2a2a2d] p-3">
        <div className="h-8 w-8 flex-none rounded-full bg-[linear-gradient(135deg,#c9a24a,#f2d98a)]" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold text-white">{user?.name ?? "Store Admin"}</div>
          <div className="truncate text-[11px] text-[#8d8d92]">{user?.email ?? ""}</div>
        </div>
        <button
          onClick={() => setConfirmingLogout(true)}
          title="Logout"
          className="flex cursor-pointer text-[#8d8d92] hover:text-white"
        >
          <LogOut size={16} strokeWidth={1.8} />
        </button>
      </div>

      {confirmingLogout && (
        <ConfirmModal
          title="Log out?"
          message="You'll need to sign in again to access the admin dashboard."
          confirmLabel="Log out"
          tone="danger"
          onConfirm={handleLogout}
          onClose={() => setConfirmingLogout(false)}
        />
      )}
    </aside>
  );
}
