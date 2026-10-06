"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { DropdownOption } from "./types";

export interface UseDropdownStateOptions {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  /** Turns on the query box and label-filtering. Off by default (plain option list). */
  searchable?: boolean;
}

export interface UseDropdownStateResult {
  open: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  query: string;
  setQuery: (query: string) => void;
  filteredOptions: DropdownOption[];
  highlighted: number;
  setHighlighted: Dispatch<SetStateAction<number>>;
  selectedOption: DropdownOption | undefined;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  choose: (option: DropdownOption) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Open/close, click-outside, keyboard nav (Escape/Up/Down/Enter) and
 * highlighted-index state for a custom dropdown, with optional type-to-filter
 * search. Shared by every themed dropdown (admin's searchable combobox,
 * storefront's plain select) so this behavior - and any future fix to it -
 * only has to be written once.
 */
export function useDropdownState({
  options,
  value,
  onChange,
  searchable = false,
}: UseDropdownStateOptions): UseDropdownStateResult {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const filteredOptions =
    searchable && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlighted(Math.max(0, options.findIndex((o) => o.value === value)));
    if (searchable) requestAnimationFrame(() => searchInputRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const choose = (option: DropdownOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(filteredOptions.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filteredOptions[highlighted];
      if (opt) choose(opt);
    }
  };

  return {
    open,
    toggleMenu: () => setOpen((o) => !o),
    closeMenu: () => setOpen(false),
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
  };
}
