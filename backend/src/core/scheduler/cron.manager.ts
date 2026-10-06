import cron from "node-cron";
import { container } from "../../di/container.js";
import { AutoCancelOrderUseCase } from "../../modules/order/use-cases/auto-cancel-order.use-case.js";

export function startCronJobs() {
    cron.schedule("*/30 * * * *", async () => {

        const useCase = container.resolve(AutoCancelOrderUseCase);
        await useCase.execute();
    });
}