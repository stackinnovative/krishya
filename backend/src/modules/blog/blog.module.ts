import blogRoutes from './routes/blog.routes.js'
import type { Application } from 'express';

export default function registerBlogModule(app: Application) {
    app.use("/api/v1/blogs", blogRoutes);
}
