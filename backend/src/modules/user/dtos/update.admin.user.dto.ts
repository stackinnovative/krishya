import { z } from "zod";

export const UpdateAdminUserSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z.string().trim().max(20, "Phone number looks too long").optional().default(""),
    role: z.enum(["user", "admin"]),
    // Optional - leave blank to keep the current password. Required (enforced
    // in the use-case, not here) only when promoting a password-less
    // guest/checkout account to "admin" for the first time.
    password: z.union([z.string().min(6, "Password must be at least 6 characters").max(50, "Password looks too long"), z.literal("")]).optional(),
});

export type UpdateAdminUserRequestDto = z.infer<typeof UpdateAdminUserSchema>;
