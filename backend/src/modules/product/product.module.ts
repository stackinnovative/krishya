import productRoutes from './routes/product.routes.js'
import type { Application } from 'express';

export default function registerProductModule(app:Application){
    app.use("/api/v1/products", productRoutes);
    
}
