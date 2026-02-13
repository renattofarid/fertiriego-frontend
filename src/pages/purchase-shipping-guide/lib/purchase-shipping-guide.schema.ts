import { z } from "zod";

// ===== DETAIL SCHEMA =====

export const purchaseShippingGuideDetailSchema = z.object({
  product_id: z.string().min(1, { message: "Debe seleccionar un producto" }),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  quantity: z
    .string()
    .min(1, { message: "La cantidad es requerida" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La cantidad debe ser un número mayor a 0",
    }),
  unit: z.string().min(1, { message: "La unidad es requerida" }),
  weight: z
    .string()
    .min(1, { message: "El peso es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El peso debe ser un número mayor a 0",
    }),
});

export type PurchaseShippingGuideDetailSchema = z.infer<typeof purchaseShippingGuideDetailSchema>;

// ===== MAIN SCHEMA =====

export const purchaseShippingGuideSchemaCreate = z.object({
  transport_modality: z.string().min(1, { message: "La modalidad de transporte es requerida" }),
  issue_date: z
    .string()
    .min(1, { message: "La fecha de emisión es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de emisión no es válida",
    }),
  transfer_start_date: z
    .string()
    .min(1, { message: "La fecha de inicio de traslado es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de inicio de traslado no es válida",
    }),
  remittent_id: z.string().min(1, { message: "El remitente es requerido" }),
  recipient_id: z.string().default("777"),
  carrier_id: z.string().min(1, { message: "El transportista es requerido" }),
  driver_id: z.string().min(1, { message: "El conductor es requerido" }),
  driver_license: z.string().min(1, { message: "La licencia del conductor es requerida" }).max(20),
  vehicle_id: z.string().min(1, { message: "El vehículo es requerido" }),
  origin_address: z.string().min(1, { message: "La dirección de origen es requerida" }).max(500),
  origin_ubigeo_id: z.string().min(1, { message: "El ubigeo de origen es requerido" }),
  destination_address: z.string().min(1, { message: "La dirección de destino es requerida" }).max(500),
  destination_ubigeo_id: z.string().min(1, { message: "El ubigeo de destino es requerido" }),
  observations: z.string().max(500).optional().default(""),
  details: z
    .array(purchaseShippingGuideDetailSchema)
    .min(1, { message: "Debe agregar al menos un detalle" }),
});

export type PurchaseShippingGuideSchema = z.infer<typeof purchaseShippingGuideSchemaCreate>;

// ===== UPDATE SCHEMA =====

export const purchaseShippingGuideSchemaUpdate = purchaseShippingGuideSchemaCreate
  .omit({ details: true })
  .partial();

export type PurchaseShippingGuideUpdateSchema = z.infer<typeof purchaseShippingGuideSchemaUpdate>;

// ===== ASSIGN PURCHASE SCHEMA =====

export const assignPurchaseSchema = z.object({
  purchase_id: z.string().min(1, { message: "Debe seleccionar una compra" }),
});

export type AssignPurchaseSchema = z.infer<typeof assignPurchaseSchema>;
