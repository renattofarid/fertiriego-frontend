import { z } from "zod";

export const productSchemaCreate = z.object({
  name: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
  category_id: z
    .number({
      required_error: "La categoría es requerida",
    })
    .min(1, {
      message: "Debe seleccionar una categoría",
    }),
  brand_id: z
    .number({
      required_error: "La marca es requerida",
    })
    .min(1, {
      message: "Debe seleccionar una marca",
    }),
  unit_id: z
    .number({
      required_error: "La unidad es requerida",
    })
    .min(1, {
      message: "Debe seleccionar una unidad",
    }),
  product_type: z
    .string()
    .min(1, {
      message: "El tipo de producto es requerido",
    }),
  technical_sheet: z
    .array(z.instanceof(File))
    .optional()
    .default([]),
});

export const productSchemaUpdate = productSchemaCreate.partial();

export type ProductSchema = z.infer<typeof productSchemaCreate>;