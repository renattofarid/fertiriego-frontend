// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Users } from "lucide-react";

const ROUTE = "/usuarios";
const NAME = "Usuario";

export const USER: ModelComplete<UserResource> = {
  MODEL: {
    name: NAME,
    plural: "Usuarios",
    gender: false,
  },
  ICON: "Users",
  ICON_REACT: Users,
  ENDPOINT: "/users",
  QUERY_KEY: "users",
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
    id: 0,
    name: "",
    username: "",
    person_id: 0,
    person_names: "",
    rol_id: 0,
    rol_name: "",
  },
};

export interface UserResponse {
  data: UserResource[];
  links: Links;
  meta: Meta;
}

export interface UserResource {
  id: number;
  name: string;
  username: string;
  person_id: number;
  person_names?: string;
  rol_id: number;
  rol_name: string;
}

export type UserResourceById = {
  data: UserResource;
};

export interface getUserProps {
  params?: Record<string, any>;
}
