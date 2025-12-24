import { z } from "zod";

export const productPriceCategorySchemaCreate = z.object({
  name: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
});

export const productPriceCategorySchemaUpdate = productPriceCategorySchemaCreate.partial();

export type ProductPriceCategorySchema = z.infer<typeof productPriceCategorySchemaCreate>;
