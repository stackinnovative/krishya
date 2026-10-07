import { HerbSprig, LeafIcon } from "./icons";

const WAVE_PATHS = {
  a: "M0,46 C220,86 520,6 820,26 C1100,44 1280,12 1440,30 L1440,80 L0,80 Z",
  b: "M0,22 C300,2 560,70 900,52 C1160,38 1320,10 1440,40 L1440,80 L0,80 Z",
} as const;

/** Curved join between two section colours: `from` is the section above, `to` the one below. */
export function Wave({ from, to, shape = "a" }: { from: string; to: string; shape?: keyof typeof WAVE_PATHS }) {
  return (
    <div aria-hidden="true" className="ka-wave" style={{ background: from }}>
      <svg width="100%" height="100%" viewBox="0 0 1440 80" preserveAspectRatio="none" className="block">
        <path d={WAVE_PATHS[shape]} fill={to} />
      </svg>
    </div>
  );
}

/**
 * The four background ornament sets the design rotates through behind its
 * sections (rings, dot grid, herb sprig). The parent must be
 * `relative isolate overflow-clip` so these sit behind content and never
 * cause horizontal scroll.
 */
export function SectionDecor({ variant, dark = false }: { variant: "a" | "b" | "c" | "d"; dark?: boolean }) {
  const ringGreen = dark ? "rgba(201,162,74,.22)" : "rgba(31,77,58,.08)";
  const ringGold = dark ? "rgba(201,162,74,.3)" : "rgba(201,162,74,.28)";
  const base = "pointer-events-none absolute -z-10";

  if (variant === "a") {
    return (
      <>
        <HerbSprig className={`${base} right-[2%] top-[18px]`} style={{ color: dark ? "rgba(201,162,74,.22)" : "rgba(31,77,58,.08)" }} />
        <span aria-hidden="true" className={`${base} bottom-[-200px] left-[8%] h-[300px] w-[300px] rounded-full`} style={{ border: `1.5px solid ${ringGold}` }} />
      </>
    );
  }
  if (variant === "b") {
    return (
      <>
        <span
          aria-hidden="true"
          className={`${base} left-[3%] top-7 h-[110px] w-[150px]`}
          style={{ backgroundImage: "radial-gradient(rgba(31,77,58,.14) 1.3px, transparent 1.6px)", backgroundSize: "16px 16px" }}
        />
        <span aria-hidden="true" className={`${base} right-[-180px] top-[-220px] h-[440px] w-[440px] rounded-full`} style={{ border: `2px solid ${ringGreen}` }} />
      </>
    );
  }
  if (variant === "c") {
    return (
      <>
        <span
          aria-hidden="true"
          className={`${base} bottom-[-200px] right-[-120px] h-[380px] w-[380px] rounded-full`}
          style={{ background: dark ? "rgba(255,255,255,.03)" : "rgba(169,196,160,.14)" }}
        />
        <HerbSprig size={150} className={`${base} bottom-4 left-[2%]`} style={{ color: ringGold }} />
        <span aria-hidden="true" className={`${base} left-[40%] top-[-70px] h-[180px] w-[180px] rounded-full`} style={{ border: `1.5px solid ${dark ? "rgba(201,162,74,.22)" : ringGreen}` }} />
      </>
    );
  }
  return (
    <>
      <span aria-hidden="true" className={`${base} left-[-220px] top-[-300px] h-[520px] w-[520px] rounded-full`} style={{ border: `2px solid ${ringGreen}` }} />
      <span aria-hidden="true" className={`${base} bottom-[-120px] right-[-60px] h-[220px] w-[220px] rounded-full`} style={{ border: `1.5px solid ${ringGold}` }} />
    </>
  );
}

/** Small uppercase kicker with gold rules ("Most loved", "Journal", ...). */
export function Eyebrow({ children, centered = false, className = "" }: { children: React.ReactNode; centered?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[.22em] text-ka-green ${className}`}>
      <span className="h-px w-8 flex-none bg-ka-gold" />
      {children}
      {centered && <span className="h-px w-8 flex-none bg-ka-gold" />}
    </div>
  );
}

/** Gold rule - leaf - gold rule, used above centred section titles. */
export function LeafDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-10 bg-ka-gold" />
      <LeafIcon size={20} strokeWidth={1.3} className="text-ka-green" />
      <span className="h-px w-10 bg-ka-gold" />
    </div>
  );
}

/** Shared serif section title size used by every storefront section. */
export const SECTION_TITLE = "m-0 font-display text-[clamp(34px,3.6vw,52px)] font-medium leading-[1.08] text-ka-green";

/** Standard page gutter + max width wrapper. */
export const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 sm:px-[clamp(20px,4vw,56px)]";
