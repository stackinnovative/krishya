export interface IDeleteFaqUseCase {
    execute(id: string): Promise<void>;
}
