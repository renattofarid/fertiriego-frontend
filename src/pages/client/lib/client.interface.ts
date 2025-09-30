import type { ModelComplete } from "@/lib/core.interface";
import { Users } from "lucide-react";

const ROUTE = "/clientes";
const NAME = "Cliente";

export const CLIENT: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de clientes del sistema.",
    plural: "Clientes",
    gender: false,
  },
  ICON: "Users",
  ICON_REACT: Users,
  ENDPOINT: "/person",
  QUERY_KEY: "clients",
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
  EMPTY: {},
};

export const CLIENT_ROLE_CODE = "CLIENT";
export const CLIENT_ROLE_ID = 1;