import { inject, injectable } from "tsyringe";
import type { IGetTestimonialsForAdminUseCase } from "./interfaces/get.testimonials.for.admin.use-case.interface.js";
import type { ITestimonialRepository } from "../repositories/testimonial.repository.interface.js";
import type { TestimonialView } from "../types/testimonial.type.js";

@injectable()
export class GetTestimonialsForAdminUseCase implements IGetTestimonialsForAdminUseCase {
    constructor(
        @inject("ITestimonialRepository")
        private readonly _testimonialRepository: ITestimonialRepository
    ) { }

    async execute(): Promise<TestimonialView[]> {
        const testimonials = await this._testimonialRepository.getAllTestimonialsForAdmin();
        return testimonials;
    }
}