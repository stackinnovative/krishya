export const formatCurrency = (amount: number, currency = "₹") =>
  `${currency}${Math.round(amount).toLocaleString("en-IN")}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
