import { optionalStringId, requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

// Schema para los detalles de la guía
export const guideDetailSchema = z.object({
  product_id: requiredStringId("Debe seleccionar un producto"),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  quantity: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "La cantidad debe ser un número mayor a 0",
    }),
  unit_measure: z
    .string()
    .min(1, { message: "La unidad de medida es requerida" }),
  weight: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "El peso debe ser un número válido",
    }),
});

// Schema principal para crear/actualizar guía
export const guideSchema = z.object({
  warehouse_id: requiredStringId("Debe seleccionar un almacén"),
  issue_date: z
    .string()
    .min(1, { message: "La fecha de emisión es requerida" }),
  transfer_date: z
    .string()
    .min(1, { message: "La fecha de traslado es requerida" }),
  motive_id: requiredStringId("Debe seleccionar un motivo de traslado"),
  sale_id: optionalStringId("Debe seleccionar una venta"),
  purchase_id: optionalStringId("Debe seleccionar una compra"),
  warehouse_document_id: optionalStringId(
    "Debe seleccionar un documento de almacén"
  ),
  transport_modality: z
    .string()
    .min(1, { message: "La modalidad de transporte es requerida" }),
  carrier_id: requiredStringId("Debe seleccionar un transportista"),
  driver_id: requiredStringId("Debe seleccionar un conductor"),
  vehicle_id: requiredStringId("Debe seleccionar un vehículo"),
  driver_license: z
    .string()
    .min(1, { message: "La licencia del conductor es requerida" }),
  origin_address: z
    .string()
    .min(1, { message: "La dirección de origen es requerida" }),
  origin_ubigeo_id: requiredStringId("Debe seleccionar un ubigeo de origen"),
  destination_address: z
    .string()
    .min(1, { message: "La dirección de destino es requerida" }),
  destination_ubigeo_id: requiredStringId(
    "Debe seleccionar un ubigeo de destino"
  ),
  destination_warehouse_id: optionalStringId(
    "Debe seleccionar un almacén de destino"
  ),
  recipient_id: optionalStringId("Debe seleccionar un destinatario"),
  observations: z.string().optional(),
  details: z
    .array(guideDetailSchema)
    .min(1, { message: "Debe agregar al menos un detalle" }),
});

export type GuideSchema = z.infer<typeof guideSchema>;
export type GuideDetailSchema = z.infer<typeof guideDetailSchema>;
