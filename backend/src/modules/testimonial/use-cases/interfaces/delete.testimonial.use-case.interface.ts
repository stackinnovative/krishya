export interface IDeleteTestimonialUseCase {
    execute(id: string): Promise<void>;
}
