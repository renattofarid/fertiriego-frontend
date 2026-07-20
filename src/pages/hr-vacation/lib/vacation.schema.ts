import { requiredStringId, dateStringSchemaRequired } from "@/lib/core.schema";
import { z } from "zod";

export const vacationSchemaCreate = z.object({
  person_id: requiredStringId("Debe seleccionar un trabajador"),
  start_date: dateStringSchemaRequired("La fecha de inicio"),
  end_date: dateStringSchemaRequired("La fecha de fin"),
  reason: z
    .string()
    .max(500, { message: "El motivo no puede tener más de 500 caracteres" })
    .optional()
    .or(z.literal("")),
});

export type VacationSchema = z.infer<typeof vacationSchemaCreate>;

export const reviewVacationSchema = z.object({
  status: requiredStringId("Debe seleccionar un estado"),
  review_notes: z
    .string()
    .max(500, { message: "Las notas no pueden tener más de 500 caracteres" })
    .optional()
    .or(z.literal("")),
});

export type ReviewVacationSchema = z.infer<typeof reviewVacationSchema>;

export const vacationControlSchema = z.object({
  hire_date: z.string().optional().or(z.literal("")),
  vacation_days_per_year: z
    .number()
    .min(1, { message: "Debe ser al menos 1 día" })
    .max(365, { message: "No puede exceder 365 días" })
    .optional(),
});

export type VacationControlSchema = z.infer<typeof vacationControlSchema>;
