"use client";

import { ArrowDown, ArrowUp, Heading2, Image as ImageIcon, List, Pilcrow, Quote, ShoppingBag, Trash2, X } from "lucide-react";
import FormField from "@/modules/admin-shell/components/FormField";
import SearchableSelect, { type SearchableSelectOption } from "@/modules/admin-shell/components/SearchableSelect";
import type { ImageFieldValue } from "@/modules/admin-shell/components/ImageDropzone";
import { dangerIconButtonStyle, iconButtonStyle } from "@/modules/admin-shell/style-helpers";
import { BLOG_INLINE_RATIO, BLOG_LIMITS as L } from "../constants";
import type { DraftBlock } from "../blog-form";
import type { BlogBlockType } from "../types/blog.type";

export const BLOCK_META: Record<BlogBlockType, { label: string; icon: typeof Pilcrow; hint: string }> = {
  paragraph: { label: "Paragraph", icon: Pilcrow, hint: "Body text." },
  heading: { label: "Heading", icon: Heading2, hint: "Starts a new section." },
  list: { label: "List", icon: List, hint: "Bullet points." },
  quote: { label: "Quote", icon: Quote, hint: "A highlighted line in gold." },
  image: { label: "Photo", icon: ImageIcon, hint: "A photo with an optional caption." },
  products: { label: "Products", icon: ShoppingBag, hint: '"From our range" box with an Add button.' },
};

const ERROR_TEXT = "text-[11px] font-medium text-[#d6432f]";

/**
 * One block of the article body in the admin editor: its own fields plus
 * move up / move down / remove. Errors use the block's dotted path
 * ("blocks.3.text"), the same keys the backend returns.
 */
export default function BlockEditor({
  block,
  index,
  count,
  errors,
  productOptions,
  productNames,
  onChange,
  onMove,
  onRemove,
}: {
  block: DraftBlock;
  index: number;
  count: number;
  errors: Record<string, string>;
  productOptions: SearchableSelectOption[];
  /** Names for picked products that aren't in `productOptions` (e.g. hidden since). */
  productNames: Record<string, string>;
  onChange: (block: DraftBlock) => void;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
}) {
  const meta = BLOCK_META[block.type];
  const Icon = meta.icon;
  const at = `blocks.${index}`;

  return (
    <div className="rounded-2xl border border-[#ececea] bg-white p-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#8a8a8e]">
          <Icon size={13} /> {meta.label}
        </span>
        <div className="flex gap-1.5">
          <button type="button" aria-label={`Move ${meta.label.toLowerCase()} up`} title="Move up" style={iconButtonStyle} disabled={index === 0} className="disabled:opacity-40" onClick={() => onMove(-1)}>
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            aria-label={`Move ${meta.label.toLowerCase()} down`}
            title="Move down"
            style={iconButtonStyle}
            disabled={index === count - 1}
            className="disabled:opacity-40"
            onClick={() => onMove(1)}
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            aria-label={`Remove ${meta.label.toLowerCase()}`}
            title={count === 1 ? "The article needs at least one block" : "Remove"}
            style={dangerIconButtonStyle}
            disabled={count === 1}
            className="disabled:opacity-40"
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {(block.type === "paragraph" || block.type === "heading" || block.type === "quote") && (
        <FormField
          label={`${meta.label} text`}
          type={block.type === "heading" ? "text" : "area"}
          rows={block.type === "paragraph" ? 5 : 2}
          value={block.text}
          onChange={(v) => onChange({ ...block, text: v as string })}
          placeholder={
            block.type === "heading"
              ? "e.g. What the tradition suggests"
              : block.type === "quote"
                ? "e.g. Small, steady habits are the heart of Ayurvedic living."
                : "Write this part of the article…"
          }
          maxLength={block.type === "paragraph" ? L.paragraph : block.type === "heading" ? L.heading : L.quote}
          error={errors[`${at}.text`]}
        />
      )}

      {block.type === "list" && (
        <div className="flex flex-col gap-2" data-invalid={errors[`${at}.items`] ? "true" : undefined}>
          {block.items.map((item, j) => (
            <div key={j} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-[17px] h-1.5 w-1.5 flex-none rounded-full bg-[#141414]" />
              <div className="min-w-0 flex-1">
                <FormField
                  label={`Item ${j + 1}`}
                  value={item}
                  onChange={(v) => onChange({ ...block, items: block.items.map((x, k) => (k === j ? (v as string) : x)) })}
                  placeholder="e.g. Begin the day with warm water"
                  maxLength={L.listItem}
                  error={errors[`${at}.items.${j}`]}
                />
              </div>
              <button
                type="button"
                aria-label={`Remove item ${j + 1}`}
                title="Remove item"
                style={{ ...iconButtonStyle, marginTop: 22 }}
                disabled={block.items.length === 1}
                className="disabled:opacity-40"
                onClick={() => onChange({ ...block, items: block.items.filter((_, k) => k !== j) })}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {errors[`${at}.items`] && <span className={ERROR_TEXT}>{errors[`${at}.items`]}</span>}
          <button
            type="button"
            className="self-start text-[12px] font-semibold text-[#141414] underline-offset-2 hover:underline disabled:opacity-40"
            disabled={block.items.length >= L.listItemsMax}
            onClick={() => onChange({ ...block, items: [...block.items, ""] })}
          >
            + Add item
          </button>
        </div>
      )}

      {block.type === "image" && (
        <div className="flex flex-col gap-3">
          <FormField
            label="Photo"
            type="image"
            value={block.image}
            onChange={(v) => onChange({ ...block, image: v as ImageFieldValue | null })}
            imageAspectRatio={BLOG_INLINE_RATIO}
            imageMaxHeight={180}
            required
            error={errors[`${at}.image`]}
            hint="Landscape (3:2)."
          />
          <FormField
            label="Caption"
            value={block.caption}
            onChange={(v) => onChange({ ...block, caption: v as string })}
            placeholder="Optional. e.g. Herbs drying in the courtyard"
            maxLength={L.caption}
            error={errors[`${at}.caption`]}
          />
        </div>
      )}

      {block.type === "products" && (
        <div className="flex flex-col gap-2" data-invalid={errors[`${at}.productIds`] ? "true" : undefined}>
          {block.productIds.map((id) => (
            <div key={id} className="flex items-center justify-between gap-2 rounded-xl bg-[#fafaf8] px-3 py-2">
              <span className="min-w-0 truncate text-[12.5px] font-semibold">
                {productOptions.find((o) => o.value === id)?.label ?? productNames[id] ?? "Product no longer available"}
              </span>
              <button
                type="button"
                aria-label="Remove product"
                title="Remove"
                style={iconButtonStyle}
                onClick={() => onChange({ ...block, productIds: block.productIds.filter((x) => x !== id) })}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {block.productIds.length < L.productsPerBlockMax && (
            <SearchableSelect
              options={productOptions.filter((o) => !block.productIds.includes(o.value))}
              value=""
              onChange={(id) => id && onChange({ ...block, productIds: [...block.productIds, id] })}
              placeholder={block.productIds.length ? "Add another product" : "Pick a product"}
              searchPlaceholder="Search products…"
              error={!!errors[`${at}.productIds`]}
            />
          )}
          {errors[`${at}.productIds`] ? (
            <span className={ERROR_TEXT}>{errors[`${at}.productIds`]}</span>
          ) : (
            <span className="text-[11px] text-[#8a8a8e]">Up to {L.productsPerBlockMax}. Hidden products are left out on the store automatically.</span>
          )}
        </div>
      )}
    </div>
  );
}
