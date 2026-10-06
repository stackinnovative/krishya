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

        const doc = new PDFDocument({ margin: 50 });
        const labelX = 350;
        const valueX = 470;

        // Register fonts (production-safe path)
        doc.registerFont(
            "Roboto",
            path.resolve(__dirname, "../../assets/fonts/Roboto-Regular.ttf")
        );

        doc.registerFont(
            "Roboto-Bold",
            path.resolve(__dirname, "../../assets/fonts/Roboto-Bold.ttf")
        );

        doc.font("Roboto");

        const buffers: Uint8Array[] = [];
        doc.on("data", (chunk) => buffers.push(chunk));

        return new Promise((resolve, reject) => {

            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);

            const accent = "#5e6c3c";
            const pageWidth = doc.page.width - 100;

            /* ---------------- HEADER ---------------- */

            const logoSize = 45;
            let textStartX = 50;

            if (logoBuffer) {
                try {
                    doc.image(logoBuffer, 50, 45, { fit: [logoSize, logoSize] });
                    textStartX = 50 + logoSize + 12;
                } catch {
                    // Corrupt/unsupported image format - fall back to text-only header.
                }
            }

            doc
                .font("Roboto-Bold")
                .fontSize(22)
                .fillColor(accent)
                .text(storeName.toUpperCase(), textStartX, doc.y, { width: pageWidth - (textStartX - 50) });

            const contactLine = [storeEmail, storePhone].filter(Boolean).join("   |   ");
            if (contactLine) {
                doc
                    .font("Roboto")
                    .fontSize(9)
                    .fillColor("gray")
                    .text(contactLine, textStartX, doc.y + 2);
            }

            doc
                .font("Roboto-Bold")
                .fontSize(18)
                .fillColor("black")
                .text("INVOICE", { align: "right" });

            doc.y = Math.max(doc.y, 45 + logoSize);
            doc.moveDown(1.5);

            /* ---------------- ORDER META ---------------- */

            doc
                .font("Roboto")
                .fontSize(11)
                .fillColor("black")
                .text(`Invoice No: ${order.orderNumber}`)
                .text(`Order ID: ${order.id}`)
                .text(`Date: ${new Date(order.createdAt).toDateString()}`);

            doc.moveDown(1.5);

            /* ---------------- BILLING DETAILS ---------------- */

            doc
                .font("Roboto-Bold")
                .fontSize(14)
                .fillColor(accent)
                .text("Billing Details");

            doc.moveDown(0.5);

            const user = order.userSnapshot;

            doc
                .font("Roboto")
                .fontSize(11)
                .fillColor("black")
                .text(user.name)
                .text(user.email)
                .text(user.phone)
                .text(user.addressLine1)
                .text(user.addressLine2 || "")
                .text(`${user.city}, ${user.state} - ${user.pincode}`);

            doc.moveDown(2);

            /* ---------------- TABLE HEADER ---------------- */

            let position = doc.y;

            const itemX = 50;
            const sizeX = 260;
            const qtyX = 320;
            const priceX = 380;
            const totalX = 450;

            doc
                .rect(50, position - 5, pageWidth, 20)
                .fill(accent);

            doc
                .font("Roboto-Bold")
                .fillColor("white")
                .fontSize(11)
                .text("Product", itemX, position)
                .text("Size", sizeX, position)
                .text("Qty", qtyX, position)
                .text("Price", priceX, position)
                .text("Total", totalX, position);

            position += 25;

            /* ---------------- TABLE BODY ---------------- */

            doc.font("Roboto").fillColor("black");

            for (const item of order.items) {

                // Auto page break
                if (position > doc.page.height - 120) {
                    doc.addPage();
                    position = 50;
                }

                const total = item.price * item.quantity;

                const productHeight = doc.heightOfString(
                    item.name,
                    { width: 200 }
                );

                doc
                    .fontSize(10)
                    .text(item.name, itemX, position, { width: 200 })
                    .text(item.size ?? "", sizeX, position)
                    .text(item.quantity.toString(), qtyX, position)
                    .text(formatCurrency(item.price), priceX, position)
                    .text(formatCurrency(total), totalX, position);

                position += productHeight + 10;
            }

            /* ---------------- TOTALS SECTION ---------------- */

            position += 20;

            doc
                .moveTo(300, position)
                .lineTo(doc.page.width - 50, position)
                .stroke();

            position += 10;

            doc
                .font("Roboto")
                .fontSize(11)
                .text("Subtotal:", labelX, position)
                .text(formatCurrency(order.subtotal), valueX, position);

            position += 20;

            doc
                .text("Shipping:", labelX, position)
                .text(
                    order.shippingFee === 0
                        ? "Free"
                        : formatCurrency(order.shippingFee),
                    valueX,
                    position
                );

            position += 25;

            doc
                .font("Roboto-Bold")
                .fontSize(13)
                .fillColor(accent)
                .text("Grand Total:", labelX, position)
                .text(formatCurrency(order.totalAmount), valueX, position);

            /* ---------------- FOOTER ---------------- */


            const footerY = doc.page.height - 80; // fixed bottom margin

            doc
                .font("Roboto")
                .fontSize(11)
                .fillColor("gray")
                .text(
                    `Thank you for shopping with ${storeName}.`,
                    50,
                    footerY,
                    { align: "center", width: doc.page.width - 100 }
                );

            doc
                .fontSize(9)
                .fillColor("#888888")
                .text(
                    "This is a system-generated invoice. No signature required.",
                    50,
                    footerY + 18,
                    { align: "center", width: doc.page.width - 100 }
                );

            doc
                .fontSize(9)
                .fillColor("#888888")
                .text(
                    "End of Document",
                    50,
                    footerY + 25,
                    { align: "center", width: doc.page.width - 100 }
                );

            doc.end();
        });
    }
}