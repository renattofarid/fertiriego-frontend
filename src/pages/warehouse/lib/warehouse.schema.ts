import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const warehouseSchemaCreate = z.object({
  name: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
  address: z
    .string()
    .max(500, {
      message: "La dirección no puede tener más de 500 caracteres",
    })
    .min(1, {
      message: "La dirección es requerida",
    }),
  capacity: z
    .number({
      error: "La capacidad es requerida",
    })
    .min(1, {
      message: "La capacidad debe ser mayor a 0",
    })
    .max(999999, {
      message: "La capacidad no puede ser mayor a 999,999",
    }),
  responsible_id: z
    .number({
      error: "El responsable es requerido",
    })
    .min(1, {
      message: "Debe seleccionar un responsable",
    }),
  phone: z
    .string()
    .max(9, {
      message: "El teléfono no puede tener más de 9 caracteres",
    })
    .min(1, {
      message: "El teléfono es requerido",
    }),
  email: z
    .string()
    .email({
      message: "El email debe tener un formato válido",
    })
    .max(255, {
      message: "El email no puede tener más de 255 caracteres",
    }),
  branch_id: requiredStringId("sucursal"),
});

export const warehouseSchemaUpdate = warehouseSchemaCreate.partial();

export type WarehouseSchema = z.infer<typeof warehouseSchemaCreate>;