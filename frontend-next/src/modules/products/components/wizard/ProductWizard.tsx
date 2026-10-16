"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { softPillButton, whitePillButton, wizardInputStyle } from "@/modules/admin-shell/style-helpers";
import { ModalPortal } from "@/shared/ui/modal/ModalPortal";
import { useModalShell } from "@/shared/ui/modal/useModalShell";
import AdminButton from "@/modules/admin-shell/components/AdminButton";
import FormField from "@/modules/admin-shell/components/FormField";
import MultiImageField from "@/modules/admin-shell/components/MultiImageField";
import { isPendingImage } from "@/modules/admin-shell/components/ImageDropzone";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/format";
import { useAdminCategories } from "@/modules/categories/hooks/useCategories";
import { useAdminProductDetails, useSaveProductWizard, type WizardVariantPayload } from "../../hooks/useAdminProducts";
import type { AdminProductImage } from "../../types/product.type";
import { PRODUCT_LIMITS as L, PRODUCT_TYPE_LABELS, PRODUCT_TYPE_OPTIONS, formatVariantLabel, type ProductType } from "../../constants/product-options";
import { newIngredient, newVariant, type WizardDetails, type WizardImages, type WizardTabs, type WizardVariant } from "./wizard.types";
import { ingredientError, previewDiscountPercent, resolveDefaultVariant, validateDetails, validateImagesAndVariants, validateTabs } from "./validation";
import VariantEditor, { FieldError } from "./VariantEditor";
import { scrollToFirstError } from "@/shared/scrollToFirstError";

const STEPS = ["Details", "Product page", "Photos & quantities", "Review"];

const toWizardVariant = (v: { variantId: string; quantity: number; unit: WizardVariant["unit"]; mrp: number; price: number; stock: number; isActive: boolean; isDefault: boolean }): WizardVariant => ({
  id: v.variantId,
  quantity: String(v.quantity),
  unit: v.unit,
  mrp: String(v.mrp),
  price: String(v.price),
  stock: String(v.stock),
  isActive: v.isActive,
  isDefault: v.isDefault,
});

export default function ProductWizard({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  // The wizard's Category picker needs every category, not a paginated page of them.
  const { data: categoriesRes } = useAdminCategories({ search: "", limit: 100 });
  const { data: productRes, isLoading: loadingProduct } = useAdminProductDetails(productId);
  const { mutateAsync: save, isPending } = useSaveProductWizard();

  const categories = (categoriesRes?.data ?? []).filter((c) => c.isActive);

  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<WizardDetails>({
    name: "",
    categoryId: "",
    type: "",
    shortDescription: "",
    description: "",
    badge: "",
    isFeatured: false,
  });
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({});
  const [tabs, setTabs] = useState<WizardTabs>({ ingredients: [], howToUse: "", storage: "" });
  const [images, setImages] = useState<WizardImages>([]);
  const [variants, setVariants] = useState<WizardVariant[]>([newVariant()]);
  /** Increments each time a step's validation runs (e.g. "Next" clicked). Rows use it to know whether *they* were on screen for the last failed attempt. */
  const [validationAttempt, setValidationAttempt] = useState(0);
  /** True once "Next" was tried on the photos & quantities step - its step-wide messages wait for that. */
  const [mediaAttempted, setMediaAttempted] = useState(false);
  const [hydrated, setHydrated] = useState(!productId);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "uploading" | "saving">("idle");
  const isSubmitting = submitPhase !== "idle" || isPending;

  useEffect(() => {
    if (!productId || !productRes?.data || hydrated) return;
    const p = productRes.data;
    setDetails({
      name: p.name,
      categoryId: p.category.id,
      type: p.type,
      shortDescription: p.shortDescription,
      description: p.description,
      badge: p.badge,
      isFeatured: p.isFeatured,
    });
    setTabs({
      ingredients: p.ingredients.map((i) => ({ name: i.name, botanicalName: i.botanicalName ?? "" })),
      howToUse: p.howToUse,
      storage: p.storage,
    });
    setImages(p.images);
    setVariants(p.variants.length ? p.variants.map(toWizardVariant) : [newVariant()]);
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
    if (s === 1 || s === 2) {
      setValidationAttempt((n) => n + 1);
      if (s === 2) setMediaAttempted(true);
      const issue = s === 1 ? validateTabs(tabs) : validateImagesAndVariants(images, variants);
      if (issue) scrollToFirstError();
      return issue ?? true;
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

  /** Uploads every still-pending (cropped-but-not-uploaded) photo right before saving - nothing hits Cloudinary until the product is actually submitted. */
  const resolveImages = (): Promise<AdminProductImage[]> =>
    Promise.all(
      images.map(async (img) => {
        if (!isPendingImage(img)) return img;
        const file = new File([img.blob], "upload.jpg", { type: img.blob.type || "image/jpeg" });
        return uploadToCloudinary(file);
      }),
    );

  const handleFinish = async () => {
    if (submitPhase !== "idle") return;
    for (let i = 0; i < 3; i++) {
      const v = validateStepIndex(i);
      if (v !== true) {
        setStep(i);
        return toast.error(v);
      }
    }

    setSubmitPhase("uploading");
    let resolvedImages: AdminProductImage[];
    try {
      resolvedImages = await resolveImages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed. Please try again.");
      setSubmitPhase("idle");
      return;
    }

    const defaultRow = resolveDefaultVariant(variants);
    const payloadVariants: WizardVariantPayload[] = variants.map((v) => ({
      ...(v.id ? { id: v.id } : {}),
      quantity: Number(v.quantity),
      unit: v.unit,
      mrp: Number(v.mrp),
      price: Number(v.price),
      stock: Number(v.stock),
      isActive: v.isActive,
      isDefault: v === defaultRow,
    }));

    setSubmitPhase("saving");
    try {
      await save({
        productId,
        details: {
          name: details.name.trim(),
          categoryId: details.categoryId,
          type: details.type as ProductType,
          shortDescription: details.shortDescription.trim(),
          description: details.description.trim(),
          ingredients: tabs.ingredients
            .filter((i) => i.name.trim())
            .map((i) => ({ name: i.name.trim(), ...(i.botanicalName.trim() ? { botanicalName: i.botanicalName.trim() } : {}) })),
          howToUse: tabs.howToUse.trim(),
          storage: tabs.storage.trim(),
          badge: details.badge.trim(),
          images: resolvedImages,
          isFeatured: details.isFeatured,
        },
        variants: payloadVariants,
      });
    } catch {
      // The save hook already showed the backend's message - keep the wizard open so nothing typed is lost.
      return;
    } finally {
      setSubmitPhase("idle");
    }
    onClose();
  };

  const setIngredient = (i: number, patch: Partial<WizardTabs["ingredients"][number]>) =>
    setTabs((t) => ({ ...t, ingredients: t.ingredients.map((row, idx) => (idx === i ? { ...row, ...patch } : row)) }));

  const defaultRow = resolveDefaultVariant(variants);
  const defaultMissing = mediaAttempted && !defaultRow && variants.length > 1;
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const imagesError = mediaAttempted && images.length === 0 ? "Add at least one photo." : undefined;

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
        style={{ background: "#fff", borderRadius: 22, maxWidth: 760, maxHeight: "92vh" }}
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
                placeholder="e.g. Nalpamaradi Skincare Oil"
                required
                maxLength={L.name}
                error={detailsErrors.name}
              />
              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                <FormField
                  label="Category (health need)"
                  type="searchable-select"
                  value={details.categoryId}
                  onChange={(v) => setDetails((d) => ({ ...d, categoryId: v as string }))}
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                  placeholder="Search categories…"
                  required
                  error={detailsErrors.categoryId}
                />
                <FormField
                  label="Product type"
                  type="select"
                  value={details.type}
                  onChange={(v) => setDetails((d) => ({ ...d, type: v as ProductType }))}
                  options={PRODUCT_TYPE_OPTIONS}
                  placeholder="Choose a type"
                  required
                  error={detailsErrors.type}
                />
              </div>
              <FormField
                label="Short description"
                value={details.shortDescription}
                onChange={(v) => setDetails((d) => ({ ...d, shortDescription: v as string }))}
                placeholder="e.g. A timeless Ayurvedic skincare ritual."
                required
                maxLength={L.shortDescription}
                hint="One line shown on product cards and at the top of the product page."
                error={detailsErrors.shortDescription}
              />
              <FormField
                label="Description"
                type="area"
                rows={5}
                value={details.description}
                onChange={(v) => setDetails((d) => ({ ...d, description: v as string }))}
                placeholder="The formulation, its tradition and what it's used for…"
                required
                maxLength={L.description}
                hint="The Description tab on the product page."
                error={detailsErrors.description}
              />
              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                <FormField
                  label="Badge"
                  value={details.badge}
                  onChange={(v) => setDetails((d) => ({ ...d, badge: v as string }))}
                  placeholder="e.g. Bestseller"
                  maxLength={L.badge}
                  hint="Optional label on the product card."
                  error={detailsErrors.badge}
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
              <div className="text-[12px] text-[#8a8a8e]">All optional - a tab is hidden on the product page when it&apos;s left empty.</div>
              <div className="rounded-2xl border border-[#ececea] bg-white p-4">
                <div className="mb-2 text-[12.5px] font-bold">Key ingredients</div>
                <div className="flex flex-col gap-2">
                  {tabs.ingredients.map((row, i) => {
                    const error = validationAttempt > 0 ? ingredientError(tabs, i) : undefined;
                    return (
                      <div key={i} className="flex flex-col gap-1" data-invalid={!!error || undefined}>
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                          <input
                            value={row.name}
                            onChange={(e) => setIngredient(i, { name: e.target.value })}
                            placeholder="Name, e.g. Kottam"
                            maxLength={L.ingredientName}
                            style={wizardInputStyle}
                          />
                          <input
                            value={row.botanicalName}
                            onChange={(e) => setIngredient(i, { botanicalName: e.target.value })}
                            placeholder="Botanical name (optional)"
                            maxLength={L.botanicalName}
                            style={wizardInputStyle}
                          />
                          <button
                            title="Remove ingredient"
                            onClick={() => setTabs((t) => ({ ...t, ingredients: t.ingredients.filter((_, idx) => idx !== i) }))}
                            className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-[#ececea] bg-white text-[#e5533f] hover:border-[#e5533f]"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {error && <FieldError message={error} />}
                      </div>
                    );
                  })}
                </div>
                {tabs.ingredients.length < L.ingredients && (
                  <button
                    onClick={() => setTabs((t) => ({ ...t, ingredients: [...t.ingredients, newIngredient()] }))}
                    style={{ ...softPillButton, marginTop: 10 }}
                  >
                    + Add ingredient
                  </button>
                )}
              </div>
              <FormField
                label="How to use"
                type="area"
                rows={4}
                value={tabs.howToUse}
                onChange={(v) => setTabs((t) => ({ ...t, howToUse: v as string }))}
                placeholder="e.g. Warm the oil gently and massage over joints for 10-15 minutes…"
                maxLength={L.howToUse}
              />
              <FormField
                label="Storage"
                type="area"
                rows={3}
                value={tabs.storage}
                onChange={(v) => setTabs((t) => ({ ...t, storage: v as string }))}
                placeholder="e.g. Store in a cool, dry place away from direct sunlight."
                maxLength={L.storage}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-[#ececea] bg-white p-4">
                <div className="mb-1.5 text-[11px] font-semibold text-[#8a8a8e]">Product photos (up to {L.imagesMax}) - the first one is the main photo</div>
                <div data-invalid={!!imagesError || undefined}>
                  <MultiImageField value={images} onChange={setImages} max={L.imagesMax} aspectRatio={1} error={!!imagesError} />
                  {imagesError && (
                    <div className="mt-1.5">
                      <FieldError message={imagesError} />
                    </div>
                  )}
                </div>
              </div>
              {defaultMissing && (
                <div
                  className="flex items-center gap-1.5 rounded-[14px] px-3.5 py-2.5 text-[12.5px] font-semibold"
                  style={{ background: "#fdf2f0", color: "#d6432f" }}
                >
                  <AlertCircle size={14} strokeWidth={2.4} />
                  Choose the default quantity - its price is shown as the product&apos;s price.
                </div>
              )}
              <div className="rounded-2xl border border-[#ececea] bg-white p-4">
                <div className="mb-2 text-[12.5px] font-bold">Quantities</div>
                <VariantEditor variants={variants} validationAttempt={validationAttempt} defaultMissing={defaultMissing} onChange={setVariants} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3.5">
              <div className="rounded-2xl border border-[#ececea] bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-[16px] font-bold">{details.name || "Untitled product"}</div>
                  {details.badge.trim() && (
                    <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: "#fbf3df", color: "#9a7a1f" }}>
                      {details.badge.trim()}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-[#8a8a8e]">
                  {categories.find((c) => c.id === details.categoryId)?.name} · {details.type ? PRODUCT_TYPE_LABELS[details.type] : "-"} · Featured:{" "}
                  {details.isFeatured ? "Yes" : "No"}
                </div>
                <div className="mt-2.5 text-[12.5px] font-semibold text-[#444]">{details.shortDescription}</div>
                <div className="mt-1 text-[12.5px] leading-[1.55] text-[#444]">{details.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-4">
                {[
                  ["Photos", images.length],
                  ["Ingredients", tabs.ingredients.filter((i) => i.name.trim()).length],
                  ["Quantities · stock", `${variants.length} · ${totalStock}`],
                  ["Default price", defaultRow ? formatCurrency(Number(defaultRow.price) || 0) : "—"],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-[14px] border border-[#ececea] bg-white px-3.5 py-3">
                    <div className="text-[11px] text-[#8a8a8e]">{label}</div>
                    <div className="text-[18px] font-bold">{value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-[#ececea] bg-white px-4">
                {variants.map((v, i) => {
                  const discount = previewDiscountPercent(Number(v.mrp), Number(v.price));
                  return (
                    <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#f3f3f1] py-2.5 text-[12.5px] last:border-b-0">
                      <span className="min-w-[80px] font-semibold">{formatVariantLabel({ quantity: Number(v.quantity) || 0, unit: v.unit })}</span>
                      <span className="min-w-[70px] font-semibold">{formatCurrency(Number(v.price) || 0)}</span>
                      {discount > 0 && (
                        <span className="min-w-[110px] text-[#8a8a8e]">
                          <s>{formatCurrency(Number(v.mrp) || 0)}</s> <span style={{ color: "#2e9e4b" }}>{discount}% off</span>
                        </span>
                      )}
                      <span className="flex-1 text-[#8a8a8e]">
                        Stock {v.stock || 0}
                        {!v.isActive && " · off sale"}
                      </span>
                      {v === defaultRow && (
                        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: "#eef6ec", color: "#2e9e4b" }}>
                          Default
                        </span>
                      )}
                    </div>
                  );
                })}
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
