import type { EditTestimonialRequestDto } from "../../dtos/testimonial.dto.js";

export interface IEditTestimonialUseCase {
    execute(id: string, dto: EditTestimonialRequestDto): Promise<void>;
}
