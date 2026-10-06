import { injectable } from "tsyringe";
import type { ITestimonialRepository } from "./testimonial.repository.interface.js";
import { Testimonial } from "../entities/testimonial.entity.js";
import { TestimonialModel } from "../infrastructure/testimonial.schema.js";
import { TestimonialMapper } from "../mappers/testimonial.mapper.js";
import type { TestimonialView, UserTestimonialView } from "../types/testimonial.type.js";

@injectable()
export class TestimonialRepository implements ITestimonialRepository {
    async create(testimonialEntity: Testimonial): Promise<Testimonial> {
        const persistenceData = TestimonialMapper.toPersistence(testimonialEntity);
        const createdTestimonial = await TestimonialModel.create(persistenceData);
        return TestimonialMapper.toDomain(createdTestimonial)!;
    }

    async findById(id: string): Promise<Testimonial | null> {
        const testimonial = await TestimonialModel.findById(id).lean();
        if (!testimonial) return null;
        return TestimonialMapper.toDomain(testimonial);
    }

    async save(testimonialEntity: Testimonial): Promise<Testimonial> {
        const { id } = testimonialEntity;
        if (!id) {
            throw new Error("Cannot save testimonial without an ID");
        }

        const persistenceData = TestimonialMapper.toPersistence(testimonialEntity);
        const updatedTestimonial = await TestimonialModel.findByIdAndUpdate(
            id,
            { $set: persistenceData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedTestimonial) {
            throw new Error("Testimonial not found for update");
        }

        return TestimonialMapper.toDomain(updatedTestimonial)!;
    }

    async delete(id: string): Promise<void> {
        await TestimonialModel.findByIdAndDelete(id);
    }

    async getAllTestimonialsForUser(): Promise<UserTestimonialView[]> {
        const testimonials = await TestimonialModel.find({ isActive: true }).lean();
        return testimonials.map((testimonial) => TestimonialMapper.toUserView(testimonial)!);
    }

    async getAllTestimonialsForAdmin(): Promise<TestimonialView[]> {
        const testimonials = await TestimonialModel.find().lean();
        return testimonials.map((testimonial) => TestimonialMapper.toAdminView(testimonial)!);
    }
}
