import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import type { IEditTestimonialUseCase } from "./interfaces/edit.testimonial.use-case.interface.js";
import type { ITestimonialRepository } from "../repositories/testimonial.repository.interface.js";
import type { EditTestimonialRequestDto } from "../dtos/testimonial.dto.js";

@injectable()
export class EditTestimonialUseCase implements IEditTestimonialUseCase {
    constructor(
        @inject("ITestimonialRepository")
        private readonly _testimonialRepository: ITestimonialRepository
    ) { }

    async execute(
        id: string,
        dto: EditTestimonialRequestDto
    ): Promise<void> {
        const testimonial = await this._testimonialRepository.findById(id);

        if (!testimonial) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }

        const updatedTestimonial = testimonial.updateDetails({
            comment: dto.comment,
            author: dto.author,
        });

        const saved = await this._testimonialRepository.save(updatedTestimonial);

        if (!saved) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_UPDATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
