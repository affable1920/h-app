import { z } from "zod";

export const UserSchema = z.object({
  username: z.string().min(4, "Please enter a valid username"),
  email: z.email("a valid email id is required"),
  password: z.string().min(6, "password must be atleast 6 characters long"),
});

export type CreateUser = z.infer<typeof UserSchema>;
export type LoginUser = Omit<CreateUser, "username">;

export const LoginSchema = z.object({
  email: z.email("a valid email id is required"),
  password: z.string().min(6, "Please enter a valid password"),
});
