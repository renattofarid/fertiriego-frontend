import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const creditNoteDetailSchema = z.object({
  sale_detail_id: requiredStringId("El detalle de venta es requerido"),
  product_id: z.number().min(1, "El producto es requerido"),
  quantity: z.number().min(0.001, "La cantidad debe ser mayor a 0"),
  unit_price: z
    .number()
    .min(0, "El precio unitario debe ser mayor o igual a 0"),
});

export const creditNoteSchema = z.object({
  sale_id: requiredStringId("La venta es requerida"),
  credit_note_motive_id: requiredStringId("El motivo es requerido"),
  issue_date: z.string().min(1, "La fecha de emisión es requerida"),
  reason: z
    .string()
    .min(1, "El motivo es requerido")
    .max(500, "El motivo debe tener máximo 500 caracteres"),
  affects_stock: z.boolean().default(true),
  details: z
    .array(creditNoteDetailSchema)
    .min(1, "Debe agregar al menos un detalle"),
});

export type CreditNoteDetailSchema = z.infer<typeof creditNoteDetailSchema>;
export type CreditNoteSchema = z.infer<typeof creditNoteSchema>;
