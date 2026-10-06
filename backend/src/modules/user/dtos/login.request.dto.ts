import z from "zod";

export const LoginUserSchema = z.object({
  email: z
    .string() 
    .trim()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email cannot be empty' }), 
  password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(50, { message: "Password must be less than 50 characters" }),
   
});


export type LoginRequestDto = z.infer<typeof LoginUserSchema>;