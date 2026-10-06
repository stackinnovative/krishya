export interface IAcceptOrderUseCase {
    execute(orderId: string): Promise<void>;
}