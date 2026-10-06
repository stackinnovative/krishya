import type { AdminOrderAlertWhatsAppData, OrderConfirmationWhatsAppData } from "../shared/types/whatsapp.type.js";

export interface IWhatsAppService {
  sendOrderConfirmation(data: OrderConfirmationWhatsAppData): Promise<void>;
  sendAdminOrderAlert(data: AdminOrderAlertWhatsAppData): Promise<void>;
}
