import type { TestimonialView } from "@/modules/home-content/types/home-content.type";

/**
 * A CSS keyframe auto-marquee only looks right once there's enough unique
 * content to exceed the viewport width - with a handful of testimonials the
 * loop repeats before the first pass is off-screen, so the same card is
 * visible twice at once. A manual scroll-snap strip has no such failure
 * mode: it's a plain row when content is short, and swipeable once there's
 * more - stable at any item count, no animation to get wrong.
 */
export default function TestimonialMarquee({ testimonials }: { testimonials: TestimonialView[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-14">
      <h2 className="mb-6 px-4 text-center font-serif text-2xl font-semibold">What customers say</h2>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4">
        {testimonials.map((t) => (
          <div key={t.id} className="w-72 flex-none snap-start rounded-2xl p-5" style={{ background: "var(--bg-secondary)" }}>
            <p className="text-sm leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
            <div className="mt-3 text-sm font-semibold">{t.author}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
