import { z } from "zod";


export const GuestIdSchema = z
    .string()
    .trim()
    .uuid({ message: "Invalid Guest Id format" });
