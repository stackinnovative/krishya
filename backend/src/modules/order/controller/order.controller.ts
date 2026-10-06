import { inject, injectable } from "tsyringe";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";
import type { Request, Response } from "express";
import { CreateOrderSchema } from "../dtos/create.order.dto.js";
import type { IOrderController } from "./order.controller.interface.js";
import type { ICreateOrderUseCase } from "../use-cases/interfaces/create.order.use-case.interface.js";
import { VerifyPaymentSchema } from "../dtos/verify.payment.dto.js";
import type { IVerifyPaymentUseCase } from "../use-cases/interfaces/verify.payment.use-case.interface.js";
import type { IGetOrderStatusUseCase } from "../use-cases/interfaces/get.order.status.use-case.interface.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";
import type { IHandlePaymentFailureUseCase } from "../use-cases/interfaces/failure.payment.use-case.interface.js";
import { HandlePaymentFailureSchema } from "../dtos/failure.order.dto.js";
import type { IGetOrderSummaryUseCase } from "../use-cases/interfaces/get.order.summery.use-case.interface.js";
import { GuestIdSchema } from "../../../core/utils/guest.id.validation.js";
import type { IDownloadInvoiceUseCase } from "../use-cases/interfaces/download.invoice.use-case.interface.js";
import type { IGetAdminOrdersUseCase } from "../use-cases/interfaces/get.admin.orders.use-case.interface.js";
import { GetAllQuerySchema } from "../../../core/shared/dtos/get.all.doc.dto.js";
import { parseReq } from "../../../core/utils/parse.query.helper.js";
import type { IDispatchOrderUseCase } from "../use-cases/interfaces/dispatch.order.use-case.interface.js";
import type { IDeliverOrderUseCase } from "../use-cases/interfaces/deliver.order.use-case.interface.js";
import type { IAcceptOrderUseCase } from "../use-cases/interfaces/accept.order.use-case.interface.js";
import type { ICancelOrderUseCase } from "../use-cases/interfaces/cancel.order.use-case.interface.js";
import type { IGetAdminFullViewUseCase } from "../use-cases/interfaces/get.admin.full.view.use-case.interface.js";
import type { IAdminDownloadInvoiceUseCase } from "../use-cases/interfaces/admin.dowload.invoice.use-case.interface.js";
import type { ISyncPaymentUseCase } from "../use-cases/interfaces/sync.payment.usecase.interface.js";


@injectable()
export class OrderController implements IOrderController {
  constructor(
    @inject("ICreateOrderUseCase")
    private readonly _createOrderUseCase: ICreateOrderUseCase,

    @inject("IVerifyPaymentUseCase")
    private readonly _verifyPaymentUseCase: IVerifyPaymentUseCase,

    @inject("IGetOrderStatusUseCase")
    private readonly _getOrderStatusUseCase: IGetOrderStatusUseCase,

    @inject("IHandlePaymentFailureUseCase")
    private readonly _handlePaymentFailureUseCase: IHandlePaymentFailureUseCase,

    @inject("IGetOrderSummaryUseCase")
    private readonly _getOrderSummaryUseCase: IGetOrderSummaryUseCase,

    @inject("IDownloadInvoiceUseCase")
    private readonly _downloadInvoiceUseCase: IDownloadInvoiceUseCase,

    @inject("IGetAdminOrdersUseCase")
    private readonly _getAdminOrdersUseCase: IGetAdminOrdersUseCase,

    @inject("IDispatchOrderUseCase")
    private readonly _dispatchOrderUseCase: IDispatchOrderUseCase,

    @inject("IDeliverOrderUseCase")
    private readonly _deliverOrderUseCase: IDeliverOrderUseCase,

    @inject("IAcceptOrderUseCase")
    private readonly _acceptOrderUseCase: IAcceptOrderUseCase,

    @inject("ICancelOrderUseCase")
    private readonly _cancelOrderUseCase: ICancelOrderUseCase,

    @inject("IGetAdminFullViewUseCase")
    private readonly _getAdminFullViewUseCase: IGetAdminFullViewUseCase,

    @inject("IAdminDownloadInvoiceUseCase")
    private readonly _adminDownloadInvoiceUseCase: IAdminDownloadInvoiceUseCase,

    @inject("ISyncPaymentUseCase")
    private readonly _syncPaymentUseCase: ISyncPaymentUseCase,

  ) { }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = CreateOrderSchema.parse(req.body);
      const order = await this._createOrderUseCase.execute(validationResult);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: ResponseMessages.ORDER_CREATED_SUCCESS,
        data: order,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in create order controller ", error);
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      
      const validationResult = VerifyPaymentSchema.parse(req.body);

      const order = await this._verifyPaymentUseCase.execute(validationResult);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: ResponseMessages.ORDER_CREATED_SUCCESS,
        data: order,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in create order controller ", error);
    }
  }

  async getOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      const orderStatus = await this._getOrderStatusUseCase.execute(orderId!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: orderStatus,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get order status controller ", error);
    }
  }

  async handlePaymentFailure(req: Request, res: Response): Promise<void> {
    try {

      const validationResult = HandlePaymentFailureSchema.parse(req.body);

      const order =
        await this._handlePaymentFailureUseCase.execute(validationResult);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: ResponseMessages.ORDER_CREATED_SUCCESS,
        data: order,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in handle payment failure controller ", error);
    }
  }

  async getOrderSummary(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      const guestId = GuestIdSchema.parse(req.query.guestId as string);
      validateObjectId(orderId);
      const orderSummary = await this._getOrderSummaryUseCase.execute(
        orderId!,
        guestId,
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: orderSummary,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get order summary controller ", error);
    }
  }

  async downloadInvoice(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      const guestId = GuestIdSchema.parse(req.query.guestId as string);
      const pdfBuffer = await this._downloadInvoiceUseCase.execute(
        orderId!,
        guestId,
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${orderId}.pdf`,
      );

      res.status(200).send(pdfBuffer);
    } catch (error) {
      handleError(res, error);
      console.log("error in download invoice controller ", error);
    }
  }

  async getAdminOrders(req: Request, res: Response): Promise<void> {
    try {
      const dto = GetAllQuerySchema.parse(parseReq(req, ["orderStatus", "userId"]));
      const { data, total } = await this._getAdminOrdersUseCase.execute(dto);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: data,
        total,
        totalPages: Math.ceil(total / dto.limit),
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get admin orders controller ", error);
    }
  }

  async dispatchOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      await this._dispatchOrderUseCase.execute(orderId!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.ORDER_DISPATCHED_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in dispatch order controller ", error);
    }
  }

  async deliverOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      await this._deliverOrderUseCase.execute(orderId!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.ORDER_DELIVERED_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in deliver order controller ", error);
    }
  }

  async acceptOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      await this._acceptOrderUseCase.execute(orderId!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.ORDER_ACCEPTED_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in accept order controller ", error);
    }
  }

  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      await this._cancelOrderUseCase.execute(orderId!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.ORDER_CANCELLED_SUCCESS,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in cancel order controller ", error);
    }
  }

  async getAdminFullView(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      const order = await this._getAdminFullViewUseCase.execute(orderId!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: order,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get admin full view controller ", error);
    }
  }

  async adminDownloadInvoice(req: Request, res: Response): Promise<void> {
    try {
      console.log("admin download invoice controller called");
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      const pdfBuffer = await this._adminDownloadInvoiceUseCase.execute(
        orderId!,
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${orderId}.pdf`,
      );

      res.status(200).send(pdfBuffer);
    } catch (error) {
      handleError(res, error);
      console.log("error in download invoice controller ", error);
    }
  }

  async syncPayment(req: Request, res: Response): Promise<void> {
    try {
      console.log("sync payment controller called");
      const orderId = req.params.orderId;
      validateObjectId(orderId);
      const orderStatus = await this._syncPaymentUseCase.execute(orderId!);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: orderStatus,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in sync payment controller ", error);
    }
  }


}
