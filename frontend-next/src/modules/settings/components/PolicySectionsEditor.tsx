"use client";

import FormField from "@/modules/admin-shell/components/FormField";
import { blackPillButton, dangerPillButton } from "@/modules/admin-shell/style-helpers";
import { POLICY_ICON_OPTIONS } from "../constants/policy-icons";
import type { PolicySection } from "../types/settings.type";

/**
 * Repeatable list editor for a policy's sections (heading + icon +
 * description) - used for both the storefront refund/return policy and the
 * privacy policy. Every field here is fully controlled from `value`, so -
 * unlike ColorEditor's per-row UUID keys - a plain index key is safe: there's
 * no per-row local state that could get reused across a remove/reorder.
 *
 * A section's `description` supports a lightweight bullet-list convention:
 * lines starting with "- " render as a bullet list on the storefront (see
 * PolicyBody) instead of flowing as plain prose.
 */
export default function PolicySectionsEditor({
  value,
  onChange,
}: {
  value: PolicySection[];
  onChange: (next: PolicySection[]) => void;
}) {
  const addSection = () => {
    onChange([...value, { heading: "", icon: "Package", description: "" }]);
  };

  const updateSection = (i: number, patch: Partial<PolicySection>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const removeSection = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      {/* Capped + independently scrollable, so a long section list scrolls in
       * place instead of stretching the whole page (which would otherwise
       * scroll the shorter left column out of view). */}
      <div className="admin-modal-scroll flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 520 }}>
        {value.map((section, i) => (
          <div key={i} className="rounded-2xl border border-[#ececea] bg-white p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-[160px] flex-1">
                <FormField
                  label={`Section ${i + 1} heading`}
                  value={section.heading}
                  onChange={(v) => updateSection(i, { heading: v as string })}
                  placeholder="e.g. Report Within 48 Hours"
                  required
                />
              </div>
              <button style={{ ...dangerPillButton, marginTop: 22 }} onClick={() => removeSection(i)}>
                Remove section
              </button>
            </div>

            <div className="mb-3">
              <div className="mb-1.5 text-[11.5px] font-semibold text-[#8a8a8e]">Icon</div>
              <div className="flex flex-wrap gap-1.5">
                {POLICY_ICON_OPTIONS.map(({ name, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => updateSection(i, { icon: name })}
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full box-border"
                    style={{
                      background: section.icon === name ? "#141414" : "#f3f3f1",
                      color: section.icon === name ? "#fff" : "#555",
                      border: section.icon === name ? "2px solid #141414" : "2px solid transparent",
                    }}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            <FormField
              label="Description"
              type="area"
              value={section.description}
              onChange={(v) => updateSection(i, { description: v as string })}
              placeholder={"What this section tells the customer.\nStart a line with \"- \" to render it as a bullet point."}
              required
            />
          </div>
        ))}
      </div>

      <button style={blackPillButton} className="self-start" onClick={addSection}>
        + Add Section
      </button>
    </div>
  );
}
