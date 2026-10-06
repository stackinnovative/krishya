import rateLimit from "express-rate-limit";

export const reteLimiter = rateLimit({
  windowMs: Number(process.env.REFRESH_RATE_LIMIT_WINDOW),
  max: Number(process.env.REFRESH_RATE_LIMIT_MAX),
  message: "Too many refresh attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/** Admin login is the one place a stolen/guessed password would actually let
 * someone in - a handful of attempts per window, then a real cooldown. */
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/** Guest-facing checkout/payment/invoice routes - unauthenticated by design
 * (guest checkout), so this is the only thing stopping a script from
 * hammering order creation, payment verification, or PDF invoice generation
 * at no cost to itself. Generous enough for a real shopper retrying a failed
 * payment a few times. */
export const guestOrderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Too many requests. Please try again in a few minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
