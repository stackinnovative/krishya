"use client";

import { type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import { useDropdownState } from "@/shared/ui/dropdown/useDropdownState";
import { useFloatingPanelPosition } from "@/shared/ui/dropdown/useFloatingPanelPosition";
import type { DropdownOption } from "@/shared/ui/dropdown/types";

export type SearchableSelectOption = DropdownOption;

const triggerStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "11px 14px",
  borderRadius: 12,
  fontSize: 13,
  color: "#141414",
  outline: "none",
  fontWeight: 500,
  border: "1px solid #e6e6e3",
  background: "#fafaf8",
  cursor: "pointer",
  textAlign: "left",
};

/**
 * Reusable styled dropdown, matching this theme on both mobile and desktop
 * (unlike a native <select>, whose open popup is drawn by the OS/browser and
 * can't be restyled). Set `searchable` for a type-to-filter combobox once
 * the option list can grow past a handful of items (e.g. picking a category
 * out of dozens); leave it off for a short fixed list (e.g. Yes/No).
 *
 * The option panel is portaled to document.body and positioned by the
 * trigger's live bounding rect - forms routinely sit inside a scrollable
 * modal body, and an in-flow `position: absolute` panel gets silently
 * clipped by that container's `overflow: auto` instead of floating above it.
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled,
  error,
  searchable = true,
}: {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
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
        style={{
          ...triggerStyle,
          ...(error ? { border: "1px solid #f0a99b", background: "#fdf2f0" } : null),
          ...(disabled ? { opacity: 0.6, cursor: "not-allowed" } : null),
        }}
      >
        <span className="truncate" style={{ color: selectedOption ? "#141414" : "#a8a8a4" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className="flex-none" color="#8a8a8e" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[300] flex flex-col overflow-hidden"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              maxHeight: rect.maxHeight,
              transform: rect.openUp ? "translateY(-100%)" : undefined,
              marginTop: rect.openUp ? -6 : 6,
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #ececea",
              boxShadow: "0 10px 30px rgba(20,20,20,.16)",
            }}
          >
            {searchable && (
              <div className="flex flex-none items-center gap-2 border-b border-[#f0f0ee] px-3 py-2.5">
                <Search size={14} color="#8a8a8e" className="flex-none" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlighted(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full border-none bg-transparent text-[13px] font-medium outline-none"
                />
              </div>
            )}
            <div className="flex-1 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3.5 py-3 text-[12.5px] text-[#8a8a8e]">No matches.</div>
              ) : (
                filteredOptions.map((opt, i) => (
                  <div
                    key={opt.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => choose(opt)}
                    className="cursor-pointer truncate px-3.5 py-2.5 text-[13px] font-medium"
                    style={{
                      background: i === highlighted ? "#141414" : opt.value === value ? "#f3f3f1" : "transparent",
                      color: i === highlighted ? "#fff" : "#141414",
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
