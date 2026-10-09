import aboutRoutes from "./routes/about.routes.js";
import type { Application } from "express";

export default function registerAboutModule(app: Application) {
    app.use("/api/v1/about", aboutRoutes);
}
