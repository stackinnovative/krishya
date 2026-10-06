import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";

import type { ISettingsController } from "./settings.controller.interface.js";
import type { IGetSettingsUseCase } from "../use-cases/interfaces/get.settings.use-case.interface.js";
import type { IUpdateSettingsUseCase } from "../use-cases/interfaces/update.settings.use-case.interface.js";
import { UpdateSettingsSchema, type UpdateSettingsRequestDto } from "../dtos/settings.dto.js";

@injectable()
export class SettingsController implements ISettingsController {
    constructor(
        @inject("IGetSettingsUseCase")
        private readonly _getSettingsUseCase: IGetSettingsUseCase,

        @inject("IUpdateSettingsUseCase")
        private readonly _updateSettingsUseCase: IUpdateSettingsUseCase,
    ) { }

    async getSettings(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getSettingsUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SETTINGS_FETCHED_SUCCESSFULLY,
                data,
            });
        } catch (error) {
            console.log("Error in getSettings:", error);
            handleError(res, error);
        }
    }

    async updateSettings(req: Request, res: Response): Promise<void> {
        try {
            const dto: UpdateSettingsRequestDto = UpdateSettingsSchema.parse(req.body);

            const data = await this._updateSettingsUseCase.execute(dto);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SETTINGS_UPDATED,
                data,
            });
        } catch (error) {
            console.log("Error in updateSettings:", error);
            handleError(res, error);
        }
    }
}
