import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const warehouseProductSchemaCreate = z.object({
  warehouse_id: requiredStringId("El almacén es requerido"),
  product_id: requiredStringId("El producto es requerido"),
  stock: z
    .number({
      error: "El stock es requerido",
    })
    .min(0, {
      message: "El stock debe ser mayor o igual a 0",
    })
    .max(999999, {
      message: "El stock no puede ser mayor a 999,999",
    }),
  min_stock: z
    .number()
    .min(0, {
      message: "El stock mínimo debe ser mayor o igual a 0",
    })
    .max(999999, {
      message: "El stock mínimo no puede ser mayor a 999,999",
    })
    .nullable()
    .optional(),
  max_stock: z
    .number()
    .min(0, {
      message: "El stock máximo debe ser mayor o igual a 0",
    })
    .max(999999, {
      message: "El stock máximo no puede ser mayor a 999,999",
    })
    .nullable()
    .optional(),
});

export const warehouseProductSchemaUpdate =
  warehouseProductSchemaCreate.partial();

export type WarehouseProductSchema = z.infer<
  typeof warehouseProductSchemaCreate
>;
