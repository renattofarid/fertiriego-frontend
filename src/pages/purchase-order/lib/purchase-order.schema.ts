import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

export const purchaseOrderDetailSchema = z.object({
  product_id: requiredStringId("Debe seleccionar un producto"),
  quantity_requested: z
    .string()
    .min(1, { message: "La cantidad es requerida" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La cantidad debe ser un número mayor a 0",
    }),
  unit_price_estimated: z
    .string()
    .min(1, { message: "El precio unitario es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El precio unitario debe ser un número válido",
    }),
});

export const purchaseOrderSchemaCreate = z.object({
  supplier_id: requiredStringId("Debe seleccionar un proveedor"),
  warehouse_id: requiredStringId("Debe seleccionar un almacén"),
  apply_igv: z.boolean().optional(),
  issue_date: z
    .string()
    .min(1, { message: "La fecha de emisión es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Debe ser una fecha válida",
    }),
  expected_date: z
    .string()
    .min(1, { message: "La fecha esperada es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Debe ser una fecha válida",
    }),
  observations: z
    .string()
    .max(500, { message: "Las observaciones no pueden exceder 500 caracteres" })
    .nullable()
    .optional(),
  details: z
    .array(purchaseOrderDetailSchema)
    .min(1, { message: "Debe agregar al menos un detalle" }),
});

export const purchaseOrderSchemaUpdate = purchaseOrderSchemaCreate
  .omit({ details: true })
  .partial();

export type PurchaseOrderSchema = z.infer<typeof purchaseOrderSchemaCreate>;
export type PurchaseOrderDetailSchema = z.infer<
  typeof purchaseOrderDetailSchema
>;
