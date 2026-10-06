import heroRoutes from './routes/hero.routes.js'
import type { Application } from 'express';

export default function registerHeroModule(app: Application) {
    app.use("/api/v1/heroes", heroRoutes);
}
