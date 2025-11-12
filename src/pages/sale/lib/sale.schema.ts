import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

// ===== DETAIL SCHEMA =====

export const saleDetailSchema = z.object({
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
});

export type SaleDetailSchema = z.infer<typeof saleDetailSchema>;

// ===== INSTALLMENT SCHEMA =====

export const saleInstallmentSchema = z.object({
  installment_number: z
    .string()
    .min(1, { message: "El número de cuota es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El número de cuota debe ser mayor a 0",
    }),
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

export type SaleInstallmentSchema = z.infer<typeof saleInstallmentSchema>;

// ===== MAIN SALE SCHEMA =====

export const saleSchemaCreate = z.object({
  customer_id: requiredStringId("Debe seleccionar un cliente"),
  warehouse_id: requiredStringId("Debe seleccionar un almacén"),
  document_type: z
    .string()
    .min(1, { message: "Debe seleccionar un tipo de documento" }),
  serie: z.string().min(1, { message: "La serie es requerida" }).max(10),
  numero: z.string().min(1, { message: "El número es requerido" }).max(20),
  issue_date: z
    .string()
    .min(1, { message: "La fecha de emisión es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de emisión no es válida",
    }),
  payment_type: z
    .string()
    .min(1, { message: "Debe seleccionar un tipo de pago" }),
  currency: z.string().min(1, { message: "Debe seleccionar una moneda" }),
  observations: z.string().max(500).optional(),
  amount_cash: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto en efectivo debe ser un número válido",
    })
    .default("0"),
  amount_card: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto con tarjeta debe ser un número válido",
    })
    .default("0"),
  amount_yape: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto Yape debe ser un número válido",
    })
    .default("0"),
  details: z
    .array(saleDetailSchema)
    .min(1, { message: "Debe agregar al menos un detalle" }),
  installments: z.array(saleInstallmentSchema).optional().default([]),
});

export type SaleSchema = z.infer<typeof saleSchemaCreate>;

// ===== UPDATE SCHEMA =====

export const saleSchemaUpdate = saleSchemaCreate.partial();

export type SaleUpdateSchema = z.infer<typeof saleSchemaUpdate>;

// ===== DETAIL CRUD SCHEMAS =====

export const saleDetailSchemaCreate = z.object({
  sale_id: requiredStringId("El ID de venta es requerido"),
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
});

export type SaleDetailCreateSchema = z.infer<typeof saleDetailSchemaCreate>;

export const saleDetailSchemaUpdate = saleDetailSchemaCreate
  .omit({ sale_id: true })
  .partial();

export type SaleDetailUpdateSchema = z.infer<typeof saleDetailSchemaUpdate>;

// ===== INSTALLMENT CRUD SCHEMAS =====

export const saleInstallmentSchemaCreate = z.object({
  sale_id: requiredStringId("El ID de venta es requerido"),
  installment_number: z
    .string()
    .min(1, { message: "El número de cuota es requerido" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El número de cuota debe ser mayor a 0",
    }),
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

export type SaleInstallmentCreateSchema = z.infer<
  typeof saleInstallmentSchemaCreate
>;

export const saleInstallmentSchemaUpdate = saleInstallmentSchemaCreate
  .omit({ sale_id: true })
  .partial();

export type SaleInstallmentUpdateSchema = z.infer<
  typeof saleInstallmentSchemaUpdate
>;

// ===== PAYMENT SCHEMAS =====

export const salePaymentSchemaCreate = z.object({
  payment_date: z
    .string()
    .min(1, { message: "La fecha de pago es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de pago no es válida",
    }),
  amount_cash: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto en efectivo debe ser un número válido",
    })
    .default("0"),
  amount_card: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto con tarjeta debe ser un número válido",
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
  amount_other: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto de otro método debe ser un número válido",
    })
    .default("0"),
});

export type SalePaymentCreateSchema = z.infer<typeof salePaymentSchemaCreate>;

export const salePaymentSchemaUpdate = salePaymentSchemaCreate.partial();

export type SalePaymentUpdateSchema = z.infer<typeof salePaymentSchemaUpdate>;
