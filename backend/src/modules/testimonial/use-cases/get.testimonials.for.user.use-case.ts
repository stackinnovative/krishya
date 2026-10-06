import { inject, injectable } from "tsyringe";
import type { IGetTestimonialsForUserUseCase } from "./interfaces/get.testimonials.for.user.use-case.interface.js";
import type { ITestimonialRepository } from "../repositories/testimonial.repository.interface.js";
import type { UserTestimonialView } from "../types/testimonial.type.js";

@injectable()
export class GetTestimonialsForUserUseCase implements IGetTestimonialsForUserUseCase {
    constructor(
        @inject("ITestimonialRepository")
        private readonly _testimonialRepository: ITestimonialRepository
    ) { }

    async execute(): Promise<UserTestimonialView[]> {
        const testimonials = await this._testimonialRepository.getAllTestimonialsForUser();
        return testimonials;
    }
}
