import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

export const productSchemaCreate = z.object({
  company_id: requiredStringId("Debe seleccionar una empresa"),
  codigo: z
    .string()
    .min(1, { message: "El código es requerido" })
    .max(50, { message: "El código no puede exceder 50 caracteres" }),
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(255, { message: "El nombre no puede exceder 255 caracteres" })
    .refine((val) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s0-9\-_\.]+$/.test(val), {
      message:
        "El nombre solo puede contener letras, números, espacios y guiones",
    }),
  category_id: requiredStringId("Debe seleccionar una categoría"),
  brand_id: requiredStringId("Debe seleccionar una marca"),
  unit_id: requiredStringId("Debe seleccionar una unidad"),
  product_type_id: requiredStringId("Debe seleccionar un tipo de producto"),
  purchase_price: z
    .string()
    .min(1, { message: "El precio de compra es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El precio de compra debe ser un número válido mayor o igual a 0",
    }),
  sale_price: z
    .string()
    .min(1, { message: "El precio de venta es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El precio de venta debe ser un número válido mayor o igual a 0",
    }),
  is_taxed: z.boolean().default(false),
  is_igv: z.boolean().default(false),
  supplier_id: requiredStringId("Debe seleccionar un proveedor"),
  comment: z.string().optional().default(""),
  technical_sheet: z.array(z.instanceof(File)).optional().default([]),
});

export const productSchemaUpdate = productSchemaCreate.partial();

export type ProductSchema = z.infer<typeof productSchemaCreate>;
