import { Router } from "express";
import { container } from "tsyringe";

import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { ProductController } from "../controller/product.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const productController = container.resolve(ProductController);

/* ---------- CREATE PRODUCT ---------- */
router.post(
  "/",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.createProduct(req, res),
);

/* ---------- EDIT PRODUCT ---------- */
router.put(
  "/:id",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.editProduct(req, res),
);

/* ---------- BLOCK PRODUCT ---------- */
router.patch(
  "/:id/block",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.blockProduct(req, res),
);

/* ---------- UNBLOCK PRODUCT ---------- */
router.patch(
  "/:id/unblock",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.unblockProduct(req, res),
);

/* ---------- ADMIN: GET ALL PRODUCTS ---------- */
router.get(
  "/",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.getAllProductForAdmin(req, res),
);

/* ---------- USER: GET ALL PRODUCTS ---------- */
router.get(
  "/list",
  (req, res) => productController.getAllProductForUser(req, res),
);

/* ---------- USER: GET PRODUCT BY SLUG (the /products/<slug> page) ---------- */
router.get(
  "/slug/:slug",
  (req, res) => productController.getProductBySlugForUser(req, res),
);

/* ---------- GET FEATURED PRODUCTS ---------- */
router.get(
  "/featured",
  (req, res) => productController.getFeaturedProducts(req, res)
)

/* ---------- GET PRODUCT DETAILS FOR ADMIN ---------- */
router.get("/:id",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.getProductDetailsForAdmin(req, res)
)

/* ---------- ADD VARIANT ---------- */
router.post(
  "/:productId/variants",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.addVariant(req, res),
);

/* ---------- EDIT VARIANT ---------- */
router.put(
  "/:productId/variants/:variantId",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.editVariant(req, res),
);

/* ---------- GET VARIANT DETAILS FOR ADMIN ---------- */
router.get(
  "/:productId/variants/:variantId",
  authenticate.authenticate,
  authorizeRoles("admin"),
  (req, res) => productController.getAdminProductVariant(req, res)
)

/* ---------- GET PRODUCT DETAILS FOR USER ---------- */
router.get("/list/:id",
  (req, res) => productController.getProductDetailsForUser(req, res)
)

/* ---------- GET RELATED PRODUCTS ---------- */
router.get("/related/:categoryId",
  (req, res) => productController.getRelatedProducts(req, res)
)

/* ---------- GET PRODUCT VARIANT FOR USER ---------- */
router.get("/list/:productId/variants/:variantId",
  (req, res) => productController.getProductVariantForUser(req, res)
)

export default router;
