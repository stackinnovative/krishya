"use client";

import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import { useDropdownState } from "@/shared/ui/dropdown/useDropdownState";
import { useFloatingPanelPosition } from "@/shared/ui/dropdown/useFloatingPanelPosition";
import type { DropdownOption } from "@/shared/ui/dropdown/types";

export type SelectOption = DropdownOption;

/**
 * Generic themed storefront dropdown, built on the same shared open/keyboard
 * /click-outside/positioning behavior as the admin dashboard's
 * SearchableSelect - so a fix to that behavior (like the viewport flip-to-fit
 * one) reaches both surfaces, while each keeps its own look (CSS variables
 * here vs admin's hardcoded hex).
 */
export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled,
  searchable = false,
}: {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const {
    open,
    toggleMenu,
    query,
    setQuery,
    filteredOptions,
    highlighted,
    setHighlighted,
    selectedOption,
    triggerRef,
    panelRef,
    searchInputRef,
    choose,
    handleKeyDown,
  } = useDropdownState({ options, value, onChange, searchable });

  const rect = useFloatingPanelPosition({ open, triggerRef });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && toggleMenu()}
        onKeyDown={searchable ? undefined : handleKeyDown}
        className="flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-sm disabled:opacity-50"
        style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--text)" }}
      >
        <span className="truncate" style={{ color: selectedOption ? "var(--text)" : "var(--muted)" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`flex-none transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[300] flex flex-col overflow-hidden rounded-xl border shadow-xl"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              maxHeight: rect.maxHeight,
              transform: rect.openUp ? "translateY(-100%)" : undefined,
              marginTop: rect.openUp ? -6 : 6,
              borderColor: "var(--border)",
              background: "var(--card)",
            }}
          >
            {searchable && (
              <div className="flex flex-none items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--border)" }}>
                <Search size={14} style={{ color: "var(--muted)" }} className="flex-none" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlighted(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full border-none bg-transparent text-sm outline-none"
                  style={{ color: "var(--text)" }}
                />
              </div>
            )}
            <div className="flex-1 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3.5 py-3 text-[13px]" style={{ color: "var(--muted)" }}>
                  No matches.
                </div>
              ) : (
                filteredOptions.map((opt, i) => (
                  <div
                    key={opt.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => choose(opt)}
                    className="cursor-pointer truncate px-4 py-2.5 text-sm"
                    style={{
                      background: i === highlighted ? "var(--accent-soft)" : "transparent",
                      color: opt.value === value ? "var(--accent-strong)" : "var(--text)",
                      fontWeight: opt.value === value ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
