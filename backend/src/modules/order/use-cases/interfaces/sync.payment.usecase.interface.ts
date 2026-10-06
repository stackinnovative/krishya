export interface ISyncPaymentUseCase {
    execute(localOrderId: string): Promise<{ status: string }>;
}