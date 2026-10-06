import { Router } from "express";
import { container } from "tsyringe";
import { CartController } from "../controller/cart.controller.js";

const router = Router();

const cartController = container.resolve(CartController);

/* ---------- CREATE ---------- */
router.post(
  "/",

  (req, res) => cartController.addToCart(req, res),
);

/* ---------- GET ---------- */
router.get(
  "/:guestId",
  (req, res) => cartController.getCart(req, res),
);

/* ---------- UPDATE ---------- */
router.patch(
  "/update-cart-count",
  (req, res) => cartController.updateCartCount(req, res),
);

/* ---------- DELETE ---------- */
router.patch(
  "/remove-cart-item",
  (req, res) => cartController.removeCartItem(req, res),
);

/* ---------- GET CHECKOUT ITEM ---------- */
router.get(
  "/checkout-item/:guestId",
  (req, res) => cartController.getCheckoutItem(req, res),
);

/* ---------- GET CART ITEMS COUNT ---------- */
router.get(
  "/cart-items-count/:guestId",
  (req, res) => cartController.getCartItemsCount(req, res),
);

export default router;