"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ExternalLink, Trash2 } from "lucide-react";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import AdminButton from "@/modules/admin-shell/components/AdminButton";
import FormField from "@/modules/admin-shell/components/FormField";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import Toggle from "@/modules/admin-shell/components/Toggle";
import { isPendingImage, type ImageFieldValue } from "@/modules/admin-shell/components/ImageDropzone";
import { blackPillButton, dangerIconButtonStyle, iconButtonStyle, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getApiFieldErrors } from "@/lib/errors";
import { scrollToFirstError } from "@/shared/scrollToFirstError";
import { useAbout, useUpdateAbout } from "../hooks/useAbout";
import { ABOUT_CRAFT_RATIO, ABOUT_HEADER_RATIO, ABOUT_LIMITS as L, ABOUT_TEASER_RATIO, ABOUT_TRIBUTE_RATIO } from "../constants";
import {
  newCraftItem,
  toDraft,
  toFieldErrors,
  toPayload,
  validateAbout,
  type AboutDraft,
  type AboutErrors,
  type CraftDraftItem,
  type ImageSlot,
} from "../about-form";
import type { AboutImage } from "../types/about.type";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <AdminCard padding="22px">
      <div className="mb-1 text-sm font-bold">{title}</div>
      <div className="mb-4 text-xs leading-relaxed text-[#8a8a8e]">{description}</div>
      <div className="flex flex-col gap-3">{children}</div>
    </AdminCard>
  );
}

function EditorSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 om:grid-cols-2">
      {[0, 1].map((col) => (
        <div key={col} className="flex flex-col gap-4">
          {[0, 1].map((card) => (
            <AdminCard key={card} padding="22px">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="mb-4 h-3 w-56" />
              <Skeleton className="mb-3 h-[160px] w-[140px] rounded-[14px]" />
              <Skeleton className="mb-3 h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </AdminCard>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Admin editor for the About content (Home Management -> About). One record
 * feeds two places: the short "Our Heritage" teaser on the landing page and
 * the full About page. Photos are cropped locally and uploaded only on Save.
 */
export default function AboutEditor() {
  const { data, isLoading, isError, refetch } = useAbout();
  const updateAbout = useUpdateAbout();
  const [draft, setDraft] = useState<AboutDraft | null>(null);
  const [errors, setErrors] = useState<AboutErrors>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data?.data) setDraft(toDraft(data.data));
  }, [data]);

  /** Updates one block of the draft and clears the errors of the fields it touched. */
  const patch = <K extends keyof AboutDraft>(block: K, values: Partial<AboutDraft[K]>) => {
    setDraft((d) => (d ? { ...d, [block]: { ...d[block], ...values } } : d));
    setErrors((prev) => {
      const touched = Object.keys(values).map((f) => `${block}.${f}`);
      const next = Object.fromEntries(Object.entries(prev).filter(([key]) => !touched.some((t) => key === t || key.startsWith(`${t}.`))));
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  };

  const setParagraphs = (paragraphs: string[]) => {
    patch("story", { paragraphs });
  };

  const setCraftItems = (items: CraftDraftItem[]) => {
    patch("craft", { items });
  };

  /** Swaps craft photo `i` with its neighbour `i + step`. */
  const moveCraftItem = (i: number, step: -1 | 1) => {
    if (!draft) return;
    const next = [...draft.craft.items];
    [next[i + step], next[i]] = [next[i]!, next[i + step]!];
    setCraftItems(next);
  };

  const handleSave = async () => {
    if (!draft) return;
    const found = validateAbout(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      toast.error("Fix the highlighted fields.");
      scrollToFirstError();
      return;
    }

    // Upload only the photos that were newly cropped in this session.
    const upload = async (value: ImageFieldValue | null, name: string): Promise<AboutImage | null> => {
      if (!isPendingImage(value)) return value;
      return uploadToCloudinary(new File([value.blob], `about-${name}.jpg`, { type: value.blob.type || "image/jpeg" }));
    };
    const images: Record<ImageSlot, AboutImage | null> = { teaser: null, header: null, tribute: null };
    let craftImages: AboutImage[] = [];
    setUploading(true);
    try {
      for (const slot of ["teaser", "header", "tribute"] as const) {
        images[slot] = await upload(draft[slot].image, slot);
      }
      // Validation already made sure every craft item has a photo.
      const uploaded = await Promise.all(draft.craft.items.map((item, i) => upload(item.image, `craft-${i + 1}`)));
      craftImages = uploaded.filter((img): img is AboutImage => img !== null);
    } catch {
      toast.error("A photo could not be uploaded. Check your connection and try again.");
      return;
    } finally {
      setUploading(false);
    }

    try {
      const res = await updateAbout.mutateAsync(toPayload(draft, images, craftImages));
      if (res.data) setDraft(toDraft(res.data));
      setErrors({});
    } catch (err) {
      const apiErrors = getApiFieldErrors(err);
      if (apiErrors) {
        setErrors(toFieldErrors(apiErrors));
        scrollToFirstError();
      }
    }
  };

  const busy = uploading || updateAbout.isPending;

  return (
    <AdminAsyncState isLoading={isLoading || (!isError && !draft)} isError={isError} onRetry={refetch} skeleton={<EditorSkeleton />} errorTitle="About content unavailable">
      {draft && (
        <>
          <div className="grid grid-cols-1 items-start gap-4 om:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Section title="Landing page teaser" description='The short "Our Heritage" section on the home page. Its link always opens the full About page.'>
                <div
                  onClick={() => patch("teaser", { showOnHome: !draft.teaser.showOnHome })}
                  className="flex cursor-pointer items-center justify-between rounded-xl bg-[#fafaf8] px-3.5 py-3"
                >
                  <div>
                    <div className="text-[12.5px] font-semibold">Show on the home page</div>
                    <div className="text-[11px] text-[#8a8a8e]">Turn off to hide the teaser - the About page is unaffected.</div>
                  </div>
                  <Toggle on={draft.teaser.showOnHome} onClick={() => patch("teaser", { showOnHome: !draft.teaser.showOnHome })} />
                </div>
                <FormField
                  label="Photo"
                  type="image"
                  value={draft.teaser.image}
                  onChange={(v) => patch("teaser", { image: v as ImageFieldValue | null })}
                  imageAspectRatio={ABOUT_TEASER_RATIO}
                  imageMaxHeight={210}
                  error={errors["teaser.image"]}
                  hint="Optional. Portrait (5:6). Leave empty to use the built-in photo."
                />
                <FormField
                  label="Eyebrow text"
                  value={draft.teaser.eyebrow}
                  onChange={(v) => patch("teaser", { eyebrow: v as string })}
                  placeholder="e.g. Our Heritage"
                  maxLength={L.eyebrow}
                  error={errors["teaser.eyebrow"]}
                  hint="Optional. Small capitals above the title."
                />
                <FormField
                  label="Title"
                  value={draft.teaser.title}
                  onChange={(v) => patch("teaser", { title: v as string })}
                  placeholder="e.g. A legacy nurtured through generations"
                  maxLength={L.title}
                  required
                  error={errors["teaser.title"]}
                />
                <FormField
                  label="Short summary"
                  type="area"
                  rows={4}
                  value={draft.teaser.summary}
                  onChange={(v) => patch("teaser", { summary: v as string })}
                  placeholder="Two or three sentences that make people want to read the full story."
                  maxLength={L.summary}
                  required
                  error={errors["teaser.summary"]}
                  hint={`Only this shows on the home page - the full story lives on the About page. ${L.summaryMin}-${L.summary} characters.`}
                />
                <FormField
                  label="Link text"
                  value={draft.teaser.linkLabel}
                  onChange={(v) => patch("teaser", { linkLabel: v as string })}
                  placeholder="e.g. Read Our Story"
                  maxLength={L.linkLabel}
                  required
                  error={errors["teaser.linkLabel"]}
                  hint="Opens the About page."
                />
              </Section>

              <Section title="Highlight stat" description="The large gold number shown beside the story - on the About page and in the home teaser.">
                <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
                  <FormField
                    label="Value"
                    value={draft.stat.value}
                    onChange={(v) => patch("stat", { value: v as string })}
                    placeholder="e.g. 75+"
                    maxLength={L.statValue}
                    error={errors["stat.value"]}
                  />
                  <FormField
                    label="Label"
                    value={draft.stat.label}
                    onChange={(v) => patch("stat", { label: v as string })}
                    placeholder="e.g. years of Ayurvedic tradition in Kerala"
                    maxLength={L.statLabel}
                    error={errors["stat.label"]}
                  />
                </div>
                <div className="-mt-1 text-[11px] text-[#8a8a8e]">Fill both, or clear both to hide the stat.</div>
              </Section>

              <Section title="Tribute" description="A portrait with a quote on the About page - for the founder or family. Hidden until a photo is added.">
                <FormField
                  label="Portrait"
                  type="image"
                  value={draft.tribute.image}
                  onChange={(v) => patch("tribute", { image: v as ImageFieldValue | null })}
                  imageAspectRatio={ABOUT_TRIBUTE_RATIO}
                  imageMaxHeight={210}
                  error={errors["tribute.image"]}
                  hint="Portrait (4:5). Shown in a round gold frame - keep the face centred."
                />
                <FormField
                  label="Quote"
                  type="area"
                  rows={3}
                  value={draft.tribute.quote}
                  onChange={(v) => patch("tribute", { quote: v as string })}
                  placeholder="e.g. Etched in our hearts forever, your life is a legacy that will guide generations to come."
                  maxLength={L.quote}
                  error={errors["tribute.quote"]}
                />
                <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
                  <FormField
                    label="Name"
                    value={draft.tribute.name}
                    onChange={(v) => patch("tribute", { name: v as string })}
                    placeholder="e.g. Dr. T. K. Ravi"
                    maxLength={L.name}
                    error={errors["tribute.name"]}
                  />
                  <FormField
                    label="Role"
                    value={draft.tribute.role}
                    onChange={(v) => patch("tribute", { role: v as string })}
                    placeholder="e.g. Ayurvedic physician"
                    maxLength={L.role}
                    error={errors["tribute.role"]}
                  />
                </div>
              </Section>
            </div>

            <div className="flex flex-col gap-4">
              <Section title="About page header" description="The top of the About page.">
                <FormField
                  label="Wide photo"
                  type="image"
                  value={draft.header.image}
                  onChange={(v) => patch("header", { image: v as ImageFieldValue | null })}
                  imageAspectRatio={ABOUT_HEADER_RATIO}
                  imageMaxHeight={150}
                  error={errors["header.image"]}
                  hint="Optional. Landscape (16:7). Leave empty to use the built-in photo."
                />
                <FormField
                  label="Eyebrow text"
                  value={draft.header.eyebrow}
                  onChange={(v) => patch("header", { eyebrow: v as string })}
                  placeholder="e.g. Our Story"
                  maxLength={L.eyebrow}
                  error={errors["header.eyebrow"]}
                />
                <FormField
                  label="Page title"
                  value={draft.header.title}
                  onChange={(v) => patch("header", { title: v as string })}
                  placeholder="e.g. A Legacy, Reimagined"
                  maxLength={L.title}
                  required
                  error={errors["header.title"]}
                />
                <FormField
                  label="Subtitle"
                  value={draft.header.subtitle}
                  onChange={(v) => patch("header", { subtitle: v as string })}
                  placeholder="e.g. From the House of Cochin Arya Vaidyasala"
                  maxLength={L.subtitle}
                  error={errors["header.subtitle"]}
                  hint="Optional. Shown in italics under the title."
                />
              </Section>

              <Section title="Story" description="The main text of the About page, in order. Each paragraph is its own block.">
                <FormField
                  label="Story heading"
                  value={draft.story.heading}
                  onChange={(v) => patch("story", { heading: v as string })}
                  placeholder="e.g. Where our story begins"
                  maxLength={L.heading}
                  required
                  error={errors["story.heading"]}
                />
                <div className="flex flex-col gap-3" data-invalid={errors["story.paragraphs"] ? "true" : undefined}>
                  {draft.story.paragraphs.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-[#ececea] p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[11.5px] font-semibold text-[#8a8a8e]">Paragraph {i + 1}</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            aria-label={`Move paragraph ${i + 1} up`}
                            title="Move up"
                            style={iconButtonStyle}
                            disabled={i === 0}
                            className="disabled:opacity-40"
                            onClick={() => {
                              const next = [...draft.story.paragraphs];
                              [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                              setParagraphs(next);
                            }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move paragraph ${i + 1} down`}
                            title="Move down"
                            style={iconButtonStyle}
                            disabled={i === draft.story.paragraphs.length - 1}
                            className="disabled:opacity-40"
                            onClick={() => {
                              const next = [...draft.story.paragraphs];
                              [next[i + 1], next[i]] = [next[i]!, next[i + 1]!];
                              setParagraphs(next);
                            }}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove paragraph ${i + 1}`}
                            title={draft.story.paragraphs.length === 1 ? "The story needs at least one paragraph" : "Remove"}
                            style={dangerIconButtonStyle}
                            disabled={draft.story.paragraphs.length === 1}
                            className="disabled:opacity-40"
                            onClick={() => setParagraphs(draft.story.paragraphs.filter((_, j) => j !== i))}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <FormField
                        label={`Paragraph ${i + 1} text`}
                        type="area"
                        rows={3}
                        value={p}
                        onChange={(v) => setParagraphs(draft.story.paragraphs.map((x, j) => (j === i ? (v as string) : x)))}
                        placeholder="Write one part of the story…"
                        maxLength={L.paragraph}
                        error={errors[`story.paragraphs.${i}`]}
                      />
                    </div>
                  ))}
                  {errors["story.paragraphs"] && <span className="text-[11px] font-medium text-[#d6432f]">{errors["story.paragraphs"]}</span>}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      style={{ ...blackPillButton, opacity: draft.story.paragraphs.length >= L.paragraphsMax ? 0.5 : 1 }}
                      disabled={draft.story.paragraphs.length >= L.paragraphsMax}
                      onClick={() => setParagraphs([...draft.story.paragraphs, ""])}
                    >
                      + Add paragraph
                    </button>
                    <span className="text-[11.5px] text-[#8a8a8e]">
                      {draft.story.paragraphs.length}/{L.paragraphsMax} paragraphs
                    </span>
                  </div>
                </div>
                <FormField
                  label="Closing lines"
                  type="area"
                  rows={2}
                  value={draft.story.closing}
                  onChange={(v) => patch("story", { closing: v as string })}
                  placeholder={"e.g. A legacy we honour.\nA tradition we continue."}
                  maxLength={L.closing}
                  error={errors["story.closing"]}
                  hint="Optional. Shown in gold italics after the story - each line on its own line."
                />
              </Section>
            </div>
          </div>

          <div className="mt-4">
            <Section
              title="Craft photos"
              description={`"The traditional way" row on the About page - real photos of how the products are made, each with a short caption. Hidden until at least one photo is added.`}
            >
              <FormField
                label="Section heading"
                value={draft.craft.heading}
                onChange={(v) => patch("craft", { heading: v as string })}
                placeholder="e.g. The traditional way"
                maxLength={L.craftHeading}
                required
                error={errors["craft.heading"]}
              />
              <div className="flex flex-col gap-3" data-invalid={errors["craft.items"] ? "true" : undefined}>
                {draft.craft.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#dcdcd8] px-4 py-6 text-center text-[12px] text-[#8a8a8e]">
                    No photos yet - the section stays hidden on the About page. Add 3 for a full row.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3">
                    {draft.craft.items.map((item, i) => (
                      <div key={item.key} className="rounded-2xl border border-[#ececea] p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-[11.5px] font-semibold text-[#8a8a8e]">Photo {i + 1}</span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              aria-label={`Move photo ${i + 1} earlier`}
                              title="Move earlier"
                              style={iconButtonStyle}
                              disabled={i === 0}
                              className="disabled:opacity-40"
                              onClick={() => moveCraftItem(i, -1)}
                            >
                              <ArrowLeft size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Move photo ${i + 1} later`}
                              title="Move later"
                              style={iconButtonStyle}
                              disabled={i === draft.craft.items.length - 1}
                              className="disabled:opacity-40"
                              onClick={() => moveCraftItem(i, 1)}
                            >
                              <ArrowRight size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Remove photo ${i + 1}`}
                              title="Remove"
                              style={dangerIconButtonStyle}
                              onClick={() => setCraftItems(draft.craft.items.filter((x) => x.key !== item.key))}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <FormField
                            label="Photo"
                            type="image"
                            value={item.image}
                            onChange={(v) => setCraftItems(draft.craft.items.map((x) => (x.key === item.key ? { ...x, image: v as ImageFieldValue | null } : x)))}
                            imageAspectRatio={ABOUT_CRAFT_RATIO}
                            imageMaxHeight={210}
                            required
                            error={errors[`craft.items.${i}.image`]}
                            hint="Portrait (4:5)."
                          />
                          <FormField
                            label="Caption"
                            value={item.caption}
                            onChange={(v) => setCraftItems(draft.craft.items.map((x) => (x.key === item.key ? { ...x, caption: v as string } : x)))}
                            placeholder="e.g. Slow-cooking in bronze urulis"
                            maxLength={L.craftCaption}
                            required
                            error={errors[`craft.items.${i}.caption`]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors["craft.items"] && <span className="text-[11px] font-medium text-[#d6432f]">{errors["craft.items"]}</span>}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    style={{ ...blackPillButton, opacity: draft.craft.items.length >= L.craftItemsMax ? 0.5 : 1 }}
                    disabled={draft.craft.items.length >= L.craftItemsMax}
                    onClick={() => setCraftItems([...draft.craft.items, newCraftItem()])}
                  >
                    + Add photo
                  </button>
                  <span className="text-[11.5px] text-[#8a8a8e]">
                    {draft.craft.items.length}/{L.craftItemsMax} photos
                  </span>
                </div>
              </div>
            </Section>
          </div>

          {/* Sticky so Save is always reachable on a long form, as on Business Settings. */}
          <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#e6e6e3] bg-[#f1f1ef] px-4 py-3 om:-mx-8 om:px-8">
            <Link href="/about" target="_blank" rel="noopener noreferrer" className="mr-auto inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#555] hover:text-[#141414]">
              View About page <ExternalLink size={13} />
            </Link>
            <button
              type="button"
              style={whitePillButton}
              disabled={busy}
              onClick={() => {
                if (data?.data) setDraft(toDraft(data.data));
                setErrors({});
              }}
            >
              Reset
            </button>
            <AdminButton loading={busy} loadingText={uploading ? "Uploading photos…" : "Saving…"} onClick={handleSave}>
              Save changes
            </AdminButton>
          </div>
        </>
      )}
    </AdminAsyncState>
  );
}
