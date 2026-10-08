import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { splitStoreName } from "@/modules/settings/store-info";

/**
 * Round brand mark. Shows the logo uploaded in Business Settings when there
 * is one; otherwise the bundled Krishay artwork, zoomed 1.8x from its top so
 * only the mortar-and-herbs emblem shows (its own lettering is cropped out
 * and set as live text beside it instead).
 */
export function BrandMark({ logoUrl, size, ring = "#C9A24A" }: { logoUrl: string | null; size: number | string; ring?: string }) {
  return (
    <span className="relative block flex-none overflow-hidden rounded-full bg-ka-green" style={{ width: size, height: size, boxShadow: `0 0 0 1.5px ${ring}` }}>
      {logoUrl ? (
        <Image src={getOptimizedImageUrl(logoUrl, 128, 128)} alt="" fill sizes="64px" className="object-cover" priority />
      ) : (
        <Image
          src="/brand/krishay-logo.png"
          alt=""
          fill
          sizes="64px"
          className="object-cover"
          style={{ objectPosition: "50% 0", transform: "scale(1.8)", transformOrigin: "47% 22%" }}
          priority
        />
      )}
    </span>
  );
}

type Props = { storeName: string; logoUrl: string | null; tone?: "light" | "dark" };

/** Mark + store-name wordmark: first word large (serif), the rest as a small spaced caption - "Krishay / AYURVEDA". `tone="dark"` is the footer (gold on green). */
export default function BrandLogo({ storeName, logoUrl, tone = "light" }: Props) {
  const { lead, rest } = splitStoreName(storeName);

  if (tone === "dark") {
    return (
      <span className="flex items-center gap-3.5">
        <BrandMark logoUrl={logoUrl} size={64} ring="rgba(201,162,74,.6)" />
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-display text-[30px] font-semibold text-ka-gold">{lead}</span>
          {rest && <span className="mt-1 text-[10px] font-semibold uppercase tracking-[.34em] text-ka-cream">{rest}</span>}
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-3">
      <BrandMark logoUrl={logoUrl} size="clamp(38px,3.6vw,54px)" />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="font-display text-[clamp(23px,2vw,28px)] font-semibold tracking-[.01em] text-ka-green">{lead}</span>
        {rest && <span className="mt-0.5 text-[8.5px] font-bold uppercase tracking-[.38em] text-ka-gold-deep">{rest}</span>}
      </span>
    </span>
  );
}
