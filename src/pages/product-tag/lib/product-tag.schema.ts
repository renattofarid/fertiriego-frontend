import { z } from "zod";

export const tagSchemaCreate = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(100, { message: "El nombre no puede tener más de 100 caracteres" }),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Debe ser un color hexadecimal válido (ej: #3b82f6)" })
    .default("#3b82f6"),
  type: z.enum(["rotation", "priority", "supplier", "custom"] as const, {
    error: "El tipo es requerido",
  }),
  description: z
    .string()
    .max(500, { message: "La descripción no puede tener más de 500 caracteres" })
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
});

export const tagSchemaUpdate = tagSchemaCreate.partial();

export type TagSchema = z.infer<typeof tagSchemaCreate>;
