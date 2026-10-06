"use client";

import { pill } from "../style-helpers";

/** A plain string is both the value and its own label; pass {value,label} when the display text needs to differ (a status code vs. its human label, or a "Custom" pill whose label becomes the picked range once one is chosen). */
export type FilterPillOption<T extends string> = T | { value: T; label: string };

const optionValue = <T extends string>(opt: FilterPillOption<T>): T => (typeof opt === "string" ? opt : opt.value);
const optionLabel = <T extends string>(opt: FilterPillOption<T>): string => (typeof opt === "string" ? opt : opt.label);

/**
 * Horizontally-scrolling pill filter row - the one reusable control every
 * admin list/report page should render its top-level filter/range buttons
 * through, instead of hand-rolling the row per page. Scrolls left-to-right
 * on narrow screens rather than wrapping to a second line (which pushes the
 * rest of the page down unpredictably as more options are added).
 */
export default function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly FilterPillOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto scroll-smooth pb-1">
      {options.map((opt) => {
        const v = optionValue(opt);
        return (
          <button key={v} type="button" className="flex-none" style={pill(value === v)} onClick={() => onChange(v)}>
            {optionLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}
