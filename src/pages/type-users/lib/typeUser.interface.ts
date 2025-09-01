// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { PersonStanding } from "lucide-react";

const ROUTE = "tipo-usuarios";
const NAME = "Tipo de Usuario";

export const TYPE_USER: ModelComplete = {
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
};

export interface TypeUserResponse {
  data: TypeUserResource[];
  links: Links;
  meta: Meta;
}

export interface TypeUserResource {
  id: number;
  nombre: string;
}

export interface TypeUserResourceById {
  status: number;
  message: string;
  data: TypeUserResource;
}

export interface getTypeUserProps {
  params?: Record<string, any>;
}
