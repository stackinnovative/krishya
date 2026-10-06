import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IUnblockTestimonialUseCase } from "./interfaces/unblock.testimonial.use-case.interface.js";
import type { ITestimonialRepository } from "../repositories/testimonial.repository.interface.js";

@injectable()
export class UnblockTestimonialUseCase implements IUnblockTestimonialUseCase {
    constructor(
        @inject("ITestimonialRepository")
        private readonly _testimonialRepository: ITestimonialRepository
    ) { }

    async execute(id: string): Promise<void> {
        const testimonial = await this._testimonialRepository.findById(id);

        if (!testimonial) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }
        if (testimonial.isActive) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_ALREADY_ACTIVATED,
                HttpStatusCode.BAD_REQUEST
            );
        }

        const updatedTestimonial = testimonial.activate();

        const saved = await this._testimonialRepository.save(updatedTestimonial);

        if (!saved) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_ACTIVATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
