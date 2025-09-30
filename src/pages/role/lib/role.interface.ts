import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Shield } from "lucide-react";
import type { RoleSchema } from "./role.schema";

const ROUTE = "/roles";
const NAME = "Rol";

export const ROLE: ModelComplete<RoleSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de roles del sistema.",
    plural: "Roles",
    gender: false,
  },
  ICON: "Shield",
  ICON_REACT: Shield,
  ENDPOINT: "/role",
  QUERY_KEY: "roles",
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
    code: "",
    name: "",
  },
};

export interface RoleResponse {
  data: RoleResource[];
  links: Links;
  meta: Meta;
}

export interface RoleResource {
  id: number;
  code: string;
  name: string;
  created_at: string;
}

export interface RoleResourceById {
  data: RoleResource;
}

export interface CreateRoleRequest {
  code: string;
  name: string;
}

export interface UpdateRoleRequest {
  code?: string;
  name?: string;
}

export interface GetRolesProps {
  params?: Record<string, unknown>;
}