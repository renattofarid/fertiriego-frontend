import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

export const permissionSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(150, { message: "El nombre no puede tener más de 150 caracteres" }),
  route: z
    .string()
    .min(1, { message: "La ruta es requerida" })
    .max(150, { message: "La ruta no puede tener más de 150 caracteres" }),
  group_menu_id: requiredStringId("Seleccione un grupo de menú"),
  action: z
    .string()
    .min(1, { message: "La acción es requerida" })
    .max(50, { message: "La acción no puede tener más de 50 caracteres" }),
  type: z
    .string()
    .min(1, { message: "El tipo es requerido" })
    .max(50, { message: "El tipo no puede tener más de 50 caracteres" }),
  status: z.string().optional(),
});

export const permissionSchemaCreate = permissionSchema.omit({ status: true });
export const permissionSchemaUpdate = permissionSchema.partial();

export type PermissionSchema = z.infer<typeof permissionSchema>;
