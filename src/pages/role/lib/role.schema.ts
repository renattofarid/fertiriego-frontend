import { z } from "zod";

export const roleCreateSchema = z.object({
  code: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede exceder 20 caracteres")
    .regex(/^[A-Z_]+$/, "El código debe estar en mayúsculas y solo contener letras y guiones bajos"),

  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
});

export const roleUpdateSchema = roleCreateSchema.partial();

export type RoleSchema = z.infer<typeof roleCreateSchema>;