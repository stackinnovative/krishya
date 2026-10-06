/** Thin wrapper so destructive admin actions (delete, block) get a native
 * confirm prompt - a safety net that adds no visual footprint, so it
 * doesn't deviate from the imported design. */
export const confirmAction = (message: string): boolean => {
  if (typeof window === "undefined") return true;
  return window.confirm(message);
};
