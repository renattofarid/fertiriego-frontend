import { requiredStringId, dateStringSchemaRequired } from "@/lib/core.schema";
import { z } from "zod";

export const reviewOvertimeSchema = z.object({
  status: requiredStringId("Debe seleccionar un estado"),
  review_notes: z
    .string()
    .max(500, { message: "Las notas no pueden tener más de 500 caracteres" })
    .optional()
    .or(z.literal("")),
});

export type ReviewOvertimeSchema = z.infer<typeof reviewOvertimeSchema>;

export const detectOvertimeSchema = z.object({
  date_from: dateStringSchemaRequired("La fecha de inicio"),
  date_until: dateStringSchemaRequired("La fecha de fin"),
  person_id: z.string().optional().or(z.literal("")),
});

export type DetectOvertimeSchema = z.infer<typeof detectOvertimeSchema>;

export const scheduleOvertimeRateSchema = z.object({
  overtime_rate: z
    .number({ message: "Ingrese una tasa válida" })
    .min(1, { message: "La tasa debe ser al menos 1" })
    .max(5, { message: "La tasa no puede exceder 5" }),
});

export type ScheduleOvertimeRateSchema = z.infer<
  typeof scheduleOvertimeRateSchema
>;

export const workerOvertimeRateSchema = z.object({
  overtime_rate_override: z
    .number()
    .min(1, { message: "La tasa debe ser al menos 1" })
    .max(5, { message: "La tasa no puede exceder 5" })
    .optional(),
});

export type WorkerOvertimeRateSchema = z.infer<
  typeof workerOvertimeRateSchema
>;
