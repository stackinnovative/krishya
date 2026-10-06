import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { handleError } from "../../../core/errors/custom.error.js";
import { validateObjectId } from "../../../core/utils/validate.object.id.helper.js";

import type { ITestimonialController } from "./testimonial.controller.interface.js";
import type { ICreateTestimonialUseCase } from "../use-cases/interfaces/create.testimonial.use-case.interface.js";
import type { IEditTestimonialUseCase } from "../use-cases/interfaces/edit.testimonial.use-case.interface.js";
import type { IBlockTestimonialUseCase } from "../use-cases/interfaces/block.testimonial.use-case.interface.js";
import type { IUnblockTestimonialUseCase } from "../use-cases/interfaces/unblock.testimonial.use-case.interface.js";
import type { IGetTestimonialsForUserUseCase } from "../use-cases/interfaces/get.testimonials.for.user.use-case.interface.js";
import type { IGetTestimonialsForAdminUseCase } from "../use-cases/interfaces/get.testimonials.for.admin.use-case.interface.js";

import {
    CreateTestimonialSchema,
    EditTestimonialSchema,
    type CreateTestimonialRequestDto,
    type EditTestimonialRequestDto,
} from "../dtos/testimonial.dto.js";

import type { IGetTestimonialByIdUseCase } from "../use-cases/interfaces/get.testimonial.by.id.use-case.interface.js";
import type { IDeleteTestimonialUseCase } from "../use-cases/interfaces/delete.testimonial.use-case.interface.js";

@injectable()
export class TestimonialController implements ITestimonialController {
    constructor(
        @inject("ICreateTestimonialUseCase")
        private readonly _createTestimonialUseCase: ICreateTestimonialUseCase,

        @inject("IEditTestimonialUseCase")
        private readonly _editTestimonialUseCase: IEditTestimonialUseCase,

        @inject("IBlockTestimonialUseCase")
        private readonly _blockTestimonialUseCase: IBlockTestimonialUseCase,

        @inject("IUnblockTestimonialUseCase")
        private readonly _unblockTestimonialUseCase: IUnblockTestimonialUseCase,

        @inject("IGetTestimonialsForUserUseCase")
        private readonly _getTestimonialsForUserUseCase: IGetTestimonialsForUserUseCase,

        @inject("IGetTestimonialsForAdminUseCase")
        private readonly _getTestimonialsForAdminUseCase: IGetTestimonialsForAdminUseCase,

        @inject("IGetTestimonialByIdUseCase")
        private readonly _getTestimonialByIdUseCase: IGetTestimonialByIdUseCase,

        @inject("IDeleteTestimonialUseCase")
        private readonly _deleteTestimonialUseCase: IDeleteTestimonialUseCase,
    ) { }

    async createTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateTestimonialRequestDto = CreateTestimonialSchema.parse(req.body);

            await this._createTestimonialUseCase.execute(dto);

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: ResponseMessages.TESTIMONIAL_CREATED,
            });
        } catch (error) {
            console.log("Error in createTestimonial:", error);
            handleError(res, error);
        }
    }

    async editTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            const dto: EditTestimonialRequestDto = EditTestimonialSchema.parse(req.body);

            await this._editTestimonialUseCase.execute(id!, dto);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.TESTIMONIAL_UPDATED,
            });
        } catch (error) {
            console.log("Error in editTestimonial:", error);
            handleError(res, error);
        }
    }

    async blockTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._blockTestimonialUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.TESTIMONIAL_DEACTIVATED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in blockTestimonial:", error);
            handleError(res, error);
        }
    }

    async unblockTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._unblockTestimonialUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.TESTIMONIAL_ACTIVATED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in unblockTestimonial:", error);
            handleError(res, error);
        }
    }

    async getTestimonialsForAdmin(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getTestimonialsForAdminUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data: data,
            });
        } catch (error) {
            console.log("Error in getTestimonialsForAdmin:", error);
            handleError(res, error);
        }
    }

    async getTestimonialsForUser(req: Request, res: Response): Promise<void> {
        try {
            const data = await this._getTestimonialsForUserUseCase.execute();

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data,
            });
        } catch (error) {
            console.log("Error in getTestimonialsForUser:", error);
            handleError(res, error);
        }
    }

    async getTestimonialById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            const data = await this._getTestimonialByIdUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.SUCCESS,
                data: data,
            });
        } catch (error) {
            console.log("Error in getTestimonialById:", error);
            handleError(res, error);
        }
    }

    async deleteTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            validateObjectId(id);

            await this._deleteTestimonialUseCase.execute(id!);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: ResponseMessages.TESTIMONIAL_DELETED_SUCCESSFULLY,
            });
        } catch (error) {
            console.log("Error in deleteTestimonial:", error);
            handleError(res, error);
        }
    }
}
