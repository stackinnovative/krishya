import bannerRoutes from './routes/banner.routes.js'
import type { Application } from 'express';

export default function registerBannerModule(app: Application) {
    app.use("/api/v1/banners", bannerRoutes);
}
