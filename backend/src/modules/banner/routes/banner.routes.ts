import { Router } from "express";
import { container } from "tsyringe";

import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { BannerController } from "../controller/banner.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const bannerController = container.resolve(BannerController);

// Depending on the product structure, auth and role middleware might need to be applied
// Typically Admin routes are protected. Leaving logic identical to hero module blueprint.

/* ---------- ADMIN: GET BANNER ---------- */
router.get(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => bannerController.getBannerForAdmin(req, res),
);

/* ---------- ADMIN: CREATE BANNER ---------- */
router.post(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => bannerController.createBanner(req, res),
);

/* ---------- ADMIN: EDIT BANNER ---------- */
router.put(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => bannerController.editBanner(req, res),
);

/* ---------- ADMIN: DELETE BANNER ---------- */
router.delete(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => bannerController.deleteBanner(req, res),
);

/* ---------- ADMIN: BLOCK BANNER ---------- */
router.patch(
    "/:id/block",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => bannerController.blockBanner(req, res),
);

/* ---------- ADMIN: UNBLOCK BANNER ---------- */
router.patch(
    "/:id/unblock",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => bannerController.unblockBanner(req, res),
);

/* ---------- USER: GET BANNER ---------- */
router.get(
    "/list",
    (req, res) => bannerController.getBannerForUser(req, res),
);

/* ---------- ADMIN: GET BANNER BY ID ---------- */
router.get(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => bannerController.getBannerById(req, res),
);

export default router;
