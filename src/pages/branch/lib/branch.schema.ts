import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const branchSchemaCreate = z.object({
  name: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
  address: z
    .string()
    .max(500, {
      message: "La dirección no puede tener más de 500 caracteres",
    })
    .min(1, {
      message: "La dirección es requerida",
    }),
  is_invoice: z.boolean({
    error: "Debe especificar si emite factura",
  }),
  responsible_id: z
    .number({
      error: "El responsable es requerido",
    })
    .min(1, {
      message: "Debe seleccionar un responsable",
    }),
  phone: z
    .string()
    .max(15, {
      message: "El teléfono no puede tener más de 15 caracteres",
    })
    .min(1, {
      message: "El teléfono es requerido",
    }),
  email: z
    .string()
    .email({
      message: "El email debe tener un formato válido",
    })
    .max(255, {
      message: "El email no puede tener más de 255 caracteres",
    }),
  company_id: requiredStringId("empresa"),
});

export const branchSchemaUpdate = branchSchemaCreate.partial();

export type BranchSchema = z.infer<typeof branchSchemaCreate>;
