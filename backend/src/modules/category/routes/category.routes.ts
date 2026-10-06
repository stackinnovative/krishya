import { Router } from "express";
import { container } from "tsyringe";

import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { CategoryController } from "../controller/category.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const categoryController = container.resolve(CategoryController);

/* ---------- CREATE ---------- */
router.post(
  "/",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => categoryController.createCategory(req, res),
);

/* ---------- EDIT ---------- */
router.put(
  "/:id",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => categoryController.editCategory(req, res),
);

/* ---------- BLOCK ---------- */
router.patch(
  "/:id/block",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => categoryController.blockCategory(req, res),
);

/* ---------- UNBLOCK ---------- */
router.patch(
  "/:id/unblock",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => categoryController.unblockCategory(req, res),
);

/* ---------- USER: get all active categories (flat list) ---------- */
router.get(
  "/list",

  (req, res) => categoryController.getActiveCategoriesForUser(req, res),
);

/* ---------- ADMIN: get all categories ---------- */
router.get(
  "/",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => categoryController.getAllCategoriesForAdmin(req, res),
);

/* ---------- USER: get signature categories ---------- */
router.get(
  "/signature",

  (req, res) => categoryController.getSignatureCategories(req, res),
);

/* ---------- GET CATEGORY BY ID ---------- */
router.get(
  "/:id",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => categoryController.getCategoryById(req, res),
);

export default router;
