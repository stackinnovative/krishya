"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import AdminButton from "@/modules/admin-shell/components/AdminButton";
import FormField, { containsSpecialChars } from "@/modules/admin-shell/components/FormField";
import { isPendingImage, type ImageFieldValue } from "@/modules/admin-shell/components/ImageDropzone";
import { tab, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { useSettings, useUpdateSettings } from "@/modules/settings/hooks/useSettings";
import PolicySectionsEditor from "@/modules/settings/components/PolicySectionsEditor";
import type { SettingsView } from "@/modules/settings/types/settings.type";
import { uploadToCloudinary } from "@/lib/cloudinary";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className="relative h-[22px] w-10 flex-none cursor-pointer rounded-full" style={{ background: on ? "#3fbf5f" : "#d9d9d5", transition: "background .2s" }}>
      <div className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)]" style={{ left: on ? 20 : 2, transition: "left .2s" }} />
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TABS = [
  { key: "company", label: "Company" },
  { key: "returns", label: "Return & Refund Policy" },
  { key: "privacy", label: "Privacy Policy" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function SettingsSkeleton() {
  return (
    <>
      <div className="mb-4 inline-flex gap-2 rounded-full bg-white p-1">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-40 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 om:grid-cols-2">
        <AdminCard padding="22px">
          <Skeleton className="mb-2 h-4 w-16" />
          <Skeleton className="mb-4 h-3 w-48" />
          <Skeleton className="mb-3 h-[100px] w-[100px] rounded-full" />
          <Skeleton className="mb-3 h-10 w-full" />
          <Skeleton className="mb-3 h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </AdminCard>
        <div className="flex flex-col gap-4">
          <AdminCard padding="22px">
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="mb-4 h-3 w-48" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </AdminCard>
          <AdminCard padding="22px">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </AdminCard>
        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const [tab_, setTab] = useState<TabKey>("company");
  const [draft, setDraft] = useState<SettingsView | null>(null);
  // Held separately from `draft.logo` because it can be a not-yet-uploaded
  // `PendingImage` while the user is editing - only resolved to a real
  // `{ url, publicId }` on save (see handleSave), same as FormModal does for
  // every other admin image field.
  const [logoValue, setLogoValue] = useState<ImageFieldValue | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.data) {
      setDraft(data.data);
      setLogoValue(data.data.logo);
    }
  }, [data]);

  const set = <K extends keyof SettingsView>(key: K, value: SettingsView[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (d: SettingsView) => {
    const next: Record<string, string> = {};
    if (!d.storeName.trim()) next.storeName = "Store name is required.";
    else if (containsSpecialChars(d.storeName)) next.storeName = "Store name can only contain letters, numbers, and basic punctuation.";
    if (!d.email.trim()) next.email = "Support email is required.";
    else if (!EMAIL_RE.test(d.email.trim())) next.email = "Enter a valid email address.";
    return next;
  };

  const handleSave = async () => {
    if (!draft) return;
    const validationErrors = validate(draft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTab("company");
      toast.error("Fix the highlighted fields.");
      return;
    }

    let logo = draft.logo;
    if (isPendingImage(logoValue)) {
      setUploadingLogo(true);
      try {
        const file = new File([logoValue.blob], "logo.jpg", { type: logoValue.blob.type || "image/jpeg" });
        logo = await uploadToCloudinary(file);
      } catch {
        toast.error("Could not upload logo. Try again.");
        setUploadingLogo(false);
        return;
      }
      setUploadingLogo(false);
    } else {
      logo = logoValue;
    }

    const payload: Omit<SettingsView, "id"> = {
      storeName: draft.storeName,
      email: draft.email,
      phone: draft.phone,
      logo,
      deliveryCharge: draft.deliveryCharge,
      freeAbove: draft.freeAbove,
      cod: draft.cod,
      maintenance: draft.maintenance,
      refundReturnSections: draft.refundReturnSections,
      privacyPolicySections: draft.privacyPolicySections,
    };
    updateSettings.mutate(payload);
  };

  return (
    <AdminPageShell title="Business Settings" subtitle="Company info, delivery, returns and privacy policy">
      <AdminAsyncState
        isLoading={isLoading || (!isError && !draft)}
        isError={isError}
        onRetry={refetch}
        skeleton={<SettingsSkeleton />}
        errorTitle="Settings unavailable"
      >
        {draft && (
          <>
            <div className="mb-4 inline-flex flex-wrap gap-0.5 rounded-full bg-white p-1">
              {TABS.map((t) => (
                <button key={t.key} style={tab(tab_ === t.key)} onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab_ === "company" && (
              <div className="grid grid-cols-1 items-start gap-4 om:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <AdminCard padding="22px">
                    <div className="mb-1 text-sm font-bold">Store</div>
                    <div className="mb-4 text-xs text-[#8a8a8e]">Shown in the storefront header and emails.</div>
                    <div className="flex flex-col gap-3">
                      <div className="max-w-[160px]">
                        <FormField
                          label="Logo"
                          type="image"
                          value={logoValue}
                          onChange={(v) => setLogoValue(v as ImageFieldValue | null)}
                          imageAspectRatio={1}
                        />
                      </div>
                      <FormField label="Store name" value={draft.storeName} onChange={(v) => set("storeName", v as string)} required error={errors.storeName} />
                      <FormField label="Support email" type="email" value={draft.email} onChange={(v) => set("email", v as string)} required error={errors.email} />
                      <FormField label="Phone / WhatsApp" type="tel" value={draft.phone} onChange={(v) => set("phone", v as string)} />
                    </div>
                  </AdminCard>
                </div>

                <div className="flex flex-col gap-4">
                  <AdminCard padding="22px">
                    <div className="mb-1 text-sm font-bold">Delivery</div>
                    <div className="mb-4 text-xs text-[#8a8a8e]">Charges apply at checkout automatically.</div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Delivery charge (₹)" type="number" value={draft.deliveryCharge} onChange={(v) => set("deliveryCharge", v as number)} />
                      <FormField label="Free delivery above (₹)" type="number" value={draft.freeAbove} onChange={(v) => set("freeAbove", v as number)} />
                    </div>
                    <div onClick={() => set("cod", !draft.cod)} className="mt-3.5 flex cursor-pointer items-center justify-between rounded-xl bg-[#fafaf8] px-3.5 py-3">
                      <div>
                        <div className="text-[12.5px] font-semibold">Cash on delivery</div>
                        <div className="text-[11px] text-[#8a8a8e]">Allow COD at checkout</div>
                      </div>
                      <Toggle on={draft.cod} onClick={() => set("cod", !draft.cod)} />
                    </div>
                  </AdminCard>

                  <AdminCard padding="22px">
                    <div className="mb-3.5 text-sm font-bold">Storefront</div>
                    <div onClick={() => set("maintenance", !draft.maintenance)} className="flex cursor-pointer items-center justify-between rounded-xl bg-[#fafaf8] px-3.5 py-3">
                      <div>
                        <div className="text-[12.5px] font-semibold">Maintenance mode</div>
                        <div className="text-[11px] text-[#8a8a8e]">Hide the store from customers</div>
                      </div>
                      <Toggle on={draft.maintenance} onClick={() => set("maintenance", !draft.maintenance)} />
                    </div>
                  </AdminCard>
                </div>
              </div>
            )}

            {tab_ === "returns" && (
              <AdminCard padding="22px">
                <div className="mb-1 text-sm font-bold">Returns &amp; refunds</div>
                <div className="mb-4 text-xs text-[#8a8a8e]">Each section becomes a card on the storefront&apos;s Return &amp; Replacement Policy page.</div>
                <PolicySectionsEditor value={draft.refundReturnSections} onChange={(next) => set("refundReturnSections", next)} />
              </AdminCard>
            )}

            {tab_ === "privacy" && (
              <AdminCard padding="22px">
                <div className="mb-1 text-sm font-bold">Privacy policy</div>
                <div className="mb-4 text-xs text-[#8a8a8e]">Each section becomes part of the storefront&apos;s Privacy Policy page, in order.</div>
                <PolicySectionsEditor value={draft.privacyPolicySections} onChange={(next) => set("privacyPolicySections", next)} />
              </AdminCard>
            )}

            {/* Sticky so Save is always reachable without hunting through a long
             * (possibly scrolled) page - especially once a policy tab has several
             * sections. */}
            <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex justify-end gap-2 border-t border-[#e6e6e3] bg-[#f1f1ef] px-4 py-3 om:-mx-8 om:px-8">
              <button
                style={whitePillButton}
                onClick={() => {
                  if (data?.data) {
                    setDraft(data.data);
                    setLogoValue(data.data.logo);
                    setErrors({});
                  }
                }}
              >
                Reset
              </button>
              <AdminButton loading={uploadingLogo || updateSettings.isPending} loadingText="Saving…" onClick={handleSave}>
                Save changes
              </AdminButton>
            </div>
          </>
        )}
      </AdminAsyncState>
    </AdminPageShell>
  );
}
