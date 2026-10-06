import { Cart } from "../entities/cart.entity.js";
import type {
  CartView,
  CheckoutView,
} from "../types/cart.type.js";

export class CartMapper {
  /* ================= DOMAIN ================= */

  static toDomain(cartModelData: any): Cart | null {
    if (!cartModelData) return null;

    const idString =
      cartModelData._id?.toString() || cartModelData.id?.toString();

    if (!idString) {
      console.error("Cart data missing ID:", cartModelData);
      return null;
    }

    return new Cart({
      id: idString,
      userId: cartModelData.userId?.toString() || null,
      guestId: cartModelData.guestId || null,

      items:
        cartModelData.items?.map((item: any) => ({
          id: item._id?.toString() || item.id?.toString(),
          productId: item.productId?.toString(),
          variantId: item.variantId?.toString(),
          quantity: item.quantity,
        })) ?? [],

      isActive: cartModelData.isActive,
    });
  }

  /* ================= PERSISTENCE ================= */

  static toPersistence(cartEntity: Cart): any {
    return {
      userId: cartEntity.userId,
      guestId: cartEntity.guestId,

      items: cartEntity.items.map((item) => ({
        _id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),

      isActive: cartEntity.isActive,
    };
  }

  /* ================= VIEW ================= */
  static toView(raw: any): CartView {
    return {
      id: raw._id?.toString() || raw.id,
      guestId: raw.guestId,

      items: raw.items.map((item: any) => ({
        itemId: item.id?.toString(),
        variant: {
          id: item.variantId?.id?.toString(),
          size: item.variantId?.size
        },
        quantity: item.quantity,

        product: {
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
        },
      })),

      totalItems: raw.totalItems,
      totalPrice: raw.totalPrice,
      deliveryCharge: raw.deliveryCharge,
      total: raw.total,
    };
  }

  static toCheckoutView(raw: any): CheckoutView {
    return {
      cartId: raw._id?.toString() || raw.id,
      items: raw.items.map((item: any) => ({
        name: item.product.name,
        size: item.variantId.size,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image,
      })),
      totalItems: raw.totalItems,
      subTotal: raw.subTotal,
      deliveryCharge: raw.deliveryCharge,
      total: raw.total,
    };
  }

}
