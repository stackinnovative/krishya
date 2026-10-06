"use client";

import { useEffect, useState } from "react";
import { X, Plus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { whitePillButton } from "@/modules/admin-shell/style-helpers";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";
import AdminButton from "@/modules/admin-shell/components/AdminButton";
import FormField from "@/modules/admin-shell/components/FormField";
import { isPendingImage } from "@/modules/admin-shell/components/ImageDropzone";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useAdminCategories } from "@/modules/categories/hooks/useCategories";
import { useAdminProductDetails, useSaveProductWizard } from "../../hooks/useAdminProducts";
import { newColor, type ResolvedWizardColor, type WizardColor, type WizardDetails } from "./wizard.types";
import { resolveDefaultVariant, totalVariantCount, validateColors, validateDetails } from "./validation";
import ColorEditor from "./ColorEditor";
import { scrollToFirstError } from "@/shared/scrollToFirstError";

const STEPS = ["Details", "Colours, images & sizes", "Review"];

export default function ProductWizard({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  // The wizard's Category picker needs every category, not a paginated page of them.
  const { data: categoriesRes } = useAdminCategories({ search: "", limit: 100 });
  const { data: productRes, isLoading: loadingProduct } = useAdminProductDetails(productId);
  const { mutateAsync: save, isPending } = useSaveProductWizard();

  const categories = (categoriesRes?.data ?? []).filter((c) => c.isActive);

  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<WizardDetails>({
    name: "",
    description: "",
    categoryId: "",
    isFeatured: false,
  });
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({});
  const [colors, setColors] = useState<WizardColor[]>([newColor(0)]);
  // Stable per-colour identity, independent of array position, so React
  // doesn't reuse a removed colour's component (and its error-display state)
  // for whichever colour shifts into its old index.
  const [colorKeys, setColorKeys] = useState<string[]>([crypto.randomUUID()]);
  /** Increments each time step-1 ("Colours, images & sizes") validation runs (e.g. "Next" clicked). Colour cards use it to know whether *they* were already on screen for the last failed attempt, rather than a single flag that would also flag a colour added afterward. */
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [hydrated, setHydrated] = useState(!productId);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "uploading" | "saving">("idle");
  const isSubmitting = submitPhase !== "idle" || isPending;

  useEffect(() => {
    if (!productId || !productRes?.data || hydrated) return;
    const p = productRes.data;
    setDetails({
      name: p.name,
      description: p.description,
      categoryId: p.category.id,
      isFeatured: p.isFeatured,
    });
    const hydratedColors = p.colorOptions.length
      ? p.colorOptions.map((c) => ({
          id: c.id,
          name: c.colorName || "Colour",
          hex: c.hex || newColor(0).hex,
          images: c.images,
          sizes: p.variants
            .filter((v) => v.colorOptionId === c.id)
            .map((v) => ({ id: v.id, size: v.size, price: String(v.price), stock: String(v.stock), isDefault: v.isDefault })),
        }))
      : [newColor(0)];
    setColors(hydratedColors);
    setColorKeys(hydratedColors.map((c) => c.id ?? crypto.randomUUID()));
    setHydrated(true);
  }, [productId, productRes, hydrated]);

  useEffect(() => {
    if (!categories.length || details.categoryId) return;
    setDetails((d) => ({ ...d, categoryId: categories[0]!.id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  const validateStepIndex = (s: number): true | string => {
    if (s === 0) {
      const errs = validateDetails(details);
      if (Object.keys(errs).length) {
        setDetailsErrors(errs);
        scrollToFirstError();
        return "Please fill all required fields.";
      }
      setDetailsErrors({});
      return true;
    }
    if (s === 1) {
      setValidationAttempt((n) => n + 1);
      const issue = validateColors(colors);
      if (issue) scrollToFirstError();
      return issue ? "Please fix the highlighted fields below." : true;
    }
    return true;
  };

  const goStep = (n: number) => {
    if (n > step) {
      for (let i = step; i < n; i++) {
        const v = validateStepIndex(i);
        if (v !== true) return toast.error(v);
      }
    }
    setStep(n);
  };

  /** Uploads every still-pending (cropped-but-not-uploaded) image across all colours right before saving - nothing hits Cloudinary until the product is actually submitted. */
  const resolveColors = async (): Promise<ResolvedWizardColor[]> =>
    Promise.all(
      colors.map(async (c) => ({
        ...c,
        images: await Promise.all(
          c.images.map(async (img) => {
            if (!isPendingImage(img)) return img;
            const file = new File([img.blob], "upload.jpg", { type: img.blob.type || "image/jpeg" });
            return uploadToCloudinary(file);
          }),
        ),
      })),
    );

  const handleFinish = async () => {
    if (submitPhase !== "idle") return;
    const v0 = validateStepIndex(0);
    const v1 = validateStepIndex(1);
    if (v0 !== true) return toast.error(v0);
    if (v1 !== true) return toast.error(v1);

    setSubmitPhase("uploading");
    let resolvedColors: ResolvedWizardColor[];
    try {
      resolvedColors = await resolveColors();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed. Please try again.");
      setSubmitPhase("idle");
      return;
    }

    setSubmitPhase("saving");
    try {
      await save({
        productId,
        details: {
          name: details.name.trim(),
          description: details.description.trim(),
          categoryId: details.categoryId,
          isFeatured: details.isFeatured,
        },
        colors: resolvedColors,
      });
    } finally {
      setSubmitPhase("idle");
    }
    onClose();
  };

  const colorNameError = (color: WizardColor, index: number): string | undefined => {
    if (!color.name.trim()) return "Colour name is required.";
    const key = color.name.trim().toLowerCase();
    const duplicate = colors.some((other, i) => i !== index && other.name.trim().toLowerCase() === key);
    return duplicate ? "Duplicate colour name." : undefined;
  };

  const colorImagesError = (color: WizardColor): string | undefined => {
    if (color.images.length === 0) return "Add at least one photo.";
    if (color.images.length > 3) return "At most 3 photos per colour.";
    return undefined;
  };

  const setDefaultVariant = (colorIndex: number, sizeIndex: number) =>
    setColors((cs) =>
      cs.map((c, ci) => ({
        ...c,
        sizes: c.sizes.map((s, si) => ({ ...s, isDefault: ci === colorIndex && si === sizeIndex })),
      })),
    );

  const allSizes = colors.flatMap((c) => c.sizes.map((s) => ({ ...s, color: c.name, hex: c.hex })));
  const totalStock = allSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
  const defaultVariant = resolveDefaultVariant(colors);
  const defaultPrice = defaultVariant ? Number(defaultVariant.price) || 0 : 0;
  const defaultMissing = validationAttempt > 0 && !defaultVariant && totalVariantCount(colors) > 1;

  const { onBackdropClick, onPanelClick } = useModalShell({ onRequestClose: onClose, busy: isSubmitting });

  if (productId && loadingProduct && !hydrated) {
    return (
      <ModalPortal>
        <div onClick={onBackdropClick} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3">
          <div onClick={onPanelClick} className="rounded-[22px] bg-white px-8 py-10 text-sm text-[#8a8a8e]">Loading product…</div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal>
    <div onClick={onBackdropClick} className="fixed inset-0 z-[100] flex items-center justify-center p-3" style={{ background: "rgba(20,20,20,.45)", backdropFilter: "blur(2px)" }}>
      <div
        onClick={onPanelClick}
        className="animate-fade-up flex w-full flex-col overflow-hidden box-border"
        style={{ background: "#fff", borderRadius: 22, maxWidth: 680, maxHeight: "92vh" }}
      >
        <div className="px-6 pt-[22px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[18px] font-bold tracking-[-.01em]">{productId ? "Edit Product" : "Create Product"}</div>
              <div className="mt-[3px] text-xs text-[#8a8a8e]">
                Step {step + 1} of {STEPS.length} · {STEPS[step]}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
              style={{ background: "#f3f3f1", opacity: isSubmitting ? 0.5 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              <X size={14} color="#141414" strokeWidth={2.2} />
            </button>
          </div>
          <div className="mt-[18px] flex items-center gap-2 overflow-x-auto pb-1.5">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  onClick={() => !isSubmitting && goStep(i)}
                  className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full text-[11.5px] font-bold"
                  style={{
                    background: i <= step ? "#141414" : "#eeeeec",
                    color: i <= step ? "#fff" : "#8a8a8e",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="hidden whitespace-nowrap text-xs font-semibold xs:inline"
                  style={{ color: i === step ? "#141414" : "#8a8a8e" }}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && <div className="h-0.5 min-w-[12px] flex-1" style={{ background: i < step ? "#141414" : "#eeeeec" }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto border-y border-[#f0f0ee] bg-[#fafaf8] px-6 py-[18px]">
          {step === 0 && (
            <div className="flex flex-col gap-3">
              <FormField
                label="Product name"
                value={details.name}
                onChange={(v) => setDetails((d) => ({ ...d, name: v as string }))}
                placeholder="e.g. Gold plated Elakkathali"
                required
                maxLength={150}
                error={detailsErrors.name}
              />
              <FormField
                label="Description"
                type="area"
                rows={5}
                value={details.description}
                onChange={(v) => setDetails((d) => ({ ...d, description: v as string }))}
                placeholder="Design, material, finish, fit…"
                required
                maxLength={1000}
                error={detailsErrors.description}
              />
              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                <FormField
                  label="Category"
                  type="searchable-select"
                  value={details.categoryId}
                  onChange={(v) => setDetails((d) => ({ ...d, categoryId: v as string }))}
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                  placeholder="Search categories…"
                  required
                  error={detailsErrors.categoryId}
                />
                <FormField
                  label="Featured"
                  type="select"
                  value={details.isFeatured ? "Yes" : "No"}
                  onChange={(v) => setDetails((d) => ({ ...d, isFeatured: v === "Yes" }))}
                  options={["No", "Yes"]}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-3">
              {defaultMissing && (
                <div
                  className="flex items-center gap-1.5 rounded-[14px] px-3.5 py-2.5 text-[12.5px] font-semibold"
                  style={{ background: "#fdf2f0", color: "#d6432f" }}
                >
                  <AlertCircle size={14} strokeWidth={2.4} />
                  Please select at least one variant as the default price for this product.
                </div>
              )}
              {colors.map((color, ci) => (
                <ColorEditor
                  key={colorKeys[ci] ?? ci}
                  color={color}
                  index={ci}
                  canRemove={colors.length > 1}
                  validationAttempt={validationAttempt}
                  nameError={colorNameError(color, ci)}
                  imagesError={colorImagesError(color)}
                  onChange={(next) => setColors((cs) => cs.map((c, i) => (i === ci ? next : c)))}
                  onRemove={() => {
                    setColors((cs) => cs.filter((_, i) => i !== ci));
                    setColorKeys((ks) => ks.filter((_, i) => i !== ci));
                  }}
                  showDefaultPicker={totalVariantCount(colors) > 1}
                  defaultMissing={defaultMissing}
                  onSetDefault={(si) => setDefaultVariant(ci, si)}
                />
              ))}
              <button
                onClick={() => {
                  setColors((cs) => [...cs, newColor(cs.length)]);
                  setColorKeys((ks) => [...ks, crypto.randomUUID()]);
                }}
                className="flex items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#d9d9d5] bg-white py-3.5 text-[12.5px] font-semibold text-[#141414] hover:border-[#141414]"
              >
                <Plus size={14} /> Add another colour
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3.5">
              <div className="rounded-2xl border border-[#ececea] bg-white p-4">
                <div className="text-[16px] font-bold">{details.name || "Untitled product"}</div>
                <div className="mt-0.5 text-xs text-[#8a8a8e]">
                  {categories.find((c) => c.id === details.categoryId)?.name} · Featured: {details.isFeatured ? "Yes" : "No"}
                </div>
                <div className="mt-2.5 text-[12.5px] leading-[1.55] text-[#444]">{details.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-4">
                {[
                  ["Colours", colors.length],
                  ["Images", colors.reduce((s, c) => s + c.images.length, 0)],
                  ["Sizes · stock", `${allSizes.length} · ${totalStock}`],
                  ["Default price", defaultVariant ? `₹${defaultPrice.toLocaleString("en-IN")}` : "—"],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-[14px] border border-[#ececea] bg-white px-3.5 py-3">
                    <div className="text-[11px] text-[#8a8a8e]">{label}</div>
                    <div className="text-[18px] font-bold">{value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-[#ececea] bg-white px-4">
                {allSizes.map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#f3f3f1] py-2.5 text-[12.5px] last:border-b-0"
                  >
                    <span className="h-3 w-3 flex-none rounded-full" style={{ background: s.hex, boxShadow: "0 0 0 1px #e0e0dc" }} />
                    <span className="min-w-[90px] font-semibold">{s.color}</span>
                    <span className="min-w-[60px]">Size {s.size}</span>
                    <span className="min-w-[70px]">₹{(Number(s.price) || 0).toLocaleString("en-IN")}</span>
                    <span className="flex-1 text-[#8a8a8e]">Stock {s.stock || 0}</span>
                    {(allSizes.length === 1 || s.isDefault) && (
                      // basis-full forces this onto its own line, right-aligned, only below the
                      // `xs` breakpoint - at xs+ it drops back into the single-line flow with everything else.
                      <div className="flex w-full basis-full justify-end xs:w-auto xs:basis-auto xs:justify-start">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                          style={{ background: "#eef6ec", color: "#2e9e4b" }}
                        >
                          Default
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4">
          {step > 0 ? (
            <button
              style={{ ...whitePillButton, padding: "11px 18px", opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
              disabled={isSubmitting}
              onClick={() => setStep(step - 1)}
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
          <div className="flex-1" />
          <AdminButton
            loading={isSubmitting && step === STEPS.length - 1}
            loadingText={submitPhase === "uploading" ? "Uploading images…" : "Saving…"}
            onClick={step === STEPS.length - 1 ? handleFinish : () => goStep(step + 1)}
          >
            {step === STEPS.length - 1 ? (productId ? "Save product" : "Create product") : "Next →"}
          </AdminButton>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
