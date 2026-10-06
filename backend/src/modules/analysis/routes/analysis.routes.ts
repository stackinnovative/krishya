import { Router } from "express";
import { container } from "../../../di/container.js";
import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { AnalysisController } from "../controller/analysis.controller.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";

const router = Router();

const authenticate = container.resolve(Authenticate);

const analysisController = container.resolve(AnalysisController);

//get revenue chart
router.get("/revenue-chart",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) =>
    analysisController.getRevenueChart(req, res),
);

// get KPI cards
router.get("/kpis",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => analysisController.getKpiCards(req, res));

// get product rankings
router.get("/product-rankings",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) =>
    analysisController.getProductRankings(req, res),
);

// get category rankings
router.get("/category-rankings",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) =>
    analysisController.getCategoryRankings(req, res),
);

// get motivation summary
router.get("/motivation",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) =>
    analysisController.getMotivationSummary(req, res),
);

// get order status distribution
router.get("/order-status",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => analysisController.getOrderStatusDistribution(req, res));

export default router;
