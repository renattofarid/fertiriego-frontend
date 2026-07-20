import { requiredStringId, dateStringSchemaRequired } from "@/lib/core.schema";
import { z } from "zod";

const timeSchema = (field: string) =>
  z
    .string()
    .min(1, { message: `${field} es requerida` })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
      message: `${field} debe tener el formato HH:mm`,
    });

const numericField = (field: string) =>
  z
    .number({ error: `${field} es requerido` })
    .min(0, { message: `${field} debe ser un número positivo` });

export const scheduleSchemaCreate = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(255, { message: "El nombre no puede tener más de 255 caracteres" }),
  check_in_time: timeSchema("La hora de entrada"),
  check_out_time: timeSchema("La hora de salida"),
  tolerance_minutes: numericField("La tolerancia en minutos"),
  min_hours: numericField("Las horas mínimas"),
  is_active: z.boolean(),
});

export type ScheduleSchema = z.infer<typeof scheduleSchemaCreate>;

export const assignScheduleSchema = z.object({
  person_id: requiredStringId("Debe seleccionar un trabajador"),
  work_schedule_id: requiredStringId("Debe seleccionar un horario"),
  valid_from: dateStringSchemaRequired("La fecha de inicio"),
  no_end_date: z.boolean(),
  valid_until: z.string().optional().or(z.literal("")),
});

export type AssignScheduleSchema = z.infer<typeof assignScheduleSchema>;
