import { z } from "zod";

export const warehouseProductSchemaCreate = z.object({
  warehouse_id: z
    .number({
      error: "El almacén es requerido",
    })
    .min(1, {
      message: "Debe seleccionar un almacén",
    }),
  product_id: z
    .number({
      error: "El producto es requerido",
    })
    .min(1, {
      message: "Debe seleccionar un producto",
    }),
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

export const warehouseProductSchemaUpdate = warehouseProductSchemaCreate.partial();

export type WarehouseProductSchema = z.infer<typeof warehouseProductSchemaCreate>;
