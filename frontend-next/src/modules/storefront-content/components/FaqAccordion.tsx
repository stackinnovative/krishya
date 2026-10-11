"use client";

import { useId, useState } from "react";
import { PlusIcon } from "@/modules/storefront-shell/components/icons";

export type FaqAccordionItem = { id: string; question: string; answer: string };

/**
 * Plus-to-cross accordion used by the home FAQ preview and the FAQ page.
 * Only one answer is open at a time - opening another closes the first.
 * Panels slide open (height + fade) instead of popping, and stay in the HTML
 * while closed so search engines still read every answer.
 *
 * Uncontrolled by default (`defaultOpenId`); pass `openId` + `onToggle` to
 * share one open answer across several accordions (the FAQ page's groups).
 */
export default function FaqAccordion({
  items,
  defaultOpenId = null,
  openId,
  onToggle,
  ruleClass = "border-ka-green/[.18]",
}: {
  items: FaqAccordionItem[];
  defaultOpenId?: string | null;
  openId?: string | null;
  onToggle?: (id: string) => void;
  ruleClass?: string;
}) {
  const baseId = useId();
  const [ownOpen, setOwnOpen] = useState<string | null>(defaultOpenId);
  const current = openId !== undefined ? openId : ownOpen;
  const toggle = (id: string) => (onToggle ? onToggle(id) : setOwnOpen((prev) => (prev === id ? null : id)));

  return (
    <div className="flex flex-col">
      {items.map((f) => {
        const isOpen = current === f.id;
        const panelId = `${baseId}-${f.id}`;
        return (
          <div key={f.id} className={`border-b ${ruleClass}`}>
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => toggle(f.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-semibold text-ka-green sm:py-[22px] sm:text-[16.5px]"
              >
                {f.question}
                <PlusIcon size={20} strokeWidth={1.5} className={`flex-none transition-transform duration-300 motion-reduce:transition-none ${isOpen ? "rotate-45" : ""}`} />
              </button>
            </h3>
            {/* Animating grid rows 0fr -> 1fr slides to the answer's real height, however long it is. */}
            <div
              id={panelId}
              aria-hidden={!isOpen}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="m-0 whitespace-pre-line pb-5 pr-10 text-[15px] leading-[1.7] text-ka-body">{f.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
