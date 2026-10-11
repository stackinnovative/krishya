"use client";

import { useState } from "react";
import FaqAccordion from "./FaqAccordion";
import type { UserFaqGroup } from "@/modules/faq/types/faq.type";

/** The FAQ page's groups, sharing one open answer - opening a question in any group closes the one open elsewhere. */
export default function FaqGroups({ groups }: { groups: UserFaqGroup[] }) {
  const [openId, setOpenId] = useState<string | null>(groups[0]?.faqs[0]?.id ?? null);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col gap-[clamp(36px,4vw,56px)]">
      {groups.map((g) => (
        <div key={g.id} className="flex flex-col">
          <h2 className="m-0 mb-2 break-words font-display text-[clamp(26px,2.6vw,32px)] font-semibold text-ka-green">{g.name}</h2>
          <div className="border-t border-ka-gold/55">
            <FaqAccordion items={g.faqs} openId={openId} onToggle={toggle} ruleClass="border-ka-green/15" />
          </div>
        </div>
      ))}
    </div>
  );
}
