import type { IEmailService } from "../../core/ports/email.service.interface.js";
import { inject, injectable } from "tsyringe";
import { Resend } from "resend";
import type {
  AdminOrderCancelledEmailData,
  AdminOrderNotificationEmailData,
  EmailData,
  OrderConfirmationEmailData,
} from "../../core/shared/types/email.type.js";
import type { ISettingsRepository } from "../../modules/settings/repositories/settings.repository.interface.js";
import { SETTINGS_DEFAULTS } from "../../modules/settings/entities/settings.entity.js";

@injectable()
export class ResendEmailService implements IEmailService {
  private readonly resend: Resend | null;
  private readonly fromAddress: string;
  private readonly adminEmail: string;

  constructor(
    @inject("ISettingsRepository")
    private readonly _settingsRepository: ISettingsRepository
  ) {
    // Same eager-construction crash class already guarded against for
    // Twilio/Razorpay/OpenAI (see config/twilio.ts etc.) - the Resend SDK
    // throws synchronously if the key is missing, and this service is
    // constructed at DI-graph resolution time (route registration), so an
    // unguarded throw here takes the whole server down on startup, not just
    // "sending an email". Guard here instead, matching this file's own
    // sendAdminOrderNotification, which already no-ops when unconfigured.
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromAddress = process.env.RESEND_FROM_EMAIL || `${SETTINGS_DEFAULTS.storeName} <onboarding@resend.dev>`;
    this.adminEmail = process.env.ADMIN_EMAIL || "";

    if (!this.resend) {
      console.warn("RESEND_API_KEY not configured - order/status emails are disabled.");
    }
  }

  /** Business name shown in every email is read live from Settings, not hardcoded,
   * so renaming the store in the admin panel updates outgoing emails immediately. */
  private async getStoreName(): Promise<string> {
    try {
      const settings = await this._settingsRepository.getSettings();
      return settings.storeName;
    } catch {
      return SETTINGS_DEFAULTS.storeName;
    }
  }

  private wrapTemplate(storeName: string, title: string, bodyHtml: string): string {
    return `
      <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:30px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <h1 style="text-align:center; color:#5e6c3c; margin-bottom:10px; text-transform:uppercase;">
            ${storeName}
          </h1>
          <h2 style="text-align:center; color:#333;">
            ${title}
          </h2>
          ${bodyHtml}
          <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
          <p style="font-size:13px; color:#888; text-align:center;">
            © ${new Date().getFullYear()} ${storeName}
            All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  async sendOrderStatusUpdate(data: EmailData): Promise<void> {
    const { to, orderNumber, status, customerName, title } = data;
    const subject = `Order Status Update: ${orderNumber}`;
    const storeName = await this.getStoreName();

    const html = this.wrapTemplate(
      storeName,
      title,
      `
        <p style="font-size:16px;">Hi <strong>${customerName}</strong>,</p>
        <p style="font-size:15px; color:#555;">
          Your order <strong>#${orderNumber}</strong> has been updated.
        </p>
        <div style="margin:20px 0; padding:15px; background:#f8f9fb; border-radius:6px;">
          <p style="margin:0; font-size:15px;">
            <strong>Order Number:</strong> #${orderNumber}
          </p>
          <p style="margin-top:10px; font-size:15px;">
            <strong>Status:</strong>
            <span style="background:#2e4d7a; color:#ffffff; padding:6px 12px; border-radius:4px; font-size:14px; margin-left:5px;">
              ${status.toUpperCase()}
            </span>
          </p>
        </div>
        <p style="font-size:15px; color:#555;">
          Thank you for shopping with <strong>${storeName}</strong>.
        </p>
      `
    );

    await this.send(to, subject, html);
  }

  async sendOrderConfirmation(data: OrderConfirmationEmailData): Promise<void> {
    const { to, orderNumber, customerName, items, subtotal, shippingFee, totalAmount, address } = data;
    const subject = `Order Confirmed: #${orderNumber}`;
    const storeName = await this.getStoreName();

    const itemsRows = items
      .map(
        (item) => `
          <tr>
            <td style="padding:8px 0; font-size:14px; color:#333;">${item.name} (${item.size}) × ${item.quantity}</td>
            <td style="padding:8px 0; font-size:14px; color:#333; text-align:right;">₹${item.price * item.quantity}</td>
          </tr>
        `
      )
      .join("");

    const html = this.wrapTemplate(
      storeName,
      "Order Confirmed",
      `
        <p style="font-size:16px;">Hi <strong>${customerName}</strong>,</p>
        <p style="font-size:15px; color:#555;">
          Thank you! Your order <strong>#${orderNumber}</strong> has been confirmed and is being prepared.
        </p>
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          ${itemsRows}
        </table>
        <div style="padding:15px; background:#f8f9fb; border-radius:6px; font-size:14px;">
          <p style="margin:0; display:flex; justify-content:space-between;">Subtotal: <strong>₹${subtotal}</strong></p>
          <p style="margin:6px 0 0; display:flex; justify-content:space-between;">Shipping: <strong>₹${shippingFee}</strong></p>
          <p style="margin:6px 0 0; font-size:16px; display:flex; justify-content:space-between;">Total: <strong>₹${totalAmount}</strong></p>
        </div>
        <p style="font-size:14px; color:#555; margin-top:20px;">
          Shipping to: ${address.addressLine1}${address.addressLine2 ? ", " + address.addressLine2 : ""}, ${address.city}, ${address.state} - ${address.pincode}
        </p>
      `
    );

    await this.send(to, subject, html);
  }

  async sendAdminOrderNotification(data: AdminOrderNotificationEmailData): Promise<void> {
    if (!this.adminEmail) {
      console.error("ADMIN_EMAIL is not configured; skipping admin order notification email.");
      return;
    }

    const { orderNumber, customerName, customerEmail, customerPhone, totalAmount, itemCount } = data;
    const subject = `New Order Placed: #${orderNumber}`;
    const storeName = await this.getStoreName();

    const html = this.wrapTemplate(
      storeName,
      "New Order Placed",
      `
        <p style="font-size:15px; color:#555;">A new order has been confirmed.</p>
        <div style="margin:20px 0; padding:15px; background:#f8f9fb; border-radius:6px; font-size:14px;">
          <p style="margin:0;"><strong>Order Number:</strong> #${orderNumber}</p>
          <p style="margin-top:8px;"><strong>Customer:</strong> ${customerName}</p>
          <p style="margin-top:8px;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="margin-top:8px;"><strong>Phone:</strong> ${customerPhone}</p>
          <p style="margin-top:8px;"><strong>Items:</strong> ${itemCount}</p>
          <p style="margin-top:8px;"><strong>Total:</strong> ₹${totalAmount}</p>
        </div>
      `
    );

    await this.send(this.adminEmail, subject, html);
  }

  async sendAdminOrderCancelled(data: AdminOrderCancelledEmailData): Promise<void> {
    if (!this.adminEmail) {
      console.error("ADMIN_EMAIL is not configured; skipping admin order-cancelled email.");
      return;
    }

    const { orderNumber, customerName, customerEmail, totalAmount, reason } = data;
    const subject = `Order Cancelled: #${orderNumber}`;
    const storeName = await this.getStoreName();

    const html = this.wrapTemplate(
      storeName,
      "Order Cancelled",
      `
        <p style="font-size:15px; color:#555;">An order has been cancelled.</p>
        <div style="margin:20px 0; padding:15px; background:#f8f9fb; border-radius:6px; font-size:14px;">
          <p style="margin:0;"><strong>Order Number:</strong> #${orderNumber}</p>
          <p style="margin-top:8px;"><strong>Customer:</strong> ${customerName}</p>
          <p style="margin-top:8px;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="margin-top:8px;"><strong>Total:</strong> ₹${totalAmount}</p>
          <p style="margin-top:8px;"><strong>Reason:</strong> ${reason}</p>
        </div>
      `
    );

    await this.send(this.adminEmail, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      console.warn(`Resend not configured; skipping email to ${to} ("${subject}").`);
      return;
    }
    try {
      const { data: responseData, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return;
      }

      console.log("Email sent via Resend. ID:", responseData?.id);
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
    }
  }
}
