import type { IWhatsAppService } from "../../../core/ports/whatsapp.service.interface.js";
import type { IEmailService } from "../../../core/ports/email.service.interface.js";
import type { Order } from "../entities/order.entity.js";

export function notifyOrderConfirmed(
  whatsAppService: IWhatsAppService,
  emailService: IEmailService,
  order: Order
): void {
  console.log(`Order confirmed: #${order.orderNumber}`);

  // Customer-facing confirmation email - itemised receipt.
  emailService
    .sendOrderConfirmation({
      to: order.userSnapshot.email,
      orderNumber: order.orderNumber,
      customerName: order.userSnapshot.name,
      items: order.items.map((item) => ({
        name: item.name,
        size: item.size ?? "",
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
      address: {
        addressLine1: order.userSnapshot.addressLine1,
        addressLine2: order.userSnapshot.addressLine2,
        city: order.userSnapshot.city,
        state: order.userSnapshot.state,
        pincode: order.userSnapshot.pincode,
      },
    })
    .catch((error) =>
      console.error(`Failed to send order confirmation email for #${order.orderNumber}:`, error)
    );

  // Admin alert - a new paid order needs their attention.
  emailService
    .sendAdminOrderNotification({
      orderNumber: order.orderNumber,
      customerName: order.userSnapshot.name,
      customerEmail: order.userSnapshot.email,
      customerPhone: order.userSnapshot.phone,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
    })
    .catch((error) =>
      console.error(`Failed to send admin new-order email for #${order.orderNumber}:`, error)
    );

  // Customer-facing confirmation - verified working end-to-end (tested with
  // the approved test template). Disabled for now since each message costs
  // money - uncomment after deploy / once the real order-confirmation
  // template is approved.
  // whatsAppService
  //   .sendOrderConfirmation({
  //     to: order.userSnapshot.phone,
  //     orderNumber: order.orderNumber,
  //     customerName: order.userSnapshot.name,
  //     items: order.items.map((item) => ({
  //       name: item.name,
  //       size: item.size,
  //       quantity: item.quantity,
  //       price: item.price,
  //     })),
  //     subtotal: order.subtotal,
  //     shippingFee: order.shippingFee,
  //     totalAmount: order.totalAmount,
  //     address: {
  //       addressLine1: order.userSnapshot.addressLine1,
  //       addressLine2: order.userSnapshot.addressLine2,
  //       city: order.userSnapshot.city,
  //       state: order.userSnapshot.state,
  //       pincode: order.userSnapshot.pincode,
  //     },
  //   })
  //   .catch((error) =>
  //     console.error(`Failed to send WhatsApp order confirmation for #${order.orderNumber}:`, error)
  //   );

  // Admin alert - active. No-ops gracefully (with a console.error) until
  // TWILIO_ADMIN_ORDER_ALERT_TEMPLATE_SID and ADMIN_WHATSAPP_NUMBER are set.
  // whatsAppService
  //   .sendAdminOrderAlert({
  //     orderId: order.id!,
  //     orderNumber: order.orderNumber,
  //     customerName: order.userSnapshot.name,
  //     totalAmount: order.totalAmount,
  //   })
  //   .catch((error) =>
  //     console.error(`Failed to send WhatsApp admin order alert for #${order.orderNumber}:`, error)
  //   );
}
