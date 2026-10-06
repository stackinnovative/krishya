import analysisRouter from "./routes/analysis.routes.js";
import type { Application } from 'express';

export default function registerAnalysisModule(app:Application){
    app.use("/api/v1/analysis", analysisRouter);
}
