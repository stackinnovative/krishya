"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/modules/storefront-shell/components/icons";
import type { TestimonialView } from "@/modules/home-content/types/home-content.type";

const INTERVAL_MS = 4500;
/** Slides further than this from the centre are faded out - they're where the loop wraps around, out of sight. */
const VISIBLE_RANGE = 1;
/** The loop needs at least this many slides so the wrap-around always happens off-screen. */
const MIN_SLIDES = 5;

/** Shortest signed distance from the centre slide, so the ring of slides wraps both ways. */
const offsetFrom = (index: number, active: number, count: number) => {
  let d = (index - active) % count;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
};

/**
 * Customer quotes as a looping carousel that moves right-to-left on its own.
 * The centre card is enlarged and switches to the deep green highlight; its
 * neighbours sit smaller and faded on either side (peeking in on phones).
 * Pauses while hovered, focused, touched or when the tab is hidden, never
 * auto-plays for people who turned off animations, and has a pause button.
 */
export default function TestimonialCarousel({ testimonials }: { testimonials: TestimonialView[] }) {
  const count = testimonials.length;
  // Repeat short lists so slides can wrap around out of view (3 quotes -> 6 slides).
  const slides = count > 1 && count < MIN_SLIDES ? Array.from({ length: Math.ceil(MIN_SLIDES / count) * count }, (_, i) => testimonials[i % count]!) : testimonials;
  const total = slides.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const touchStart = useRef<number | null>(null);

  const go = useCallback((step: number) => setActive((a) => (a + step + total) % total), [total]);
  const goToQuote = (quote: number) => setActive((a) => a - (a % count) + quote);

  const autoPlay = count > 1 && !paused && !hovering && !userPaused && !reducedMotion;

  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => go(1), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoPlay, go]);

  // Don't keep turning while nobody can see it.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHovering(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
        setHovering(true);
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        const end = e.changedTouches[0]?.clientX;
        touchStart.current = null;
        setHovering(false);
        if (start === null || end === undefined || Math.abs(end - start) < 40) return;
        go(end < start ? 1 : -1);
      }}
      className="relative"
    >
      {/* Every slide sits in the same grid cell, so the stage is as tall as the longest quote and nothing jumps.
          On phones it runs edge to edge (cancelling the page padding) so the neighbours peek in; from laptop width
          the edges fade out instead of cutting a card off mid-word. */}
      <div className="-mx-[clamp(20px,4vw,56px)] grid touch-pan-y select-none overflow-hidden py-4 [grid-template-areas:'stack'] [&>*]:[grid-area:stack] ka:mx-0 ka:[mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]">
        {slides.map((t, i) => {
          const offset = count === 1 ? 0 : offsetFrom(i, active, total);
          const isCenter = offset === 0;
          const shown = Math.abs(offset) <= VISIBLE_RANGE;
          // Only the first copy of each quote is announced; repeats exist just for the loop.
          const isCopy = i >= count;
          return (
            <figure
              key={i}
              aria-roledescription="slide"
              aria-label={`${(i % count) + 1} of ${count}`}
              aria-hidden={isCopy || !isCenter}
              onClick={() => !isCenter && shown && go(offset)}
              style={{
                transform: `translateX(calc(${offset} * (100% + var(--gap)))) scale(${isCenter ? 1 : 0.86})`,
                // Shrink side cards toward the centre so the edge that peeks in stays put.
                transformOrigin: offset > 0 ? "left center" : offset < 0 ? "right center" : "center",
                opacity: shown ? (isCenter ? 1 : 0.55) : 0,
                zIndex: isCenter ? 2 : 1,
              }}
              className={`m-0 flex w-[min(72vw,420px)] flex-col gap-[18px] justify-self-center rounded-2xl px-[26px] py-7 [--gap:14px] sm:[--gap:24px] transition-[transform,transform-origin,opacity,background-color,box-shadow] duration-700 ease-[cubic-bezier(.22,.8,.3,1)] motion-reduce:transition-none ${
                isCenter ? "bg-ka-green shadow-[0_18px_40px_-18px_rgba(31,77,58,.55)]" : "cursor-pointer bg-ka-sand"
              } ${shown ? "" : "pointer-events-none"}`}
            >
              <span aria-hidden="true" className="h-[22px] font-display text-[56px] leading-[.6] text-ka-gold">
                &ldquo;
              </span>
              <blockquote
                className={`m-0 flex-1 text-pretty break-words font-display text-[21px] italic leading-[1.4] transition-colors duration-700 ${isCenter ? "text-ka-cream" : "text-ka-green"}`}
              >
                {t.comment}
              </blockquote>
              <figcaption
                className={`break-words border-t pt-4 text-[14.5px] font-semibold transition-colors duration-700 ${isCenter ? "border-ka-gold/60 text-ka-cream" : "border-ka-gold/50 text-ka-ink"}`}
              >
                {t.author}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="hidden h-10 w-10 place-items-center rounded-full border border-ka-sage text-ka-green hover:bg-ka-mint ka:grid"
          >
            <ChevronLeftIcon size={18} />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((t, q) => {
              const current = active % count === q;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => goToQuote(q)}
                  aria-label={`Show testimonial ${q + 1} of ${count}`}
                  aria-current={current || undefined}
                  className="grid h-6 place-items-center"
                >
                  <span className={`block h-2 rounded-full transition-all duration-500 ${current ? "w-6 bg-ka-green" : "w-2 bg-ka-sage"}`} />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="hidden h-10 w-10 place-items-center rounded-full border border-ka-sage text-ka-green hover:bg-ka-mint ka:grid"
          >
            <ChevronRightIcon size={18} />
          </button>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Play testimonials" : "Pause testimonials"}
              className="ml-1 grid h-8 w-8 place-items-center rounded-full text-ka-muted hover:bg-ka-mint hover:text-ka-green"
            >
              {userPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
