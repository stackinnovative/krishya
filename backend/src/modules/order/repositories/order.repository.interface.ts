import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import type { TopAndLowSellingProductItem, TopSellingCategoryItem } from "../../analysis/types/analysis.type.js";
import type { GetRevenueReportPayload, RevenueReportSummary } from "../../reports/types/report.type.js";
import { Order } from "../entities/order.entity.js";
import type {
  OrderSummaryView,
  AdminOrderListItem,
  AdminOrderFullView,
} from "../types/order.type.js";
import type { OrderStatus } from "../types/order.type.js";
import type { ClientSession } from "mongoose";

export interface IOrderRepository {
  create(orderEntity: Order): Promise<Order>;

  save(orderEntity: Order): Promise<Order>;

  changeStatus(
    orderId: string,
    status: OrderStatus,
    session?: ClientSession,
  ): Promise<Order | null>;

  findById(id: string, session?: ClientSession): Promise<Order | null>;
  getOrderStatus(orderId: string): Promise<OrderStatus>;
  findPendingOlderThan(date: Date): Promise<Order[]>;
  autoCancelOlderThan(orderIds: string[], session?: ClientSession): Promise<void>;
  confirmOrder(orderId: string, session?: ClientSession): Promise<void>;
  cancelOrder(orderId: string, session?: ClientSession): Promise<void>;
  getSummary(orderId: string, guestId: string): Promise<OrderSummaryView | null>;
  getAdminOrderList(allDoc: IGetAllDocDB): Promise<AdminOrderListItem[]>;
  countDocuments(query: Record<string, any>): Promise<number>;
  dispatchOrder(orderId: string, session?: ClientSession): Promise<void>;
  deliverOrder(orderId: string, session?: ClientSession): Promise<void>;
  acceptOrder(orderId: string, session?: ClientSession): Promise<void>;
  getAdminOrderFullView(orderId: string): Promise<AdminOrderFullView | null>;
  getAdminSummery(orderId: string): Promise<OrderSummaryView | null>;
  getOrdersForRevenue(startDate: Date, endDate: Date): Promise<{ createdAt: Date; totalAmount: number }[]>;
  getAggregateKpiStats(startDate: Date, endDate: Date): Promise<{ totalOrders: number, totalRevenue: number }>;
  getDailyKpiStats(startDate: Date, endDate: Date): Promise<{ _id: string, orders: number, revenue: number }[]>;
  getPendingOrdersCount(): Promise<number>;
  getNewUsersCount(startDate: Date, endDate: Date): Promise<number>;
  getDailyNewUsers(startDate: Date, endDate: Date): Promise<{ _id: string, count: number }[]>;
  getProductRankings(startDate: Date, endDate: Date, sortDirection: 1 | -1, limit: number): Promise<TopAndLowSellingProductItem[]>;
  getTopSellingCategories(startDate: Date, endDate: Date, limit: number): Promise<TopSellingCategoryItem[]>;
  getOrderStatusCounts(): Promise<{ _id: string; count: number }[]>;
  getRevenueReport(payload: GetRevenueReportPayload) : Promise<RevenueReportSummary>
}
