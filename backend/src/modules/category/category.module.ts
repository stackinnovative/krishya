import categoryRouter from './routes/category.routes.js';
import type { Application } from 'express';

export default function registerCategoryModule(app:Application){
    app.use("/api/v1/categories", categoryRouter);
}
