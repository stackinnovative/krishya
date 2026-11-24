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
    orderNumber: string;
    customerName: string;
    totalAmount: number;
};
