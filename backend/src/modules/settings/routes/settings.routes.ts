import { Router } from "express";
import { container } from "tsyringe";
import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { SettingsController } from "../controller/settings.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const settingsController = container.resolve(SettingsController);

/* ---------- PUBLIC: GET SETTINGS ----------
   No sensitive data lives on this record (no secrets/keys) - the storefront,
   emails and invoices all need to read business name/contact/delivery info
   without requiring a login, so this stays unauthenticated. */
router.get("/", (req, res) => settingsController.getSettings(req, res));

/* ---------- ADMIN: UPDATE SETTINGS ---------- */
router.put(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => settingsController.updateSettings(req, res),
);

export default router;
