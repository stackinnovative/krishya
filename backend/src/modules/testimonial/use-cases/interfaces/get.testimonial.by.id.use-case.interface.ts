import type { TestimonialView } from "../../types/testimonial.type.js";

export interface IGetTestimonialByIdUseCase {
    execute(id: string): Promise<TestimonialView>;
}   