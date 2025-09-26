import { z } from "zod";

export const unitSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre debe tener máximo 255 caracteres"),
  code: z
    .string()
    .min(1, "El código es requerido")
    .max(50, "El código debe tener máximo 50 caracteres"),
});

export type UnitSchema = z.infer<typeof unitSchema>;