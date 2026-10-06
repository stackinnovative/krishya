import type { UserTestimonialView } from "../../types/testimonial.type.js";

export interface IGetTestimonialsForUserUseCase {
    execute(): Promise<UserTestimonialView[]>;
}
