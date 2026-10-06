import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { handleError } from "../../../core/errors/custom.error.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";

import type { IHeroController } from "./hero.controller.interface.js";
import type { ICreateHeroUseCase } from "../use-cases/interfaces/create.hero.use-case.interface.js";
import type { IEditHeroUseCase } from "../use-cases/interfaces/edit.hero.use-case.interface.js";
import type { IBlockHeroUseCase } from "../use-cases/interfaces/block.hero.use-case.interface.js";
import type { IUnblockHeroUseCase } from "../use-cases/interfaces/unblock.hero.use-case.interface.js";
import type { IGetHeroUserUseCase } from "../use-cases/interfaces/get.hero.user.use-case.interface.js";
import type { IGetHeroAdminUseCase } from "../use-cases/interfaces/get.hero.admin.use-case.interface.js";

import {
    CreateHeroSchema,
    EditHeroSchema,
    type CreateHeroRequestDto,
    type EditHeroRequestDto,
} from "../dtos/hero.dto.js";

import { ResponseMessages } from "../../../core/constants/response.message.js";
import type { IGetHeroByIdUseCase } from "../use-cases/interfaces/get.hero.by.id.use-case.interface.js";

@injectable()
export class HeroController implements IHeroController {
    constructor(
        @inject("ICreateHeroUseCase")
        private readonly _createHeroUseCase: ICreateHeroUseCase,

        @inject("IEditHeroUseCase")
        private readonly _editHeroUseCase: IEditHeroUseCase,

        @inject("IBlockHeroUseCase")
        private readonly _blockHeroUseCase: IBlockHeroUseCase,

        @inject("IUnblockHeroUseCase")
        private readonly _unblockHeroUseCase: IUnblockHeroUseCase,

        @inject("IGetHeroUserUseCase")
        private readonly _getHeroUserUseCase: IGetHeroUserUseCase,

        @inject("IGetHeroAdminUseCase")
        private readonly _getHeroAdminUseCase: IGetHeroAdminUseCase,

        @inject("IGetHeroByIdUseCase")
        private readonly _getHeroByIdUseCase: IGetHeroByIdUseCase
    ) { }

    async createHero(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateHeroRequestDto = CreateHeroSchema.parse(req.body);

            await this._createHeroUseCase.execute(dto);

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: ResponseMessages.HERO_CREATED,
            });
        } catch (error) {
            console.log("Error in createHero:", error);
            handleError(res, error);
        }
    }

    async editHero(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            const dto: EditHeroRequestDto = EditHeroSchema.parse(req.body);

            await this._editHeroUseCase.execute(id!, dto);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.HERO_UPDATED,
            });
        } catch (error) {
            console.log("Error in editHero:", error);
            handleError(res, error);
        }
    }

    async blockHero(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._blockHeroUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.HERO_DEACTIVATED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in blockHero:", error);
            handleError(res, error);
        }
    }

    async unblockHero(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._unblockHeroUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.HERO_ACTIVATED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in unblockHero:", error);
            handleError(res, error);
        }
    }

    async getHeroForAdmin(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getHeroAdminUseCase.execute();
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.HERO_FETCHED_SUCCESSFULLY,
                data: data,
            });
        } catch (error) {
            console.log("Error in getHeroForAdmin:", error);
            handleError(res, error);
        }
    }

    async getHeroForUser(req: Request, res: Response): Promise<void> {
        try {

            const data = await this._getHeroUserUseCase.execute();
            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data: data,
            });
        } catch (error) {
            console.log("Error in getHeroForUser:", error);
            handleError(res, error);
        }
    }

    async getHeroById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            const data = await this._getHeroByIdUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.HERO_FETCHED_SUCCESSFULLY,
                data: data,
            });
        } catch (error) {
            console.log("Error in getHeroById:", error);
            handleError(res, error);
        }
    }
}
