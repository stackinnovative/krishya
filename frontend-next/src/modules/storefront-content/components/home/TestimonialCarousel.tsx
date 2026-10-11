"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TestimonialView } from "@/modules/home-content/types/home-content.type";

const INTERVAL_MS = 4500;
/** Slides further than this from the centre are faded out - they're where the loop wraps around, out of sight. */
const VISIBLE_RANGE = 1;
/** The loop needs at least this many slides so the wrap-around always happens off-screen. */
const MIN_SLIDES = 5;
/** A drag shorter than this is treated as a tap, not a swipe. */
const DRAG_THRESHOLD = 40;
/** Sideways wheel/trackpad travel that moves one card, and the pause before the next one can. */
const WHEEL_STEP = 50;
const WHEEL_COOLDOWN_MS = 450;

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
 *
 * Moved by hand too: drag with a finger or the mouse (the cards follow, then
 * snap to the nearest one), or scroll sideways on a trackpad / mouse wheel.
 * Auto-play pauses while a pointer is on it or the tab is hidden, and never
 * runs for people who turned off animations.
 */
export default function TestimonialCarousel({ testimonials }: { testimonials: TestimonialView[] }) {
  const count = testimonials.length;
  // Repeat short lists so slides can wrap around out of view (3 quotes -> 6 slides).
  const slides = count > 1 && count < MIN_SLIDES ? Array.from({ length: Math.ceil(MIN_SLIDES / count) * count }, (_, i) => testimonials[i % count]!) : testimonials;
  const total = slides.length;

  const [active, setActive] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [dragPx, setDragPx] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; startX: number; moved: boolean } | null>(null);
  const wheel = useRef({ sum: 0, lockedUntil: 0 });
  /** Set for the click that follows a drag, so ending a drag never also "taps" a card. */
  const suppressClick = useRef(false);

  const go = useCallback((step: number) => setActive((a) => (((a + step) % total) + total) % total), [total]);
  const goToQuote = (quote: number) => setActive((a) => a - (a % count) + quote);
  const cardWidth = () => (stageRef.current?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 300;

  const dragging = dragPx !== null;
  const autoPlay = count > 1 && !hidden && !hovering && !dragging && !reducedMotion;

  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => go(1), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoPlay, go]);

  // Don't keep turning while nobody can see it.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Sideways trackpad / wheel scrolling. Attached natively (not via React) so it can stop the
  // browser's own back/forward swipe - and only for sideways motion, so the page still scrolls normally.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || count < 2) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const w = wheel.current;
      if (Date.now() < w.lockedUntil) return;
      w.sum += e.deltaX;
      if (Math.abs(w.sum) >= WHEEL_STEP) {
        go(w.sum > 0 ? 1 : -1);
        w.sum = 0;
        w.lockedUntil = Date.now() + WHEEL_COOLDOWN_MS;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [count, go]);

  const endDrag = (clientX: number | null) => {
    const d = drag.current;
    drag.current = null;
    setDragPx(null);
    if (!d || clientX === null) return;
    if (d.moved) {
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 0);
    }
    const dx = clientX - d.startX;
    if (Math.abs(dx) < DRAG_THRESHOLD) return;
    // A long drag can skip a card; anything past the threshold moves at least one.
    const steps = Math.max(1, Math.min(2, Math.round(Math.abs(dx) / cardWidth())));
    go(dx < 0 ? steps : -steps);
  };

  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials - drag or swipe to see more"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHovering(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      className="relative"
    >
      {/* Every slide sits in the same grid cell, so the stage is as tall as the longest quote and nothing jumps.
          On phones it runs edge to edge (cancelling the page padding) so the neighbours peek in; from laptop width
          the edges fade out instead of cutting a card off mid-word. The extra bottom padding leaves room for the
          centre card's shadow. */}
      <div
        ref={stageRef}
        onPointerDown={(e) => {
          if (count < 2 || (e.pointerType === "mouse" && e.button !== 0)) return;
          drag.current = { id: e.pointerId, startX: e.clientX, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const dx = e.clientX - d.startX;
          if (!d.moved && Math.abs(dx) < 6) return;
          if (!d.moved) {
            d.moved = true;
            // Keep receiving moves even if the pointer leaves the stage mid-drag.
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* pointer already released */
            }
          }
          setDragPx(dx);
        }}
        onPointerUp={(e) => drag.current?.id === e.pointerId && endDrag(e.clientX)}
        onPointerCancel={() => endDrag(null)}
        onClickCapture={(e) => {
          // The click that ends a drag shouldn't also count as tapping a card.
          if (suppressClick.current) e.stopPropagation();
        }}
        className={`-mx-[clamp(20px,4vw,56px)] grid touch-pan-y select-none overflow-hidden pb-12 pt-4 [grid-template-areas:'stack'] [&>*]:[grid-area:stack] ka:mx-0 ka:[mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)] ${
          count > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
      >
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
                transform: `translateX(calc(${offset} * (100% + var(--gap)) + ${dragPx ?? 0}px)) scale(${isCenter ? 1 : 0.86})`,
                // Shrink side cards toward the centre so the edge that peeks in stays put.
                transformOrigin: offset > 0 ? "left center" : offset < 0 ? "right center" : "center",
                opacity: shown ? (isCenter ? 1 : 0.55) : 0,
                zIndex: isCenter ? 2 : 1,
                // Follow the finger exactly while dragging; glide everywhere else.
                transitionDuration: dragging ? "0ms" : undefined,
              }}
              className={`m-0 flex w-[min(72vw,420px)] flex-col gap-[18px] justify-self-center rounded-2xl px-[26px] py-7 [--gap:14px] sm:[--gap:24px] transition-[transform,transform-origin,opacity,background-color,box-shadow] duration-700 ease-[cubic-bezier(.22,.8,.3,1)] motion-reduce:transition-none ${
                isCenter ? "bg-ka-green shadow-[0_18px_40px_-18px_rgba(31,77,58,.55)]" : "bg-ka-sand"
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
        <div className="-mt-6 flex items-center justify-center gap-2">
          {testimonials.map((t, q) => {
            const current = active % count === q;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => goToQuote(q)}
                aria-label={`Show testimonial ${q + 1} of ${count}`}
                aria-current={current || undefined}
                className="grid h-6 place-items-center px-0.5"
              >
                <span className={`block h-2 rounded-full transition-all duration-500 ${current ? "w-6 bg-ka-green" : "w-2 bg-ka-sage"}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
