"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import FormField from "@/modules/admin-shell/components/FormField";
import { blackPillButton, dangerIconButtonStyle, iconButtonStyle } from "@/modules/admin-shell/style-helpers";
import { getSocialLinkLabel, MAX_SOCIAL_LINKS, SOCIAL_PLATFORM_OPTIONS, SOCIAL_PLATFORMS, type SocialIconName } from "../constants/social-icons";
import type { SocialLink } from "../types/settings.type";

/** Round brand-coloured badge for a platform - used in the picker, the row header and the preview. */
function PlatformBadge({ icon, size = 36 }: { icon: SocialIconName; size?: number }) {
  const { Icon, color } = SOCIAL_PLATFORMS[icon];
  return (
    <span className="flex flex-none items-center justify-center rounded-full text-white" style={{ width: size, height: size, background: color }}>
      <Icon size={Math.round(size * 0.46)} />
    </span>
  );
}

/**
 * Repeatable editor for the store's social media links (platform icon +
 * optional label + URL), in the order they show on the storefront. Same
 * controlled-list shape as PolicySectionsEditor; `errors` maps a row index to
 * its URL validation message from the page's save-time validation.
 */
export default function SocialLinksEditor({
  value,
  onChange,
  errors = {},
}: {
  value: SocialLink[];
  onChange: (next: SocialLink[]) => void;
  errors?: Record<number, string>;
}) {
  const atLimit = value.length >= MAX_SOCIAL_LINKS;
  // Suggest the first platform that isn't already used for a new row.
  const nextIcon = SOCIAL_PLATFORM_OPTIONS.find((p) => !value.some((l) => l.icon === p.name))?.name ?? "website";

  const addLink = () => onChange([...value, { icon: nextIcon, label: "", url: "" }]);
  const updateLink = (i: number, patch: Partial<SocialLink>) => onChange(value.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const removeLink = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const moveLink = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {value.length > 0 && (
        <div className="rounded-2xl border border-dashed border-[#e1e1dd] bg-[#fafaf8] px-4 py-3">
          <div className="mb-2 text-[11.5px] font-semibold text-[#8a8a8e]">Storefront preview</div>
          <div className="flex flex-wrap items-center gap-2">
            {value.map((l, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-[12px] font-semibold text-[#141414] shadow-[0_1px_2px_rgba(0,0,0,.06)]">
                <PlatformBadge icon={l.icon} size={24} />
                {getSocialLinkLabel(l)}
              </span>
            ))}
          </div>
        </div>
      )}

      {value.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#e1e1dd] bg-[#fafaf8] px-4 py-8 text-center">
          <div className="mb-3 flex justify-center gap-1.5">
            {SOCIAL_PLATFORM_OPTIONS.slice(0, 5).map((p) => (
              <PlatformBadge key={p.name} icon={p.name} size={30} />
            ))}
          </div>
          <div className="text-[13px] font-semibold">No social media links yet</div>
          <div className="mt-1 text-xs text-[#8a8a8e]">Add your Instagram, Facebook, YouTube and more - they appear in the storefront footer and contact page.</div>
        </div>
      )}

      <div className="admin-modal-scroll flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 620 }}>
        {value.map((link, i) => {
          const platform = SOCIAL_PLATFORMS[link.icon];
          return (
            <div key={i} className="rounded-2xl border border-[#ececea] bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <PlatformBadge icon={link.icon} />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold">{getSocialLinkLabel(link)}</div>
                    <div className="text-[11px] text-[#8a8a8e]">
                      Link {i + 1} · {platform.title}
                    </div>
                  </div>
                </div>
                <div className="flex flex-none gap-1.5">
                  <button type="button" title="Move up" aria-label="Move up" style={iconButtonStyle} disabled={i === 0} className="disabled:opacity-40" onClick={() => moveLink(i, -1)}>
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    aria-label="Move down"
                    style={iconButtonStyle}
                    disabled={i === value.length - 1}
                    className="disabled:opacity-40"
                    onClick={() => moveLink(i, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button type="button" title="Remove link" aria-label="Remove link" style={dangerIconButtonStyle} onClick={() => removeLink(i)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="mb-1.5 text-[11.5px] font-semibold text-[#8a8a8e]">Platform</div>
                <div className="grid grid-cols-3 gap-1.5 xs:grid-cols-4 om:grid-cols-6" role="radiogroup" aria-label={`Platform for link ${i + 1}`}>
                  {SOCIAL_PLATFORM_OPTIONS.map(({ name, title, Icon, color }) => {
                    const on = link.icon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        title={title}
                        onClick={() => updateLink(i, { icon: name })}
                        className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10.5px] font-semibold transition-colors"
                        style={{
                          background: on ? `${color}14` : "#f7f7f5",
                          border: on ? `1.5px solid ${color}` : "1.5px solid transparent",
                          color: on ? "#141414" : "#6b6b6f",
                        }}
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: on ? color : "#e9e9e6", color: on ? "#fff" : "#555" }}>
                          <Icon size={14} />
                        </span>
                        <span className="w-full truncate text-center">{title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 om:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <FormField label="Label (optional)" value={link.label} onChange={(v) => updateLink(i, { label: v as string })} placeholder={platform.title} maxLength={40} />
                <FormField
                  label="Link"
                  type="url"
                  value={link.url}
                  onChange={(v) => updateLink(i, { url: v as string })}
                  placeholder={platform.placeholder}
                  required
                  error={errors[i]}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" style={{ ...blackPillButton, opacity: atLimit ? 0.5 : 1 }} disabled={atLimit} onClick={addLink}>
          + Add Social Link
        </button>
        <span className="text-[11.5px] text-[#8a8a8e]">
          {value.length}/{MAX_SOCIAL_LINKS} links
        </span>
      </div>
    </div>
  );
}
