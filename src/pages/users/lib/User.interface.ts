// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import type { TypeUserResource } from "@/pages/type-users/lib/typeUser.interface";
import { Users } from "lucide-react";

const ROUTE = "usuarios";
const NAME = "Usuario";

export const USER: ModelComplete = {
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
};

export interface UserResponse {
  data: UserResource[];
  links: Links;
  meta: Meta;
}

export interface UserResource {
  id: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  tipo_usuario_id: number;
  tipos_usuario: TypeUserResource;
  password: string;
}

export type UserResourceById = UserResource | null;

export interface getUserProps {
  params?: Record<string, any>;
}
