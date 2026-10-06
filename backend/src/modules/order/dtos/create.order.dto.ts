import { z } from "zod";
import { GuestIdSchema } from "../../../core/utils/guest.id.validation.js";
import { ObjectIdSchema } from "../../../core/utils/object.id.validation.js";

/* ---------- ALLOWED STATES ---------- */


export const STATE_OPTIONS = [
    "Kerala",
    "Tamil Nadu",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
    "Delhi",
    "Uttar Pradesh",
    "Maharashtra",
    "Gujarat",
    "Goa",
] as const;

/* ---------- COMMON VALIDATORS ---------- */

const cleanString = (field: string, min: number, max: number) =>
    z
        .string()
        .trim()
        .min(min, `${field} is too short`)
        .max(max, `${field} is too long`);

const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
const pincodeRegex = /^[1-9][0-9]{5}$/;
const cityRegex = /^[A-Za-z\s.-]+$/;

/* ---------- CREATE ORDER SCHEMA ---------- */

export const CreateOrderSchema = z
    .object({
        guestId: GuestIdSchema,
        cartId: ObjectIdSchema,
        name: cleanString("Name", 2, 60)
            .regex(/^[A-Za-z\s.'-]+$/, "Invalid name format"),

        email: z
            .string()
            .trim()
            .toLowerCase()
            .email("Invalid email address")
            .max(100, "Email too long"),

        phone: z
            .string()
            .trim()
            .regex(phoneRegex, "Invalid Indian phone number"),

        addressLine1: cleanString("Address line 1", 5, 120),

        addressLine2: z
            .string()
            .trim()
            .max(120, "Address line 2 too long")
            .optional()
            .or(z.literal("")),

        city: z
            .string()
            .trim()
            .min(2, "City is too short")
            .max(60, "City too long")
            .regex(cityRegex, "Invalid city name"),

        state: z.enum(STATE_OPTIONS, {
            message: "Invalid state selected",
        }),

        pincode: z
            .string()
            .trim()
            .regex(pincodeRegex, "Invalid pincode"),
        acceptedTerms: z.boolean().refine((value) => value, {
            message: "You must accept the terms and conditions",
        }),
    })
    .strict();

/* ---------- DTO ---------- */

export type CreateOrderRequestDto = z.infer<
    typeof CreateOrderSchema
>;
