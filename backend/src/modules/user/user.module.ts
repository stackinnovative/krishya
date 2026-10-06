import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import type { Application } from 'express';

export default function registerUserModule(app:Application){
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/admin", adminRoutes);
}
