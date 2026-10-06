import { inject, injectable } from "tsyringe";
import type { IDeleteTestimonialUseCase } from "./interfaces/delete.testimonial.use-case.interface.js";
import type { ITestimonialRepository } from "../repositories/testimonial.repository.interface.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";

@injectable()
export class DeleteTestimonialUseCase implements IDeleteTestimonialUseCase {
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

        await this._testimonialRepository.delete(id);
    }
}
