import orderRoutes from './routes/order.routes.js'
import type { Application } from 'express';

export default function registerOrderModule(app: Application) {
    app.use("/api/v1/orders", orderRoutes);

}
