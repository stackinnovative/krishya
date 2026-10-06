import { container } from "tsyringe";
import type { IOrderRepository } from "../modules/order/repositories/order.repository.interface.js";
import type { ICreateOrderUseCase } from "../modules/order/use-cases/interfaces/create.order.use-case.interface.js";
import { CreateOrderUseCase } from "../modules/order/use-cases/create.order.use-case.js";
import { OrderRepository } from "../modules/order/repositories/order.repository.js";
import type { IVerifyPaymentUseCase } from "../modules/order/use-cases/interfaces/verify.payment.use-case.interface.js";
import { VerifyPaymentUseCase } from "../modules/order/use-cases/verify.payment.use-case.js";
import type { IHandleRazorpayWebhookUseCase } from "../modules/order/use-cases/interfaces/handle.webhook.use-case.interface.js";
import { HandleRazorpayWebhookUseCase } from "../modules/order/use-cases/handle.webhook.usecase.js";
import type { IGetOrderStatusUseCase } from "../modules/order/use-cases/interfaces/get.order.status.use-case.interface.js";
import { GetOrderStatusUseCase } from "../modules/order/use-cases/get.order.status.use-case.js";
import type { IAutoCancelOrderUseCase } from "../modules/order/use-cases/interfaces/auto.cancel-order.use-case.js";
import { AutoCancelOrderUseCase } from "../modules/order/use-cases/auto-cancel-order.use-case.js";
import type { IHandlePaymentFailureUseCase } from "../modules/order/use-cases/interfaces/failure.payment.use-case.interface.js";
import { HandlePaymentFailureUseCase } from "../modules/order/use-cases/failure.payment.use-case.js";
import type { IGetOrderSummaryUseCase } from "../modules/order/use-cases/interfaces/get.order.summery.use-case.interface.js";
import { GetOrderSummaryUseCase } from "../modules/order/use-cases/get.order.summery.use-case.js";
import type { IDownloadInvoiceUseCase } from "../modules/order/use-cases/interfaces/download.invoice.use-case.interface.js";
import { DownloadInvoiceUseCase } from "../modules/order/use-cases/download.invoice.use-case.js";
import type { IGetAdminOrdersUseCase } from "../modules/order/use-cases/interfaces/get.admin.orders.use-case.interface.js";
import { GetAdminOrdersUseCase } from "../modules/order/use-cases/get.admin.orders.use-case.js";
import type { IDispatchOrderUseCase } from "../modules/order/use-cases/interfaces/dispatch.order.use-case.interface.js";
import { DispatchOrderUseCase } from "../modules/order/use-cases/dispatch.order.use-case.js";
import type { IDeliverOrderUseCase } from "../modules/order/use-cases/interfaces/deliver.order.use-case.interface.js";
import { DeliverOrderUseCase } from "../modules/order/use-cases/deliver.order.use-case.js";
import type { IAcceptOrderUseCase } from "../modules/order/use-cases/interfaces/accept.order.use-case.interface.js";
import { AcceptOrderUseCase } from "../modules/order/use-cases/accept.order.use-case.js";
import type { ICancelOrderUseCase } from "../modules/order/use-cases/interfaces/cancel.order.use-case.interface.js";
import { CancelOrderUseCase } from "../modules/order/use-cases/cancel.order.use-case.js";
import type { IGetAdminFullViewUseCase } from "../modules/order/use-cases/interfaces/get.admin.full.view.use-case.interface.js";
import { GetAdminFullViewUseCase } from "../modules/order/use-cases/get.admin.full.view.use-case.js";
import type { IAdminDownloadInvoiceUseCase } from "../modules/order/use-cases/interfaces/admin.dowload.invoice.use-case.interface.js";
import { AdminDownloadInvoiceUseCase } from "../modules/order/use-cases/admin.dowload.invoice.use-case.js";
import type { ISyncPaymentUseCase } from "../modules/order/use-cases/interfaces/sync.payment.usecase.interface.js";
import { SyncPaymentUseCase } from "../modules/order/use-cases/sync.payment.use-case.js";

export const registerOrderDependencies = () => {
    container.register<IOrderRepository>("IOrderRepository", {
        useClass: OrderRepository,
    });

    container.register<ICreateOrderUseCase>("ICreateOrderUseCase", {
        useClass: CreateOrderUseCase,
    });

    container.register<IVerifyPaymentUseCase>("IVerifyPaymentUseCase", {
        useClass: VerifyPaymentUseCase,
    });

    container.register<IHandleRazorpayWebhookUseCase>("IHandleRazorpayWebhookUseCase", {
        useClass: HandleRazorpayWebhookUseCase,
    });

    container.register<IGetOrderStatusUseCase>("IGetOrderStatusUseCase", {
        useClass: GetOrderStatusUseCase,
    });

    container.register<IAutoCancelOrderUseCase>("IAutoCancelOrderUseCase", {
        useClass: AutoCancelOrderUseCase,
    });

    container.register<IHandlePaymentFailureUseCase>("IHandlePaymentFailureUseCase", {
        useClass: HandlePaymentFailureUseCase,
    });

    container.register<IGetOrderSummaryUseCase>("IGetOrderSummaryUseCase", {
        useClass: GetOrderSummaryUseCase,
    });

    container.register<IDownloadInvoiceUseCase>("IDownloadInvoiceUseCase", {
        useClass: DownloadInvoiceUseCase,
    });

    container.register<IGetAdminOrdersUseCase>("IGetAdminOrdersUseCase", {
        useClass: GetAdminOrdersUseCase,
    });

    container.register<IDispatchOrderUseCase>("IDispatchOrderUseCase", {
        useClass: DispatchOrderUseCase,
    });

    container.register<IDeliverOrderUseCase>("IDeliverOrderUseCase", {
        useClass: DeliverOrderUseCase,
    });

    container.register<IAcceptOrderUseCase>("IAcceptOrderUseCase", {
        useClass: AcceptOrderUseCase,
    });

    container.register<ICancelOrderUseCase>("ICancelOrderUseCase", {
        useClass: CancelOrderUseCase,
    });


    container.register<IGetAdminFullViewUseCase>("IGetAdminFullViewUseCase", {
        useClass: GetAdminFullViewUseCase,
    });

    container.register<IAdminDownloadInvoiceUseCase>("IAdminDownloadInvoiceUseCase", {
        useClass: AdminDownloadInvoiceUseCase,
    });

    container.register<ISyncPaymentUseCase>("ISyncPaymentUseCase", {
        useClass: SyncPaymentUseCase,
    });

};