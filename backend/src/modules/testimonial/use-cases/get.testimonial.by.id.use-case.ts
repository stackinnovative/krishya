import { inject, injectable } from "tsyringe";
import type { ITestimonialRepository } from "../repositories/testimonial.repository.interface.js";
import type { IGetTestimonialByIdUseCase } from "./interfaces/get.testimonial.by.id.use-case.interface.js";
import type { TestimonialView } from "../types/testimonial.type.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";

@injectable()
export class GetTestimonialByIdUseCase implements IGetTestimonialByIdUseCase {
    constructor(
        @inject("ITestimonialRepository")
        private readonly _testimonialRepository: ITestimonialRepository,
    ) { }

    async execute(id: string): Promise<TestimonialView> {
        const testimonial = await this._testimonialRepository.findById(id);
        if (!testimonial) {
            throw new CustomError(
                ResponseMessages.TESTIMONIAL_NOT_FOUND,
                HttpStatusCode.NOT_FOUND
            );
        }
        return {
            id: testimonial.id!,
            author: testimonial.author,
            comment: testimonial.comment,
            isActive: testimonial.isActive,
        };
    }
}