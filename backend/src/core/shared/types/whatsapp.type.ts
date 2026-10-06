export type OrderConfirmationWhatsAppItem = {
    name: string;
    size: string;
    quantity: number;
    price: number;
};

export type OrderConfirmationWhatsAppData = {
    to: string;
    orderNumber: string;
    customerName: string;
    items: OrderConfirmationWhatsAppItem[];
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    address: {
        addressLine1: string;
        addressLine2?: string | undefined;
        city: string;
        state: string;
        pincode: string;
    };
};

/** Sent to the fixed admin WhatsApp number (ADMIN_WHATSAPP_NUMBER), not a
 * per-order recipient - no `to` field, unlike OrderConfirmationWhatsAppData. */
export type AdminOrderAlertWhatsAppData = {
    /** Raw order _id - used to build the admin "View Order" deep link, not the human-readable orderNumber. */
    orderId: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
};
