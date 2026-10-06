"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    let reconnectTimer: ReturnType<typeof setTimeout>;

    const handleOffline = () => {
      setOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setOffline(false);
      setJustReconnected(true);
      reconnectTimer = setTimeout(() => setJustReconnected(false), 2500);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearTimeout(reconnectTimer);
    };
  }, []);

  if (!offline && !justReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[999] flex justify-center px-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}
    >
      <div
        className="flex items-center gap-2.5 rounded-full px-4 py-2.5 shadow-lg transition-colors"
        style={
          offline
            ? { background: "#141414", color: "#fff" }
            : { background: "#e4f7e8", color: "#2e9e4b" }
        }
      >
        {offline ? (
          <>
            <WifiOff size={16} strokeWidth={2.2} />
            <span className="text-[12.5px] font-medium">
              You&apos;re offline — check your internet connection
            </span>
          </>
        ) : (
          <>
            <Wifi size={16} strokeWidth={2.2} />
            <span className="text-[12.5px] font-medium">Back online</span>
          </>
        )}
      </div>
    </div>
  );
}
