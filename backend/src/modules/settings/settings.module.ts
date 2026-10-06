import settingsRoutes from './routes/settings.routes.js'
import type { Application } from 'express';

export default function registerSettingsModule(app: Application) {
    app.use("/api/v1/settings", settingsRoutes);
}
