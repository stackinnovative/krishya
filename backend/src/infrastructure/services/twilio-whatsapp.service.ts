import { injectable } from "tsyringe";
import { twilioClient } from "../../config/twilio.js";
import type { IWhatsAppService } from "../../core/ports/whatsapp.service.interface.js";
import type { AdminOrderAlertWhatsAppData, OrderConfirmationWhatsAppData } from "../../core/shared/types/whatsapp.type.js";

@injectable()
export class TwilioWhatsAppService implements IWhatsAppService {
  private readonly fromNumber: string;
  private readonly defaultCountryCode: string;
  private readonly orderConfirmationTemplateSid: string;
  private readonly adminOrderAlertTemplateSid: string;
  private readonly adminWhatsAppNumber: string;

  constructor() {
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "";
    this.defaultCountryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "+91";
    this.orderConfirmationTemplateSid = process.env.TWILIO_ORDER_CONFIRMATION_TEMPLATE_SID || "";
    this.adminOrderAlertTemplateSid = process.env.TWILIO_ADMIN_ORDER_ALERT_TEMPLATE_SID || "";
    this.adminWhatsAppNumber = process.env.ADMIN_WHATSAPP_NUMBER || "";
  }

  async sendOrderConfirmation(data: OrderConfirmationWhatsAppData): Promise<void> {
    if (!twilioClient) {
      console.error("Twilio is not configured; skipping WhatsApp order confirmation.");
      return;
    }

    if (!this.fromNumber) {
      console.error("TWILIO_WHATSAPP_NUMBER is not configured; skipping WhatsApp order confirmation.");
      return;
    }

    if (!this.orderConfirmationTemplateSid) {
      console.error("TWILIO_ORDER_CONFIRMATION_TEMPLATE_SID is not configured; skipping WhatsApp order confirmation.");
      return;
    }

    const to = this.formatPhoneNumber(data.to);
    if (!to) {
      console.error(`Invalid phone number for order #${data.orderNumber}; skipping WhatsApp order confirmation.`);
      return;
    }

    try {
      // Business-initiated WhatsApp messages must use an approved Content
      // Template. This template is a fixed test message with no variables;
      // once the real order-confirmation template is approved, pass its
      // variables here via contentVariables (JSON string of "1", "2", ...).
      const message = await twilioClient.messages.create({
        from: this.toWhatsAppAddress(this.fromNumber),
        to: this.toWhatsAppAddress(to),
        contentSid: this.orderConfirmationTemplateSid,
      });

      console.log("WhatsApp order confirmation sent. SID:", message.sid);
    } catch (error) {
      console.error(`Failed to send WhatsApp order confirmation for #${data.orderNumber}:`, error);
    }
  }

  async sendAdminOrderAlert(data: AdminOrderAlertWhatsAppData): Promise<void> {
    if (!twilioClient) {
      console.error("Twilio is not configured; skipping WhatsApp admin order alert.");
      return;
    }

    if (!this.fromNumber) {
      console.error("TWILIO_WHATSAPP_NUMBER is not configured; skipping WhatsApp admin order alert.");
      return;
    }

    if (!this.adminOrderAlertTemplateSid) {
      console.error("TWILIO_ADMIN_ORDER_ALERT_TEMPLATE_SID is not configured; skipping WhatsApp admin order alert.");
      return;
    }

    const to = this.formatPhoneNumber(this.adminWhatsAppNumber);
    if (!to) {
      console.error("ADMIN_WHATSAPP_NUMBER is not configured or invalid; skipping WhatsApp admin order alert.");
      return;
    }

    try {
      // Template body is "New order received! Order ID: {{1}}, Customer:
      // {{2}}, Amount: ₹{{3}}" with a "View Order" button linking to
      // https://artspaces.in/admin/orderDetails/{{4}} - {{4}} is the raw
      // order _id (the admin details page route param), not orderNumber.
      const message = await twilioClient.messages.create({
        from: this.toWhatsAppAddress(this.fromNumber),
        to: this.toWhatsAppAddress(to),
        contentSid: this.adminOrderAlertTemplateSid,
        contentVariables: JSON.stringify({
          "1": data.orderNumber,
          "2": data.customerName,
          "3": data.totalAmount.toString(),
          "4": data.orderId,
        }),
      });

      console.log("WhatsApp admin order alert sent. SID:", message.sid);
    } catch (error) {
      console.error(`Failed to send WhatsApp admin order alert for #${data.orderNumber}:`, error);
    }
  }

  private formatPhoneNumber(rawPhone: string): string | null {
    const trimmed = rawPhone.replace(/[^\d+]/g, "");
    if (!trimmed) return null;

    return trimmed.startsWith("+") ? trimmed : `${this.defaultCountryCode}${trimmed}`;
  }

  private toWhatsAppAddress(phone: string): string {
    return phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;
  }
}
