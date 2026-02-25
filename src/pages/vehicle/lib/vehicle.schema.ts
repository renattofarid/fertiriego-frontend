import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const vehicleSchema = z.object({
  plate: z
    .string()
    .min(1, "La placa es requerida")
    .max(20, "La placa debe tener máximo 20 caracteres"),
  brand: z
    .string()
    .min(1, "La marca es requerida")
    .max(100, "La marca debe tener máximo 100 caracteres"),
  model: z
    .string()
    .min(1, "El modelo es requerido")
    .max(100, "El modelo debe tener máximo 100 caracteres"),
  year: z
    .number()
    .min(1900, "El año debe ser mayor a 1900")
    .max(
      new Date().getFullYear() + 1,
      "El año no puede ser mayor al próximo año"
    ),
  color: z
    .string()
    .min(1, "El color es requerido")
    .max(50, "El color debe tener máximo 50 caracteres"),
  vehicle_type: z
    .string()
    .min(1, "El tipo de vehículo es requerido")
    .max(50, "El tipo debe tener máximo 50 caracteres"),
  max_weight: z.number().min(0, "El peso máximo debe ser mayor o igual a 0"),
  mtc: z
    .string()
    .min(1, "El MTC es requerido")
    .max(50, "El MTC debe tener máximo 50 caracteres"),
  owner_id: requiredStringId("El propietario es requerido"),
  observations: z
    .string()
    .max(500, "Las observaciones deben tener máximo 500 caracteres")
    .optional()
    .default(""),
});

export type VehicleSchema = z.infer<typeof vehicleSchema>;
