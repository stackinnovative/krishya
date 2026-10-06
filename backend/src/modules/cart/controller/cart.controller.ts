import { inject, injectable } from "tsyringe";
import type { ICartController } from "./cart.controller.interface.js";
import { AddCartItemSchema } from "../dtos/create.cart.dto.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";
import type { Request, Response } from "express";
import type { ICreateCartUseCase } from "../use-cases/interfaces/create.cart.use-case.interface.js";
import type { IGetCartUseCase } from "../use-cases/interfaces/get.cart.use-case.interface.js";
import { GuestIdSchema } from "../../../core/utils/guest.id.validation.js";
import type { IRemoveCartItemUseCase } from "../use-cases/interfaces/remove.cart.item.use-case.interface.js";
import type { IUpdateCartCountUseCase } from "../use-cases/interfaces/update.cart.count.use-case.interface.js";
import { RemoveCartItemSchema } from "../dtos/remove.cart.dto.js";
import { UpdateCartItemQuantitySchema } from "../dtos/update.cart.dto.js";
import type { IGetCheckoutItemUseCase } from "../use-cases/interfaces/get.checkout.item.use-case.interface.js";
import type { IGetCartItemsCountUseCase } from "../use-cases/interfaces/get.cart.items.count.use-case.interface.js";

@injectable()
export class CartController implements ICartController {

    constructor(
        @inject("ICreateCartUseCase") private _createCartUseCase: ICreateCartUseCase,
        @inject("IGetCartUseCase") private _getCartUseCase: IGetCartUseCase,
        @inject("IRemoveCartItemUseCase") private _removeCartItemUseCase: IRemoveCartItemUseCase,
        @inject("IUpdateCartCountUseCase") private _updateCartCountUseCase: IUpdateCartCountUseCase,
        @inject("IGetCheckoutItemUseCase") private _getCheckoutItemUseCase: IGetCheckoutItemUseCase,
        @inject("IGetCartItemsCountUseCase") private _getCartItemsCountUseCase: IGetCartItemsCountUseCase,
    ) { }

    async addToCart(req: Request, res: Response): Promise<void> {
        try {
            const dto = AddCartItemSchema.parse(req.body);
            await this._createCartUseCase.execute(dto)
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.CART_ITEM_ADDED_SUCCESS,
            });
        } catch (error) {
            handleError(res, error)
            console.log("error in add cart controller", error)
        }
    }

    async getCart(req: Request, res: Response): Promise<void> {
        try {
            const guestId = req.params.guestId;
            const dto = GuestIdSchema.parse(guestId);
            const cart = await this._getCartUseCase.execute(dto);
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data: cart,
            });
        } catch (error) {
            handleError(res, error)
            console.log("error in get cart controller", error)
        }
    }

    async removeCartItem(req: Request, res: Response): Promise<void> {
        try {
            const dto = RemoveCartItemSchema.parse(req.body);
            await this._removeCartItemUseCase.execute(dto)
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.CART_ITEM_REMOVED_SUCCESS,
            });
        } catch (error) {
            handleError(res, error)
            console.log("error in remove cart item controller", error)
        }
    }

    async updateCartCount(req: Request, res: Response): Promise<void> {
        try {
            const dto = UpdateCartItemQuantitySchema.parse(req.body);
            await this._updateCartCountUseCase.execute(dto)
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.CART_COUNT_UPDATED_SUCCESS,
            });
        } catch (error) {
            handleError(res, error)
            console.log("error in update cart count controller", error)
        }
    }

    async getCheckoutItem(req: Request, res: Response): Promise<void> {
        try {
            const guestId = req.params.guestId;
            const dto = GuestIdSchema.parse(guestId);
            const checkoutItem = await this._getCheckoutItemUseCase.execute(dto);
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data: checkoutItem,
            });
        } catch (error) {
            handleError(res, error)
            console.log("error in get checkout item controller", error)
        }
    }

    async getCartItemsCount(req: Request, res: Response): Promise<void> {
        try {
            const guestId = req.params.guestId;
            const dto = GuestIdSchema.parse(guestId);
            const cartItemsCount = await this._getCartItemsCountUseCase.execute(dto);
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data: cartItemsCount,
            });
        } catch (error) {
            handleError(res, error)
            console.log("error in get cart items count controller", error)
        }
    }

}
