import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

export const productSchemaCreate = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(255, { message: "El nombre no puede exceder 255 caracteres" }),
  category_id: requiredStringId("Debe seleccionar una categoría"),
  brand_id: requiredStringId("Debe seleccionar una marca"),
  unit_id: requiredStringId("Debe seleccionar una unidad"),
  product_type_id: requiredStringId("Debe seleccionar un tipo de producto"),
  is_igv: z.boolean().default(false),
  observations: z.string().optional().default(""),
  technical_sheet: z.array(z.instanceof(File)).optional().default([]),
});

export const productSchemaUpdate = productSchemaCreate.partial();

export type ProductSchema = z.infer<typeof productSchemaCreate>;
