export interface ICancelOrderUseCase {
    execute(orderId: string): Promise<void>;
}