import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FolderTree } from "lucide-react";
import type { MenuGroupSchema } from "./menuGroup.schema";

const ROUTE = "/grupos-menu";
const NAME = "Grupo de Menú";

export const MENU_GROUP: ModelComplete<MenuGroupSchema> = {
  MODEL: {
    name: NAME,
    description:
      "Gestión de los grupos y opciones que organizan el menú del sistema.",
    plural: "Grupos de Menú",
    gender: true,
  },
  ICON: "FolderTree",
  ICON_REACT: FolderTree,
  ENDPOINT: "/menu",
  QUERY_KEY: "menu-groups",
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
    icon: "",
    group_menu_id: "",
  },
};

export interface MenuGroupResponse {
  data: MenuGroupResource[];
  links: Links;
  meta: Meta;
}

export interface MenuGroupResource {
  id: number;
  name: string;
  nivel: number;
  icon: string;
  group_menu_id: number | null;
  status: string;
  created_at: string;
}

export interface MenuGroupResourceById {
  data: MenuGroupResource;
}

export interface CreateMenuGroupRequest {
  name: string;
  icon: string;
  group_menu_id: number | null;
}

export interface UpdateMenuGroupRequest {
  name?: string;
  icon?: string;
  group_menu_id?: number | null;
  status?: string;
}

export interface GetMenuGroupsProps {
  params?: Record<string, unknown>;
}
