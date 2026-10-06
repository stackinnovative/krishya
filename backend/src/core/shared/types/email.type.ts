export type EmailData = {
    to: string;
    orderNumber: string;
    status: string;
    customerName: string;
    title: string;
};

export type OrderConfirmationEmailItem = {
    name: string;
    size: string;
    quantity: number;
    price: number;
};

export type OrderConfirmationEmailData = {
    to: string;
    orderNumber: string;
    customerName: string;
    items: OrderConfirmationEmailItem[];
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

export type AdminOrderNotificationEmailData = {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    itemCount: number;
};

export type AdminOrderCancelledEmailData = {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    reason: string;
};