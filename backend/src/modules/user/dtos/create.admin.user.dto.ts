import { z } from "zod";

export const CreateAdminUserSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z.string().trim().max(20, "Phone number looks too long").optional().default(""),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password looks too long"),
    role: z.enum(["user", "admin"]),
});

export type CreateAdminUserRequestDto = z.infer<typeof CreateAdminUserSchema>;
