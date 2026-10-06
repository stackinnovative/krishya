import type { Request, Response } from "express";

export interface IOrderController {
    createOrder(req: Request, res: Response): Promise<void>;
    verifyPayment(req: Request, res: Response): Promise<void>;
    getOrderStatus(req: Request, res: Response): Promise<void>;
    handlePaymentFailure(req: Request, res: Response): Promise<void>;
    getOrderSummary(req: Request, res: Response): Promise<void>;
    downloadInvoice(req: Request, res: Response): Promise<void>;
    getAdminOrders(req: Request, res: Response): Promise<void>;
    dispatchOrder(req: Request, res: Response): Promise<void>;
    deliverOrder(req: Request, res: Response): Promise<void>;
    acceptOrder(req: Request, res: Response): Promise<void>;
    cancelOrder(req: Request, res: Response): Promise<void>;
    getAdminFullView(req: Request, res: Response): Promise<void>;
    adminDownloadInvoice(req: Request, res: Response): Promise<void>;
    syncPayment(req: Request, res: Response): Promise<void>;
}