import { Router } from "express";
import { container } from "tsyringe";

import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { HeroController } from "../controller/hero.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const heroController = container.resolve(HeroController);


/* ---------- ADMIN: GET HERO BANNER ---------- */
router.get(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => heroController.getHeroForAdmin(req, res),
);
/* ---------- USER: GET HERO BANNER ---------- */
router.get(
    "/list",
    (req, res) => heroController.getHeroForUser(req, res),
);
/* ---------- ADMIN: GET HERO BANNER BY ID ---------- */
router.get(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => heroController.getHeroById(req, res),
);

/* ---------- ADMIN: CREATE HERO BANNER ---------- */
router.post(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => heroController.createHero(req, res),
);

/* ---------- ADMIN: EDIT HERO BANNER ---------- */
router.put(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => heroController.editHero(req, res),
);

/* ---------- ADMIN: BLOCK HERO BANNER ---------- */
router.patch(
    "/:id/block",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => heroController.blockHero(req, res),
);

/* ---------- ADMIN: UNBLOCK HERO BANNER ---------- */
router.patch(
    "/:id/unblock",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => heroController.unblockHero(req, res),
);



export default router;
