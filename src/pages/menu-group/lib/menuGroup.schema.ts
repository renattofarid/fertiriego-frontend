import { z } from "zod";
import { optionalStringId } from "@/lib/core.schema";

export const menuGroupSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(150, { message: "El nombre no puede tener más de 150 caracteres" }),
  icon: z
    .string()
    .min(1, { message: "El ícono es requerido" })
    .max(100, { message: "El ícono no puede tener más de 100 caracteres" }),
  group_menu_id: optionalStringId("El grupo padre debe ser un ID válido"),
  status: z.string().optional(),
});

export const menuGroupSchemaCreate = menuGroupSchema.omit({ status: true });
export const menuGroupSchemaUpdate = menuGroupSchema.partial();

export type MenuGroupSchema = z.infer<typeof menuGroupSchema>;
