/**
 * Scrolls the first invalid field (any element marked `data-invalid="true"`
 * - FormField sets this on its wrapping <label>, ColorEditor's size/price/
 * qty/image error containers do the same) into view, so a failed Next/Save
 * doesn't just flash a toast while the actual problem sits off-screen.
 *
 * Deferred to the next animation frame because the caller just ran
 * `setState` to populate the error(s) - React hasn't committed that DOM
 * update yet when this is invoked synchronously afterward, so the
 * `[data-invalid="true"]` markers we're querying for don't exist yet.
 */
export function scrollToFirstError() {
  requestAnimationFrame(() => {
    document.querySelector('[data-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
