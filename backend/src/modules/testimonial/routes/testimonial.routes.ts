import { Router } from "express";
import { container } from "tsyringe";
import { Authenticate } from "../../../infrastructure/middileware/auth.middleware.js";
import { authorizeRoles } from "../../../infrastructure/middileware/role.middleware.js";
import { TestimonialController } from "../controller/testimonial.controller.js";

const router = Router();

const authenticate = container.resolve(Authenticate);
const testimonialController = container.resolve(TestimonialController);

/* ---------- ADMIN: GET TESTIMONIALS ---------- */
router.get(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => testimonialController.getTestimonialsForAdmin(req, res),
);

/* ---------- ADMIN: CREATE TESTIMONIAL ---------- */
router.post(
    "/",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => testimonialController.createTestimonial(req, res),
);

/* ---------- ADMIN: EDIT TESTIMONIAL ---------- */
router.put(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => testimonialController.editTestimonial(req, res),
);

/* ---------- ADMIN: DELETE TESTIMONIAL ---------- */
router.delete(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => testimonialController.deleteTestimonial(req, res),
);

/* ---------- ADMIN: BLOCK TESTIMONIAL ---------- */
router.patch(
    "/:id/block",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => testimonialController.blockTestimonial(req, res),
);

/* ---------- ADMIN: UNBLOCK TESTIMONIAL ---------- */
router.patch(
    "/:id/unblock",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => testimonialController.unblockTestimonial(req, res),
);

/* ---------- USER: GET TESTIMONIALS ---------- */
router.get(
    "/list",
    (req, res) => testimonialController.getTestimonialsForUser(req, res),
);

/* ---------- ADMIN: GET TESTIMONIAL BY ID ---------- */
router.get(
    "/:id",
    authenticate.authenticate,
    authorizeRoles("admin"),
    (req, res) => testimonialController.getTestimonialById(req, res),
);

export default router;
