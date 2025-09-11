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
    description: "Gestión de usuarios",
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
    person: {
      id: 0,
      type_document: "",
      type_person: "",
      number_document: "",
      names: "",
      father_surname: "",
      mother_surname: "",
      business_name: "",
      address: "",
      phone: "",
      email: "",
      ocupation: "",
      status: "",
    },
    rol_id: "",
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
  person: Person;
  rol_id: number | string;
  rol_name: string;
}

export type UserResourceById = {
  data: UserResource;
};

export interface getUserProps {
  params?: Record<string, any>;
}

interface Person {
  id: number;
  type_document: string;
  type_person: string;
  number_document: string;
  names: string;
  father_surname: string;
  mother_surname: string;
  business_name: string;
  address: string;
  phone: string;
  email: string;
  ocupation: string;
  status: string;
}
