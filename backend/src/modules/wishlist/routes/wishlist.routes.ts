import { Router } from "express";
import { container } from "tsyringe";
import { WishlistController } from "../controller/wishlist.controller.js";

const router = Router();

const wishlistController = container.resolve(WishlistController);

/* ---------- TOGGLE ---------- */
router.post(
  "/toggle",
  (req, res) => wishlistController.toggleWishlist(req, res),
);

/* ---------- GET WISHLIST PRODUCT IDS (lightweight, for card state) ---------- */
router.get(
  "/ids/:guestId",
  (req, res) => wishlistController.getWishlistIds(req, res),
);

/* ---------- GET WISHLIST ---------- */
router.get(
  "/:guestId",
  (req, res) => wishlistController.getWishlist(req, res),
);

export default router;
