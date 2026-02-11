import { requiredStringId } from "@/lib/core.schema";
import * as z from "zod";

// Schema de validación para el formulario de cotización
export const quotationFormSchema = z.object({
  fecha_emision: z.string().min(1, "La fecha de emisión es requerida"),
  delivery_time: z.string().min(1, "El tiempo de entrega es requerido"),
  validity_time: z.string().min(1, "El tiempo de vigencia es requerido"),
  currency: z.string().min(1, "La moneda es requerida"),
  payment_type: z.string().min(1, "El tipo de pago es requerido"),
  days: z.string().optional(),
  observations: z.string().optional(),
  address: z.string().optional(),
  reference: z.string().optional(),
  order_purchase: z.string().optional(),
  order_service: z.string().optional(),
  warehouse_id: requiredStringId("El almacén es requerido"),
  customer_id: requiredStringId("El cliente es requerido"),
  status: z.string().optional(),
});

// Tipo inferido del schema
export type QuotationFormValues = z.infer<typeof quotationFormSchema>;
