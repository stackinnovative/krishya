"use client";

import { useState } from "react";
import { AlertCircle, Trash2 } from "lucide-react";
import { softPillButton, wizardInputStyle } from "@/modules/admin-shell/style-helpers";
import SearchableSelect from "@/modules/admin-shell/components/SearchableSelect";
import Toggle from "@/modules/admin-shell/components/Toggle";
import { PRODUCT_LIMITS, VARIANT_UNITS, type VariantUnit } from "../../constants/product-options";
import { previewDiscountPercent, variantFieldErrors } from "./validation";
import { newVariant, type WizardVariant } from "./wizard.types";

const errorInputStyle = { ...wizardInputStyle, border: "1px solid #f0a99b", background: "#fdf2f0" };
const UNIT_OPTIONS = VARIANT_UNITS.map((u) => ({ label: u, value: u }));

export function FieldError({ message }: { message: string }) {
  return (
    <span className="flex items-center gap-1 px-0.5 text-[11px] font-medium" style={{ color: "#d6432f" }}>
      <AlertCircle size={11} strokeWidth={2.4} className="flex-none" />
      {message}
    </span>
  );
}

function NumberInput({
  label,
  value,
  error,
  placeholder = "0",
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1" data-invalid={!!error || undefined}>
      <span className="text-[10.5px] font-semibold text-[#8a8a8e]">{label}</span>
      <input type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={error ? errorInputStyle : wizardInputStyle} />
      {error && <FieldError message={error} />}
    </div>
  );
}

/**
 * One quantity row, with its own "was I here for the last failed Next"
 * baseline - so a row added after a failed attempt starts clean instead of
 * immediately showing errors it never had a chance to avoid.
 */
function VariantRow({
  variants,
  index,
  validationAttempt,
  showDefaultPicker,
  defaultMissing,
  onChange,
  onRemove,
  onSetDefault,
}: {
  variants: WizardVariant[];
  index: number;
  validationAttempt: number;
  showDefaultPicker: boolean;
  defaultMissing: boolean;
  onChange: (patch: Partial<WizardVariant>) => void;
  onRemove: () => void;
  onSetDefault: () => void;
}) {
  const [attemptAtMount] = useState(validationAttempt);
  const showErrors = validationAttempt > attemptAtMount;
  const errors = showErrors ? variantFieldErrors(variants, index) : {};
  const v = variants[index]!;
  const discount = previewDiscountPercent(Number(v.mrp), Number(v.price));

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#ececea] bg-[#f7f7f5] p-3">
      <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] xs:items-start">
        <NumberInput label="Quantity" value={v.quantity} placeholder="200" error={errors.quantity} onChange={(quantity) => onChange({ quantity })} />
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-semibold text-[#8a8a8e]">Unit</span>
          <SearchableSelect options={UNIT_OPTIONS} value={v.unit} onChange={(unit) => onChange({ unit: unit as VariantUnit })} searchable={false} />
        </div>
        <NumberInput label="MRP (₹)" value={v.mrp} error={errors.mrp} onChange={(mrp) => onChange({ mrp })} />
        <NumberInput label="Price (₹)" value={v.price} error={errors.price} onChange={(price) => onChange({ price })} />
        <NumberInput label="Stock" value={v.stock} error={errors.stock} onChange={(stock) => onChange({ stock })} />
        <div className="flex flex-col gap-1">
          <span className="invisible text-[10.5px] font-semibold" aria-hidden="true">
            Remove
          </span>
          {/* Saved quantities can't be deleted (past orders point at them) - they're switched off instead. */}
          {v.id ? (
            <div className="flex h-9 items-center gap-2 text-[11px] font-medium text-[#555]" title="Show this quantity on the storefront">
              <Toggle on={v.isActive} onClick={() => onChange({ isActive: !v.isActive })} />
              On sale
            </div>
          ) : (
            <button
              title="Remove quantity"
              onClick={onRemove}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-[#ececea] bg-white text-[#e5533f] hover:border-[#e5533f]"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-[11px] font-medium">
        {showDefaultPicker ? (
          <label
            className="flex items-center gap-1.5"
            style={{ color: defaultMissing && showErrors ? "#d6432f" : "#8a8a8e" }}
            data-invalid={(defaultMissing && showErrors) || undefined}
          >
            <input type="radio" name="default-variant" checked={v.isDefault} onChange={onSetDefault} />
            Default quantity for this product
          </label>
        ) : (
          <span />
        )}
        {discount > 0 && <span style={{ color: "#2e9e4b" }}>{discount}% off will show on the storefront</span>}
      </div>
    </div>
  );
}

export default function VariantEditor({
  variants,
  validationAttempt,
  defaultMissing,
  onChange,
}: {
  variants: WizardVariant[];
  /** Increments each time the parent runs step validation (e.g. "Next" is clicked). */
  validationAttempt: number;
  /** True once a failed "Next" has surfaced that no default is picked yet. */
  defaultMissing: boolean;
  onChange: (next: WizardVariant[]) => void;
}) {
  // Stable per-row identity, independent of array position, so React
  // doesn't reuse a removed row's component (and its error baseline).
  const [rowKeys, setRowKeys] = useState<string[]>(() => variants.map(() => crypto.randomUUID()));

  const add = () => {
    onChange([...variants, newVariant(variants.at(-1))]);
    setRowKeys((ks) => [...ks, crypto.randomUUID()]);
  };
  const update = (i: number, patch: Partial<WizardVariant>) => onChange(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const remove = (i: number) => {
    onChange(variants.filter((_, idx) => idx !== i));
    setRowKeys((ks) => ks.filter((_, idx) => idx !== i));
  };
  const setDefault = (i: number) => onChange(variants.map((v, idx) => ({ ...v, isDefault: idx === i })));

  return (
    <div className="flex flex-col gap-2.5">
      {variants.map((_, i) => (
        <VariantRow
          key={rowKeys[i] ?? i}
          variants={variants}
          index={i}
          validationAttempt={validationAttempt}
          showDefaultPicker={variants.length > 1}
          defaultMissing={defaultMissing}
          onChange={(patch) => update(i, patch)}
          onRemove={() => remove(i)}
          onSetDefault={() => setDefault(i)}
        />
      ))}
      {variants.length < PRODUCT_LIMITS.variantsMax && (
        <button onClick={add} style={{ ...softPillButton, alignSelf: "flex-start" }}>
          + Add quantity
        </button>
      )}
    </div>
  );
}
