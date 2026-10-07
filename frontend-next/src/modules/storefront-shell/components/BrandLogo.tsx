import Image from "next/image";

/**
 * The Krishay mark: the supplied logo artwork cropped to its mortar-and-herbs
 * emblem inside a gold-ringed green disc (the design zooms the artwork 1.8x
 * from its top so the "Krishay" lettering in the file is cropped out and
 * set as live text beside it instead).
 */
export function BrandMark({ size, ring = "#C9A24A" }: { size: number | string; ring?: string }) {
  return (
    <span
      className="relative block flex-none overflow-hidden rounded-full bg-ka-green"
      style={{ width: size, height: size, boxShadow: `0 0 0 1.5px ${ring}` }}
    >
      <Image
        src="/brand/krishay-logo.png"
        alt=""
        fill
        sizes="64px"
        className="object-cover"
        style={{ objectPosition: "50% 0", transform: "scale(1.8)", transformOrigin: "47% 22%" }}
        priority
      />
    </span>
  );
}

/** Mark + "Krishay / AYURVEDA" wordmark. `tone="dark"` is the footer (gold on green). */
export default function BrandLogo({ tone = "light" }: { tone?: "light" | "dark" }) {
  if (tone === "dark") {
    return (
      <span className="flex items-center gap-3.5">
        <BrandMark size={64} ring="rgba(201,162,74,.6)" />
        <span className="flex flex-col leading-none">
          <span className="font-display text-[30px] font-semibold text-ka-gold">Krishay</span>
          <span className="mt-1 text-[10px] font-semibold tracking-[.34em] text-ka-cream">AYURVEDA</span>
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-3">
      <BrandMark size="clamp(38px,3.6vw,54px)" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[clamp(23px,2vw,28px)] font-semibold tracking-[.01em] text-ka-green">Krishay</span>
        <span className="mt-0.5 text-[8.5px] font-bold tracking-[.38em] text-ka-gold-deep">AYURVEDA</span>
      </span>
    </span>
  );
}
