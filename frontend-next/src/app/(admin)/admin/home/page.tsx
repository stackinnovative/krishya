"use client";

import { useState } from "react";
import Image from "next/image";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import StatusBadge from "@/modules/admin-shell/components/StatusBadge";
import FormModal, { type FormFieldDef } from "@/modules/admin-shell/components/FormModal";
import { blackPillButton, dangerPillButton, softPillButton, whitePillButton, tab } from "@/modules/admin-shell/style-helpers";
import { getOptimizedImageUrl, getDownloadUrl } from "@/lib/cloudinary";
import { confirmAction } from "@/lib/confirm";
import { HERO_ASPECT_RATIO, BANNER_ASPECT_RATIO, MAX_BANNERS } from "@/modules/home-content/constants";
import {
  useAdminBanners,
  useAdminHeroes,
  useAdminTestimonials,
  useDeleteBanner,
  useDeleteTestimonial,
  useSaveBanner,
  useSaveHero,
  useSaveTestimonial,
  useToggleBanner,
  useToggleHero,
  useToggleTestimonial,
} from "@/modules/home-content/hooks/useHomeContent";
import type { BannerView, HeroView, TestimonialView } from "@/modules/home-content/types/home-content.type";

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "banner", label: "Banners" },
  { key: "testimonials", label: "Testimonials" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const HERO_FIELDS: FormFieldDef[] = [
  { key: "title", label: "Headline", type: "text", placeholder: "Headline", required: true },
  { key: "subtitle", label: "Subheadline", type: "area", placeholder: "Supporting line", required: true, minLength: 5 },
  { key: "buttonLabel", label: "Button label", type: "text", placeholder: "Shop now" },
  { key: "buttonUrl", label: "Button link", type: "url", placeholder: "/collections/all" },
  { key: "image", label: "Image", type: "image", required: true, imageAspectRatio: HERO_ASPECT_RATIO },
];
const BANNER_FIELDS: FormFieldDef[] = [
  { key: "image", label: "Image", type: "image", required: true, imageAspectRatio: BANNER_ASPECT_RATIO },
  { key: "buttonUrl", label: "Link (optional)", type: "url", placeholder: "/collections/all" },
];
const TESTIMONIAL_FIELDS: FormFieldDef[] = [
  { key: "author", label: "Customer name", type: "text", placeholder: "Name", required: true, minLength: 2, maxLength: 100 },
  { key: "comment", label: "Quote", type: "area", placeholder: "What did they say?", required: true, minLength: 5, maxLength: 500 },
];

export default function HomeManagementPage() {
  const [tab_, setTab] = useState<TabKey>("hero");
  const [heroEditing, setHeroEditing] = useState<HeroView | "new" | null>(null);
  const [bannerEditing, setBannerEditing] = useState<BannerView | "new" | null>(null);
  const [testimonialEditing, setTestimonialEditing] = useState<TestimonialView | "new" | null>(null);

  const { data: heroes } = useAdminHeroes();
  const { data: banners } = useAdminBanners();
  const { data: testimonials } = useAdminTestimonials();
  const { mutateAsync: saveHero } = useSaveHero();
  const { mutate: toggleHero } = useToggleHero();
  const { mutateAsync: saveBanner } = useSaveBanner();
  const { mutate: toggleBanner } = useToggleBanner();
  const { mutate: deleteBanner } = useDeleteBanner();
  const { mutateAsync: saveTestimonial } = useSaveTestimonial();
  const { mutate: toggleTestimonial } = useToggleTestimonial();
  const { mutate: deleteTestimonial } = useDeleteTestimonial();

  return (
    <AdminPageShell title="Home Management" subtitle="Hero slides, banners and testimonials on the storefront">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-0.5 rounded-full bg-white p-1">
          {TABS.map((t) => (
            <button key={t.key} style={tab(tab_ === t.key)} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {tab_ === "banner" && (
            <span className="text-[12px] text-[#8a8a8e]">
              {banners?.data?.length ?? 0}/{MAX_BANNERS} banners &mdash; adding a {MAX_BANNERS + 1}th replaces the oldest
            </span>
          )}
          <button
            style={blackPillButton}
            onClick={() => {
              if (tab_ === "hero") setHeroEditing("new");
              else if (tab_ === "banner") setBannerEditing("new");
              else setTestimonialEditing("new");
            }}
          >
            {tab_ === "hero" ? "+ Add Hero Slide" : tab_ === "banner" ? "+ Add Banner" : "+ Add Testimonial"}
          </button>
        </div>
      </div>

      {tab_ === "hero" && (
        <div className="grid grid-cols-1 gap-4 om:grid-cols-2">
          {(heroes?.data ?? []).map((h) => (
            <AdminCard key={h.id}>
              <div className="relative mb-3.5 w-full overflow-hidden rounded-[14px] bg-[#f1f1ef]" style={{ aspectRatio: HERO_ASPECT_RATIO }}>
                {h.image?.url && (
                  <Image
                    src={getOptimizedImageUrl(h.image.url, 600, Math.round(600 / HERO_ASPECT_RATIO))}
                    alt={h.title}
                    fill
                    sizes="600px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="text-[15px] font-bold">{h.title}</div>
              <div className="mt-1 text-[12.5px] text-[#555]">{h.subtitle}</div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={h.isActive ? "Active" : "Draft"} onClick={() => toggleHero({ id: h.id, isActive: h.isActive })} />
                  {h.buttonLabel && <span className="text-[11.5px] text-[#8a8a8e]">CTA: {h.buttonLabel}</span>}
                </div>
                <button style={softPillButton} onClick={() => setHeroEditing(h)}>
                  Edit
                </button>
              </div>
            </AdminCard>
          ))}
          {!heroes?.data?.length && <div className="col-span-full py-8 text-center text-[13px] text-[#8a8a8e]">No hero slides yet.</div>}
        </div>
      )}

      {tab_ === "banner" && (
        <div className="flex flex-col gap-3">
          {(banners?.data ?? []).map((b) => (
            <AdminCard key={b.id} padding="16px 20px">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative w-[140px] flex-none overflow-hidden rounded-xl bg-[#f1f1ef]" style={{ aspectRatio: BANNER_ASPECT_RATIO }}>
                  {b.image?.url && (
                    <Image
                      src={getOptimizedImageUrl(b.image.url, 280, Math.round(280 / BANNER_ASPECT_RATIO))}
                      alt=""
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1" style={{ minWidth: 180 }}>
                  <StatusBadge status={b.isActive ? "Active" : "Inactive"} onClick={() => toggleBanner({ id: b.id, isActive: b.isActive })} />
                  {b.buttonUrl && <div className="mt-1.5 text-[11.5px] text-[#8a8a8e]">Links to: {b.buttonUrl}</div>}
                </div>
                <a style={whitePillButton} href={getDownloadUrl(b.image?.url)} download>
                  Download
                </a>
                <button style={softPillButton} onClick={() => setBannerEditing(b)}>
                  Edit
                </button>
                <button style={dangerPillButton} onClick={() => confirmAction("Delete this banner? This can't be undone.") && deleteBanner(b.id)}>
                  Delete
                </button>
              </div>
            </AdminCard>
          ))}
          {!banners?.data?.length && <div className="py-8 text-center text-[13px] text-[#8a8a8e]">No banners yet.</div>}
        </div>
      )}

      {tab_ === "testimonials" && (
        <div className="grid grid-cols-1 gap-4 om:grid-cols-3">
          {(testimonials?.data ?? []).map((t) => (
            <AdminCard key={t.id}>
              <div className="mb-2.5 flex items-center justify-between">
                <StatusBadge status={t.isActive ? "Published" : "Hidden"} onClick={() => toggleTestimonial({ id: t.id, isActive: t.isActive })} />
              </div>
              <div className="min-h-[60px] flex-1 text-[13px] leading-[1.55] text-[#333]">&ldquo;{t.comment}&rdquo;</div>
              <div className="mt-3 flex items-center justify-between gap-2.5">
                <div className="text-[12.5px] font-semibold">{t.author}</div>
                <div className="flex gap-1.5">
                  <button style={softPillButton} onClick={() => setTestimonialEditing(t)}>
                    Edit
                  </button>
                  <button
                    style={dangerPillButton}
                    onClick={() => confirmAction(`Delete the testimonial from "${t.author}"?`) && deleteTestimonial(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </AdminCard>
          ))}
          {!testimonials?.data?.length && <div className="col-span-full py-8 text-center text-[13px] text-[#8a8a8e]">No testimonials yet.</div>}
        </div>
      )}

      {heroEditing && (
        <FormModal
          title={heroEditing === "new" ? "Add Hero Slide" : "Edit Hero"}
          fields={HERO_FIELDS}
          initialValues={
            heroEditing === "new"
              ? { title: "", subtitle: "", buttonLabel: "Shop now", buttonUrl: "/", image: null }
              : { title: heroEditing.title, subtitle: heroEditing.subtitle, buttonLabel: heroEditing.buttonLabel ?? "", buttonUrl: heroEditing.buttonUrl ?? "", image: heroEditing.image }
          }
          onSave={async (v) => {
            const image = v.image as { url: string; publicId: string } | null;
            if (!image) return;
            await saveHero({
              id: heroEditing === "new" ? null : heroEditing.id,
              data: { title: String(v.title ?? ""), subtitle: String(v.subtitle ?? ""), buttonLabel: String(v.buttonLabel ?? ""), buttonUrl: String(v.buttonUrl ?? ""), image },
            });
            setHeroEditing(null);
          }}
          onClose={() => setHeroEditing(null)}
        />
      )}

      {bannerEditing && (
        <FormModal
          title={bannerEditing === "new" ? "Add Banner" : "Edit Banner"}
          fields={BANNER_FIELDS}
          initialValues={bannerEditing === "new" ? { image: null, buttonUrl: "" } : { image: bannerEditing.image, buttonUrl: bannerEditing.buttonUrl ?? "" }}
          onSave={async (v) => {
            const image = v.image as { url: string; publicId: string } | null;
            if (!image) return;
            await saveBanner({ id: bannerEditing === "new" ? null : bannerEditing.id, data: { image, buttonUrl: String(v.buttonUrl ?? "") } });
            setBannerEditing(null);
          }}
          onClose={() => setBannerEditing(null)}
        />
      )}

      {testimonialEditing && (
        <FormModal
          title={testimonialEditing === "new" ? "Add Testimonial" : "Edit Testimonial"}
          fields={TESTIMONIAL_FIELDS}
          initialValues={testimonialEditing === "new" ? { author: "", comment: "" } : { author: testimonialEditing.author, comment: testimonialEditing.comment }}
          onSave={async (v) => {
            await saveTestimonial({
              id: testimonialEditing === "new" ? null : testimonialEditing.id,
              data: { author: String(v.author ?? ""), comment: String(v.comment ?? "") },
            });
            setTestimonialEditing(null);
          }}
          onClose={() => setTestimonialEditing(null)}
        />
      )}
    </AdminPageShell>
  );
}
