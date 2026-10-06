import reportRouter from "./routes/report.routes.js";
import type { Application } from 'express';

export default function registerReportModule(app:Application){
    app.use("/api/v1/reports", reportRouter);
}
