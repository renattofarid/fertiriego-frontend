import { z } from "zod";
import { requiredNumberId } from "@/lib/core.schema";

export const boxShiftSchemaCreate = z.object({
  box_id: requiredNumberId("Debe seleccionar una caja"),
  started_amount: z.coerce
    .number({
      error: "El monto inicial es requerido",
    })
    .nonnegative("El monto no puede ser negativo"),
  observation: z
    .string()
    .max(500, "La observación no puede exceder 500 caracteres")
    .optional(),
});

export const boxShiftSchemaClose = z.object({
  box_id: requiredNumberId("Debe seleccionar una caja"),
  closed_amount: z.coerce
    .number({
      error: "El monto de cierre es requerido",
    })
    .nonnegative("El monto no puede ser negativo"),
  observation: z
    .string()
    .max(500, "La observación no puede exceder 500 caracteres")
    .optional(),
});

export type BoxShiftSchemaCreate = z.infer<typeof boxShiftSchemaCreate>;
export type BoxShiftSchemaClose = z.infer<typeof boxShiftSchemaClose>;
