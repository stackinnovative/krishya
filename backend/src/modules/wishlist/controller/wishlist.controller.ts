import { inject, injectable } from "tsyringe";
import type { Request, Response } from "express";

import type { IWishlistController } from "./wishlist.controller.interface.js";
import { ToggleWishlistSchema } from "../dtos/toggle.wishlist.dto.js";
import { GuestIdSchema } from "../../../core/utils/guest.id.validation.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";

import type { IToggleWishlistUseCase } from "../use-cases/interfaces/toggle.wishlist.use-case.interface.js";
import type { IGetWishlistUseCase } from "../use-cases/interfaces/get.wishlist.use-case.interface.js";
import type { IGetWishlistIdsUseCase } from "../use-cases/interfaces/get.wishlist.ids.use-case.interface.js";

@injectable()
export class WishlistController implements IWishlistController {
  constructor(
    @inject("IToggleWishlistUseCase")
    private _toggleWishlistUseCase: IToggleWishlistUseCase,

    @inject("IGetWishlistUseCase")
    private _getWishlistUseCase: IGetWishlistUseCase,

    @inject("IGetWishlistIdsUseCase")
    private _getWishlistIdsUseCase: IGetWishlistIdsUseCase
  ) {}

  async toggleWishlist(req: Request, res: Response): Promise<void> {
    try {
      const dto = ToggleWishlistSchema.parse(req.body);
      const result = await this._toggleWishlistUseCase.execute(dto);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: result.added
          ? ResponseMessages.WISHLIST_ITEM_ADDED_SUCCESS
          : ResponseMessages.WISHLIST_ITEM_REMOVED_SUCCESS,
        data: result,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in toggle wishlist controller", error);
    }
  }

  async getWishlist(req: Request, res: Response): Promise<void> {
    try {
      const guestId = req.params.guestId;
      const dto = GuestIdSchema.parse(guestId);
      const wishlist = await this._getWishlistUseCase.execute(dto);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: wishlist,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get wishlist controller", error);
    }
  }

  async getWishlistIds(req: Request, res: Response): Promise<void> {
    try {
      const guestId = req.params.guestId;
      const dto = GuestIdSchema.parse(guestId);
      const productIds = await this._getWishlistIdsUseCase.execute(dto);
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: ResponseMessages.SUCCESS,
        data: productIds,
      });
    } catch (error) {
      handleError(res, error);
      console.log("error in get wishlist ids controller", error);
    }
  }
}
