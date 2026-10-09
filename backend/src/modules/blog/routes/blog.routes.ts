import { Router } from "express";
import { container } from "tsyringe";

import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { BlogController } from "../controller/blog.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const blogController = container.resolve(BlogController);

/* ---------- USER: LIST PUBLISHED ARTICLES ---------- */
router.get(
    "/list",
    (req, res) => blogController.getAllBlogsForUser(req, res),
);

/* ---------- USER: FEATURED ARTICLE ---------- */
router.get(
    "/featured",
    (req, res) => blogController.getFeaturedBlog(req, res),
);

/* ---------- USER: ARTICLE BY SLUG ---------- */
router.get(
    "/slug/:slug",
    (req, res) => blogController.getBlogBySlug(req, res),
);

/* ---------- ADMIN: LIST ARTICLES ---------- */
router.get(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => blogController.getAllBlogsForAdmin(req, res),
);

/* ---------- ADMIN: CREATE ARTICLE ---------- */
router.post(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => blogController.createBlog(req, res),
);

/* ---------- ADMIN: EDIT ARTICLE ---------- */
router.put(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => blogController.editBlog(req, res),
);

/* ---------- ADMIN: DELETE ARTICLE ---------- */
router.delete(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => blogController.deleteBlog(req, res),
);

/* ---------- ADMIN: PUBLISH ARTICLE ---------- */
router.patch(
    "/:id/publish",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => blogController.publishBlog(req, res),
);

/* ---------- ADMIN: UNPUBLISH ARTICLE ---------- */
router.patch(
    "/:id/unpublish",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => blogController.unpublishBlog(req, res),
);

/* ---------- ADMIN: GET ARTICLE BY ID ---------- */
router.get(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => blogController.getBlogForAdmin(req, res),
);

export default router;
