import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

// Schema para los detalles del documento
export const warehouseDocumentDetailSchema = z.object({
  id: z.number().optional(),
  product_id: requiredStringId("Debe seleccionar un producto"),
  quantity: z
    .number({ message: "La cantidad es requerida" })
    .positive("La cantidad debe ser mayor a 0"),
  unit_cost: z
    .number({ message: "El costo unitario es requerido" })
    .nonnegative("El costo unitario no puede ser negativo"),
  observations: z.string().max(500, "Las observaciones no pueden exceder 500 caracteres").optional(),
});

// Schema principal para crear documento
export const warehouseDocumentSchemaCreate = z.object({
  warehouse_id: requiredStringId("Debe seleccionar un almacén"),
  document_type: z
    .string()
    .min(1, { message: "Debe seleccionar un tipo de documento" }),
  document_number: z
    .string()
    .min(1, { message: "El número de documento es requerido" })
    .max(50, { message: "El número de documento no puede exceder 50 caracteres" }),
  person_id: requiredStringId("Debe seleccionar una persona responsable"),
  document_date: z
    .string()
    .min(1, { message: "La fecha del documento es requerida" }),
  observations: z
    .string()
    .max(1000, { message: "Las observaciones no pueden exceder 1000 caracteres" })
    .default(""),
  details: z
    .array(warehouseDocumentDetailSchema)
    .min(1, { message: "Debe agregar al menos un detalle" }),
});

export const warehouseDocumentSchemaUpdate = warehouseDocumentSchemaCreate.partial();

export type WarehouseDocumentSchema = z.infer<typeof warehouseDocumentSchemaCreate>;
export type WarehouseDocumentDetailSchema = z.infer<typeof warehouseDocumentDetailSchema>;
