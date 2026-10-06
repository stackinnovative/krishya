"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { dangerPillButton, softPillButton, wizardInputStyle } from "@/modules/admin-shell/style-helpers";
import FormField from "@/modules/admin-shell/components/FormField";
import MultiImageField from "@/modules/admin-shell/components/MultiImageField";
import { MAX_IMAGES_PER_COLOR, sizeFieldErrors } from "./validation";
import { SWATCHES, type WizardColor } from "./wizard.types";

const errorInputStyle = { ...wizardInputStyle, border: "1px solid #f0a99b", background: "#fdf2f0" };

function FieldError({ message }: { message: string }) {
  return (
    <span className="flex items-center gap-1 px-0.5 text-[11px] font-medium" style={{ color: "#d6432f" }}>
      <AlertCircle size={11} strokeWidth={2.4} className="flex-none" />
      {message}
    </span>
  );
}

/**
 * One size row, with its own "was I here for the last failed Next"
 * baseline - kept separate from the colour's own baseline so a row added
 * via "+ Add size" to an already-invalid colour starts clean instead of
 * immediately showing errors it never had a chance to avoid.
 */
function SizeRow({
  color,
  index,
  validationAttempt,
  showDefaultPicker,
  defaultMissing,
  onChangeField,
  onRemove,
  onSetDefault,
}: {
  color: WizardColor;
  index: number;
  validationAttempt: number;
  showDefaultPicker: boolean;
  /** True once a failed "Next" has surfaced that no default is picked yet. */
  defaultMissing: boolean;
  onChangeField: (patch: Partial<WizardColor["sizes"][number]>) => void;
  onRemove: () => void;
  onSetDefault: () => void;
}) {
  const [attemptAtMount] = useState(validationAttempt);
  const showErrors = validationAttempt > attemptAtMount;
  const errors = showErrors ? sizeFieldErrors(color, index) : {};
  const s = color.sizes[index]!;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#ececea] bg-[#f7f7f5] p-3">
      <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-[1fr_1fr_1fr_auto] xs:items-start">
        <div className="flex flex-col gap-1" data-invalid={!!errors.size || undefined}>
          <span className="text-[10.5px] font-semibold text-[#8a8a8e]">Size</span>
          <input
            value={s.size}
            onChange={(e) => onChangeField({ size: e.target.value })}
            placeholder="e.g. 18"
            style={errors.size ? errorInputStyle : wizardInputStyle}
          />
          {errors.size && <FieldError message={errors.size} />}
        </div>
        <div className="flex flex-col gap-1" data-invalid={!!errors.price || undefined}>
          <span className="text-[10.5px] font-semibold text-[#8a8a8e]">Price (₹)</span>
          <input
            type="number"
            value={s.price}
            onChange={(e) => onChangeField({ price: e.target.value })}
            placeholder="0"
            style={errors.price ? errorInputStyle : wizardInputStyle}
          />
          {errors.price && <FieldError message={errors.price} />}
        </div>
        <div className="flex flex-col gap-1" data-invalid={!!errors.stock || undefined}>
          <span className="text-[10.5px] font-semibold text-[#8a8a8e]">Qty</span>
          <input
            type="number"
            value={s.stock}
            onChange={(e) => onChangeField({ stock: e.target.value })}
            placeholder="0"
            style={errors.stock ? errorInputStyle : wizardInputStyle}
          />
          {errors.stock && <FieldError message={errors.stock} />}
        </div>
        <div className="flex flex-col gap-1">
          <span className="invisible text-[10.5px] font-semibold" aria-hidden="true">
            Remove
          </span>
          <button
            title="Remove size"
            onClick={onRemove}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-[#ececea] bg-white text-[#e5533f] hover:border-[#e5533f]"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {showDefaultPicker && (
        <label
          className="flex items-center gap-1.5 px-0.5 text-[11px] font-medium"
          style={{ color: defaultMissing && showErrors ? "#d6432f" : "#8a8a8e" }}
          data-invalid={(defaultMissing && showErrors) || undefined}
        >
          <input type="radio" name="default-variant" checked={!!s.isDefault} onChange={onSetDefault} />
          Default price for this product
        </label>
      )}
    </div>
  );
}

export default function ColorEditor({
  color,
  index,
  canRemove,
  nameError,
  imagesError,
  validationAttempt,
  onChange,
  onRemove,
  showDefaultPicker,
  defaultMissing,
  onSetDefault,
}: {
  color: WizardColor;
  index: number;
  canRemove: boolean;
  /** Shown under the colour-name field once errors should surface for this colour (e.g. after a failed "Next"). */
  nameError?: string;
  imagesError?: string;
  /** Increments each time the parent runs step validation (e.g. "Next" is clicked). Compared against the value captured when this colour first mounted, so a colour added *after* a failed attempt starts clean instead of showing errors immediately - it only reddens once another attempt happens while it exists. */
  validationAttempt: number;
  onChange: (next: WizardColor) => void;
  onRemove: () => void;
  /** True once the product has more than one variant total - below that there's nothing to choose, the sole variant is implicitly default. */
  showDefaultPicker: boolean;
  /** True once a failed "Next" has surfaced that no default is picked yet - reddens each row's "Default price" label, subject to that row's own baseline. */
  defaultMissing: boolean;
  onSetDefault: (sizeIndex: number) => void;
}) {
  const [attemptAtMount] = useState(validationAttempt);
  const showErrors = validationAttempt > attemptAtMount;

  // Stable per-row identity, independent of array position, so React
  // doesn't reuse a removed row's component (and its own error-display
  // baseline) for whichever row shifts into its old index.
  const [sizeKeys, setSizeKeys] = useState<string[]>(() => color.sizes.map(() => crypto.randomUUID()));

  const addSize = () => {
    onChange({ ...color, sizes: [...color.sizes, { size: "", price: color.sizes.at(-1)?.price ?? "", stock: "" }] });
    setSizeKeys((ks) => [...ks, crypto.randomUUID()]);
  };
  const setSize = (i: number, patch: Partial<WizardColor["sizes"][number]>) =>
    onChange({ ...color, sizes: color.sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const removeSize = (i: number) => {
    onChange({ ...color, sizes: color.sizes.filter((_, idx) => idx !== i) });
    setSizeKeys((ks) => ks.filter((_, idx) => idx !== i));
  };

  return (
    <div className="rounded-2xl border border-[#ececea] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-start gap-3">
        <span className="mt-6 h-[34px] w-[34px] flex-none rounded-full" style={{ background: color.hex, boxShadow: "0 0 0 1px #e0e0dc" }} />
        <div className="min-w-[160px] flex-1">
          <FormField
            label={`Colour ${index + 1}`}
            value={color.name}
            onChange={(v) => onChange({ ...color, name: v as string })}
            placeholder="Colour name"
            required
            error={showErrors ? nameError : undefined}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {SWATCHES.map(([name, hex]) => (
            <span
              key={hex}
              title={name}
              onClick={() => onChange({ ...color, hex, name: SWATCHES.some(([n]) => n === color.name) || !color.name ? name : color.name })}
              className="h-[22px] w-[22px] cursor-pointer rounded-full box-border"
              style={{ background: hex, border: color.hex === hex ? "2px solid #141414" : "2px solid #fff", boxShadow: "0 0 0 1px #e0e0dc" }}
            />
          ))}
        </div>
        {canRemove && (
          <button style={{ ...dangerPillButton, marginTop: 22 }} onClick={onRemove}>
            Remove colour
          </button>
        )}
      </div>

      <div className="mb-1.5 text-[11px] font-semibold text-[#8a8a8e]">Images for this colour (up to {MAX_IMAGES_PER_COLOR})</div>
      <div data-invalid={(showErrors && !!imagesError) || undefined}>
        <MultiImageField
          value={color.images}
          onChange={(images) => onChange({ ...color, images })}
          max={MAX_IMAGES_PER_COLOR}
          aspectRatio={1}
          error={showErrors && !!imagesError}
        />
        {showErrors && imagesError && (
          <div className="mt-1.5">
            <FieldError message={imagesError} />
          </div>
        )}
      </div>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {color.sizes.map((_, i) => (
          <SizeRow
            key={sizeKeys[i] ?? i}
            color={color}
            index={i}
            validationAttempt={validationAttempt}
            showDefaultPicker={showDefaultPicker}
            defaultMissing={defaultMissing}
            onChangeField={(patch) => setSize(i, patch)}
            onRemove={() => removeSize(i)}
            onSetDefault={() => onSetDefault(i)}
          />
        ))}
      </div>
      <button onClick={addSize} style={{ ...softPillButton, marginTop: 10 }}>
        + Add size
      </button>
    </div>
  );
}
