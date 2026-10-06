import { container } from "tsyringe";
import type { ITestimonialRepository } from "../modules/testimonial/repositories/testimonial.repository.interface.js";
import { TestimonialRepository } from "../modules/testimonial/repositories/testimonial.repository.js";
import type { ICreateTestimonialUseCase } from "../modules/testimonial/use-cases/interfaces/create.testimonial.use-case.interface.js";
import { CreateTestimonialUseCase } from "../modules/testimonial/use-cases/create.testimonial.use-case.js";
import type { IEditTestimonialUseCase } from "../modules/testimonial/use-cases/interfaces/edit.testimonial.use-case.interface.js";
import { EditTestimonialUseCase } from "../modules/testimonial/use-cases/edit.testimonial.use-case.js";
import type { IBlockTestimonialUseCase } from "../modules/testimonial/use-cases/interfaces/block.testimonial.use-case.interface.js";
import { BlockTestimonialUseCase } from "../modules/testimonial/use-cases/block.testimonial.use-case.js";
import type { IUnblockTestimonialUseCase } from "../modules/testimonial/use-cases/interfaces/unblock.testimonial.use-case.interface.js";
import { UnblockTestimonialUseCase } from "../modules/testimonial/use-cases/unblock.testimonial.use-case.js";
import type { IGetTestimonialsForUserUseCase } from "../modules/testimonial/use-cases/interfaces/get.testimonials.for.user.use-case.interface.js";
import { GetTestimonialsForUserUseCase } from "../modules/testimonial/use-cases/get.testimonials.for.user.use-case.js";
import type { IGetTestimonialsForAdminUseCase } from "../modules/testimonial/use-cases/interfaces/get.testimonials.for.admin.use-case.interface.js";
import { GetTestimonialsForAdminUseCase } from "../modules/testimonial/use-cases/get.testimonials.for.admin.use-case.js";
import type { IGetTestimonialByIdUseCase } from "../modules/testimonial/use-cases/interfaces/get.testimonial.by.id.use-case.interface.js";
import { GetTestimonialByIdUseCase } from "../modules/testimonial/use-cases/get.testimonial.by.id.use-case.js";
import type { IDeleteTestimonialUseCase } from "../modules/testimonial/use-cases/interfaces/delete.testimonial.use-case.interface.js";
import { DeleteTestimonialUseCase } from "../modules/testimonial/use-cases/delete.testimonial.use-case.js";


export const registerTestimonialDependencies = () => {
    container.register<ITestimonialRepository>("ITestimonialRepository", {
        useClass: TestimonialRepository,
    });
    container.register<ICreateTestimonialUseCase>("ICreateTestimonialUseCase", {
        useClass: CreateTestimonialUseCase,
    });
    container.register<IEditTestimonialUseCase>("IEditTestimonialUseCase", {
        useClass: EditTestimonialUseCase,
    });
    container.register<IBlockTestimonialUseCase>("IBlockTestimonialUseCase", {
        useClass: BlockTestimonialUseCase,
    });
    container.register<IUnblockTestimonialUseCase>("IUnblockTestimonialUseCase", {
        useClass: UnblockTestimonialUseCase,
    });
    container.register<IGetTestimonialsForUserUseCase>("IGetTestimonialsForUserUseCase", {
        useClass: GetTestimonialsForUserUseCase,
    });
    container.register<IGetTestimonialsForAdminUseCase>("IGetTestimonialsForAdminUseCase", {
        useClass: GetTestimonialsForAdminUseCase,
    });

    container.register<IGetTestimonialByIdUseCase>("IGetTestimonialByIdUseCase", {
        useClass: GetTestimonialByIdUseCase,
    });
    container.register<IDeleteTestimonialUseCase>("IDeleteTestimonialUseCase", {
        useClass: DeleteTestimonialUseCase,
    });
}