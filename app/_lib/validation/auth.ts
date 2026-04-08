import { z } from "zod";
import { Language, UserRole } from "@/app/_prisma/enums";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const SignUpSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

export const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole)
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  language: z.nativeEnum(Language).optional(),
  workdayStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  workdayEnd: z.string().regex(/^\d{2}:\d{2}$/).optional()
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6)
});

export const UpdateLanguageSchema = z.object({
  language: z.nativeEnum(Language)
});
