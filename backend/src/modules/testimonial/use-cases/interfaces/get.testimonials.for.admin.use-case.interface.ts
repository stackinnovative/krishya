import type { TestimonialView } from "../../types/testimonial.type.js";

export interface IGetTestimonialsForAdminUseCase {
    execute(): Promise<TestimonialView[]>;
}   