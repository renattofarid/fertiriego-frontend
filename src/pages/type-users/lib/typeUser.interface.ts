// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { PersonStanding } from "lucide-react";

const ROUTE = "/tipo-usuario";
const NAME = "Tipo de Usuario";

export const TYPE_USER: ModelComplete<TypeUserResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de roles y permisos de los usuarios en el sistema.",
    plural: "Tipos de Usuario",
    gender: false,
  },
  ICON: "PersonStanding",
  ICON_REACT: PersonStanding,
  ENDPOINT: "/rols",
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
    id: 0,
    name: "",
    permissions: [],
    status: "active",
  },
};

export interface TypeUserResponse {
  data: TypeUserResource[];
  links: Links;
  meta: Meta;
}

export interface TypeUserResource {
  id: number;
  name: string;
  status: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  action: string;
  route: string;
  type: null;
  status: string;
}

export interface TypeUserResourceById {
  data: TypeUserResource;
}

export interface getTypeUserProps {
  params?: Record<string, any>;
}
