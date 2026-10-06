import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IBlockTestimonialUseCase } from "./interfaces/block.testimonial.use-case.interface.js";
import type { ITestimonialRepository } from "../repositories/testimonial.repository.interface.js";

@injectable()
export class BlockTestimonialUseCase implements IBlockTestimonialUseCase {
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

        if (!testimonial.isActive) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_ALREADY_DEACTIVATED,
                HttpStatusCode.BAD_REQUEST
            );
        }

        const updatedTestimonial = testimonial.deactivate();

        const saved = await this._testimonialRepository.save(updatedTestimonial);

        if (!saved) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_DEACTIVATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
