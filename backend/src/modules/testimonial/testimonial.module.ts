import testimonialRoutes from './routes/testimonial.routes.js'
import type { Application } from 'express';

export default function registerTestimonialModule(app: Application) {
    app.use("/api/v1/testimonials", testimonialRoutes);
}
