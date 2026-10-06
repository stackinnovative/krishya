import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";

import type { IBannerController } from "./banner.controller.interface.js";
import type { ICreateBannerUseCase } from "../use-cases/interfaces/create.banner.use-case.interface.js";
import type { IEditBannerUseCase } from "../use-cases/interfaces/edit.banner.use-case.interface.js";
import type { IBlockBannerUseCase } from "../use-cases/interfaces/block.banner.use-case.interface.js";
import type { IUnblockBannerUseCase } from "../use-cases/interfaces/unblock.banner.use-case.interface.js";
import type { IGetBannerUserUseCase } from "../use-cases/interfaces/get.banner.user.use-case.interface.js";
import type { IGetBannerAdminUseCase } from "../use-cases/interfaces/get.banner.admin.use-case.interface.js";
import type { IDeleteBannerUseCase } from "../use-cases/interfaces/delete.banner.use-case.interface.js";

import {
    CreateBannerSchema,
    EditBannerSchema,
    type CreateBannerRequestDto,
    type EditBannerRequestDto,
} from "../dtos/banner.dto.js";

import type { IGetBannerByIdUseCase } from "../use-cases/interfaces/get.banner.by.id.use-case.interface.js";

@injectable()
export class BannerController implements IBannerController {
    constructor(
        @inject("ICreateBannerUseCase")
        private readonly _createBannerUseCase: ICreateBannerUseCase,

        @inject("IEditBannerUseCase")
        private readonly _editBannerUseCase: IEditBannerUseCase,

        @inject("IBlockBannerUseCase")
        private readonly _blockBannerUseCase: IBlockBannerUseCase,

        @inject("IUnblockBannerUseCase")
        private readonly _unblockBannerUseCase: IUnblockBannerUseCase,

        @inject("IGetBannerUserUseCase")
        private readonly _getBannerUserUseCase: IGetBannerUserUseCase,

        @inject("IGetBannerAdminUseCase")
        private readonly _getBannerAdminUseCase: IGetBannerAdminUseCase,

        @inject("IGetBannerByIdUseCase")
        private readonly _getBannerByIdUseCase: IGetBannerByIdUseCase,

        @inject("IDeleteBannerUseCase")
        private readonly _deleteBannerUseCase: IDeleteBannerUseCase,
    ) { }

    async createBanner(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateBannerRequestDto = CreateBannerSchema.parse(req.body);

            await this._createBannerUseCase.execute(dto);

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: ResponseMessages.BANNER_CREATED,
            });
        } catch (error) {
            console.log("Error in createBanner:", error);
            handleError(res, error);
        }
    }

    async editBanner(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            const dto: EditBannerRequestDto = EditBannerSchema.parse(req.body);

            await this._editBannerUseCase.execute(id!, dto);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.BANNER_UPDATED,
            });
        } catch (error) {
            console.log("Error in editBanner:", error);
            handleError(res, error);
        }
    }

    async blockBanner(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._blockBannerUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.BANNER_DEACTIVATED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in blockBanner:", error);
            handleError(res, error);
        }
    }

    async unblockBanner(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._unblockBannerUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.BANNER_ACTIVATED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in unblockBanner:", error);
            handleError(res, error);
        }
    }

    async getBannerForAdmin(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getBannerAdminUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data,
            });
        } catch (error) {
            console.log("Error in getBannerForAdmin:", error);
            handleError(res, error);
        }
    }

    async getBannerForUser(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getBannerUserUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data: data,
            });
        } catch (error) {
            console.log("Error in getBannerForUser:", error);
            handleError(res, error);
        }
    }

    async getBannerById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            const data = await this._getBannerByIdUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data: data,
            });
        } catch (error) {
            console.log("Error in getBannerById:", error);
            handleError(res, error);
        }
    }

    async deleteBanner(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._deleteBannerUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.BANNER_DELETED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in deleteBanner:", error);
            handleError(res, error);
        }
    }
}
