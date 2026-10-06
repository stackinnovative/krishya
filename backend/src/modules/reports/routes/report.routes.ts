import { Router } from "express";
import { container } from "../../../di/container.js";
import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { ReportController } from "../controller/report.controller.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";


const router = Router();

const authenticate = container.resolve(Authenticate);

const reportController = container.resolve(ReportController);

//get revenue chart
router.get("/revenue",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => reportController.getRevenueReport(req, res),
);

export default router;