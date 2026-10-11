import { Router } from "express";
import { container } from "tsyringe";

import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { FaqController } from "../controller/faq.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const faqController = container.resolve(FaqController);

/* ---------- USER: FAQ PAGE (VISIBLE GROUPS + QUESTIONS) ---------- */
router.get(
    "/list",
    (req, res) => faqController.getFaqsForUser(req, res),
);

/* ---------- USER: HOME PAGE QUESTIONS ---------- */
router.get(
    "/home",
    (req, res) => faqController.getHomeFaqs(req, res),
);

/* ---------- ADMIN: ALL GROUPS + QUESTIONS ---------- */
router.get(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.getFaqsForAdmin(req, res),
);

/* ---------- ADMIN: CREATE GROUP ---------- */
router.post(
    "/groups",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.createGroup(req, res),
);

/* ---------- ADMIN: REORDER GROUPS ---------- */
router.patch(
    "/groups/reorder",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.reorderGroups(req, res),
);

/* ---------- ADMIN: EDIT GROUP ---------- */
router.put(
    "/groups/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.editGroup(req, res),
);

/* ---------- ADMIN: DELETE GROUP ---------- */
router.delete(
    "/groups/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.deleteGroup(req, res),
);

/* ---------- ADMIN: REORDER QUESTIONS IN A GROUP ---------- */
router.patch(
    "/groups/:groupId/reorder",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.reorderFaqs(req, res),
);

/* ---------- ADMIN: CREATE QUESTION ---------- */
router.post(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.createFaq(req, res),
);

/* ---------- ADMIN: EDIT QUESTION ---------- */
router.put(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.editFaq(req, res),
);

/* ---------- ADMIN: DELETE QUESTION ---------- */
router.delete(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => faqController.deleteFaq(req, res),
);

export default router;
