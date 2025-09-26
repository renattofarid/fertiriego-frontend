import { z } from "zod";

export const brandSchemaCreate = z.object({
  name: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
  code: z
    .string()
    .max(10, {
      message: "El código no puede tener más de 10 caracteres",
    })
    .min(1, {
      message: "El código es requerido",
    })
    .regex(/^[A-Z0-9]+$/, {
      message: "El código solo debe contener letras mayúsculas y números",
    }),
});

export const brandSchemaUpdate = brandSchemaCreate.partial();

export type BrandSchema = z.infer<typeof brandSchemaCreate>;