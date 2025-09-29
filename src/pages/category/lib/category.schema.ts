import { optionalStringId } from "@/lib/core.schema";
import { z } from "zod";

export const categorySchemaCreate = z.object({
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
  parent_id: optionalStringId("La categoría padre debe ser un ID válido"),
});

export const categorySchemaUpdate = categorySchemaCreate.partial();

export type CategorySchema = z.infer<typeof categorySchemaCreate>;
