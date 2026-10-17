import PDFDocument from "pdfkit";
import { inject, injectable } from "tsyringe";
import type { IInvoiceService } from "../../core/ports/invoice.service.interface.js";
import type { OrderSummaryView } from "../../modules/order/types/order.type.js";
import { formatCurrency } from "../../core/utils/format.rupees.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { ISettingsRepository } from "../../modules/settings/repositories/settings.repository.interface.js";
import { SETTINGS_DEFAULTS } from "../../modules/settings/entities/settings.entity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* Storefront palette (frontend-next globals.css "ka-" tokens), so the invoice looks like the shop it came from. */
const COLORS = {
    green: "#1f4d3a",
    gold: "#c9a24a",
    goldText: "#9a7a2e",
    cream: "#faf6ee",
    line: "#e2d8c6",
    ink: "#2e2e2e",
    body: "#4a4d45",
    muted: "#5e6b5a",
    white: "#ffffff",
};

const MARGIN = 48;
/** Space kept free at the bottom of every page for the footer - content never flows into it. */
const FOOTER_SPACE = 44;
const TABLE_HEADER_HEIGHT = 24;
/** Gap + subtotal/delivery rows + the green total bar, kept together on one page. */
const TOTALS_HEIGHT = 100;

type TextStyle = {
    font?: "Roboto" | "Roboto-Bold";
    size?: number;
    color?: string;
    width: number;
    align?: "left" | "right" | "center";
    spacing?: number;
};

const formatInvoiceDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const paymentLabel = (status: OrderSummaryView["orderStatus"]) => {
    if (status === "created") return "Payment pending";
    if (status === "cancelled") return "Cancelled";
    return "Paid online";
};

@injectable()
export class InvoiceService implements IInvoiceService {
    constructor(
        @inject("ISettingsRepository")
        private readonly _settingsRepository: ISettingsRepository
    ) { }

    async generateInvoice(order: OrderSummaryView): Promise<Buffer> {
        // Invoice branding (name, logo, contact info) is read live from
        // Settings, not hardcoded, so an admin edit shows up on the very next
        // invoice without a redeploy.
        const settings = await this._settingsRepository.getSettings().catch(() => null);
        const storeName = settings?.storeName || SETTINGS_DEFAULTS.storeName;
        const storeEmail = settings?.email || SETTINGS_DEFAULTS.email;
        const storePhone = settings?.phone || SETTINGS_DEFAULTS.phone;

        // Logo lives on Cloudinary - fetch it into a buffer up front so a slow
        // or failed fetch can fall back to a text-only header instead of
        // breaking invoice generation entirely.
        let logoBuffer: Buffer | null = null;
        if (settings?.logo?.url) {
            try {
                const res = await fetch(settings.logo.url);
                if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
            } catch {
                logoBuffer = null;
            }
        }

        // bufferPages: the footer ("Page 1 of 2") is drawn on every page once
        // the total page count is known.
        const doc = new PDFDocument({
            size: "A4",
            margin: MARGIN,
            bufferPages: true,
            info: { Title: `Invoice ${order.orderNumber}`, Author: storeName },
        });

        // Register fonts (production-safe path)
        doc.registerFont("Roboto", path.resolve(__dirname, "../../assets/fonts/Roboto-Regular.ttf"));
        doc.registerFont("Roboto-Bold", path.resolve(__dirname, "../../assets/fonts/Roboto-Bold.ttf"));

        const buffers: Uint8Array[] = [];
        doc.on("data", (chunk) => buffers.push(chunk));

        return new Promise((resolve, reject) => {
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);

            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const left = MARGIN;
            const right = pageWidth - MARGIN;
            const contentWidth = right - left;
            const contentBottom = pageHeight - MARGIN - FOOTER_SPACE;

            // Every piece of text is placed at an explicit x/y inside the
            // content area, so PDFKit never starts a page on its own - pages
            // are only added below, when the next block truly doesn't fit.
            const write = (str: string, x: number, y: number, style: TextStyle) => {
                doc.font(style.font ?? "Roboto")
                    .fontSize(style.size ?? 10)
                    .fillColor(style.color ?? COLORS.ink)
                    .text(str, x, y, { width: style.width, align: style.align ?? "left", characterSpacing: style.spacing ?? 0 });
            };
            const heightOf = (str: string, style: TextStyle) =>
                doc.font(style.font ?? "Roboto").fontSize(style.size ?? 10).heightOfString(str, { width: style.width });
            const label = (str: string, x: number, y: number, width: number, align: TextStyle["align"] = "left") =>
                write(str.toUpperCase(), x, y, { font: "Roboto-Bold", size: 7.5, color: COLORS.goldText, width, align, spacing: 1 });
            const hairline = (y: number, x1 = left, x2 = right) =>
                doc.moveTo(x1, y).lineTo(x2, y).lineWidth(0.75).strokeColor(COLORS.line).stroke();
            const accentBar = () => {
                doc.rect(0, 0, pageWidth, 6).fill(COLORS.green);
                doc.rect(0, 6, pageWidth, 1.5).fill(COLORS.gold);
            };

            /* ---------------- HEADER ---------------- */

            accentBar();
            let y = MARGIN;
            const logoSize = 44;
            let brandX = left;

            if (logoBuffer) {
                try {
                    doc.image(logoBuffer, left, y, { fit: [logoSize, logoSize] });
                    brandX = left + logoSize + 12;
                } catch {
                    // Corrupt/unsupported image format - fall back to text-only header.
                }
            }

            const brandWidth = contentWidth - (brandX - left) - 190;
            write(storeName, brandX, y + 4, { font: "Roboto-Bold", size: 20, color: COLORS.green, width: brandWidth });
            const contactLine = [storeEmail, storePhone].filter(Boolean).join("  ·  ");
            if (contactLine) write(contactLine, brandX, y + 30, { size: 9, color: COLORS.muted, width: brandWidth });

            write("INVOICE", right - 190, y, { font: "Roboto-Bold", size: 22, color: COLORS.green, width: 190, align: "right", spacing: 2 });
            write(`# ${order.orderNumber}`, right - 190, y + 30, { size: 9.5, color: COLORS.body, width: 190, align: "right" });

            y += logoSize + 18;
            hairline(y);
            y += 18;

            /* ---------------- BILLED TO / DELIVER TO / DETAILS ---------------- */

            const user = order.userSnapshot;
            const colGap = 20;
            const colWidth = (contentWidth - colGap * 2) / 3;
            const cols = [left, left + colWidth + colGap, left + (colWidth + colGap) * 2];
            const lineStyle: TextStyle = { size: 9.5, color: COLORS.body, width: colWidth };

            // Each column stacks its own lines; the block ends below the tallest one.
            const stack = (x: number, title: string, lines: { text: string; bold?: boolean }[]) => {
                label(title, x, y, colWidth);
                let cy = y + 15;
                for (const line of lines.filter((l) => l.text)) {
                    const style: TextStyle = line.bold ? { ...lineStyle, font: "Roboto-Bold", size: 10.5, color: COLORS.ink } : lineStyle;
                    write(line.text, x, cy, style);
                    cy += heightOf(line.text, style) + 3;
                }
                return cy;
            };

            const billedEnd = stack(cols[0]!, "Billed to", [
                { text: user.name, bold: true },
                { text: user.phone },
                { text: user.email },
            ]);
            const deliverEnd = stack(cols[1]!, "Deliver to", [
                { text: user.addressLine1 },
                { text: user.addressLine2 ?? "" },
                { text: `${user.city}, ${user.state} - ${user.pincode}` },
            ]);

            label("Invoice details", cols[2]!, y, colWidth);
            const details: [string, string][] = [
                ["Order date", formatInvoiceDate(order.createdAt)],
                ["Payment", paymentLabel(order.orderStatus)],
                ["Total quantity", String(order.items.reduce((sum, item) => sum + item.quantity, 0))],
            ];
            let detailsEnd = y + 15;
            for (const [name, value] of details) {
                write(name, cols[2]!, detailsEnd, { size: 9.5, color: COLORS.muted, width: colWidth / 2 });
                write(value, cols[2]! + colWidth / 2, detailsEnd, { font: "Roboto-Bold", size: 9.5, color: COLORS.ink, width: colWidth / 2, align: "right" });
                detailsEnd += 16;
            }

            y = Math.max(billedEnd, deliverEnd, detailsEnd) + 22;

            /* ---------------- ITEMS TABLE ---------------- */

            const pad = 10;
            const amountW = 80;
            const priceW = 72;
            const qtyW = 36;
            const sizeW = 70;
            const numW = 22;
            const amountX = right - pad - amountW;
            const priceX = amountX - 10 - priceW;
            const qtyX = priceX - 10 - qtyW;
            const sizeX = qtyX - 12 - sizeW;
            const numX = left + pad;
            const itemX = numX + numW;
            const itemW = sizeX - 12 - itemX;

            const drawTableHeader = (top: number) => {
                doc.rect(left, top, contentWidth, TABLE_HEADER_HEIGHT).fill(COLORS.cream);
                const ty = top + 8.5;
                label("#", numX, ty, numW);
                label("Item", itemX, ty, itemW);
                label("Size", sizeX, ty, sizeW);
                label("Qty", qtyX, ty, qtyW, "right");
                label("Price", priceX, ty, priceW, "right");
                label("Amount", amountX, ty, amountW, "right");
                return top + TABLE_HEADER_HEIGHT;
            };

            // A continuation page repeats the brand bar and table header, so
            // page 2 still reads as part of the same invoice.
            const startContinuationPage = () => {
                doc.addPage();
                accentBar();
                write(`Invoice # ${order.orderNumber} (continued)`, left, MARGIN, { size: 9, color: COLORS.muted, width: contentWidth });
                return MARGIN + 22;
            };

            y = drawTableHeader(y);

            order.items.forEach((item, index) => {
                const nameStyle: TextStyle = { font: "Roboto-Bold", size: 10, color: COLORS.ink, width: itemW };
                const rowHeight = Math.max(heightOf(item.name, nameStyle), 12) + 18;

                if (y + rowHeight > contentBottom) y = drawTableHeader(startContinuationPage());

                const ty = y + 9;
                write(String(index + 1), numX, ty, { size: 10, color: COLORS.muted, width: numW });
                write(item.name, itemX, ty, nameStyle);
                write(item.size ?? "-", sizeX, ty, { size: 10, color: COLORS.body, width: sizeW });
                write(String(item.quantity), qtyX, ty, { size: 10, color: COLORS.body, width: qtyW, align: "right" });
                write(formatCurrency(item.price), priceX, ty, { size: 10, color: COLORS.body, width: priceW, align: "right" });
                write(formatCurrency(item.price * item.quantity), amountX, ty, { font: "Roboto-Bold", size: 10, color: COLORS.ink, width: amountW, align: "right" });

                y += rowHeight;
                hairline(y);
            });

            /* ---------------- TOTALS + HELP ---------------- */

            // Totals stay in one piece: if they'd be cut by the footer they
            // move to the next page together.
            if (y + TOTALS_HEIGHT > contentBottom) y = startContinuationPage();
            y += 18;

            const totalsW = 230;
            const totalsX = right - totalsW;
            const rowLabel: TextStyle = { size: 10, color: COLORS.body, width: totalsW / 2 };
            const rowValue: TextStyle = { size: 10, color: COLORS.ink, width: totalsW / 2 - 14, align: "right" };

            write("Subtotal", totalsX + 14, y, rowLabel);
            write(formatCurrency(order.subtotal), totalsX + totalsW / 2, y, rowValue);
            write("Delivery", totalsX + 14, y + 20, rowLabel);
            write(order.shippingFee === 0 ? "Free" : formatCurrency(order.shippingFee), totalsX + totalsW / 2, y + 20, rowValue);

            const totalY = y + 44;
            doc.roundedRect(totalsX, totalY, totalsW, 38, 6).fill(COLORS.green);
            write("Total", totalsX + 14, totalY + 13, { font: "Roboto-Bold", size: 11, color: COLORS.white, width: totalsW / 2 });
            write(formatCurrency(order.totalAmount), totalsX + totalsW / 2, totalY + 10.5, {
                font: "Roboto-Bold",
                size: 15,
                color: COLORS.white,
                width: totalsW / 2 - 14,
                align: "right",
            });

            const helpW = totalsX - left - 30;
            if (contactLine) {
                label("Need help with this order?", left, y, helpW);
                write(`Reach us at ${[storeEmail, storePhone].filter(Boolean).join(" or ")} and quote invoice # ${order.orderNumber}.`, left, y + 15, {
                    size: 9.5,
                    color: COLORS.body,
                    width: helpW,
                });
            }

            /* ---------------- FOOTER (every page) ---------------- */

            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                // The footer sits inside the bottom margin; dropping the margin
                // while drawing it stops PDFKit from treating that as overflow
                // and adding an empty page.
                doc.page.margins.bottom = 0;
                const footerY = pageHeight - MARGIN - 22;
                hairline(footerY - 10);
                write(`Thank you for shopping with ${storeName}.`, left, footerY, {
                    font: "Roboto-Bold",
                    size: 9,
                    color: COLORS.green,
                    width: contentWidth - 100,
                });
                write("This is a system-generated invoice. No signature required.", left, footerY + 13, {
                    size: 8,
                    color: COLORS.muted,
                    width: contentWidth - 100,
                });
                write(`Page ${i - range.start + 1} of ${range.count}`, right - 100, footerY, {
                    size: 8,
                    color: COLORS.muted,
                    width: 100,
                    align: "right",
                });
            }

            doc.end();
        });
    }
}
