"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import FormModal from "@/modules/admin-shell/components/FormModal";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import StatusBadge from "@/modules/admin-shell/components/StatusBadge";
import { blackPillButton, softPillButton } from "@/modules/admin-shell/style-helpers";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { useActiveProductOptions } from "@/modules/products/hooks/useStorefrontProducts";
import { HERO_ASPECT_RATIO } from "../constants";
import { buildHeroFields, heroInitialValues, toHeroPayload } from "../hero-form";
import { useAdminHeroes, useSaveHero, useToggleHero } from "../hooks/useHomeContent";
import type { HeroView } from "../types/home-content.type";

const THUMB_W = 112;

function MetaChip({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-1 text-[11px]"
      style={{ background: warn ? "#fdf2f0" : "#f3f3f1", color: warn ? "#c2412d" : "#555" }}
    >
      <span className="font-semibold">{label}:</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

function HeroListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 om:grid-cols-2">
      {[0, 1].map((i) => (
        <AdminCard key={i}>
          <div className="flex gap-4">
            <Skeleton className="flex-none rounded-[14px]" style={{ width: THUMB_W, aspectRatio: HERO_ASPECT_RATIO }} />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </AdminCard>
      ))}
    </div>
  );
}

/**
 * Admin list + editor for the storefront hero slideshow. Active slides rotate
 * on the home page in "Slide position" order; drafts stay hidden. With no
 * active slide the storefront falls back to its built-in default hero.
 */
export default function HeroSlidesPanel({ editing, onEdit }: { editing: HeroView | "new" | null; onEdit: (hero: HeroView | "new" | null) => void }) {
  const { data, isLoading, isError, refetch } = useAdminHeroes();
  const { mutateAsync: saveHero } = useSaveHero();
  const { mutate: toggleHero, isPending: toggling, variables: toggleVars } = useToggleHero();
  const { data: productOptions = [], isLoading: productsLoading } = useActiveProductOptions();

  const heroes = [...(data?.data ?? [])].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  const activeCount = heroes.filter((h) => h.isActive).length;
  const productName = new Map(productOptions.map((o) => [o.value, o.label]));
  const nextPosition = heroes.length ? Math.max(...heroes.map((h) => h.priority ?? 0)) + 1 : 1;

  // A slide may spotlight a product that has since been hidden - keep it selectable (labelled) so editing doesn't silently drop it.
  const editingSpotlight = editing && editing !== "new" ? editing.spotlightProductId : undefined;
  const options =
    editingSpotlight && !productName.has(editingSpotlight)
      ? [{ label: "Unavailable product (hidden on the store)", value: editingSpotlight }, ...productOptions]
      : productOptions;
  const otherPositions = heroes.filter((h) => editing === "new" || !editing || h.id !== editing.id).map((h) => h.priority ?? 0);

  return (
    <>
      <AdminAsyncState isLoading={isLoading} isError={isError} onRetry={refetch} skeleton={<HeroListSkeleton />} errorTitle="Hero slides unavailable">
        {heroes.length === 0 ? (
          <AdminCard>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f3f1] text-[#8a8a8e]">
                <ImageIcon size={20} />
              </span>
              <div className="text-[14px] font-bold">No hero slides yet</div>
              <div className="max-w-[420px] text-[12.5px] leading-relaxed text-[#8a8a8e]">
                The home page is showing its built-in default hero. Add a slide to use your own photo, headline and buttons - add more and they rotate as a slideshow.
              </div>
              <button style={{ ...blackPillButton, marginTop: 8 }} onClick={() => onEdit("new")}>
                + Add your first slide
              </button>
            </div>
          </AdminCard>
        ) : (
          <>
            <div className="mb-3 text-[12px] text-[#8a8a8e]">
              {activeCount === 0
                ? "All slides are drafts - the home page shows the built-in default hero until you activate one."
                : activeCount === 1
                  ? "1 active slide - shown on its own. Activate another to start the slideshow."
                  : `${activeCount} active slides rotate on the home page, lowest position first. Drafts stay hidden.`}
            </div>
            <div className="grid grid-cols-1 gap-4 om:grid-cols-2">
              {heroes.map((h) => {
                const spotlight = h.spotlightProductId ? productName.get(h.spotlightProductId) : undefined;
                return (
                  <AdminCard key={h.id} className="flex flex-col">
                    <div className="flex gap-4">
                      <div
                        className="relative flex-none overflow-hidden rounded-[14px] bg-[#f1f1ef]"
                        style={{ width: THUMB_W, aspectRatio: HERO_ASPECT_RATIO, opacity: h.isActive ? 1 : 0.55 }}
                      >
                        {h.image?.url && (
                          <Image
                            src={getOptimizedImageUrl(h.image.url, THUMB_W * 2, Math.round((THUMB_W * 2) / HERO_ASPECT_RATIO))}
                            alt={h.title}
                            fill
                            sizes={`${THUMB_W}px`}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#141414] px-2 py-0.5 text-[10.5px] font-bold text-white">Position {h.priority ?? 0}</span>
                          <StatusBadge
                            status={h.isActive ? "Active" : "Draft"}
                            onClick={() => !(toggling && toggleVars?.id === h.id) && toggleHero({ id: h.id, isActive: h.isActive })}
                          />
                        </div>
                        {h.label && <div className="truncate text-[10.5px] font-bold uppercase tracking-[.12em] text-[#8a8a8e]">{h.label}</div>}
                        <div className="line-clamp-2 break-words text-[15px] font-bold leading-snug">{h.title}</div>
                        <div className="mt-1 line-clamp-2 break-words text-[12.5px] text-[#555]">{h.subtitle}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <MetaChip label="Button" value={`${h.buttonLabel || "Shop Now"} → ${h.buttonUrl || "/products"}`} />
                      {h.secondaryLabel && <MetaChip label="Link" value={`${h.secondaryLabel} → ${h.secondaryUrl}`} />}
                      {h.badgeText && <MetaChip label="Badge" value={h.badgeText} />}
                      {h.spotlightProductId &&
                        (spotlight ? (
                          <MetaChip label="Spotlight" value={`${h.spotlightLabel ? `${h.spotlightLabel} · ` : ""}${spotlight}`} />
                        ) : (
                          !productsLoading && <MetaChip label="Spotlight" value="product unavailable - hidden on the store" warn />
                        ))}
                    </div>

                    <div className="mt-auto flex justify-end pt-3">
                      <button style={softPillButton} onClick={() => onEdit(h)}>
                        Edit
                      </button>
                    </div>
                  </AdminCard>
                );
              })}
            </div>
          </>
        )}
      </AdminAsyncState>

      {editing && (
        <FormModal
          title={editing === "new" ? "Add Hero Slide" : "Edit Hero Slide"}
          fields={buildHeroFields(options, otherPositions, productsLoading)}
          initialValues={heroInitialValues(editing, nextPosition)}
          saveLabel={editing === "new" ? "Add slide" : "Save changes"}
          onSave={async (v) => {
            const image = v.image as { url: string; publicId: string } | null;
            if (!image) return;
            await saveHero({ id: editing === "new" ? null : editing.id, data: toHeroPayload(v, image) });
            onEdit(null);
          }}
          onClose={() => onEdit(null)}
        />
      )}
    </>
  );
}
