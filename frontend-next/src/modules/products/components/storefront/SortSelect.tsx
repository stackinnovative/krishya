"use client";

import Select from "./Select";

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price: Low to High", value: "price_low_high" },
  { label: "Price: High to Low", value: "price_high_low" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function SortSelect({ value, onChange }: { value: SortValue; onChange: (v: SortValue) => void }) {
  return (
    <div className="w-full sm:w-56">
      <Select options={[...SORT_OPTIONS]} value={value} onChange={(v) => onChange(v as SortValue)} />
    </div>
  );
}
