import { Router } from "express";
import { container } from "tsyringe";
import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { AboutController } from "../controller/about.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const aboutController = container.resolve(AboutController);

/* ---------- PUBLIC: GET ABOUT CONTENT ----------
   Brand story for the landing page teaser and the About page - public copy, no login needed. */
router.get("/", (req, res) => aboutController.getAbout(req, res));

/* ---------- ADMIN: UPDATE ABOUT CONTENT ---------- */
router.put(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => aboutController.updateAbout(req, res),
);

export default router;
