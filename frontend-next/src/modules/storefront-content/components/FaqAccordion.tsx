"use client";

import { useId, useState } from "react";
import { PlusIcon } from "@/modules/storefront-shell/components/icons";
import type { Faq } from "../constants/faqs";

/** Plus-to-cross accordion used by the home FAQ preview and the FAQ page. `defaultOpen` is the index opened on load. */
export default function FaqAccordion({ items, defaultOpen, ruleClass = "border-ka-green/[.18]" }: { items: Faq[]; defaultOpen?: number; ruleClass?: string }) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen === undefined ? [] : [defaultOpen]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="flex flex-col">
      {items.map((f, i) => {
        const isOpen = open.has(i);
        const panelId = `${baseId}-${i}`;
        return (
          <div key={f.q} className={`border-b ${ruleClass}`}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-semibold text-ka-green sm:py-[22px] sm:text-[16.5px]"
            >
              {f.q}
              <PlusIcon size={20} strokeWidth={1.5} className={`flex-none transition-transform duration-250 ${isOpen ? "rotate-45" : ""}`} />
            </button>
            {isOpen && (
              <p id={panelId} className="-mt-1 mb-5 pr-10 text-[15px] leading-[1.7] text-ka-body">
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
