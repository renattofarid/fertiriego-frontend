import { z } from "zod";
import { requiredNumberId } from "@/lib/core.schema";

export const boxMovementSchemaCreate = z.object({
  box_id: requiredNumberId("Debe seleccionar una caja"),
  customer_id: z.number().optional(),
  type: z.enum(["INGRESO", "EGRESO"], {
    required_error: "Debe seleccionar un tipo de movimiento",
  }),
  concept: z
    .string()
    .min(1, "El concepto es requerido")
    .max(255, "El concepto no puede exceder 255 caracteres"),
  amount_cash: z.number().nonnegative("El monto no puede ser negativo").optional().default(0),
  amount_deposit: z.number().nonnegative("El monto no puede ser negativo").optional().default(0),
  amount_yape: z.number().nonnegative("El monto no puede ser negativo").optional().default(0),
  amount_plin: z.number().nonnegative("El monto no puede ser negativo").optional().default(0),
  amount_tarjeta: z.number().nonnegative("El monto no puede ser negativo").optional().default(0),
  amount_other: z.number().nonnegative("El monto no puede ser negativo").optional().default(0),
  comment: z.string().max(500, "El comentario no puede exceder 500 caracteres").optional(),
}).refine(
  (data) => {
    const total =
      (data.amount_cash || 0) +
      (data.amount_deposit || 0) +
      (data.amount_yape || 0) +
      (data.amount_plin || 0) +
      (data.amount_tarjeta || 0) +
      (data.amount_other || 0);
    return total > 0;
  },
  {
    message: "Debe ingresar al menos un monto en algún método de pago",
  }
);

export type BoxMovementSchemaCreate = z.infer<typeof boxMovementSchemaCreate>;
