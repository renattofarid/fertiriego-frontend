import { requiredStringId, dateStringSchemaRequired } from "@/lib/core.schema";
import { z } from "zod";

export const justificationSchemaCreate = z.object({
  person_id: requiredStringId("Debe seleccionar un trabajador"),
  date_from: dateStringSchemaRequired("La fecha de inicio"),
  date_until: dateStringSchemaRequired("La fecha de fin"),
  type: requiredStringId("Debe seleccionar un tipo de justificación"),
  reason: z
    .string()
    .min(1, { message: "El motivo es requerido" })
    .max(1000, { message: "El motivo no puede tener más de 1000 caracteres" }),
});

export type JustificationSchema = z.infer<typeof justificationSchemaCreate>;

export const reviewJustificationSchema = z.object({
  status: requiredStringId("Debe seleccionar un estado"),
  review_notes: z
    .string()
    .max(500, { message: "Las notas no pueden tener más de 500 caracteres" })
    .optional()
    .or(z.literal("")),
});

export type ReviewJustificationSchema = z.infer<
  typeof reviewJustificationSchema
>;
