import { z } from "zod";
import { FAQ_LIMITS as L } from "../types/faq.type.js";

const text = (name: string, max: number) =>
    z.string().trim().min(1, `${name} is required`).max(max, `${name} cannot exceed ${max} characters`);

const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const CreateFaqGroupSchema = z.object({
    name: text("Group name", L.groupName),
    isActive: z.boolean().optional().default(true),
});

export type CreateFaqGroupRequestDto = z.infer<typeof CreateFaqGroupSchema>;

export const EditFaqGroupSchema = CreateFaqGroupSchema;

export type EditFaqGroupRequestDto = z.infer<typeof EditFaqGroupSchema>;

export const CreateFaqSchema = z.object({
    question: text("Question", L.question),
    answer: text("Answer", L.answer),
    groupId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a group"),
    isActive: z.boolean().optional().default(true),
    showOnHome: z.boolean().optional().default(false),
});

export type CreateFaqRequestDto = z.infer<typeof CreateFaqSchema>;

export const EditFaqSchema = CreateFaqSchema;

export type EditFaqRequestDto = z.infer<typeof EditFaqSchema>;

/** The full new order - every id once, first shown first. */
export const ReorderSchema = z.object({
    ids: z
        .array(ObjectIdSchema)
        .min(1, "Nothing to reorder")
        .refine((ids) => new Set(ids).size === ids.length, "Each item can appear only once"),
});

export type ReorderRequestDto = z.infer<typeof ReorderSchema>;
