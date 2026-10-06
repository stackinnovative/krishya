"use client";

/** Dot-indicator nav shared by every storefront carousel (Hero, Banners, ...). Hides itself below 2 slides. */
export default function CarouselDots({
  count,
  active,
  onSelect,
  keys,
}: {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  keys?: string[];
}) {
  if (count < 2) return null;

  return (
    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={keys?.[i] ?? i}
          onClick={() => onSelect(i)}
          aria-label={`Show slide ${i + 1}`}
          className="h-1.5 rounded-full transition-all"
          style={{ width: i === active ? 22 : 8, background: i === active ? "#fff" : "rgba(255,255,255,.5)" }}
        />
      ))}
    </div>
  );
}
