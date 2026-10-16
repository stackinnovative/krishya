import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";

import { Cart } from "../entities/cart.entity.js";
import { CartModel } from "../infrastructure/cart.schema.js";
import { CartMapper } from "../mappers/cart.mapper.js";
import type { ICartRepository } from "./cart.repository.interface.js";
import type {
  AddCartItemPayload,
  CartView,
  CheckoutView,
  FindSameItemInCartPayload,
  PushNewItemPayload,
  RemoveCartItemPayload
} from "../types/cart.type.js";
import type { ClientSession } from "mongoose";
import type { ISettingsRepository } from "../../settings/repositories/settings.repository.interface.js";


const { ObjectId } = Types;


@injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @inject("ISettingsRepository")
    private readonly _settingsRepository: ISettingsRepository
  ) { }

  async create(cartEntity: Cart): Promise<Cart> {
    const persistenceData = CartMapper.toPersistence(cartEntity);

    const created = await CartModel.create(persistenceData);

    const domainCart = CartMapper.toDomain(created);
    if (!domainCart) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    return domainCart;
  }

  async findById(id: string): Promise<Cart | null> {
    if (!ObjectId.isValid(id)) return null;

    const document = await CartModel.findById(id).lean();
    return CartMapper.toDomain(document);
  }

  async findByGuestId(guestId: string): Promise<Cart | null> {
    const document = await CartModel.findOne({
      guestId,
      isActive: true,
    }).lean();

    return CartMapper.toDomain(document);
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    if (!ObjectId.isValid(userId)) return null;

    const document = await CartModel.findOne({
      userId,
      isActive: true,
    }).lean();

    return CartMapper.toDomain(document);
  }

  async save(cartEntity: Cart): Promise<Cart> {
    if (!cartEntity.id) {
      throw new CustomError(
        ResponseMessages.ID_MISSING,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    const persistenceData = CartMapper.toPersistence(cartEntity);

    const updated = await CartModel.findByIdAndUpdate(
      cartEntity.id,
      { $set: persistenceData },
      { new: true }
    ).lean();

    if (!updated) {
      throw new CustomError(
        ResponseMessages.CART_NOT_FOUND,
        HttpStatusCode.NOT_FOUND
      );
    }

    const domainCart = CartMapper.toDomain(updated);

    if (!domainCart) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    return domainCart;
  }


  async incrementItemQuantity(
    dto: AddCartItemPayload
  ): Promise<boolean> {
    const { cartId, itemId, quantity, stock, guestId } = dto;

    if (!ObjectId.isValid(cartId)) return false;

    const updated = await CartModel.findOneAndUpdate(
      {
        _id: cartId,
        isActive: true,
        guestId,
        items: {
          $elemMatch: {
            _id: itemId,
            quantity: { $lte: stock - quantity },
          },
        },
      },
      {
        $inc: {
          "items.$.quantity": quantity,
        },
      },
      {
        new: false
      }
    ).lean();

    return !!updated;
  }

  async pushNewItem(
    dto: PushNewItemPayload
  ): Promise<boolean> {
    const { cartId, item, stock, guestId } = dto;
    if (!ObjectId.isValid(cartId)) return false;

    const updated = await CartModel.findOneAndUpdate(
      {
        _id: cartId,
        isActive: true,
        guestId,
        items: {
          $not: {
            $elemMatch: {
              productId: item.productId,
              variantId: item.variantId,
              quantity: { $lte: stock - item.quantity },
            },
          },
        },
      },
      {
        $push: {
          items: item,
        },
      },
      { new: false }
    ).lean();

    return !!updated;
  }

  async findSameItemInCart(
    dto: FindSameItemInCartPayload
  ): Promise<boolean> {
    const { cartId, itemId } = dto;

    if (!ObjectId.isValid(cartId)) return false;

    const document = await CartModel.findOne({
      _id: cartId,
      isActive: true,
      items: {
        $elemMatch: {
          _id: itemId,
        },
      },
    }).lean();

    return !!document;
  }

  async findCartForViewByGuestId(
    guestId: string
  ): Promise<CartView | null> {

    const result = await CartModel.aggregate([
      {
        $match: { guestId, isActive: true }
      },

      { $unwind: "$items" },

      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },

      { $unwind: "$product" },

      // find the selected quantity variant
      {
        $addFields: {
          selectedVariant: {
            $first: {
              $filter: {
                input: "$product.variants",
                as: "v",
                cond: { $eq: ["$$v._id", "$items.variantId"] }
              }
            }
          }
        }
      },

      {
        $project: {
          cartId: "$_id",
          guestId: 1,
          itemId: "$items._id",
          quantity: "$items.quantity",
          variantId: {
            id: "$items.variantId",
            size: { $concat: [{ $toString: "$selectedVariant.quantity" }, " ", "$selectedVariant.unit"] }
          },

          product: {
            name: "$product.name",
            image: { $arrayElemAt: ["$product.images.url", 0] },
            price: "$selectedVariant.price"
          }
        }
      },

      {
        $group: {
          _id: "$cartId",
          guestId: { $first: "$guestId" },
          items: {
            $push: {
              id: "$itemId",
              product: "$product",
              variantId: "$variantId",
              quantity: "$quantity"
            }
          },
          totalItems: { $sum: "$quantity" },
          totalPrice: {
            $sum: {
              $multiply: ["$quantity", "$product.price"]
            }
          }
        }
      }
    ]);

    if (!result.length) return null;

    const raw = result[0];
    const subTotal = raw.totalPrice;
    const settings = await this._settingsRepository.getSettings();
    const deliveryCharge = settings.calculateDeliveryCharge(subTotal);
    const total = subTotal + deliveryCharge;

    return CartMapper.toView({
      ...raw,
      deliveryCharge,
      total,
    });

  }

  async decrementItemQuantity(
    dto: AddCartItemPayload
  ): Promise<boolean> {
    const { cartId, itemId, quantity, guestId } = dto;

    if (!ObjectId.isValid(cartId)) return false;

    const updated = await CartModel.findOneAndUpdate(
      {
        _id: cartId,
        isActive: true,
        guestId,
        items: {
          $elemMatch: {
            _id: itemId,
            quantity: { $gt: 1 }
          },
        },
      },
      {
        $inc: {
          "items.$.quantity": -quantity,
        },
      },
      {
        new: false
      }
    ).lean();

    return !!updated;
  }

  async removeItem(
    dto: RemoveCartItemPayload
  ): Promise<boolean> {
    const { cartId, itemId, guestId } = dto;

    if (!ObjectId.isValid(cartId)) return false;

    const updated = await CartModel.findOneAndUpdate(
      {
        _id: cartId,
        isActive: true,
        guestId,
        items: {
          $elemMatch: {
            _id: itemId,
          },
        },
      },
      {
        $pull: {
          items: {
            _id: itemId,
          },
        },
      },
      {
        new: false
      }
    ).lean();

    return !!updated;
  }

  async getCheckoutViewByGuestId(guestId: string): Promise<CheckoutView | null> {


    const result = await CartModel.aggregate([
      {
        $match: { guestId, isActive: true }
      },

      { $unwind: "$items" },

      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },

      { $unwind: "$product" },

      // find the selected quantity variant
      {
        $addFields: {
          selectedVariant: {
            $first: {
              $filter: {
                input: "$product.variants",
                as: "v",
                cond: { $eq: ["$$v._id", "$items.variantId"] }
              }
            }
          }
        }
      },

      {
        $project: {
          cartId: "$_id",
          quantity: "$items.quantity",
          variantId: {
            size: { $concat: [{ $toString: "$selectedVariant.quantity" }, " ", "$selectedVariant.unit"] }
          },

          product: {
            name: "$product.name",
            image: { $arrayElemAt: ["$product.images.url", 0] },
            price: "$selectedVariant.price"
          }
        }
      },

      {
        $group: {
          _id: "$cartId",
          items: {
            $push: {
              product: "$product",
              variantId: "$variantId",
              quantity: "$quantity"
            }
          },
          totalItems: { $sum: "$quantity" },
          totalPrice: {
            $sum: {
              $multiply: ["$quantity", "$product.price"]
            }
          }
        }
      }
    ]);


    if (!result.length) return null;

    const raw = result[0];

    const subTotal = raw.totalPrice;
    const settings = await this._settingsRepository.getSettings();
    const deliveryCharge = settings.calculateDeliveryCharge(subTotal);
    const total = subTotal + deliveryCharge;

    return CartMapper.toCheckoutView({
      ...raw,
      subTotal,
      deliveryCharge,
      total
    });
  }

  async emptyCart(guestId: string, session?: ClientSession): Promise<void> {
    const options = session
      ? { session }
      : {};

    await CartModel.updateOne(
      {
        guestId,
        isActive: true,
      },
      {
        $set: {
          items: [],
        },
      },
      options
    )


  }

  async getCartItemsCount(guestId: string): Promise<number> {
    const cart = await CartModel.findOne(
      { guestId, isActive: true },
      { items: 1 }
    ).lean();

    if (!cart) return 0;

    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
