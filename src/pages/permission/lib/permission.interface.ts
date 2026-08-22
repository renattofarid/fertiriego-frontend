import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { KeyRound } from "lucide-react";
import type { PermissionSchema } from "./permission.schema";

const ROUTE = "/permisos";
const NAME = "Permiso";

export const PERMISSION: ModelComplete<PermissionSchema> = {
  MODEL: {
    name: NAME,
    description:
      "Gestión de los permisos del sistema y su asociación a los grupos de menú.",
    plural: "Permisos",
    gender: false,
  },
  ICON: "KeyRound",
  ICON_REACT: KeyRound,
  ENDPOINT: "/permission",
  QUERY_KEY: "permissions",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear un nuevo ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar el ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar el ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    name: "",
    route: "",
    group_menu_id: "",
    action: "list",
    type: "modulo",
  },
};

export interface PermissionResponse {
  data: PermissionResource[];
  links: Links;
  meta: Meta;
}

export interface PermissionResource {
  id: number;
  name: string;
  action: string;
  route: string;
  type: string | null;
  status: string;
  group_menu_id: number;
  group_menu_name: string;
  created_at: string;
}

export interface PermissionResourceById {
  data: PermissionResource;
}

export interface CreatePermissionRequest {
  name: string;
  route: string;
  group_menu_id: number;
  action: string;
  type: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  route?: string;
  group_menu_id?: number;
  action?: string;
  type?: string;
  status?: string;
}

export interface GetPermissionsProps {
  params?: Record<string, unknown>;
}
