import cartRoutes from './routes/cart.routes.js'
import type { Application } from 'express';

export default function registerCartModule(app:Application){
    app.use("/api/v1/cart", cartRoutes);
    
}
