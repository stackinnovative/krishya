import { inject, injectable } from "tsyringe";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

import { Testimonial } from "../entities/testimonial.entity.js";
import type { ICreateTestimonialUseCase } from "./interfaces/create.testimonial.use-case.interface.js";
import type { ITestimonialRepository } from "../repositories/testimonial.repository.interface.js";
import type { CreateTestimonialRequestDto } from "../dtos/testimonial.dto.js";

@injectable()
export class CreateTestimonialUseCase implements ICreateTestimonialUseCase {
    constructor(
        @inject("ITestimonialRepository")
        private readonly _testimonialRepository: ITestimonialRepository
    ) { }

    async execute(dto: CreateTestimonialRequestDto): Promise<void> {
        const testimonialEntity = new Testimonial({
            id: null,
            comment: dto.comment,
            author: dto.author,
            isActive: true,
        });

        const testimonial = await this._testimonialRepository.create(testimonialEntity);

        if (!testimonial) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_CREATE_FAILED,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
