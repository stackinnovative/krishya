"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { dangerPillButton } from "../style-helpers";

export default function AdminErrorFallback({
  title = "Something went wrong",
  message = "This section couldn't load. Please try again.",
  onRetry,
  compact = false,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-[#fdf6f5] text-center ${compact ? "px-4 py-6" : "px-6 py-10"}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fde8e4]">
        <AlertTriangle size={16} strokeWidth={2} color="#e5533f" />
      </div>
      <div className="text-[13px] font-semibold text-[#141414]">{title}</div>
      <div className="max-w-[280px] text-[12px] leading-relaxed text-[#8a8a8e]">{message}</div>
      {onRetry && (
        <button onClick={onRetry} style={dangerPillButton} className="mt-1 inline-flex items-center gap-1.5">
          <RotateCcw size={12} strokeWidth={2.3} />
          Try again
        </button>
      )}
    </div>
  );
}
