import type { IRazorpayOrder, IRazorpayOrderOptions, IRazorpayPayment, IRazorpayPaymentCollection } from "../../modules/order/types/order.type.js";

export interface IPaymentGateway {
    createOrder(options: IRazorpayOrderOptions): Promise<IRazorpayOrder>;
    fetchPayment(paymentId: string): Promise<IRazorpayPayment>;
    fetchPaymentsByOrderId(orderId: string): Promise<IRazorpayPaymentCollection>;
}