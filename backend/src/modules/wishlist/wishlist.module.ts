import wishlistRoutes from './routes/wishlist.routes.js'
import type { Application } from 'express';

export default function registerWishlistModule(app: Application) {
    app.use("/api/v1/wishlist", wishlistRoutes);

}
