import { z } from "zod";

// ===== DETAIL SCHEMA =====

export const purchaseShippingGuideDetailSchema = z.object({
  product_id: z.string().min(1, { message: "Debe seleccionar un producto" }),
  quantity: z
    .string()
    .min(1, { message: "La cantidad es requerida" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La cantidad debe ser un número mayor a 0",
    }),
  unit: z.string().min(1, { message: "La unidad es requerida" }),
});

export type PurchaseShippingGuideDetailSchema = z.infer<typeof purchaseShippingGuideDetailSchema>;

// ===== MAIN SCHEMA =====

export const purchaseShippingGuideSchemaCreate = z.object({
  purchase_id: z.string().optional().nullable(),
  guide_number: z.string().min(1, { message: "El número de guía es requerido" }).max(50),
  issue_date: z
    .string()
    .min(1, { message: "La fecha de emisión es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de emisión no es válida",
    }),
  transfer_date: z
    .string()
    .min(1, { message: "La fecha de traslado es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de traslado no es válida",
    }),
  motive: z.string().min(1, { message: "El motivo es requerido" }).max(200),
  carrier_name: z.string().min(1, { message: "El nombre del transportista es requerido" }).max(200),
  carrier_ruc: z
    .string()
    .min(11, { message: "El RUC del transportista debe tener 11 dígitos" })
    .max(11, { message: "El RUC del transportista debe tener 11 dígitos" })
    .regex(/^\d+$/, { message: "El RUC debe contener solo números" }),
  vehicle_plate: z.string().min(1, { message: "La placa del vehículo es requerida" }).max(20),
  driver_name: z.string().min(1, { message: "El nombre del conductor es requerido" }).max(200),
  driver_license: z.string().min(1, { message: "La licencia del conductor es requerida" }).max(20),
  origin_address: z.string().min(1, { message: "La dirección de origen es requerida" }).max(500),
  destination_address: z.string().min(1, { message: "La dirección de destino es requerida" }).max(500),
  total_weight: z
    .string()
    .min(1, { message: "El peso total es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El peso total debe ser un número mayor a 0",
    }),
  observations: z.string().max(500).optional().default(""),
  status: z.string().min(1, { message: "Debe seleccionar un estado" }),
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
