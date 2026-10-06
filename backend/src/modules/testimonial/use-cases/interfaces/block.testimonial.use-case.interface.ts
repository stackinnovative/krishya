export interface IBlockTestimonialUseCase {
    execute(id: string): Promise<void>;
}
