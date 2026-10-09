import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";

import type { IAboutController } from "./about.controller.interface.js";
import type { IGetAboutUseCase } from "../use-cases/interfaces/get.about.use-case.interface.js";
import type { IUpdateAboutUseCase } from "../use-cases/interfaces/update.about.use-case.interface.js";
import { UpdateAboutSchema, type UpdateAboutRequestDto } from "../dtos/about.dto.js";

@injectable()
export class AboutController implements IAboutController {
    constructor(
        @inject("IGetAboutUseCase")
        private readonly _getAboutUseCase: IGetAboutUseCase,

        @inject("IUpdateAboutUseCase")
        private readonly _updateAboutUseCase: IUpdateAboutUseCase,
    ) { }

    async getAbout(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getAboutUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.ABOUT_FETCHED_SUCCESSFULLY,
                data,
            });
        } catch (error) {
            console.log("Error in getAbout:", error);
            handleError(res, error);
        }
    }

    async updateAbout(req: Request, res: Response): Promise<void> {
        try {
            const dto: UpdateAboutRequestDto = UpdateAboutSchema.parse(req.body);

            const data = await this._updateAboutUseCase.execute(dto);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.ABOUT_UPDATED,
                data,
            });
        } catch (error) {
            console.log("Error in updateAbout:", error);
            handleError(res, error);
        }
    }
}
