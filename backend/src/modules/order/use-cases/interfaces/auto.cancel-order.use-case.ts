export interface IAutoCancelOrderUseCase {
    execute(): Promise<void>;
}