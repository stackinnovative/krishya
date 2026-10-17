import type {
  TopAndLowSellingProductItem,
  TopSellingCategoryItem,
} from "../../analysis/types/analysis.type.js";
import { Order } from "../entities/order.entity.js";
import type {
  AdminOrderFullView,
  AdminOrderListItem,
  IOrderLean,
  IPaymentLean,
  OrderSummaryView,
} from "../types/order.type.js";

export class OrderMapper {
  /* ================= DOMAIN ================= */

  static toDomain(orderModelData: any): Order | null {
    if (!orderModelData) {
      return null;
    }

    const idString =
      orderModelData._id?.toString() || orderModelData.id?.toString();

    if (!idString) {
      console.error("Order data missing ID:", orderModelData);
      return null;
    }

    return new Order({
      id: idString,
      orderNumber: orderModelData.orderNumber,
      userId: orderModelData.userId?.toString() || orderModelData.userId,
      guestId: orderModelData.guestId,
      userSnapshot: {
        name: orderModelData.userSnapshot.name,
        email: orderModelData.userSnapshot.email,
        phone: orderModelData.userSnapshot.phone,
        addressLine1: orderModelData.userSnapshot.addressLine1,
        addressLine2: orderModelData.userSnapshot.addressLine2,
        city: orderModelData.userSnapshot.city,
        state: orderModelData.userSnapshot.state,
        pincode: orderModelData.userSnapshot.pincode,
      },

      subtotal: orderModelData.subtotal,
      shippingFee: orderModelData.shippingFee,
      totalAmount: orderModelData.totalAmount,
      orderStatus: orderModelData.orderStatus,
      items:
        orderModelData.items?.map((item: any) => ({
          id: item._id?.toString() || item.id?.toString(),
          productId: item.productId?.toString() || item.productId,
          variantId: item.variantId?.toString() || item.variantId,
          size: item.size,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          mrp: item.mrp,
          image: item.image,
        })) ?? [],

      createdAt: orderModelData.createdAt,
      confirmedAt: orderModelData.confirmedAt,
      acceptedAt: orderModelData.acceptedAt,
      dispatchedAt: orderModelData.dispatchedAt,
      cancelledAt: orderModelData.cancelledAt,
      deliveredAt: orderModelData.deliveredAt,
    });
  }

  /* ================= PERSISTENCE ================= */

  static toPersistence(orderEntity: Order): any {
    return {
      orderNumber: orderEntity.orderNumber,

      userId: orderEntity.userId,
      guestId: orderEntity.guestId,
      userSnapshot: {
        name: orderEntity.userSnapshot.name,
        email: orderEntity.userSnapshot.email,
        phone: orderEntity.userSnapshot.phone,
        addressLine1: orderEntity.userSnapshot.addressLine1,
        addressLine2: orderEntity.userSnapshot.addressLine2,
        city: orderEntity.userSnapshot.city,
        state: orderEntity.userSnapshot.state,
        pincode: orderEntity.userSnapshot.pincode,
      },
      subtotal: orderEntity.subtotal,
      shippingFee: orderEntity.shippingFee,
      totalAmount: orderEntity.totalAmount,
      orderStatus: orderEntity.orderStatus,
      items: orderEntity.items.map((item) => ({
        _id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        size: item.size,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        mrp: item.mrp,
        image: item.image,
      })),

      confirmedAt: orderEntity.confirmedAt,
      acceptedAt: orderEntity.acceptedAt,
      dispatchedAt: orderEntity.dispatchedAt,
      cancelledAt: orderEntity.cancelledAt,
      deliveredAt: orderEntity.deliveredAt,
    };
  }

  static toSummaryView(orderModelData: any): OrderSummaryView | null {
    if (!orderModelData) return null;

    const id = orderModelData._id?.toString() || orderModelData.id?.toString();

    if (!id) {
      console.error("Order data missing ID:", orderModelData);
      return null;
    }

    return {
      id,
      orderNumber: orderModelData.orderNumber,
      userSnapshot: {
        name: orderModelData.userSnapshot.name,
        email: orderModelData.userSnapshot.email,
        phone: orderModelData.userSnapshot.phone,
        addressLine1: orderModelData.userSnapshot.addressLine1,
        addressLine2: orderModelData.userSnapshot.addressLine2,
        city: orderModelData.userSnapshot.city,
        state: orderModelData.userSnapshot.state,
        pincode: orderModelData.userSnapshot.pincode,
      },
      subtotal: orderModelData.subtotal,
      shippingFee: orderModelData.shippingFee,
      totalAmount: orderModelData.totalAmount,
      orderStatus: orderModelData.orderStatus,
      createdAt: orderModelData.createdAt,
      items: orderModelData.items.map((item: any) => ({
        itemId: item._id.toString(),
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
      })),
    };
  }

  //   /* ================= ADMIN LIST VIEW ================= */

  static toAdminOrderListItem(orderModelData: any): AdminOrderListItem | null {
    if (!orderModelData) return null;

    const id = orderModelData._id?.toString() || orderModelData.id?.toString();

    if (!id) {
      console.error("Order data missing ID:", orderModelData);
      return null;
    }

    return {
      id,
      orderNumber: orderModelData.orderNumber,
      customerName: orderModelData.userSnapshot.name,
      customerPhone: orderModelData.userSnapshot.phone,
      totalAmount: orderModelData.totalAmount,
      orderStatus: orderModelData.orderStatus,
      createdAt: orderModelData.createdAt,
      itemsCount: orderModelData.items.length,
    };
  }

  /* ================= ADMIN TOP SELLING PRODUCT ================= */

  static toTopAndLowSellingProductItem(
    data: any,
  ): TopAndLowSellingProductItem | null {
    if (!data) return null;

    const productId = data.productId?.toString?.() || data._id?.toString?.();

    if (!productId) {
      console.error("Product ranking missing productId:", data);
      return null;
    }

    return {
      productId,
      name: data.name ?? "Unknown Product",
      totalQuantitySold: Number(data.totalQuantitySold ?? 0),
      totalRevenue: Number(data.totalRevenue ?? 0),
      iconUrl: data.iconUrl ?? "",
    };
  }

  /* ================= ADMIN TOP SELLING CATEGORY ================= */
  static toTopSellingCategoryItem(data: any): TopSellingCategoryItem | null {
    if (!data) return null;

    const categoryId = data.categoryId?.toString?.() || data._id?.toString?.();

    if (!categoryId) {
      console.error("Category ranking missing categoryId:", data);
      return null;
    }

    return {
      categoryId,
      name: data.name ?? "Unknown Category",
      totalQuantitySold: Number(data.totalQuantitySold ?? 0),
      totalRevenue: Number(data.totalRevenue ?? 0),
      iconUrl: data.iconUrl ?? "",
    };
  }

  /* ================= ADMIN DETAIL VIEW ================= */
  static toAdminOrderFullView(
    order: IOrderLean,
    payment?: IPaymentLean | null,
  ): AdminOrderFullView {
    return {
      id: order._id.toString(),

      orderNumber: order.orderNumber,

      user: {
        name: order.userSnapshot.name,
        email: order.userSnapshot.email,
        phone: order.userSnapshot.phone,
        addressLine1: order.userSnapshot.addressLine1,
        addressLine2: order.userSnapshot.addressLine2 || "",
        city: order.userSnapshot.city,
        state: order.userSnapshot.state,
        pincode: order.userSnapshot.pincode,
      },

      pricing: {
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        totalAmount: order.totalAmount,
      },

      orderStatus: order.orderStatus,
      ...(order.cancelReason && { cancelReason: order.cancelReason }),

      timeline: {
        createdAt: order.createdAt.toISOString(),
        ...(order.confirmedAt && {
          confirmedAt: order.confirmedAt.toISOString(),
        }),
        ...(order.acceptedAt && {
          acceptedAt: order.acceptedAt.toISOString(),
        }),
        ...(order.dispatchedAt && {
          dispatchedAt: order.dispatchedAt.toISOString(),
        }),
        ...(order.cancelledAt && {
          cancelledAt: order.cancelledAt.toISOString(),
        }),
        ...(order.deliveredAt && {
          deliveredAt: order.deliveredAt.toISOString(),
        }),
      },

      ...(payment && {
        payment: {
          paymentId: payment._id.toString(),
          status: payment.status,
          ...(payment.paymentMode && { method: payment.paymentMode }),
          ...(payment.createdAt && {
            paidAt: payment.createdAt.toISOString(),
          }),
        },
      }),

      items: order.items.map((item) => ({
        productId: item.productId.toString(),
        variantId: item.variantId.toString(),
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        mrp: item.mrp,
        image: item.image,
      })),
    };
  }
}
