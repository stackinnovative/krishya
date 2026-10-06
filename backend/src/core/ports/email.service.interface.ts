import type {
  AdminOrderCancelledEmailData,
  AdminOrderNotificationEmailData,
  EmailData,
  OrderConfirmationEmailData,
} from "../shared/types/email.type.js";

export interface IEmailService {
  sendOrderStatusUpdate(
    data: EmailData
  ): Promise<void>;

  sendOrderConfirmation(
    data: OrderConfirmationEmailData
  ): Promise<void>;

  sendAdminOrderNotification(
    data: AdminOrderNotificationEmailData
  ): Promise<void>;

  sendAdminOrderCancelled(
    data: AdminOrderCancelledEmailData
  ): Promise<void>;
}