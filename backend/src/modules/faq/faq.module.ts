import faqRoutes from './routes/faq.routes.js'
import type { Application } from 'express';

export default function registerFaqModule(app: Application) {
    app.use("/api/v1/faqs", faqRoutes);
}
