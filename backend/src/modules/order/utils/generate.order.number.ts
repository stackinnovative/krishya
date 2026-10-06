export function generateOrderNumber(prefix = "ART"): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const datePart = `${year}${month}${day}`;

  // 6-digit random number
  const randomPart = Math.floor(100000 + Math.random() * 900000);

  return `${prefix}-${datePart}-${randomPart}`;
}