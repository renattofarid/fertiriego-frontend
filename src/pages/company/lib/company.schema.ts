import { z } from "zod";

export const companySchemaCreate = z.object({
  social_reason: z
    .string()
    .max(255, {
      message: "La razón social no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "La razón social es requerida",
    }),
  ruc: z
    .string()
    .max(11, {
      message: "El RUC no puede tener más de 11 caracteres",
    })
    .min(11, {
      message: "El RUC debe tener 11 caracteres",
    })
    .regex(/^\d+$/, {
      message: "El RUC solo debe contener números",
    }),
  trade_name: z
    .string()
    .max(255, {
      message: "El nombre comercial no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre comercial es requerido",
    }),
  address: z
    .string()
    .max(500, {
      message: "La dirección no puede tener más de 500 caracteres",
    })
    .min(1, {
      message: "La dirección es requerida",
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
  responsible_id: z
    .number({
      required_error: "El responsable es requerido",
    })
    .min(1, {
      message: "Debe seleccionar un responsable",
    }),
});

export const companySchemaUpdate = companySchemaCreate.partial();

export type CompanySchema = z.infer<typeof companySchemaCreate>;