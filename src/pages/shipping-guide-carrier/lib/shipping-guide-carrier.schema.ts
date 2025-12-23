import { optionalStringId, requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

// Schema para los detalles de la guía de transportista
export const shippingGuideCarrierDetailSchema = z.object({
  product_id: requiredStringId("Debe seleccionar un producto"),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  quantity: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed > 0;
  }, {
    message: "La cantidad debe ser un número mayor a 0",
  }),
  unit: z
    .string()
    .min(1, { message: "La unidad de medida es requerida" }),
  weight: z.string().refine((val) => {
    const parsed = Number(val);
    return !isNaN(parsed) && parsed >= 0;
  }, {
    message: "El peso debe ser un número válido",
  }),
});

// Schema principal para crear/actualizar guía de transportista
export const shippingGuideCarrierSchema = z.object({
  carrier_id: requiredStringId("Debe seleccionar un transportista"),
  issue_date: z
    .string()
    .min(1, { message: "La fecha de emisión es requerida" }),
  transfer_start_date: z
    .string()
    .min(1, { message: "La fecha de inicio de traslado es requerida" }),
  shipping_guide_remittent_id: requiredStringId("Debe seleccionar un remitente"),
  driver_id: requiredStringId("Debe seleccionar un conductor"),
  vehicle_id: requiredStringId("Debe seleccionar un vehículo"),
  secondary_vehicle_id: optionalStringId("Debe seleccionar un vehículo secundario"),
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
  observations: z.string().optional(),
  details: z
    .array(shippingGuideCarrierDetailSchema)
    .min(1, { message: "Debe agregar al menos un detalle" }),
});

export type ShippingGuideCarrierSchema = z.infer<typeof shippingGuideCarrierSchema>;
export type ShippingGuideCarrierDetailSchema = z.infer<typeof shippingGuideCarrierDetailSchema>;
