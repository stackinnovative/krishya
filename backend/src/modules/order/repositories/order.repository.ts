import { Types } from "mongoose";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";

import { Order } from "../entities/order.entity.js";
import { OrderModel } from "../infrastructure/order.schema.js";
import { OrderMapper } from "../mappers/order.mapper.js";
import type { IOrderRepository } from "./order.repository.interface.js";

import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import type {
  AdminOrderFullView,
  AdminOrderListItem,
  IOrderLean,
  IPaymentLean,
  OrderSummaryView,
} from "../types/order.type.js";
import type { OrderStatus } from "../types/order.type.js";
import type { ClientSession } from "mongoose";
import { PaymentModel } from "../../payment/infrastructure/payment.schema.js";
import type {
  TopAndLowSellingProductItem,
  TopSellingCategoryItem,
} from "../../analysis/types/analysis.type.js";
import type { GetRevenueReportPayload, RevenueReportSummary } from "../../reports/types/report.type.js";

const { ObjectId } = Types;

export class OrderRepository implements IOrderRepository {
  /* ================= CREATE ================= */

  async create(orderEntity: Order, session?: ClientSession): Promise<Order> {
    const persistenceData = OrderMapper.toPersistence(orderEntity);

    // The array form is the only one Model.create accepts a session with.
    const [created] = await OrderModel.create([persistenceData], session ? { session } : {});

    const domainOrder = OrderMapper.toDomain(created);

    if (!domainOrder) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainOrder;
  }

  /* ================= SAVE ================= */

  async save(orderEntity: Order): Promise<Order> {
    if (!orderEntity.id) {
      throw new CustomError(
        ResponseMessages.ID_MISSING,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const persistenceData = OrderMapper.toPersistence(orderEntity);

    const updated = await OrderModel.findByIdAndUpdate(
      orderEntity.id,
      { $set: persistenceData },
      { new: true },
    ).lean();

    if (!updated) {
      throw new CustomError(
        ResponseMessages.ORDER_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const domainOrder = OrderMapper.toDomain(updated);

    if (!domainOrder) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainOrder;
  }

  /* ================= CHANGE STATUS ================= */

  async changeStatus(
    orderId: string,
    status: OrderStatus,
    session?: ClientSession,
  ): Promise<Order | null> {
    if (!ObjectId.isValid(orderId)) return null;

    const updated = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus: status } },
      { new: true, session: session ?? null },
    ).lean();

    return OrderMapper.toDomain(updated);
  }

  /* ================= FIND BY ID ================= */

  async findById(id: string, session?: ClientSession): Promise<Order | null> {
    if (!ObjectId.isValid(id)) return null;

    const query = OrderModel.findById(id).lean();

    if (session) {
      query.session(session);
    }

    const document = await query;

    return OrderMapper.toDomain(document);
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    const document = await OrderModel.findById(orderId).lean();
    return document?.orderStatus ?? "created";
  }

  async findPendingOlderThan(date: Date): Promise<Order[]> {
    const documents = await OrderModel.find({
      orderStatus: "created",
      createdAt: { $lt: date },
    }).lean();

    return documents
      .map(OrderMapper.toDomain)
      .filter((o): o is Order => o !== null);
  }

  async autoCancelOlderThan(
    orderIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    const result = await OrderModel.updateMany(
      {
        orderStatus: "created",
        _id: { $in: orderIds },
      },
      {
        $set: {
          orderStatus: "cancelled",
          cancelledAt: new Date(),
          cancelReason: "Auto cancelled due to payment timeout",
        },
      },
      session ? { session } : {},
    );

    if (result.modifiedCount === 0) {
      throw new Error(ResponseMessages.ORDER_NOT_FOUND);
    }
  }

  // confirm order
  async confirmOrder(orderId: string, session?: ClientSession): Promise<void> {
    const result = await OrderModel.updateOne(
      { _id: orderId, orderStatus: "created" },
      { $set: { orderStatus: "confirmed", confirmedAt: new Date() } },
      session ? { session } : {},
    );

    if (result.modifiedCount === 0) {
      throw new Error(ResponseMessages.ORDER_NOT_FOUND);
    }
  }

  // confirm an order whose payment landed after it was cancelled (its stock has already been re-reserved by the caller)
  async reconfirmCancelledOrder(orderId: string, session?: ClientSession): Promise<void> {
    const result = await OrderModel.updateOne(
      { _id: orderId, orderStatus: "cancelled" },
      { $set: { orderStatus: "confirmed", confirmedAt: new Date() }, $unset: { cancelledAt: "", cancelReason: "" } },
      session ? { session } : {},
    );

    if (result.modifiedCount === 0) {
      throw new Error(ResponseMessages.ORDER_NOT_FOUND);
    }
  }

  // cancel order
  async cancelOrder(orderId: string, session?: ClientSession): Promise<void> {
    const result = await OrderModel.updateOne(
      { _id: orderId, orderStatus: { $nin: ["cancelled", "delivered"] } },
      {
        $set: {
          orderStatus: "cancelled",
          cancelledAt: new Date(),
          cancelReason: "Payment failed",
        },
      },
      session ? { session } : {},
    );

    if (result.modifiedCount === 0) {
      throw new Error(ResponseMessages.ORDER_NOT_FOUND);
    }
  }

  // get order summary
  async getSummary(
    orderId: string,
    guestId: string,
  ): Promise<OrderSummaryView | null> {
    const document = await OrderModel.findOne({ _id: orderId, guestId }).lean();
    return OrderMapper.toSummaryView(document);
  }

  async getAdminOrderList(allDoc: IGetAllDocDB): Promise<AdminOrderListItem[]> {
    const { query, page, limit, sort } = allDoc;
    const skip = (page - 1) * limit;

    const documents = await OrderModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return documents
      .map(OrderMapper.toAdminOrderListItem)
      .filter((o): o is AdminOrderListItem => o !== null);
  }

  async countDocuments(query: Record<string, any>): Promise<number> {
    return OrderModel.countDocuments(query);
  }

  // dispatch order
  async dispatchOrder(orderId: string, session?: ClientSession): Promise<void> {
    const result = await OrderModel.updateOne(
      { _id: orderId, orderStatus: "accepted" },
      { $set: { orderStatus: "dispatched", dispatchedAt: new Date() } },
      session ? { session } : {},
    );

    if (result.modifiedCount === 0) {
      throw new Error(ResponseMessages.ORDER_NOT_FOUND);
    }
  }

  // deliver order
  async deliverOrder(orderId: string, session?: ClientSession): Promise<void> {
    const result = await OrderModel.updateOne(
      { _id: orderId, orderStatus: "dispatched" },
      { $set: { orderStatus: "delivered", deliveredAt: new Date() } },
      session ? { session } : {},
    );

    if (result.modifiedCount === 0) {
      throw new Error(ResponseMessages.ORDER_NOT_FOUND);
    }
  }

  // accept order
  async acceptOrder(orderId: string, session?: ClientSession): Promise<void> {
    const result = await OrderModel.updateOne(
      { _id: orderId, orderStatus: "confirmed" },
      { $set: { orderStatus: "accepted", acceptedAt: new Date() } },
      session ? { session } : {},
    );

    if (result.modifiedCount === 0) {
      throw new Error(ResponseMessages.ORDER_NOT_FOUND);
    }
  }

  async getAdminOrderFullView(
    orderId: string,
  ): Promise<AdminOrderFullView | null> {
    const document = await OrderModel.findById(orderId).lean<IOrderLean>();
    if (!document) return null;
    const payment = await PaymentModel.findOne({
      orderId: document._id,
    }).lean<IPaymentLean>();
    return OrderMapper.toAdminOrderFullView(document, payment);
  }

  async getAdminSummery(orderId: string): Promise<OrderSummaryView | null> {
    const document = await OrderModel.findOne({ _id: orderId }).lean();
    return OrderMapper.toSummaryView(document);
  }

  async getOrdersForRevenue(
    startDate: Date,
    endDate: Date,
  ): Promise<{ createdAt: Date; totalAmount: number }[]> {
    const documents = await OrderModel.find(
      {
        createdAt: { $gte: startDate, $lte: endDate },
        orderStatus: { $in: ["confirmed", "accepted", "dispatched", "delivered"] },
      },
      { createdAt: 1, subtotal: 1, _id: 0 },
    ).lean<{ createdAt: Date; subtotal: number }[]>();

    return documents.map((doc) => ({
      createdAt: doc.createdAt!,
      totalAmount: doc.subtotal,
    }));
  }

  async getAggregateKpiStats(
    startDate: Date,
    endDate: Date,
  ): Promise<{ totalOrders: number; totalRevenue: number }> {
    const result = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $in: ["confirmed", "accepted", "dispatched", "delivered"] }, // Only paid orders
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$subtotal" },
        },
      },
    ]);
    return result[0] || { totalOrders: 0, totalRevenue: 0 };
  }

  async getDailyKpiStats(
    startDate: Date,
    endDate: Date,
  ): Promise<{ _id: string; orders: number; revenue: number }[]> {
    return await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $in: ["confirmed", "accepted", "dispatched", "delivered"] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$subtotal" },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
    ]);
  }

  async getPendingOrdersCount(): Promise<number> {
    return await OrderModel.countDocuments({ orderStatus: "created" });
  }

  async getNewUsersCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$guestId",
        },
      },
      {
        $count: "totalUniqueUsers",
      },
    ]);

    return result[0]?.totalUniqueUsers || 0;
  }

  async getDailyNewUsers(
    startDate: Date,
    endDate: Date,
  ): Promise<{ _id: string; count: number }[]> {
    return await OrderModel.aggregate([
      // 1️⃣ Create unified user key
      {
        $addFields: {
          customerId: {
            $ifNull: ["$userId", "$guestId"],
          },
        },
      },

      // 2️⃣ Find each user's FIRST order ever
      {
        $group: {
          _id: "$customerId",
          firstOrderDate: { $min: "$createdAt" },
        },
      },

      // 3️⃣ Keep only users whose first order falls inside range
      {
        $match: {
          firstOrderDate: { $gte: startDate, $lte: endDate },
        },
      },

      // 4️⃣ Group by day
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$firstOrderDate",
            },
          },
          count: { $sum: 1 },
        },
      },

      { $sort: { _id: 1 } },
    ]);
  }

  async getProductRankings(
    startDate: Date,
    endDate: Date,
    sortDirection: 1 | -1,
    limit: number,
  ): Promise<TopAndLowSellingProductItem[]> {
    const raw = await OrderModel.aggregate([
      // 1. Match valid orders within the date range
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: {
            $in: ["confirmed", "accepted", "dispatched", "delivered"],
          },
        },
      },
      // 2. Unwind the items array so we can group by individual products
      { $unwind: "$items" },
      // 3. Group by productId and sum up quantity and revenue
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      // 4. Sort based on direction (1 for low-to-high, -1 for high-to-low)
      { $sort: { totalQuantitySold: sortDirection } },
      // 5. Limit to top 5 (or however many requested)
      { $limit: limit },
      // 6. Lookup the product to get the image
      {
        $lookup: {
          from: "products", // Ensure this exactly matches your MongoDB collection name for products
          localField: "_id",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      // 7. Flatten the product lookup array
      { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
      // 8. Format the final output to exactly match the type
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: 1,
          totalQuantitySold: 1,
          totalRevenue: 1,
          // The product's first photo as its icon
          iconUrl: { $arrayElemAt: ["$productDoc.images.url", 0] },
        },
      },
    ]);

    return raw
      .map((item) => OrderMapper.toTopAndLowSellingProductItem(item))
      .filter((o): o is TopAndLowSellingProductItem => o !== null);
  }

  async getTopSellingCategories(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<TopSellingCategoryItem[]> {
    const raw = await OrderModel.aggregate([
      // 1. Match valid orders from the last year
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: {
            $in: ["confirmed", "accepted", "dispatched", "delivered"],
          },
        },
      },
      // 2. Break apart the order items
      { $unwind: "$items" },
      // 3. Group by Product first (Optimizes the lookup)
      {
        $group: {
          _id: "$items.productId",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      // 4. Lookup the Product to get its sub-category and image
      {
        $lookup: {
          from: "products", // Must match your MongoDB collection name exactly
          localField: "_id",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: false } },
      // 5. Group by Category (Sub-Category from Product)
      {
        $group: {
          _id: "$productDoc.category",
          totalQuantitySold: { $sum: "$totalQuantitySold" },
          totalRevenue: { $sum: "$totalRevenue" },
          // The first product's first photo represents this category
          iconUrl: {
            $first: { $arrayElemAt: ["$productDoc.images.url", 0] },
          },
        },
      },
      // 6. Sort by highest quantity sold
      { $sort: { totalQuantitySold: -1 } },
      // 7. Limit to top 5
      { $limit: limit },
      // 8. Lookup the Category to get its actual name
      {
        $lookup: {
          from: "categories", // Must match your MongoDB collection name exactly
          localField: "_id",
          foreignField: "_id",
          as: "categoryDoc",
        },
      },
      { $unwind: { path: "$categoryDoc", preserveNullAndEmptyArrays: true } },
      // 9. Format output to match TopSellingCategoryItem exactly
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: { $ifNull: ["$categoryDoc.name", "Unknown Category"] },
          totalQuantitySold: 1,
          totalRevenue: 1,
          iconUrl: 1,
        },
      },
    ]);

    return raw
      .map((item) => OrderMapper.toTopSellingCategoryItem(item))
      .filter((o): o is TopSellingCategoryItem => o !== null);
  }

  async getOrderStatusCounts(): Promise<{ _id: string; count: number }[]> {
    return await OrderModel.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getRevenueReport(payload: GetRevenueReportPayload): Promise<RevenueReportSummary> {
    const { startDate, endDate, granularity, page, limit } = payload;
    // 1. Only count orders where payment was actually captured, and apply date ranges
    const matchStage: any = {
      orderStatus: { $in: ["confirmed", "accepted", "dispatched", "delivered"] },
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    // Bucket key: a plain day/week/month string, sized to `granularity` so
    // the overview stays a handful of bars/rows even across a year or the
    // store's whole lifetime, without pagination. Weeks bucket by their
    // Monday start date; months bucket by "YYYY-MM" (no day component).
    const bucketDateExpr =
      granularity === "day"
        ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        : granularity === "week"
        ? {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $dateTrunc: { date: "$createdAt", unit: "week", startOfWeek: "monday" } },
            },
          }
        : { $dateToString: { format: "%Y-%m", date: "$createdAt" } };

    // Only the "detail" drill-down (always day granularity) supplies both
    // page and limit - that's the one place real pagination applies. Every
    // other caller (overview, CSV export of the full range) omits them and
    // gets every bucket back in one shot.
    const paginate = typeof page === "number" && typeof limit === "number";

    const bucketPipeline: any[] = [
      { $group: { _id: bucketDateExpr, revenue: { $sum: "$subtotal" }, orders: { $sum: 1 } } },
      { $sort: { _id: -1 } }, // Newest first
    ];
    if (paginate) {
      bucketPipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
    }

    const facetStage: any = {
      // Facet A: Calculate the overall summary for the top cards
      summary: [
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$subtotal" },
            totalOrders: { $sum: 1 },
          },
        },
      ],
      // Facet B: Calculate the bucketed revenue, sorted and (only when
      // paginating) sliced to one page.
      bucketData: bucketPipeline,
    };
    if (paginate) {
      // Facet C: Count of distinct buckets, only needed to compute
      // totalPages - skipped entirely when the caller isn't paginating.
      facetStage.bucketCount = [{ $group: { _id: bucketDateExpr } }, { $count: "count" }];
    }

    // 2. The Aggregation Pipeline
    const result = await OrderModel.aggregate([{ $match: matchStage }, { $facet: facetStage }]);

    const facetData = result[0];

    // Extract Summary (handle case where no orders exist)
    const summaryData = facetData.summary[0] || { totalRevenue: 0, totalOrders: 0 };
    const totalRevenue = summaryData.totalRevenue;
    const totalOrders = summaryData.totalOrders;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Extract Pagination Data
    const totalBuckets = paginate ? facetData.bucketCount[0]?.count || 0 : facetData.bucketData.length;
    const totalPages = paginate ? Math.max(1, Math.ceil(totalBuckets / limit!)) : 1;

    // Format bucket data array
    const dailyData = facetData.bucketData.map((bucket: any) => ({
      date: bucket._id,
      revenue: bucket.revenue,
      orders: bucket.orders,
    }));

    const revenueSummery: RevenueReportSummary = {
      summary: { totalRevenue, totalOrders, averageOrderValue },
      totalPages,
      total: totalBuckets,
      dailyData,
      granularity,
    };

    return revenueSummery;
  }
}
