import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const debitNoteDetailSchema = z.object({
  sale_detail_id: requiredStringId("El detalle de venta es requerido"),
  product_id: z.number().min(1, "El producto es requerido"),
  concept: z.string().min(1, "El concepto es requerido"),
  quantity: z.number().min(0.001, "La cantidad debe ser mayor a 0"),
  unit_price: z
    .number()
    .min(0, "El precio unitario debe ser mayor o igual a 0"),
});

export const debitNoteSchema = z.object({
  sale_id: requiredStringId("La venta es requerida"),
  warehouse_id: requiredStringId("El almacén es requerido"),
  issue_date: z.string().min(1, "La fecha de emisión es requerida"),
  debit_note_motive_id: requiredStringId("El motivo es requerido"),
  observations: z.string().optional(),
  details: z
    .array(debitNoteDetailSchema)
    .min(1, "Debe agregar al menos un detalle"),
});

export type DebitNoteDetailSchema = z.infer<typeof debitNoteDetailSchema>;
export type DebitNoteSchema = z.infer<typeof debitNoteSchema>;
