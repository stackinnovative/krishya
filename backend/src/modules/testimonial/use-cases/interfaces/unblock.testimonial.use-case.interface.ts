export interface IUnblockTestimonialUseCase {
    execute(id: string): Promise<void>;
}
