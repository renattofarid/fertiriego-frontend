import { optionalStringId, requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

// Schema para los detalles de la guía de transportista
export const shippingGuideCarrierDetailSchema = z.object({
  product_id: requiredStringId("Debe seleccionar un producto"),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  quantity: z.string().refine(
    (val) => {
      const parsed = Number(val);
      return !isNaN(parsed) && parsed > 0;
    },
    {
      message: "La cantidad debe ser un número mayor a 0",
    },
  ),
  unit: z.string().min(1, { message: "La unidad de medida es requerida" }),
  weight: z.string().refine(
    (val) => {
      const parsed = Number(val);
      return !isNaN(parsed) && parsed >= 0;
    },
    {
      message: "El peso debe ser un número válido",
    },
  ),
});

// Schema principal para crear/actualizar guía de transportista con validaciones condicionales
export const shippingGuideCarrierSchema = z
  .object({
    transport_modality: z
      .string()
      .min(1, { message: "La modalidad de transporte es requerida" }),
    // Campos condicionales
    carrier_id: requiredStringId("Debe seleccionar un transportista"),
    driver_id: optionalStringId("Debe seleccionar un conductor"),
    vehicle_id: optionalStringId("Debe seleccionar un vehículo"),
    vehicle_plate: z.string().max(20).optional(),
    vehicle_brand: z.string().max(100).optional(),
    vehicle_model: z.string().max(100).optional(),
    vehicle_mtc: z.string().max(50).optional(),
    driver_license: z.string().max(20).optional(),
    // Otros campos
    issue_date: z
      .string()
      .min(1, { message: "La fecha de emisión es requerida" }),
    transfer_start_date: z
      .string()
      .min(1, { message: "La fecha de inicio de traslado es requerida" }),
    remittent_id: requiredStringId("Debe seleccionar un remitente"),
    recipient_id: optionalStringId("Debe seleccionar un destinatario"),
    secondary_vehicle_id: optionalStringId(
      "Debe seleccionar un vehículo secundario",
    ),
    order_id: optionalStringId("Debe seleccionar un pedido"),
    shipping_guide_remittent_id: optionalStringId(
      "Debe seleccionar una guía de remitente",
    ),
    // Direcciones
    origin_address: z
      .string()
      .min(1, { message: "La dirección de origen es requerida" })
      .max(500),
    origin_ubigeo_id: requiredStringId("Debe seleccionar un ubigeo de origen"),
    destination_address: z
      .string()
      .min(1, { message: "La dirección de destino es requerida" })
      .max(500),
    destination_ubigeo_id: requiredStringId(
      "Debe seleccionar un ubigeo de destino",
    ),
    observations: z.string().max(1000).optional(),
    details: z
      .array(shippingGuideCarrierDetailSchema)
      .min(1, { message: "Debe agregar al menos un detalle" }),
  })
  .refine(
    (data) => {
      // Si es PUBLICO, carrier_id es requerido
      if (data.transport_modality === "PUBLICO") {
        return data.carrier_id && data.carrier_id.trim() !== "";
      }
      return true;
    },
    {
      message: "El transportista es requerido para transporte público",
      path: ["carrier_id"],
    },
  )
  .refine(
    (data) => {
      // Si es PRIVADO, driver_id es requerido
      if (data.transport_modality === "PRIVADO") {
        return data.driver_id && data.driver_id.trim() !== "";
      }
      return true;
    },
    {
      message: "El conductor es requerido para transporte privado",
      path: ["driver_id"],
    },
  )
  .refine(
    (data) => {
      // Si es PRIVADO, vehicle_id es requerido
      if (data.transport_modality === "PRIVADO") {
        return data.vehicle_id && data.vehicle_id.trim() !== "";
      }
      return true;
    },
    {
      message: "El vehículo es requerido para transporte privado",
      path: ["vehicle_id"],
    },
  )
  .refine(
    (data) => {
      // Si es PRIVADO, driver_license es requerido
      if (data.transport_modality === "PRIVADO") {
        return data.driver_license && data.driver_license.trim() !== "";
      }
      return true;
    },
    {
      message: "La licencia del conductor es requerida para transporte privado",
      path: ["driver_license"],
    },
  )
  .refine(
    (data) => {
      // Si es PRIVADO, vehicle_plate es requerido
      if (data.transport_modality === "PRIVADO") {
        return data.vehicle_plate && data.vehicle_plate.trim() !== "";
      }
      return true;
    },
    {
      message: "La placa del vehículo es requerida para transporte privado",
      path: ["vehicle_plate"],
    },
  )
  .refine(
    (data) => {
      // Si es PRIVADO, vehicle_brand es requerido
      if (data.transport_modality === "PRIVADO") {
        return data.vehicle_brand && data.vehicle_brand.trim() !== "";
      }
      return true;
    },
    {
      message: "La marca del vehículo es requerida para transporte privado",
      path: ["vehicle_brand"],
    },
  )
  .refine(
    (data) => {
      // Si es PRIVADO, vehicle_model es requerido
      if (data.transport_modality === "PRIVADO") {
        return data.vehicle_model && data.vehicle_model.trim() !== "";
      }
      return true;
    },
    {
      message: "El modelo del vehículo es requerido para transporte privado",
      path: ["vehicle_model"],
    },
  )
  .refine(
    (data) => {
      // Si es PRIVADO, vehicle_mtc es requerido
      if (data.transport_modality === "PRIVADO") {
        return data.vehicle_mtc && data.vehicle_mtc.trim() !== "";
      }
      return true;
    },
    {
      message: "El certificado MTC es requerido para transporte privado",
      path: ["vehicle_mtc"],
    },
  );

export type ShippingGuideCarrierSchema = z.infer<
  typeof shippingGuideCarrierSchema
>;
export type ShippingGuideCarrierDetailSchema = z.infer<
  typeof shippingGuideCarrierDetailSchema
>;
