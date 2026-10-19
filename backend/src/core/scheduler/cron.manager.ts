import cron from "node-cron";
import { container } from "../../di/container.js";
import { AutoCancelOrderUseCase } from "../../modules/order/use-cases/auto-cancel-order.use-case.js";

export function startCronJobs() {
    cron.schedule("*/30 * * * *", async () => {
        // An escaped rejection here would be unhandled and can take the whole server down.
        try {
            const useCase = container.resolve(AutoCancelOrderUseCase);
            await useCase.execute();
        } catch (error) {
            console.error("Auto-cancel job failed:", error);
        }
    });
}