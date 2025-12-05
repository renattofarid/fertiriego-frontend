import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { UserCheck } from "lucide-react";

const ROUTE = "/asignacion-caja";
const NAME = "Asignación de Caja";

export const USERBOXASSIGNMENT: ModelComplete<UserBoxAssignmentResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de asignación de usuarios a cajas.",
    plural: "Asignaciones de Caja",
    gender: false,
  },
  ICON: "UserCheck",
  ICON_REACT: UserCheck,
  ENDPOINT: "/userboxassignment",
  QUERY_KEY: "userboxassignments",
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
    id: 0,
    user_id: 0,
    user_name: "",
    box_id: 0,
    box_name: "",
    status: "active",
    assigned_at: "",
    ended_at: null,
    created_at: "",
  },
};

export interface UserBoxAssignmentResponse {
  data: UserBoxAssignmentResource[];
  links: Links;
  meta: Meta;
}

export interface UserBoxAssignmentResource {
  id: number;
  user_id: number;
  user_name: string;
  box_id: number;
  box_name: string;
  status: string;
  assigned_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface UserBoxAssignmentResourceById {
  data: UserBoxAssignmentResource;
}

export interface getUserBoxAssignmentProps {
  params?: Record<string, any>;
}
