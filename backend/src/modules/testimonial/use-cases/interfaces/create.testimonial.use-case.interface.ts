import type { CreateTestimonialRequestDto } from "../../dtos/testimonial.dto.js";

export interface ICreateTestimonialUseCase {
    execute(dto: CreateTestimonialRequestDto): Promise<void>;
}
