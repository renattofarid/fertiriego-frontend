import { z } from "zod";
import { requiredNumberId } from "@/lib/core.schema";

export const productSchemaCreate = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(255, { message: "El nombre no puede exceder 255 caracteres" })
    .refine((val) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s0-9\-_\.]+$/.test(val), {
      message: "El nombre solo puede contener letras, números, espacios y guiones",
    }),
  category_id: requiredNumberId("Debe seleccionar una categoría"),
  brand_id: requiredNumberId("Debe seleccionar una marca"),
  unit_id: requiredNumberId("Debe seleccionar una unidad"),
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