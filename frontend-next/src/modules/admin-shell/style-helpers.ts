import type { CSSProperties } from "react";

/** Ported 1:1 from the Claude Design "Admin Dashboard" mockup's style helpers,
 * so every admin screen matches the design exactly. Keep in sync with
 * design/Admin Dashboard.dc.html if the design is revised. */

export const TH: Record<string, string> = {
  gold: "linear-gradient(135deg,#d9b25a,#f5e2a0 60%,#c69a3a)",
  teal: "linear-gradient(135deg,#1f7a86,#3fb0b8 60%,#0f5560)",
  ruby: "linear-gradient(135deg,#e9c9b8,#f6e3d6 55%,#b8412f)",
  ivory: "linear-gradient(135deg,#efe3d2,#fbf5ea 60%,#d6c3a3)",
  sage: "linear-gradient(135deg,#9fb89a,#d3e2cf 60%,#6f8f6b)",
  plum: "linear-gradient(135deg,#8a5a7a,#c9a2bd 60%,#5f3a55)",
};

export const SWATCHES: [string, string][] = [
  ["Gold", "#d4af37"],
  ["Rose Gold", "#b76e79"],
  ["Silver", "#c0c0c0"],
  ["Antique", "#8b6b3d"],
  ["Ruby", "#b8412f"],
  ["Emerald", "#2e8b57"],
  ["Teal", "#1f7a86"],
  ["Black", "#222222"],
];

export const toneForIndex = (i: number) => ["gold", "teal", "ruby", "sage", "plum"][i % 5]!;

export function pill(active: boolean): CSSProperties {
  return active
    ? { background: "#141414", color: "#fff", border: "1px solid #141414", borderRadius: 999, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }
    : { background: "#fff", color: "#141414", border: "1px solid #e6e6e3", borderRadius: 999, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };
}

export function tab(active: boolean): CSSProperties {
  return active
    ? { background: "#141414", color: "#fff", border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }
    : { background: "transparent", color: "#555", border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" };
}

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "blue" | "grey"> = {
  Active: "green", Delivered: "green", Approved: "green", Published: "green", Paid: "green",
  Pending: "amber", Processing: "amber", Draft: "amber",
  Shipped: "blue", Scheduled: "blue",
  Cancelled: "red", Blocked: "red",
  Inactive: "grey", Hidden: "grey",
};

const STATUS_COLORS: Record<string, [string, string]> = {
  green: ["#e4f7e8", "#2e9e4b"],
  amber: ["#fdf0dc", "#c27a12"],
  red: ["#fde8e4", "#d6432f"],
  blue: ["#e3edfb", "#2f6fd6"],
  grey: ["#eeeeec", "#666"],
};

export function statusStyle(s: string): CSSProperties {
  const tone = STATUS_TONE[s] ?? "grey";
  const [bg, fg] = STATUS_COLORS[tone]!;
  return { display: "inline-block", background: bg, color: fg, borderRadius: 999, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };
}

export function delta(n: number): { text: string; style: CSSProperties } {
  const up = n >= 0;
  return {
    text: (up ? "+" : "") + n + "%",
    style: { background: up ? "#e4f7e8" : "#fde8e4", color: up ? "#2e9e4b" : "#d6432f", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 700 },
  };
}

export function barColor(v: number, max: number) {
  const r = v / max;
  return r < 0.4 ? "#f7a072" : r < 0.7 ? "#f8d77a" : "#b5e36e";
}

export const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12, border: "1px solid #e6e6e3",
  background: "#fafaf8", fontSize: 13, color: "#141414", outline: "none", fontWeight: 500,
};

export const wizardInputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid #e6e6e3",
  background: "#fff", fontSize: 13, color: "#141414", outline: "none", fontWeight: 500,
};

export const iconButtonStyle: CSSProperties = {
  width: 32, height: 32, borderRadius: 10, border: "1px solid #ececea", background: "#fff",
  display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555",
};

export const dangerIconButtonStyle: CSSProperties = { ...iconButtonStyle, color: "#e5533f" };

export const blackPillButton: CSSProperties = {
  background: "#141414", color: "#fff", border: "none", borderRadius: 999, padding: "10px 18px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
};

export const whitePillButton: CSSProperties = {
  background: "#fff", border: "1px solid #e6e6e3", borderRadius: 999, padding: "11px 18px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
};

export const softPillButton: CSSProperties = {
  background: "#f3f3f1", border: "none", borderRadius: 999, padding: "7px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
};

export const dangerPillButton: CSSProperties = {
  background: "#fde8e4", color: "#e5533f", border: "none", borderRadius: 999, padding: "7px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
};
