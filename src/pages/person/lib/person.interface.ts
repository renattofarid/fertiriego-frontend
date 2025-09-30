import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Users } from "lucide-react";
import type { PersonSchema } from "./person.schema";

const ROUTE = "/personas";
const NAME = "Persona";

export const PERSON: ModelComplete<PersonSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de personas del sistema.",
    plural: "Personas",
    gender: false,
  },
  ICON: "Users",
  ICON_REACT: Users,
  ENDPOINT: "/person",
  QUERY_KEY: "persons",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear una nueva ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar la ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar la ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    type_document: "DNI",
    type_person: "NATURAL",
    names: "",
    gender: "M",
    birth_date: "",
    commercial_name: "",
    father_surname: "",
    mother_surname: "",
    business_name: "",
    address: "",
    phone: "",
    email: "",
    rol_id: "",
    number_document: "",
  },
};

export interface PersonResponse {
  data: PersonResource[];
  links: Links;
  meta: Meta;
}

export interface PersonResource {
  id: number;
  type_document: string;
  type_person: string;
  number_document: string;
  names: string;
  father_surname: string;
  mother_surname: string;
  gender: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  business_name: string;
  commercial_name: string;
  user_id?: string;
  created_at: string;
  roles: Role[];
}

interface Role {
  id: number;
  name: string;
}

export interface PersonResourceById {
  data: PersonResource;
}

export interface CreatePersonRequest {
  username: string;
  password: string;
  type_document: "DNI" | "RUC" | "CE" | "PASAPORTE";
  type_person: "NATURAL" | "JURIDICA";
  names: string;
  gender?: string;
  birth_date?: string;
  father_surname: string;
  mother_surname: string;
  business_name: string;
  commercial_name?: string;
  address: string;
  phone: string;
  email: string;
  ocupation?: string;
  status: string;
  rol_id: number;
  number_document: string;
}

export interface UpdatePersonRequest {
  username?: string;
  password?: string;
  type_document?: "DNI" | "RUC" | "CE" | "PASAPORTE";
  type_person?: "NATURAL" | "JURIDICA";
  names?: string;
  father_surname?: string;
  mother_surname?: string;
  business_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  rol_id?: number;
  number_document?: string;
}

export interface GetPersonsProps {
  params?: Record<any, unknown>;
}

// Role Assignment Interfaces
export interface PersonRoleAssignment {
  role_id: number;
  status: boolean;
}

export interface UpdatePersonRolesRequest {
  roles: PersonRoleAssignment[];
}

export interface PersonRoleResource {
  id: number;
  person_id: number;
  role_id: number;
  role_name: string;
  role_code: string;
  status: boolean;
  created_at: string;
}

export interface PersonRolesResponse {
  data: PersonRoleResource[];
}

// New interface for /personrole endpoint
export interface PersonRoleDetailResource {
  id: number;
  person_id: number;
  person: PersonResource;
  role_id: number;
  role_name: string;
  created_at: string;
}
