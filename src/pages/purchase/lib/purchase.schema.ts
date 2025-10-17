import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

// ===== DETAIL SCHEMA =====

export const purchaseDetailSchema = z.object({
  product_id: requiredStringId("Debe seleccionar un producto"),
  quantity: z
    .string()
    .min(1, { message: "La cantidad es requerida" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La cantidad debe ser un número mayor a 0",
    }),
  unit_price: z
    .string()
    .min(1, { message: "El precio unitario es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El precio unitario debe ser un número válido",
    }),
  tax: z
    .string()
    .min(1, { message: "El impuesto es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El impuesto debe ser un número válido",
    }),
});

export type PurchaseDetailSchema = z.infer<typeof purchaseDetailSchema>;

// ===== INSTALLMENT SCHEMA =====

export const purchaseInstallmentSchema = z.object({
  due_days: z
    .string()
    .min(1, { message: "Los días de vencimiento son requeridos" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Los días deben ser un número mayor a 0",
    }),
  amount: z
    .string()
    .min(1, { message: "El monto es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El monto debe ser un número mayor a 0",
    }),
});

export type PurchaseInstallmentSchema = z.infer<typeof purchaseInstallmentSchema>;

// ===== MAIN PURCHASE SCHEMA =====

export const purchaseSchemaCreate = z.object({
  supplier_id: requiredStringId("Debe seleccionar un proveedor"),
  warehouse_id: requiredStringId("Debe seleccionar un almacén"),
  user_id: requiredStringId("Debe seleccionar un usuario"),
  purchase_order_id: z.string().optional().nullable(),
  document_type: z.string().min(1, { message: "Debe seleccionar un tipo de documento" }),
  document_number: z.string().min(1, { message: "El número de documento es requerido" }).max(50),
  issue_date: z
    .string()
    .min(1, { message: "La fecha de emisión es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de emisión no es válida",
    }),
  payment_type: z.string().min(1, { message: "Debe seleccionar un tipo de pago" }),
  currency: z.string().min(1, { message: "Debe seleccionar una moneda" }),
  observations: z.string().max(500).optional().default(""),
  details: z
    .array(purchaseDetailSchema)
    .min(1, { message: "Debe agregar al menos un detalle" }),
  installments: z.array(purchaseInstallmentSchema).optional().default([]),
});

export type PurchaseSchema = z.infer<typeof purchaseSchemaCreate>;

// ===== UPDATE SCHEMA =====

export const purchaseSchemaUpdate = purchaseSchemaCreate
  .omit({ details: true, installments: true })
  .partial();

export type PurchaseUpdateSchema = z.infer<typeof purchaseSchemaUpdate>;

// ===== DETAIL CRUD SCHEMAS =====

export const purchaseDetailSchemaCreate = z.object({
  purchase_id: requiredStringId("El ID de compra es requerido"),
  product_id: requiredStringId("Debe seleccionar un producto"),
  quantity: z
    .string()
    .min(1, { message: "La cantidad es requerida" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La cantidad debe ser un número mayor a 0",
    }),
  unit_price: z
    .string()
    .min(1, { message: "El precio unitario es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El precio unitario debe ser un número válido",
    }),
  tax: z
    .string()
    .min(1, { message: "El impuesto es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El impuesto debe ser un número válido",
    }),
});

export type PurchaseDetailCreateSchema = z.infer<typeof purchaseDetailSchemaCreate>;

export const purchaseDetailSchemaUpdate = purchaseDetailSchemaCreate
  .omit({ purchase_id: true })
  .partial();

export type PurchaseDetailUpdateSchema = z.infer<typeof purchaseDetailSchemaUpdate>;

// ===== INSTALLMENT CRUD SCHEMAS =====

export const purchaseInstallmentSchemaCreate = z.object({
  purchase_id: requiredStringId("El ID de compra es requerido"),
  due_days: z
    .string()
    .min(1, { message: "Los días de vencimiento son requeridos" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Los días deben ser un número mayor a 0",
    }),
  amount: z
    .string()
    .min(1, { message: "El monto es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El monto debe ser un número mayor a 0",
    }),
});

export type PurchaseInstallmentCreateSchema = z.infer<typeof purchaseInstallmentSchemaCreate>;

export const purchaseInstallmentSchemaUpdate = purchaseInstallmentSchemaCreate
  .omit({ purchase_id: true })
  .partial();

export type PurchaseInstallmentUpdateSchema = z.infer<typeof purchaseInstallmentSchemaUpdate>;

// ===== PAYMENT SCHEMAS =====

export const purchasePaymentSchemaCreate = z.object({
  purchase_installment_id: requiredStringId("Debe seleccionar una cuota"),
  user_id: requiredStringId("Debe seleccionar un usuario"),
  payment_date: z
    .string()
    .min(1, { message: "La fecha de pago es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de pago no es válida",
    }),
  reference_number: z.string().min(1, { message: "El número de referencia es requerido" }).max(50),
  bank_number: z.string().min(1, { message: "El número de banco es requerido" }).max(50),
  route: z.string().optional().default(""),
  amount_cash: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto en efectivo debe ser un número válido",
    })
    .default("0"),
  amount_yape: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto Yape debe ser un número válido",
    })
    .default("0"),
  amount_plin: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto Plin debe ser un número válido",
    })
    .default("0"),
  amount_deposit: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto de depósito debe ser un número válido",
    })
    .default("0"),
  amount_transfer: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto de transferencia debe ser un número válido",
    })
    .default("0"),
  observation: z.string().max(500).optional().default(""),
});

export type PurchasePaymentCreateSchema = z.infer<typeof purchasePaymentSchemaCreate>;

export const purchasePaymentSchemaUpdate = purchasePaymentSchemaCreate
  .omit({ purchase_installment_id: true })
  .partial();

export type PurchasePaymentUpdateSchema = z.infer<typeof purchasePaymentSchemaUpdate>;
