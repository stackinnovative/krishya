import { Testimonial } from "../entities/testimonial.entity.js";
import type { TestimonialView, UserTestimonialView } from "../types/testimonial.type.js";
export interface ITestimonialRepository {
    create(testimonialEntity: Testimonial): Promise<Testimonial>;
    findById(id: string): Promise<Testimonial | null>;
    save(testimonialEntity: Testimonial): Promise<Testimonial>;
    delete(id: string): Promise<void>;
    getAllTestimonialsForUser(): Promise<UserTestimonialView[]>;
    getAllTestimonialsForAdmin(): Promise<TestimonialView[]>;
}
