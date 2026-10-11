export interface IDeleteFaqGroupUseCase {
    execute(id: string): Promise<void>;
}
