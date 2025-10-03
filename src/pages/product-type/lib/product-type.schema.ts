import { z } from "zod";

export const productTypeSchemaCreate = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" }),
  code: z
    .string()
    .min(1, { message: "El código es requerido" })
    .max(20, { message: "El código no puede exceder 20 caracteres" })
    .refine((val) => /^[A-Z0-9\-_]+$/.test(val), {
      message: "El código solo puede contener letras mayúsculas, números, guiones y guiones bajos",
    }),
});

export const productTypeSchemaUpdate = productTypeSchemaCreate.partial();

export type ProductTypeSchema = z.infer<typeof productTypeSchemaCreate>;
